import { prisma } from '@/lib/prisma';
import { TestRun } from '@/types/runs';
import { ExtendedTestConversation } from "@/types/extendedTestConversation";

// Hardcoded persona mapping
const PERSONA_MAP: Record<string, { name: string; description?: string }> = {
  '11111111-1111-1111-1111-111111111111': { name: 'Friendly User', description: 'A typical friendly user asking questions politely' },
  '22222222-2222-2222-2222-222222222222': { name: 'Technical Expert', description: 'A technically savvy user with detailed questions' },
  '33333333-3333-3333-3333-333333333333': { name: 'Confused User', description: 'A user who needs extra help and clarification' },
  // Legacy mappings for backward compatibility
  'curious-customer': { name: 'Curious Customer', description: 'Asks detailed questions about products' },
  'skeptical-buyer': { name: 'Skeptical Buyer', description: 'Questions claims and needs proof' },
  'tech-savvy': { name: 'Tech Savvy User', description: 'Understands technical details' },
  'budget-conscious': { name: 'Budget Conscious', description: 'Focused on price and value' },
  'first-time-user': { name: 'First Time User', description: 'New to the product/service' },
};

function getPersonaName(personaId: string): string {
  return PERSONA_MAP[personaId]?.name || personaId;
}

export class TestRunService {
  async getAllTestRuns(limit: number = 20, offset: number = 0): Promise<{ runs: TestRun[], total: number }> {
    try {
      // Get total count for pagination
      const total = await prisma.test_runs.count();
      
      const runs = await prisma.test_runs.findMany({
        include: {
          test_conversations: {
            include: {
              conversation_messages: {
                orderBy: { message_order: 'asc' }
              },
              test_scenarios: true
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      });

      return runs.map(run => ({
        id: run.id,
        name: run.name,
        timestamp: run.created_at ? run.created_at.toISOString() : new Date().toISOString(),
        status: run.status as 'pending' | 'running' | 'completed' | 'failed',
        metrics: {
          total: run.total_tests ?? 0,
          passed: run.passed_tests ?? 0,
          failed: run.failed_tests ?? 0,
          chats: run.test_conversations.length,
          correct: 0,
          incorrect: 0,
          sentimentScores: { positive: 0, neutral: 0, negative: 0 }
        },
        chats: run.test_conversations.map(tc => {
          const conversation = tc as ExtendedTestConversation;
          return {
            id: conversation.id,
            name: `${tc.test_scenarios?.name || ""} - ${getPersonaName(tc.persona_id || "")}`,
            scenarioName: tc.test_scenarios?.name,
            personaName: getPersonaName(tc.persona_id || ""),
            scenario: conversation.scenario_id,
            status: conversation.status as 'running' | 'passed' | 'failed',
            messages: (conversation.conversation_messages || []).map(msg => {
              // Build metrics object from both individual fields and JSON metrics
              const metrics: any = {
                responseTime: msg.response_time ?? 0
              };
              
              // If there's a metrics JSON object, merge it in
              if (msg.metrics && typeof msg.metrics === 'object') {
                Object.assign(metrics, msg.metrics);
              }
              
              return {
                id: msg.id,
                chatId: msg.conversation_id,
                role: msg.role as "user" | "assistant",
                content: msg.content,
                expectedOutput: undefined,
                // isCorrect removed - validation is at conversation level
                explanation: undefined,
                metrics: metrics
              };
            }),
            metrics: {
              correct: 0,
              incorrect: 0,
              responseTime: conversation.conversation_messages
              .filter(msg => msg.role === 'assistant')
              .map(msg => msg.response_time ?? 0),
              validationScores: [],
              contextRelevance: [],
              metricResults: []
            },
            timestamp: conversation.created_at ? conversation.created_at.toISOString() : new Date().toISOString(),
            personaId: tc.persona_id || "",
            validationResult: {
              isCorrect: conversation.is_correct ?? false,
              explanation: conversation.validation_reason ?? ""
            }
          };
        }),     
        results: [],
        agentId: run.agent_id,
      }));
      
      return { runs: mappedRuns, total };
    } catch (error) {
      console.error("Database error in getAllTestRuns:", error);
      throw new Error("Failed to fetch test runs");
    }
  }

  async createTestRun(run: TestRun) {
    return await prisma.$transaction(async (tx) => {
      try {
        // Create the test run first
        const testRun = await tx.test_runs.create({
          data: {
            id: run.id,
            agent_id: run.agentId,
            name: run.name,
            status: run.status,
            total_tests: run.metrics.total,
            passed_tests: run.metrics.passed,
            failed_tests: run.metrics.failed,
          }
        });

        // Create test conversations and messages in the transaction
        for (const chat of run.chats) {
          const conversation = await tx.test_conversations.create({
            data: {
              id: chat.id,
              run_id: run.id,
              scenario_id: chat.scenario,
              persona_id: chat.personaId || "",
              status: chat.status,
              error_message: chat.error || null,
              validation_reason: chat.validationResult ? chat.validationResult.explanation : null,
              is_correct: chat.validationResult ? chat.validationResult.isCorrect : undefined,
            }
          });

          // Create messages for this conversation
          await tx.conversation_messages.createMany({
            data: chat.messages.map(msg => ({
              id: msg.id,
              conversation_id: chat.id,
              role: msg.role,
              content: msg.content,
              response_time: msg.metrics?.responseTime || 0,
              metrics: msg.metrics || {}
              // message_order will be auto-generated by database
            }))
          });
        }

        return testRun;
      } catch (error) {
        console.error("Database error in createTestRun:", error);
        throw new Error("Failed to create test run");
      }
    });
  }
  
  async getTestRuns(): Promise<TestRun[]> {
    try {
      const runs = await prisma.test_runs.findMany({
        include: {
          test_conversations: {
            include: {
              conversation_messages: {
                orderBy: { message_order: 'asc' }
              },
              test_scenarios: true
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return runs.map(run => ({
        id: run.id,
        name: run.name,
        timestamp: run.created_at ? run.created_at.toISOString() : new Date().toISOString(),
        status: run.status as 'pending' | 'running' | 'completed' | 'failed',
        metrics: {
          total: run.total_tests ?? 0,
          passed: run.passed_tests ?? 0,
          failed: run.failed_tests ?? 0,
          chats: run.test_conversations.length,
          correct: 0,
          incorrect: 0,
          sentimentScores: { positive: 0, neutral: 0, negative: 0 }
        },
        chats: run.test_conversations.map(tc => {
          const conversation = tc as ExtendedTestConversation;
          return {
            id: conversation.id,
            name: `${tc.test_scenarios?.name || ""} - ${getPersonaName(tc.persona_id || "")}`,
            scenarioName: tc.test_scenarios?.name,
            personaName: getPersonaName(tc.persona_id || ""),
            scenario: conversation.scenario_id,
            status: conversation.status as 'running' | 'passed' | 'failed',
            messages: (conversation.conversation_messages || []).map(msg => {
              // Build metrics object from both individual fields and JSON metrics
              const metrics: any = {
                responseTime: msg.response_time ?? 0
              };
              
              // If there's a metrics JSON object, merge it in
              if (msg.metrics && typeof msg.metrics === 'object') {
                Object.assign(metrics, msg.metrics);
              }
              
              return {
                id: msg.id,
                chatId: msg.conversation_id,
                role: msg.role as "user" | "assistant",
                content: msg.content,
                expectedOutput: undefined,
                // isCorrect removed - validation is at conversation level
                explanation: undefined,
                metrics: metrics
              };
            }),
            metrics: {
              correct: 0,
              incorrect: 0,
              responseTime: conversation.conversation_messages
              .filter(msg => msg.role === 'assistant')
              .map(msg => msg.response_time ?? 0),
              validationScores: [],
              contextRelevance: [],
              metricResults: []
            },
            timestamp: conversation.created_at ? conversation.created_at.toISOString() : new Date().toISOString(),
            personaId: tc.persona_id || "",
            validationResult: {
              isCorrect: conversation.is_correct ?? false,
              explanation: conversation.validation_reason ?? ""
            }
          };
        }),     
        results: [],
        agentId: run.agent_id,
      }));
    } catch (error) {
      console.error("Database error in getTestRuns:", error);
      throw new Error("Failed to fetch test runs");
    }
  }
  

  // Removed saveMetricResults - test_run_metrics table no longer exists
  // Metric results should be stored elsewhere or in the conversation messages

  // In src-services-db-testRunService.ts
async updateTestRun(testRun: TestRun) {
    try {
      return await prisma.test_runs.update({
        where: { id: testRun.id },
        data: {
          status: testRun.status,
          passed_tests: testRun.metrics.passed,
          failed_tests: testRun.metrics.failed,
          total_tests: testRun.metrics.total
        }
      });
    } catch (error) {
      console.error("Database error in updateTestRun:", error);
      throw new Error("Failed to update test run");
    }
  }
  
  async updateTestConversationStatus(
    conversationId: string, 
    status: string, 
    errorMessage?: string,
    validationResult?: { isCorrect: boolean; explanation: string }
  ) {
    try {
      const updateData: any = {
        status: status
      };
      
      if (errorMessage) {
        updateData.error_message = errorMessage;
      }
      
      if (validationResult) {
        updateData.is_correct = validationResult.isCorrect;
        updateData.validation_reason = validationResult.explanation;
      }
      
      return await prisma.test_conversations.update({
        where: { id: conversationId },
        data: updateData
      });
    } catch (error) {
      console.error("Database error in updateTestConversationStatus:", error);
      throw new Error("Failed to update test conversation status");
    }
  }
  
}

export const testRunService = new TestRunService();