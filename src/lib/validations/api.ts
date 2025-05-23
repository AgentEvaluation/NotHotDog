import { z } from 'zod';
import { 
  MessageLength, 
  PrimaryIntent, 
  CommunicationStyle, 
  TechSavviness, 
  EmotionalState, 
  ErrorTolerance, 
  DecisionSpeed, 
  SlangUsage 
} from '@/types';

// Persona validation schemas
export const createPersonaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  temperature: z.number().min(0).max(1),
  messageLength: z.enum(['Short', 'Medium', 'Long'] as const),
  primaryIntent: z.enum(['Information-seeking', 'Transactional', 'Support Query', 'Feedback'] as const),
  communicationStyle: z.enum(['Formal', 'Casual', 'Sarcastic', 'Concise', 'Detailed'] as const),
  techSavviness: z.enum(['Beginner', 'Intermediate', 'Advanced'] as const),
  emotionalState: z.enum(['Neutral', 'Frustrated', 'Happy', 'Curious'] as const),
  errorTolerance: z.enum(['Low', 'Medium', 'High'] as const),
  decisionSpeed: z.enum(['Fast', 'Thoughtful', 'Hesitant'] as const),
  slangUsage: z.enum(['None', 'Moderate', 'Heavy'] as const),
  historyBasedMemory: z.boolean().optional()
});

export const updatePersonaSchema = createPersonaSchema.partial().extend({
  id: z.string().uuid('Invalid persona ID')
});

// Metrics validation schemas
export const createMetricSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  type: z.enum(['accuracy', 'relevance', 'completeness', 'conciseness', 'friendliness', 'helpfulness', 'custom'] as const),
  criticality: z.enum(['Critical', 'High', 'Medium', 'Low'] as const),
  description: z.string().optional(),
  formula: z.string().optional(),
  threshold: z.number().min(0).max(100).optional(),
  agentIds: z.array(z.string()).optional()
});

export const updateMetricSchema = createMetricSchema.partial().extend({
  id: z.string().uuid('Invalid metric ID')
});

// Agent configuration validation schemas
export const agentConfigSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  endpoint: z.string().url('Invalid endpoint URL'),
  headers: z.record(z.string()).default({}),
  input: z.string().optional(),
  agent_response: z.string().optional(),
  rules: z.array(z.object({
    id: z.string(),
    type: z.string(),
    field: z.string(),
    condition: z.string(),
    value: z.string(),
    severity: z.enum(['Critical', 'High', 'Medium', 'Low'] as const)
  })).optional().default([]),
  responseTime: z.number().optional(),
  agentDescription: z.string().optional(),
  userDescription: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  org_id: z.string().uuid().optional(),
  created_by: z.string().uuid().optional()
});

// Test run validation schemas
export const createTestRunSchema = z.object({
  testId: z.string().uuid('Invalid test ID')
});

// Validation helper function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Type-safe validation with error handling
export function safeValidateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}