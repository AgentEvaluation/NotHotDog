import { prisma } from '@/lib/prisma';
import { Persona } from '@/types';

// Hardcoded personas for community edition
// Using fixed UUIDs for consistency
const COMMUNITY_PERSONAS: Persona[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Friendly User',
    description: 'A typical friendly user asking questions politely',
    systemPrompt: 'You are a friendly user asking questions in a polite and clear manner.',
    temperature: 0.7,
    messageLength: 'MEDIUM',
    primaryIntent: 'INFORMATION_SEEKING',
    communicationStyle: 'FRIENDLY',
    techSavviness: 'MODERATE',
    emotionalState: 'POSITIVE',
    errorTolerance: 'HIGH',
    decisionSpeed: 'MODERATE',
    slangUsage: 'MINIMAL',
    isDefault: true,
    created_at: new Date(),
    updated_at: new Date(),
    org_id: ''
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Technical Expert',
    description: 'A technically savvy user with detailed questions',
    systemPrompt: 'You are a technical expert asking detailed and specific questions using proper technical terminology.',
    temperature: 0.5,
    messageLength: 'LONG',
    primaryIntent: 'TECHNICAL_SUPPORT',
    communicationStyle: 'FORMAL',
    techSavviness: 'EXPERT',
    emotionalState: 'NEUTRAL',
    errorTolerance: 'LOW',
    decisionSpeed: 'FAST',
    slangUsage: 'NONE',
    isDefault: true,
    created_at: new Date(),
    updated_at: new Date(),
    org_id: ''
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Confused User',
    description: 'A user who needs extra help and clarification',
    systemPrompt: 'You are a confused user who needs things explained simply and may ask follow-up questions for clarification.',
    temperature: 0.8,
    messageLength: 'SHORT',
    primaryIntent: 'HELP_SUPPORT',
    communicationStyle: 'CASUAL',
    techSavviness: 'BEGINNER',
    emotionalState: 'CONFUSED',
    errorTolerance: 'VERY_HIGH',
    decisionSpeed: 'SLOW',
    slangUsage: 'MODERATE',
    isDefault: true,
    created_at: new Date(),
    updated_at: new Date(),
    org_id: ''
  }
];

export class PersonaService {
  async getPersonas(): Promise<Persona[]> {
    // Return hardcoded personas for community edition
    return COMMUNITY_PERSONAS;
  }

  async getPersonaById(personaId: string): Promise<Persona | null> {
    const persona = COMMUNITY_PERSONAS.find(p => p.id === personaId);
    return persona || null;
  }

  async createPersona(data: any) {
    throw new Error('Custom personas are not available in the community edition');
  }

  async updatePersona(personaId: string, data: any) {
    throw new Error('Custom personas are not available in the community edition');
  }

  async deletePersona(personaId: string) {
    throw new Error('Custom personas are not available in the community edition');
  }
}

export const personaService = new PersonaService();