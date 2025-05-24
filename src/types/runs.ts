import { MessageRole } from "./base";
import { Conversation } from "./chat";

interface Metrics {
  total: number;
  passed: number;
  failed: number;
  chats: number;
  correct: number;
  incorrect: number;
  sentimentScores?: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface TestRun {
  id: string;
  name: string;
  timestamp: string;
  status: TestRunStatus;
  metrics: Metrics;
  chats: Conversation[];
  results: Array<{ scenarioId: string; responseTime: number }>;
  agentId: string;
  createdBy?: string;
}

export type TestRunStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface TestMessage {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  expectedOutput?: string;
  explanation?: string;
  metrics?: {
    responseTime?: number;
    isHallucination?: boolean | null;
  };
}