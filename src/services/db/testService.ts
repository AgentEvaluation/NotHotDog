import { prisma } from '@/lib/prisma';
import { SimplifiedTestCases, TestVariation } from '@/types/variations';

export class TestService {
  async getTestVariations(testId: string): Promise<SimplifiedTestCases> {
    try {
      const scenarios = await prisma.test_scenarios.findMany({
        where: { agent_id: testId },
        orderBy: { created_at: 'desc' }
      });
  
      const testCases = scenarios.map(scenario => ({
        id: scenario.id,
        scenario: scenario.name,
        expectedOutput: scenario.expected_output,
        enabled: scenario.enabled
      }));
  
      return { testId, testCases };
    } catch (error) {
      console.error("Database error in getTestVariations:", error);
      throw new Error("Failed to fetch test variations");
    }
  }
  
  
  async createTestVariation(variation: TestVariation) {
    try {
      const testScenariosData = variation.cases.map((testCase) => ({
        id: testCase.id,
        agent_id: variation.testId,
        name: testCase.scenario,
        input: testCase.scenario,
        expected_output: testCase.expectedOutput,
        created_at: new Date(variation.timestamp),
        updated_at: new Date(variation.timestamp),
      }));
  
      const result = await prisma.test_scenarios.createMany({
        data: testScenariosData,
      });
  
      return result;
    } catch (error) {
      console.error("Database error in createTestVariation:", error);
      throw new Error("Failed to create test variation");
    }
  }
  
  async updateTestVariation(variation: TestVariation) {
    try {
      const editedCase = variation.cases[0];
      return await prisma.test_scenarios.update({
        where: { id: editedCase.id },
        data: {
          name: editedCase.scenario,
          input: editedCase.scenario,
          expected_output: editedCase.expectedOutput,
          updated_at: new Date(variation.timestamp)
        }
      });
    } catch (error) {
      console.error("Database error in updateTestVariation:", error);
      throw new Error("Failed to update test variation");
    }
  }

  async updateScenarioEnabled(scenarioId: string, enabled: boolean) {
    try {
      return await prisma.test_scenarios.update({
        where: { id: scenarioId },
        data: { enabled }
      });
    } catch (error) {
      console.error("Database error in updateScenarioEnabled:", error);
      throw new Error("Failed to update scenario status");
    }
  }
  
    async deleteTestScenarios(testId: string, scenarioIds: string[]) {
        try {
        const result = await prisma.test_scenarios.deleteMany({
            where: {
                agent_id: testId,
                id: {
                    in: scenarioIds
                }
            }
        });
        return { deletedCount: result.count };
        } catch (error) {
        console.error("Database error in deleteTestScenarios:", error);
        throw new Error("Failed to delete test scenarios");
        }
    }
}

export const testService = new TestService();