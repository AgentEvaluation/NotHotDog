import { prisma } from '@/lib/prisma';
import { CommunicationStyle, DecisionSpeed, EmotionalState, ErrorTolerance, MessageLength, Persona, PrimaryIntent, SlangUsage, TechSavviness } from '@/types';

export class PersonaService {
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

}

export const personaService = new PersonaService();