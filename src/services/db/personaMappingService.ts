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
}

export const personaMappingService = new PersonaMappingService();