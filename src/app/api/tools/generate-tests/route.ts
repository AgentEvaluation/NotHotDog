import { withApiHandler } from '@/lib/api-utils';
import { jsonrepair } from 'jsonrepair';
import { AnthropicModel, LLMProvider } from '@/services/llm/enums';
import { ModelFactory } from '@/services/llm/modelfactory';
import { TEST_CASES_PROMPT } from '@/services/prompts';
import { dbService } from '@/services/db';
import { Evaluation } from '@/types/test-sets';
import { ValidationError, NotFoundError, ConfigurationError } from '@/lib/errors';

function extractJSON(text: string): any {
  try {
    // Find the array start
    const jsonStart = text.indexOf('[');
    if (jsonStart === -1) {
      const objStart = text.indexOf('{');
      if (objStart === -1) {
        console.warn('No JSON structure found');
        return { evaluations: [] };
      }
      text = text.slice(objStart);
    } else {
      text = text.slice(jsonStart);
    }
    
    // First try to parse directly (might work if JSON is well-formed)
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? { evaluations: parsed } : parsed;
    } catch (parseError) {
      // If direct parsing fails, try to clean and repair the JSON
      // Remove any backticks, markdown code blocks, or other non-JSON elements
      text = text.replace(/```json|```|`/g, '');
      
      // Find the end of JSON structure (to handle trailing text)
      const lastBrace = text.lastIndexOf('}');
      const lastBracket = text.lastIndexOf(']');
      const jsonEnd = Math.max(lastBrace, lastBracket);
      
      if (jsonEnd !== -1) {
        text = text.substring(0, jsonEnd + 1);
      }
      
      // Now attempt repair on the cleaned text
      const repaired = jsonrepair(text);
      const parsed = JSON.parse(repaired);
      
      // If we got an array directly, wrap it
      return Array.isArray(parsed) ? { evaluations: parsed } : parsed;
    }
  } catch (e) {
    console.warn('JSON extraction failed:', e);
    return { evaluations: [] };
  }
}

function isValidEvaluation(evaluation: any): evaluation is Evaluation {
  return (
    evaluation &&
    typeof evaluation === 'object' &&
    typeof evaluation.scenario === 'string' &&
    evaluation.scenario.trim().length > 0 &&
    typeof evaluation.expectedOutput === 'string' &&
    evaluation.expectedOutput.trim().length > 0
  );
}

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const testId = body.testId;

  if (!testId) {
    throw new ValidationError("Missing testId");
  }

  const agentConfig = await dbService.getAgentConfig(testId);
  if (!agentConfig) {
    throw new NotFoundError("Agent config not found");
  }

  const agentDescription = agentConfig.agentDescription || "Not provided";
  const userDescription = agentConfig.userDescription || "Not provided";

  const apiKey = req.headers.get("x-api-key");
  const modelId = req.headers.get("x-model") || AnthropicModel.Sonnet3_5;
  const provider = req.headers.get("x-provider") || LLMProvider.Anthropic;
  const extraParamsStr = req.headers.get("x-extra-params");
  
  let extraParams = {};
  if (extraParamsStr) {
    try {
      extraParams = JSON.parse(extraParamsStr);
    } catch (e) {
      throw new ValidationError("Failed to parse extra params: " + 
        (e instanceof Error ? e.message : String(e)));
    }
  }
  
  if (!apiKey) {
    throw new ConfigurationError("API key required");
  }

  const model = ModelFactory.createLangchainModel(modelId, apiKey, extraParams);

  const context = `Agent Description: ${agentDescription}
User Description: ${userDescription}`;

  const prompt = TEST_CASES_PROMPT.replace("{context}", context);

  const response = await model.invoke([
    {
      role: "user",
      content: prompt as string,
    },
  ]);

  let evaluations = extractJSON(response.content as string);

  if (!evaluations?.evaluations || !Array.isArray(evaluations.evaluations)) {
    evaluations = { evaluations: [] };
  }

  const validEvaluations = evaluations.evaluations
    .filter(isValidEvaluation)
    .map((evaluation: Evaluation) => ({
      scenario: evaluation.scenario.trim(),
      expectedOutput: evaluation.expectedOutput.trim(),
    }));

  if (validEvaluations.length === 0) {
    throw new ValidationError("No valid test cases generated");
  }

  const variation = {
    id: crypto.randomUUID(),
    testId,
    sourceTestId: testId,
    timestamp: new Date().toISOString(),
    cases: validEvaluations.map((evaluation: Evaluation) => ({
      id: crypto.randomUUID(),
      sourceTestId: testId,
      scenario: evaluation.scenario,
      expectedOutput: evaluation.expectedOutput,
    })),
  };

  await dbService.createTestVariation(variation);

  return {
    testCases: variation.cases,
    stats: {
      total: evaluations.evaluations.length,
      valid: validEvaluations.length,
      filtered: evaluations.evaluations.length - validEvaluations.length,
    },
  };
});