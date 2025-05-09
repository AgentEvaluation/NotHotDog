import { TestScenario } from "@/types/test";

export interface TestSet {
  id: string;
  name: string;
  description: string;
  scenarios: TestScenario[];
  createdAt: Date;
  updatedAt: Date;
}
