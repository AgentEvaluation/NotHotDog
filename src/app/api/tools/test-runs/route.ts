import { NextResponse } from 'next/server';
import { dbService } from '@/services/db';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import { QaAgent } from '@/services/agents/claude/qaAgent';
import { AnthropicModel } from '@/services/llm/enums';
import { TestRun, TestMessage } from '@/types/runs';
import { TestChat } from '@/types/chat';
import { Rule } from '@/services/agents/claude/types';


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

    const apiKey = request.headers.get("x-api-key");
    const modelFromHeader = request.headers.get("x-model") || "";
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key is missing on the server.' },
        { status: 500 }
      );
    }

    // Get user profile to ensure they have access to this test
    const profile = await dbService.getProfileByClerkId(userId);
    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Fetch all the necessary data in one go
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
    const totalRuns = scenarios.length * selectedPersonas.length;

    // Create new test run
    const testRun: TestRun = {
      id: uuidv4(),
      name: testConfig.name,
      timestamp: new Date().toISOString(),
      status: 'running' as const, // Explicitly type as TestRunStatus
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

    const completedChats: TestChat[] = [];

    // Format rules to match the required Rule type
    const formattedRules: Rule[] = testConfig.rules.map(rule => ({
      id: uuidv4(), // Generate an id for each rule
      path: rule.path,
      condition: rule.condition,
      value: rule.value,
      description: rule.description || "",
      isValid: true // Add the missing isValid property
    }));

    // Convert inputFormat to Record<string, any>
    const inputFormat: Record<string, any> = 
      typeof testConfig.inputFormat === 'object' ? 
      testConfig.inputFormat as Record<string, any> : 
      {};

    // Run the tests
    for (const scenario of scenarios) {
      for (const personaId of selectedPersonas) {
        console.log(personaId);
        try {
          const agent = new QaAgent({
            headers: testConfig.headers,
            modelId: modelFromHeader,
            endpointUrl: testConfig.endpoint,
            apiConfig: {
              inputFormat: inputFormat,
              outputFormat: typeof testConfig.latestOutput?.responseData === 'object' ? 
                testConfig.latestOutput.responseData as Record<string, any> : 
                {},
              rules: formattedRules
            },
            persona: personaId,
            userApiKey: apiKey
          });

          const result = await agent.runTest(
            scenario.scenario,
            scenario.expectedOutput || ''
          );

          const chatId = uuidv4();
          
          const chat: TestChat = {
            id: chatId,
            name: scenario.scenario,
            scenario: scenario.id,
            status: 'passed',
            messages: result.conversation.allMessages,
            metrics: {
              correct: result.validation.passedTest ? 1 : 0,
              incorrect: result.validation.passedTest ? 0 : 1,
              responseTime: [result.validation.metrics.responseTime],
              validationScores: [result.validation.passedTest ? 1 : 0],
              contextRelevance: [1],
              validationDetails: {
                customFailure: !result.validation.passedTest,
                containsFailures: [],
                notContainsFailures: []
              }
            },
            timestamp: new Date().toISOString(),
            personaId: personaId
          };

          completedChats.push(chat);
          testRun.metrics.passed += result.validation.passedTest ? 1 : 0;
          testRun.metrics.failed += result.validation.passedTest ? 0 : 1;
          testRun.metrics.correct += result.validation.passedTest ? 1 : 0;
          testRun.metrics.incorrect += result.validation.passedTest ? 0 : 1;
          
        } catch (error: any) { // Type error as any
          console.error('Error in test execution:', error);
          const chat: TestChat = {
            id: uuidv4(),
            name: scenario.scenario,
            scenario: scenario.id,
            status: 'failed',
            messages: [],
            metrics: {
              correct: 0,
              incorrect: 1,
              responseTime: [],
              validationScores: [],
              contextRelevance: [],
              validationDetails: {
                customFailure: true,
                containsFailures: [],
                notContainsFailures: []
              }
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
    testRun.status = 'completed' as const; // Explicitly type as TestRunStatus
    
    // Save the test run to the database
    await dbService.createTestRun(testRun);

    return NextResponse.json(testRun);
  } catch (error: any) { // Type error as any
    console.error('Error executing test:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during test execution' },
      { status: 500 }
    );
  }
}