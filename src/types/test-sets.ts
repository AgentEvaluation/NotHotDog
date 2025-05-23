import { TestScenario } from './test';

export interface TestSet {
  id: string;
  name: string;
  description: string;
  agentId: string;
  agentName: string;
  agentDescription?: string;
  scenarios: TestScenario[];
  evaluations: Evaluation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Evaluation {
  scenario: string;
  expectedOutput: string;
}