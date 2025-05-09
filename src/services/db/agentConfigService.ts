import { prisma } from '@/lib/prisma';
import { Rule } from '@/services/agents/claude/types';

export class AgentConfigService {
  async getAgentConfigs(userId: string): Promise<any[]> {
    try { 
      const configs = await prisma.agent_configs.findMany({
        where: {
          organizations: {
            profiles: { some: { clerk_id: userId } }
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
  
}

export const agentConfigService = new AgentConfigService();