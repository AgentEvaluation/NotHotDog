import { NextResponse } from 'next/server';
import { dbService } from '@/services/db';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import { QaAgent } from '@/services/agents/claude/qaAgent';
import { TestRun } from '@/types/runs';
import { TestChat } from '@/types/chat';
import { Rule } from '@/services/agents/claude/types';
import { LLMProvider } from '@/services/llm/enums';


export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const testRuns = await dbService.getTestRuns(userId);
    
    return NextResponse.json(testRuns);
  } catch (error: any) {
    console.error('Error fetching test runs:', error);
    return NextResponse.json({ error: 'Failed to fetch test runs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const testId = body.testId;
    
    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
    }

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
        console.error("Failed to parse extra params", e);
      }
    }
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is missing. Please configure in settings.' },
        { status: 500 }
      );
    }

    // Get user profile
    const profile = await dbService.getProfileByClerkId(userId);
    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Fetch all the necessary data
    const testConfig = await dbService.getAgentConfigAll(testId);
    if (!testConfig) {
      return NextResponse.json({ error: 'Test configuration not found' }, { status: 404 });
    }

    // Make sure the test belongs to the user's organization
    if (testConfig.org_id !== profile.org_id) {
      return NextResponse.json({ error: 'Unauthorized access to test' }, { status: 403 });
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
      createdBy: profile.id
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

    const completedChats: TestChat[] = [];

    // Create test conversations BEFORE running the tests
    for (const scenario of enabledScenarios) {
      for (const personaId of selectedPersonas) {
        // Create a conversation ID upfront
        const chatId = uuidv4();
        
        // Create the test conversation record in the database BEFORE running the test
        const conversationId = await  dbService.createTestConversation({
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
            conversationId: conversationId
          });

          const result = await agent.runTest(
            scenario.scenario,
            scenario.expectedOutput || ''
          );

          const agentMetrics = await dbService.getMetricsForAgent(testId);
          
          const conversationValidation = await agent.validateFullConversation(
            result.conversation.allMessages
              .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
              .join('\n\n'),
            scenario.scenario,
            scenario.expectedOutput || '',
            agentMetrics
          );

          const chat: TestChat = {
            id: chatId,
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
              validationScores: [conversationValidation.isCorrect ? 1 : 0],
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
          
          // Update the test conversation's status to 'passed' or 'failed'
          await dbService.updateTestConversationStatus(conversationId, conversationValidation.isCorrect ? 'passed' : 'failed');

          completedChats.push(chat);
          testRun.metrics.passed += conversationValidation.isCorrect ? 1 : 0;
          testRun.metrics.failed += conversationValidation.isCorrect ? 0 : 1;
          testRun.metrics.correct += conversationValidation.isCorrect ? 1 : 0;
          testRun.metrics.incorrect += conversationValidation.isCorrect ? 0 : 1;
          
        } catch (error: any) {
          console.error('Error in test execution:', error);
          
          // Update the test conversation's status to 'failed'
          await dbService.updateTestConversationStatus(conversationId, 'failed', error.message);
          
          const chat: TestChat = {
            id: chatId,
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
              validationScores: [],
              contextRelevance: [],
              metricResults: []
            },
            timestamp: new Date().toISOString(),
            error: error.message || 'Unknown error occurred',
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

    for (const chat of completedChats) {
      const metricResults = chat.metrics.metricResults ?? [];
      if (metricResults.length > 0) {
        await dbService.saveMetricResults(
          testRun.id,
          chat.id,
          metricResults
        );
      }
    }

    return NextResponse.json(testRun);
  } catch (error: any) {
    console.error('Error executing test:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during test execution' },
      { status: 500 }
    );
  }
}