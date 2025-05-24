import { prisma } from '@/lib/prisma';

export class PersonaMappingService {
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
      // Check if mapping already exists
      const existingMapping = await prisma.agent_persona_mappings.findFirst({
        where: {
          agent_id: agentId,
          persona_id: personaId
        }
      });
      
      if (existingMapping) {
        // Already exists, just return current mappings
        return this.getPersonaMappingByAgentId(agentId);
      }
      
      await prisma.agent_persona_mappings.create({
        data: {
          agent_id: agentId,
          persona_id: personaId,
        },
      });
      return this.getPersonaMappingByAgentId(agentId);
    } catch (error) {
      console.error("Database error in createPersonaMapping:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        agentId,
        personaId
      });
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
}

export const personaMappingService = new PersonaMappingService();