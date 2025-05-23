import { MessageRole } from './base';
import { Evaluation } from './test-sets';

export interface TestScenario {
  id: string;
  scenario: string;
  input?: string;
  expectedOutput: string;
  type?: 'transcript' | 'rule' | 'metric';
  enabled?: boolean;
  metrics?: {
    [key: string]: number | undefined;
    sentimentAnalysis?: number;
    responseQuality?: number;
    hallucination?: number;
  };
  steps?: ConversationStep[];
  sourceTestId?: string;
}

export interface ConversationStep {
  id: string;
  role: MessageRole;
  content: string;
  validationPoints?: {
    contains?: string[];
    notContains?: string[];
  };
  branch?: Array<{
    condition: string;
    nextStep: string;
  }>;
}

// TestSet moved to @/types/test-sets to avoid duplication