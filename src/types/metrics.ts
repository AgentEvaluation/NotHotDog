export interface MessageMetrics {
  responseTime?: number;
  validationScore?: number;
  contextRelevance?: number;
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
  validationScores: number[];
  contextRelevance: number[];
  validationDetails?: {
    customFailure?: boolean;
    containsFailures?: string[];
    notContainsFailures?: string[];
  };
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