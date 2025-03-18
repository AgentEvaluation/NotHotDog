import { prisma } from '@/lib/prisma';
import { TestRun } from '@/types/runs';
import { SimplifiedTestCases, TestVariation } from '@/types/variations';
import { CommunicationStyle, DecisionSpeed, Persona, PersonaMappings, SlangUsage, MessageLength, PrimaryIntent, TechSavviness, EmotionalState, ErrorTolerance } from '@/types';
import { Rule } from '../agents/claude/types';
import { ExtendedTestConversation } from "@/types/extendedTestConversation";

export class DbService {
  private static instance: DbService;

  private constructor() {}

  static getInstance(): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService();
    }
    return DbService.instance;
  }

  async getAgentConfigs(userId: string): Promise<any[]> {
    try { 
      const configs = await prisma.agent_configs.findMany({
        where: {
          organizations: {
            profiles: {
              some: {
                clerk_id: userId
              }
            }
          }
        },
        include: {
          agent_headers: true,
          agent_persona_mappings: true,
        },
      });
    
      return configs.map(config => ({
        id: config.id,
        name: config.name,
        endpoint: config.endpoint,
        headers: config.agent_headers.reduce((acc, header) => ({
          ...acc,
          [header.key]: header.value,
        }), {}),
      }));
    } catch(error) {
      console.error("Database error in getAgentConfigs:", error);
      throw new Error("Failed to fetch agent configs");
    }
  }
  
  async getAgentConfigAll(id: string) {
    try {
      const config = await prisma.agent_configs.findUnique({
        where: { id },
        include: {
          agent_headers: true,
          agent_descriptions: true,
          agent_user_descriptions: true,
          validation_rules: true,
          agent_outputs: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
      if (!config) return null;
      const latestOutput = config.agent_outputs[0];
      return {
        id: config.id,
        name: config.name,
        endpoint: config.endpoint,
        inputFormat: config.input_format,
        org_id: config.org_id,
        headers: config.agent_headers.reduce((acc, h) => {
          acc[h.key] = h.value;
          return acc;
        }, {} as Record<string, string>),
        agentDescription: config.agent_descriptions?.[0]?.description ?? "",
        userDescription: config.agent_user_descriptions?.[0]?.description ?? "",
        rules: config.validation_rules.map(r => ({
          path: r.path,
          condition: r.condition,
          value: r.expected_value,
          description: r.description
        })),
        latestOutput: latestOutput ? {
          responseData: latestOutput.response_data,
          responseTime: latestOutput.response_time,
          status: latestOutput.status,
          errorMessage: latestOutput.error_message
        } : null
      };
    } catch(error) {
      console.error("Database error in getAgentConfigAll:", error);
      throw new Error("Failed to fetch agent config details");
    }
  }

  async saveAgentConfig(config: any) {
    try {
      const parsedResponse = this.safeJsonParse(config.agent_response);
      let input_format = this.safeJsonParse(config.input);
  
      if (config.id) {
        // Update existing config
        return await prisma.agent_configs.update({
          where: { id: config.id },
          data: {
            name: config.name,
            endpoint: config.endpoint,
            input_format: input_format,
            // Normally, org_id is not updated
            agent_headers: {
              deleteMany: {},
              create: Object.entries(config.headers).map(([key, value]) => ({
                key,
                value: String(value),
              }))
            },
            agent_descriptions: {
              deleteMany: {},
              create: { description: config.agentDescription }
            },
            agent_user_descriptions: {
              deleteMany: {},
              create: { description: config.userDescription }
            },
            validation_rules: {
              deleteMany: {},
              create: config.rules.map((rule: any) => ({
                path: rule.path,
                condition: rule.condition,
                expected_value: rule.value,
                description: rule.description || ""
              }))
            },
            agent_outputs: {
              deleteMany: {},
              create: {
                response_data: parsedResponse,
                response_time: config.responseTime,
                status: "success",
                error_message: ""
              }
            }
          }
        });
      } else {
        return await prisma.agent_configs.create({
          data: {
            name: config.name,
            endpoint: config.endpoint,
            input_format: input_format,
            org_id: config.org_id,
            created_by: config.created_by,
            agent_headers: {
              create: Object.entries(config.headers).map(([key, value]) => ({
                key,
                value: String(value),
              }))
            },
            agent_descriptions: {
              create: { description: config.agentDescription }
            },
            agent_user_descriptions: {
              create: { description: config.userDescription }
            },
            validation_rules: {
              create: config.rules.map((rule: any) => ({
                path: rule.path,
                condition: rule.condition,
                expected_value: rule.value,
                description: rule.description || ""
              }))
            },
            agent_outputs: {
              create: {
                response_data: parsedResponse,
                response_time: config.responseTime,
                status: "success",
                error_message: ""
              }
            }
          }
        });
      }
    } catch (error) {
      console.error("Error saving agent config:", error);
      throw new Error("Failed to save agent config");
    }
  }
  
  safeJsonParse(str: string) {
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch {
      return { rawOutput: str };
    }
  }
  
  async deleteAgentConfig(configId: string): Promise<{ deleted: boolean }> {
    try {
      // Step 1: Delete related test scenarios
      await prisma.test_scenarios.deleteMany({
        where: { agent_id: configId },
      });
  
      // Step 2: Delete related persona mappings
      await prisma.agent_persona_mappings.deleteMany({
        where: { agent_id: configId },
      });
  
      // Step 3: Delete the agent config itself
      await prisma.agent_configs.delete({
        where: { id: configId },
      });
  
      return { deleted: true };
    } catch (error) {
      console.error("Error deleting agent config:", error);
      throw new Error("Failed to delete agent config");
    }
  }
  
  async getAgentConfig(testId: string) {
    try {
      return await prisma.agent_configs.findUnique({
        where: { id: testId },
        include: {
          agent_descriptions: true,
          agent_user_descriptions: true,
        },
      });
    } catch(error) {
      console.error("Database error in getAgentConfig:", error);
      throw new Error("Failed to fetch agent config");
    }
  }
  
  async getPersonaMappings(userId: string): Promise<PersonaMappings> {
    try {
      const mappings = await prisma.agent_persona_mappings.findMany({
        where: {
          agent_configs: {
            organizations: {
              profiles: {
                some: {
                  clerk_id: userId
                }
              }
            }
          }
        }
      });
  
      return mappings.reduce((acc, mapping) => ({
        ...acc,
        [mapping.agent_id]: {
          id: mapping.id,
          testId: mapping.agent_id,
          personaIds: [mapping.persona_id],
          createdAt: mapping.created_at!.toISOString(),
          updatedAt: mapping.created_at!.toISOString()
        }
      }), {});
    } catch (error) {
      console.error("Database error in getPersonaMappings:", error);
      throw new Error("Failed to fetch persona mappings");
    }
  }
  
  // async updateTestRun(run: TestRun) {
  //   try {
  //     return await prisma.test_runs.update({
  //       where: { id: run.id },
  //       data: {
  //         status: run.status,
  //         total_tests: run.metrics.total,
  //         passed_tests: run.metrics.passed,
  //         failed_tests: run.metrics.failed,
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Database error in updateTestRun:", error);
  //     throw new Error("Failed to update test run");
  //   }
  // }
  
  async getTestVariations(testId: string): Promise<SimplifiedTestCases> {
    try {
      const scenarios = await prisma.test_scenarios.findMany({
        where: { agent_id: testId },
        orderBy: { created_at: 'desc' }
      });
  
      const testCases = scenarios.map(scenario => ({
        id: scenario.id,
        scenario: scenario.name,
        expectedOutput: scenario.expected_output
      }));
  
      return { testId, testCases };
    } catch (error) {
      console.error("Database error in getTestVariations:", error);
      throw new Error("Failed to fetch test variations");
    }
  }
  
  async createTestVariation(variation: TestVariation) {
    try {
      const testScenariosData = variation.cases.map((testCase) => ({
        id: testCase.id,
        agent_id: variation.testId,
        name: testCase.scenario,
        input: testCase.scenario,
        expected_output: testCase.expectedOutput,
        created_at: new Date(variation.timestamp),
        updated_at: new Date(variation.timestamp),
      }));
  
      const result = await prisma.test_scenarios.createMany({
        data: testScenariosData,
      });
  
      return result;
    } catch (error) {
      console.error("Database error in createTestVariation:", error);
      throw new Error("Failed to create test variation");
    }
  }
  
  async updateTestVariation(variation: TestVariation) {
    try {
      const editedCase = variation.cases[0];
      return await prisma.test_scenarios.update({
        where: { id: editedCase.id },
        data: {
          name: editedCase.scenario,
          input: editedCase.scenario,
          expected_output: editedCase.expectedOutput,
          updated_at: new Date(variation.timestamp)
        }
      });
    } catch (error) {
      console.error("Database error in updateTestVariation:", error);
      throw new Error("Failed to update test variation");
    }
  }
  
  async deleteTestVariation(variation: TestVariation) {
    try {
      const remainingIds = variation.cases.map(tc => tc.id);
      const result = await prisma.test_scenarios.deleteMany({
        where: {
          agent_id: variation.testId,
          id: {
            notIn: remainingIds
          }
        }
      });
      return { deletedCount: result.count };
    } catch (error) {
      console.error("Database error in deleteTestVariation:", error);
      throw new Error("Failed to delete test variation");
    }
  }
  
  async getPersonaMappingByAgentId(agentId: string): Promise<{ personaIds: string[] }> {
    try {
      const rows = await prisma.agent_persona_mappings.findMany({
        where: { agent_id: agentId },
      });
      return { personaIds: rows.map(row => row.persona_id) };
    } catch (error) {
      console.error("Database error in getPersonaMappingByAgentId:", error);
      throw new Error("Failed to fetch persona mapping by agent id");
    }
  }
  
  async createPersonaMapping(agentId: string, personaId: string): Promise<{ personaIds: string[] }> {
    try {
      await prisma.agent_persona_mappings.create({
        data: {
          agent_id: agentId,
          persona_id: personaId,
        },
      });
      return this.getPersonaMappingByAgentId(agentId);
    } catch (error) {
      console.error("Database error in createPersonaMapping:", error);
      throw new Error("Failed to create persona mapping");
    }
  }
  
  async deletePersonaMapping(agentId: string, personaId: string): Promise<{ personaIds: string[] }> {
    try {
      await prisma.agent_persona_mappings.deleteMany({
        where: {
          agent_id: agentId,
          persona_id: personaId,
        },
      });
      return this.getPersonaMappingByAgentId(agentId);
    } catch (error) {
      console.error("Database error in deletePersonaMapping:", error);
      throw new Error("Failed to delete persona mapping");
    }
  }
  
  async getPersonas(userId: string): Promise<any[]> {
    try {
      const profile = await prisma.profiles.findUnique({
        where: { clerk_id: userId }
      });
      
      if (!profile || !profile.org_id) {
        return [];
      }
      const personas = await prisma.personas.findMany({
        where: {
          OR: [
            { org_id: profile.org_id },
            { is_default: true }
          ]
        }
      });
      return personas;
    } catch (error) {
      console.error("Database error in getPersonas:", error);
      return [];
    }
  }

  async getPersonaById(personaId: string) {
    try {
      const persona = await prisma.personas.findUnique({
        where: { id: personaId }
      });
      return persona;
    } catch (error) {
      console.error("Database error in getPersonaById:", error);
      throw new Error("Failed to fetch persona");
    }
  }

  async createPersona(data: {
    org_id: string;
    name: string;
    description?: string;
    systemPrompt?: string;
    temperature: number;
    messageLength: MessageLength;
    primaryIntent: PrimaryIntent;
    communicationStyle: CommunicationStyle;
    techSavviness: TechSavviness;
    emotionalState: EmotionalState;
    errorTolerance: ErrorTolerance;
    decisionSpeed: DecisionSpeed;
    slangUsage: SlangUsage;
    isDefault?: boolean;
  }) {
    try {
      const newPersona = await prisma.personas.create({
        data: {
          org_id: data.org_id,
          name: data.name,
          description: data.description || "",
          system_prompt: data.systemPrompt || "",
          is_default: data.isDefault || false,
          temperature: data.temperature,
          message_length: data.messageLength,
          primary_intent: data.primaryIntent,
          communication_style: data.communicationStyle,
          tech_savviness: data.techSavviness,
          emotional_state: data.emotionalState,
          error_tolerance: data.errorTolerance,
          decision_speed: data.decisionSpeed,
          slang_usage: data.slangUsage
        }
      });
      
      return this.mapDbPersonaToPersona(newPersona);
    } catch (error) {
      console.error("Database error in createPersona:", error);
      throw new Error("Failed to create persona");
    }
  }
  
  async updatePersona(id: string, data: {
    name: string;
    description?: string;
    systemPrompt?: string;
    temperature: number;
    messageLength: MessageLength;
    primaryIntent: PrimaryIntent;
    communicationStyle: CommunicationStyle;
    techSavviness: TechSavviness;
    emotionalState: EmotionalState;
    errorTolerance: ErrorTolerance;
    decisionSpeed: DecisionSpeed;
    slangUsage: SlangUsage;
    isDefault?: boolean;
  }) {
    try {
      const updatedPersona = await prisma.personas.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          system_prompt: data.systemPrompt || "",
          is_default: data.isDefault || false,
          temperature: data.temperature,
          message_length: data.messageLength,
          primary_intent: data.primaryIntent,
          communication_style: data.communicationStyle,
          tech_savviness: data.techSavviness,
          emotional_state: data.emotionalState,
          error_tolerance: data.errorTolerance,
          decision_speed: data.decisionSpeed,
          slang_usage: data.slangUsage,
          updated_at: new Date()
        }
      });
      
      return this.mapDbPersonaToPersona(updatedPersona);
    } catch (error) {
      console.error("Database error in updatePersona:", error);
      throw new Error("Failed to update persona");
    }
  }
  
  async deletePersona(id: string) {
    try {
      await prisma.agent_persona_mappings.deleteMany({
        where: { persona_id: id }
      });
      
      await prisma.personas.delete({
        where: { id }
      });
      
      return { success: true };
    } catch (error) {
      console.error("Database error in deletePersona:", error);
      throw new Error("Failed to delete persona");
    }
  }
  
  private mapDbPersonaToPersona(dbPersona: any): Persona {
    return {
      id: dbPersona.id,
      name: dbPersona.name,
      description: dbPersona.description || "",
      systemPrompt: dbPersona.system_prompt || "",
      isDefault: dbPersona.is_default,
      temperature: dbPersona.temperature,
      messageLength: dbPersona.message_length as MessageLength,
      primaryIntent: dbPersona.primary_intent as PrimaryIntent,
      communicationStyle: dbPersona.communication_style as CommunicationStyle,
      techSavviness: dbPersona.tech_savviness as TechSavviness,
      emotionalState: dbPersona.emotional_state as EmotionalState,
      errorTolerance: dbPersona.error_tolerance as ErrorTolerance,
      decisionSpeed: dbPersona.decision_speed as DecisionSpeed,
      slangUsage: dbPersona.slang_usage as SlangUsage,
      historyBasedMemory: false,
      createdAt: dbPersona.created_at,
      updatedAt: dbPersona.updated_at
    };
  }
  
  async updateValidationRules(agentId: string, rules: Rule[]) {
    try {
      return await prisma.agent_configs.update({
        where: { id: agentId },
        data: {
          validation_rules: {
            deleteMany: {},
            create: rules.map(rule => ({
              path: rule.path,
              condition: rule.condition,
              expected_value: rule.value,
            })),
          },
        },
      });
    } catch (error) {
      console.error("Database error in updateValidationRules:", error);
      throw new Error("Failed to update validation rules");
    }
  }
  
  async createTestRun(run: TestRun) {
    try {
      return await prisma.test_runs.create({
        data: {
          id: run.id,
          agent_id: run.agentId,
          name: run.name,
          status: run.status,
          total_tests: run.metrics.total,
          passed_tests: run.metrics.passed,
          failed_tests: run.metrics.failed,
          created_by: run.createdBy,
          test_conversations: {
            create: run.chats.map(chat => ({
              id: chat.id,
              scenario_id: chat.scenario,
              persona_id: chat.personaId || "",
              status: chat.status,
              error_message: chat.error || null,
              validation_reason: chat.validationResult ? chat.validationResult.explanation : null,
              is_correct: chat.validationResult ? chat.validationResult.isCorrect : undefined,
              conversation_messages: {
                create: chat.messages.map(msg => ({
                  id: msg.id,
                  role: msg.role,
                  content: msg.content,
                  is_correct: msg.metrics?.validationScore === 1 ? true : false,
                  response_time: msg.metrics?.responseTime || 0,
                  validation_score: msg.metrics?.validationScore || 0,
                  metrics: msg.metrics || {}
                }))
              }
            }))
          }
        }
      });
    } catch (error) {
      console.error("Database error in createTestRun:", error);
      throw new Error("Failed to create test run");
    }
  }
  
  async getTestRuns(userId: string): Promise<TestRun[]> {
    try {
      // Retrieve the user's profile to get the org_id
      const profile = await prisma.profiles.findUnique({
        where: { clerk_id: userId }
      });
      if (!profile || !profile.org_id) {
        console.error(`Profile not found or missing org_id for user ${userId}`);
        throw new Error("Unauthorized: Profile not found or org missing");
      }
      
      const runs = await prisma.test_runs.findMany({
        where: { agent_configs: { org_id: profile.org_id } },
        include: {
          test_conversations: {
            include: {
              conversation_messages: true,
              test_scenarios: true,
              personas: true, 
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
            name: `${tc.test_scenarios?.name || ""} - ${tc.personas?.name || ""}`,
            scenarioName: tc.test_scenarios?.name,
            personaName: tc.personas?.name,
            scenario: conversation.scenario_id,
            status: conversation.status as 'running' | 'passed' | 'failed',
            messages: conversation.conversation_messages.map(msg => ({
              id: msg.id,
              chatId: msg.conversation_id,
              role: msg.role as "user" | "assistant",
              content: msg.content,
              expectedOutput: undefined,
              isCorrect: msg.is_correct ?? false,
              explanation: undefined,
              metrics: {
                responseTime: msg.response_time ?? 0,
                validationScore: msg.validation_score ?? 0
              }
            })),
            metrics: {
              correct: 0,
              incorrect: 0,
              responseTime: [],
              validationScores: [],
              contextRelevance: []
            },
            timestamp: conversation.created_at ? conversation.created_at.toISOString() : new Date().toISOString(),
            personaId: "",
            validationResult: {
              isCorrect: conversation.is_correct ?? false,
              explanation: conversation.validation_reason ?? ""
            }
          };
        }),     
        results: [],
        agentId: run.agent_id,
        createdBy: run.created_by,
      }));
    } catch (error) {
      console.error("Database error in getTestRuns:", error);
      throw new Error("Failed to fetch test runs");
    }
  }
  
  
  async signupUser(data: { 
    clerkId: string; 
    orgName: string; 
    orgDescription: string; 
    role: string; 
    status: string; 
  }) {
    try {
      const { clerkId, orgName, orgDescription, role, status } = data;
      return await prisma.$transaction(async (tx) => {
        const newOrg = await tx.organizations.create({
          data: {
            name: orgName,
            description: orgDescription,
          },
        });
        const newProfile = await tx.profiles.create({
          data: {
            clerk_id: clerkId,
            org_id: newOrg.id,
          },
        });
        const newOrgMember = await tx.org_members.create({
          data: {
            org_id: newOrg.id,
            user_id: newProfile.id,
            role,
            status,
          },
        });
        return { organization: newOrg, profile: newProfile, orgMember: newOrgMember };
      });
    } catch (error) {
      console.error("Database error in signupUser:", error);
      throw new Error("Failed to sign up user");
    }
  }
  
  async getProfileByClerkId(clerkId: string) {
    try {
      const profile = await prisma.profiles.findUnique({
        where: { clerk_id: clerkId }
      });
      return profile;
    } catch (error) {
      console.error("Database error in getProfileByClerkId:", error);
      return null;
    }
  }
  
  async getOrganization(orgId: string) {
    try{
      return await prisma.organizations.findUnique({
        where: { id: orgId }
      });
    } catch(error){
      console.error("Database error in getOrganization:", error);
      throw new Error("Failed to fetch organization");
    }
  }

  async getMetricById(metricId: string) {
    try {
      const metric = await prisma.metrics.findUnique({
        where: { id: metricId },
        include: {
          agent_metrics: true
        }
      });
      
      if (!metric) return null;
      
      return {
        id: metric.id,
        name: metric.name,
        type: metric.type,
        description: metric.check_criteria,
        successCriteria: metric.success_criteria,
        criticality: metric.criticality,
        createdAt: metric.created_at,
        agentIds: metric.agent_metrics.map(am => am.agent_id)
      };
    } catch (error) {
      console.error("Database error in getMetricById:", error);
      throw new Error("Failed to fetch metric");
    }
  }

  async getMetrics(userId: string): Promise<any[]> {
    try {
      const profile = await prisma.profiles.findUnique({
        where: { clerk_id: userId }
      });
      
      if (!profile || !profile.org_id) {
        return [];
      }
      
      const metrics = await prisma.metrics.findMany({
        where: {
          org_id: profile.org_id
        }
      });
      
      return metrics.map(metric => ({
        id: metric.id,
        name: metric.name,
        type: metric.type,
        description: metric.check_criteria,
        successCriteria: metric.success_criteria,
        criticality: metric.criticality,
        createdAt: metric.created_at
      }));
    } catch (error) {
      console.error("Database error in getMetrics:", error);
      return [];
    }
  }
  
  async createMetric(data: {
    name: string;
    type: string;
    description?: string;
    successCriteria?: string;
    criticality: string;
    org_id: string;
    created_by: string;
  }) {
    try {
      const newMetric = await prisma.metrics.create({
        data: {
          org_id: data.org_id,
          name: data.name,
          check_criteria: data.description || "",
          type: data.type,
          success_criteria: data.successCriteria || "",
          criticality: data.criticality,
          created_by: data.created_by
        }
      });
      
      return {
        id: newMetric.id,
        name: newMetric.name,
        type: newMetric.type,
        description: newMetric.check_criteria,
        successCriteria: newMetric.success_criteria,
        criticality: newMetric.criticality,
        createdAt: newMetric.created_at
      };
    } catch (error) {
      console.error("Database error in createMetric:", error);
      throw new Error("Failed to create metric");
    }
  }
  
  async deleteMetric(id: string) {
    try {
      // First delete all agent_metrics associations
      await prisma.agent_metrics.deleteMany({
        where: { metric_id: id }
      });
      
      // Then delete the metric
      await prisma.metrics.delete({
        where: { id }
      });
      
      return { success: true };
    } catch (error) {
      console.error("Database error in deleteMetric:", error);
      throw new Error("Failed to delete metric");
    }
  }
}

export const dbService = DbService.getInstance();
