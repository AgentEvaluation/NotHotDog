export interface TestVariation {
    id: string;
    testId: string;
    timestamp: string;
    sourceTestId: string;
    cases: Array<{
      id: string;
      scenario: string;
      expectedOutput: string;
      sourceTestId: string;
      enabled?: boolean;
    }>;
  }
  
  export interface TestVariations {
    [testId: string]: TestVariation[];
  }

  export interface SimplifiedTestCase {
    id: string;
    scenario: string;
    expectedOutput: string;
    enabled?: boolean;
  }
  
  export interface SimplifiedTestCases {
    testId: string;
    testCases: SimplifiedTestCase[];
  }