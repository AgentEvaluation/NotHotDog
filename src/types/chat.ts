import { TestMessage } from "./runs";

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isCorrect? : boolean;
  metrics?: {
    responseTime?: number;
    validationScore?: number;
    contextRelevance?: number;
  };
}

export interface Conversation {
  id: string;
  name: string;
  scenario: string;
  scenarioName: string,
  personaName: string,
  status: 'running' | 'passed' | 'failed';
  messages: TestMessage[];
  metrics: {
    correct: number;
    incorrect: number;
    responseTime: number[];
    validationScores: number[];
    contextRelevance: number[];
    validationDetails?: {
      customFailure?: boolean;
      containsFailures?: string[];
      notContainsFailures?: string[];
    };
    metricResults?: Array<{
      id: string;
      name: string;
      score: number;
      reason: string;
    }>;
    isHallucination?: boolean; 
  };
  error?: string | null;
  timestamp: string;
  personaId: string;
  validationResult?: ValidationResult;
}


export interface ValidationResult {
  isCorrect: boolean;
  explanation: string;
}

