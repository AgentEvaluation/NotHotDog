export interface MessageMetrics {
  responseTime?: number;
  isHallucination?: boolean | null;
}

export interface BaseMetrics {
  correct: number;
  incorrect: number;
}

export interface TestMetrics extends BaseMetrics {
  total: number;
  passed: number;
  failed: number;
  chats: number;
  sentimentScores?: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface ChatMetrics extends BaseMetrics {
  correct: number;
  incorrect: number;
  responseTime: number[];
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
}

export type MetricType =
  | "Binary Qualitative"
  | "Numeric"
  | "Binary Workflow Adherence"
  | "Continuous Qualitative"
  | "Enum"

export type Criticality = "Low" | "Medium" | "High";

export interface Metric {
  id: string;
  name: string;
  description?: string;
  type: MetricType;
  successCriteria?: string;
  criticality?: Criticality;
  agentIds?: string[];
  createdAt?: string;
}