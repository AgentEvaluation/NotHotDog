  export interface TestCase {
    id: string;
    sourceTestId: string;
    scenario: string;
    expectedOutput: string;
    enabled?: boolean;
  }
