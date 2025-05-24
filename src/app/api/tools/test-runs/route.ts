import { withApiHandler } from '@/lib/api-utils';
import { NotFoundError, ValidationError, ExternalAPIError } from '@/lib/errors';
import { dbService } from '@/services/db';
import { QaAgent } from '@/services/agents/claude/qaAgent';
import { v4 as uuidv4 } from 'uuid';
import { TestRun } from '@/types/runs';
import { Conversation } from '@/types/chat';
import { Rule } from '@/services/agents/claude/types';
import { LLMProvider } from '@/services/llm/enums';
import { createTestRunSchema, safeValidateRequest } from '@/lib/validations/api';

export const GET = withApiHandler(async (request: Request) => {
  // Parse query parameters for pagination
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');
  
  // Return paginated test runs
  const result = await dbService.getAllTestRuns(limit, offset);
  return result;
});

export const POST = withApiHandler(async (request: Request) => {

  const body = await request.json();
  
  const validation = safeValidateRequest(createTestRunSchema, body);
  if (!validation.success) {
    throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
  }
  
  const { testId } = validation.data;

  // Setup API key configuration
  const apiKey = request.headers.get("x-api-key");
  const modelId = request.headers.get("x-model") || "";
  const provider = request.headers.get("x-provider") || LLMProvider.Anthropic;
  const extraParamsStr = request.headers.get("x-extra-params");
  
  let extraParams = {};
  if (extraParamsStr) {
    try {
      extraParams = JSON.parse(extraParamsStr);
    } catch (e) {
      throw new ValidationError(`Invalid extra params: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  
  if (!apiKey) {
    throw new ValidationError('API key is missing. Please configure in settings.');
  }

  // Fetch all the necessary data
  const testConfig = await dbService.getAgentConfigAll(testId);
  if (!testConfig) {
    throw new NotFoundError('Test configuration not found');
  }


  const personaMapping = await dbService.getPersonaMappingByAgentId(testId);
  const testVariations = await dbService.getTestVariations(testId);
  
  const scenarios = testVariations.testCases;
  const selectedPersonas = personaMapping.personaIds || [];
  const enabledScenarios = scenarios.filter(scenario => scenario.enabled !== false);
  const totalRuns = enabledScenarios.length * selectedPersonas.length;

  // Create test run record FIRST
  const testRun: TestRun = {
    id: uuidv4(),
    name: testConfig.name,
    timestamp: new Date().toISOString(),
    status: 'running' as const,
    metrics: {
      total: totalRuns,
      passed: 0,
      failed: 0,
      chats: totalRuns,
      correct: 0,
      incorrect: 0
    },
    chats: [],
    results: [],
    agentId: testId,
    createdBy: 'system'
  };
  
  // Save the test run to the database immediately
  await dbService.createTestRun(testRun);

  // Format rules for the agent
  const formattedRules: Rule[] = testConfig.rules.map(rule => ({
    id: uuidv4(),
    path: rule.path,
    condition: rule.condition,
    value: rule.value,
    description: rule.description || "",
    isValid: true
  }));

  // Convert inputFormat to Record<string, any>
  const inputFormat: Record<string, any> = 
    typeof testConfig.inputFormat === 'object' ? 
    testConfig.inputFormat as Record<string, any> : 
    {};

  const completedChats: Conversation[] = [];

  // Create test conversations BEFORE running the tests
  for (const scenario of enabledScenarios) {
    for (const personaId of selectedPersonas) {
      // Create the test conversation record in the database BEFORE running the test
      const conversationId = await dbService.createTestConversation({
        runId: testRun.id,
        scenarioId: scenario.id,
        personaId: personaId,
        status: 'running'
      });
      
      try {
        const agent = new QaAgent({
          headers: testConfig.headers,
          modelId,
          provider,
          endpointUrl: testConfig.endpoint,
          apiConfig: {
            inputFormat: inputFormat,
            outputFormat: typeof testConfig.latestOutput?.responseData === 'object' ? 
              testConfig.latestOutput.responseData as Record<string, any> : 
              {},
            rules: formattedRules
          },
          persona: personaId,
          userApiKey: apiKey,
          extraParams,
          // Pass the conversation ID created above to ensure all messages use the same ID
          conversationId: conversationId,
          agentDescription: testConfig.agentDescription
        });

        const result = await agent.runTest(
          scenario.scenario,
          scenario.expectedOutput || ''
        ).catch(err => {
          throw new ExternalAPIError(
            `Failed to run test: ${err instanceof Error ? err.message : String(err)}`,
            err
          );
        });

        const agentMetrics = await dbService.getMetricsForAgent(testId);
        
        const conversationValidation = await agent.validateFullConversation(
          result.conversation.allMessages
            .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
            .join('\n\n'),
          scenario.scenario,
          scenario.expectedOutput || '',
          agentMetrics
        ).catch(err => {
          throw new ExternalAPIError(
            `Failed to validate conversation: ${err instanceof Error ? err.message : String(err)}`,
            err
          );
        });

        const chat: Conversation = {
          id: conversationId,
          scenarioName: scenario.scenario,
          personaName: personaId,
          name: scenario.scenario,
          scenario: scenario.id,
          status: conversationValidation.isCorrect ? 'passed' : 'failed',
          messages: result.conversation.allMessages,
          metrics: {
            correct: conversationValidation.isCorrect ? 1 : 0,
            incorrect: conversationValidation.isCorrect ? 0 : 1,
            responseTime: [result.validation.metrics.responseTime],
            contextRelevance: [1],
            validationDetails: {
              customFailure: !conversationValidation.isCorrect,
              containsFailures: [],
              notContainsFailures: []
            },
            metricResults: conversationValidation.metrics || []
          },
          timestamp: new Date().toISOString(),
          personaId: personaId,
          validationResult: conversationValidation
        };
        
        // Update the test conversation's status to 'passed' or 'failed' with validation data
        await dbService.updateTestConversationStatus(
          conversationId, 
          conversationValidation.isCorrect ? 'passed' : 'failed',
          undefined, // no error message for successful runs
          conversationValidation // pass the validation result to be saved
        );

        completedChats.push(chat);
        testRun.metrics.passed += conversationValidation.isCorrect ? 1 : 0;
        testRun.metrics.failed += conversationValidation.isCorrect ? 0 : 1;
        testRun.metrics.correct += conversationValidation.isCorrect ? 1 : 0;
        testRun.metrics.incorrect += conversationValidation.isCorrect ? 0 : 1;
        
      } catch (error) {
        // Update the test conversation's status to 'failed'
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Test execution failed for scenario ${scenario.scenario} with persona ${personaId}:`, error);
        await dbService.updateTestConversationStatus(conversationId, 'failed', errorMessage);
        
        const chat: Conversation = {
          id: conversationId,
          scenarioName: scenario.scenario,
          personaName: personaId,
          name: scenario.scenario,
          scenario: scenario.id,
          status: 'failed',
          messages: [],
          metrics: {
            correct: 0,
            incorrect: 0,
            responseTime: [],
            contextRelevance: [],
            metricResults: []
          },
          timestamp: new Date().toISOString(),
          error: errorMessage,
          personaId: personaId
        };
        
        completedChats.push(chat);
        testRun.metrics.failed += 1;
        testRun.metrics.incorrect += 1;
      }
    }
  }

  testRun.chats = completedChats;
  testRun.status = 'completed' as const;
  
  // Update the test run with final results
  await dbService.updateTestRun(testRun);

  // Metric results are now stored inline with conversations, no need for separate saving

  return testRun;
});