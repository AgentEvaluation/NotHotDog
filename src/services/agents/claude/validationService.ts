export class ValidationService {
    private model;
    
    constructor(model: any) {
      this.model = model;
    }
  
    async validateWithMetrics(conversation: string, scenario: string, expectedOutput: string, metrics: any[]) {
        const promptText = `You are evaluating a conversation against expected output and specific metrics.
        
        CONVERSATION: ${conversation}
        SCENARIO: ${scenario}
        EXPECTED OUTPUT: ${expectedOutput}
        METRICS: ${JSON.stringify(metrics.map(m => ({id: m.id, type: m.type, criteria: m.check_criteria})))}
        
        Your response MUST be VALID JSON with this exact structure:
        {"isCorrect": boolean, "explanation": "reason", "metrics": [{"id": "metric-id", "score": number, "reason": "explanation"}]}
        
        DO NOT include any text outside the JSON object.
        Evaluate both expected output match and each metric.`;
      
        const result = await this.model.invoke([{ role: 'user', content: promptText }]);
        const content = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
        
        try {
          // Try direct parsing first
          return JSON.parse(content);
        } catch (directError) {
          try {
            // Extract JSON if model included explanatory text - improved regex
            const jsonMatch = content.match(/\{(?:[^{}]|{[^{}]*})*\}/);
            if (jsonMatch) {
              return JSON.parse(jsonMatch[0]);
            }
            throw new Error("No JSON found");
          } catch (extractError) {
            console.error("Failed to extract valid JSON:", extractError);
            console.error("Raw content:", content);
            return {
              isCorrect: false,
              explanation: "Failed to parse evaluation results",
              metrics: metrics.map(m => ({
                id: m.id,
                score: 0,
                reason: "Evaluation failed due to parsing error"
              }))
            };
          }
        }
      }
    
    public async validateFullConversation(
      fullConversation: string,
      scenario: string,
      expectedOutput: string,
      metrics?: any[]
    ) {
      // 1. Expected output-only validation
      const promptWithoutMetrics = `You are a strict evaluator. Return ONLY valid JSON. No extra text.
      
    Test Scenario: ${scenario}
    Expected Output: ${expectedOutput}
    Complete Conversation:
    ${fullConversation}
    
    Return JSON in this EXACT format:
    {"isCorrect": true or false, "explanation": "Your reason in a single string"}
    Do NOT include any text outside the braces.`;
    
      const resultWithoutMetrics = await this.model.invoke([{ role: 'user', content: promptWithoutMetrics }]);
      const contentWithoutMetrics = typeof resultWithoutMetrics.content === 'string'
        ? resultWithoutMetrics.content
        : JSON.stringify(resultWithoutMetrics.content);
      let expectedOutputEvaluation;
      try {
        expectedOutputEvaluation = JSON.parse(contentWithoutMetrics);
      } catch (error) {
        console.error("Model did not return valid JSON for expected output evaluation:", error);
        console.error("Raw content:", contentWithoutMetrics);
        expectedOutputEvaluation = {
          isCorrect: false,
          explanation: "Model returned invalid JSON during expected output evaluation."
        };
      }
    
      // 2. Metrics-based validation (which also includes expected output)
      const metricsEvaluation = await this.validateWithMetrics(
        fullConversation,
        scenario,
        expectedOutput,
        metrics ?? []
      );
    
      // 3. Combine both JSON responses:
      const combinedIsCorrect = expectedOutputEvaluation.isCorrect && metricsEvaluation.isCorrect;
      const combinedExplanation = `Expected Output Eval: ${expectedOutputEvaluation.explanation}. Metrics Eval: ${metricsEvaluation.explanation}`;
    
      return {
        isCorrect: combinedIsCorrect,
        explanation: combinedExplanation,
        expectedOutputEvaluation,
        metricsEvaluation,
        metrics: metricsEvaluation.metrics || []
      };
    }
  }