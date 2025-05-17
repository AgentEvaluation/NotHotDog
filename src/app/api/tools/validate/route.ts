export const runtime = 'edge';

import { withApiHandler } from '@/lib/api-utils';
import { ModelFactory } from '@/services/llm/modelfactory';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ValidationError, ConfigurationError } from '@/lib/errors';

const validationTemplate = ChatPromptTemplate.fromMessages([
  ["user", `You are a test validation system. Compare if the actual response matches the expected output semantically.
The responses don't need to match exactly, but they should convey the same meaning and information.

Expected Output:
{expectedOutput}

Actual Response:
{actualResponse}

Respond in this exact JSON format:
{
  "isCorrect": boolean,
  "explanation": "Detailed explanation of why the response matches or doesn't match"
}

Focus on semantic meaning rather than exact wording. Consider:
1. Core information/intent matches
2. Key details are present
3. No contradictions
4. Similar level of specificity`]
]);

export const POST = withApiHandler(async (req: Request) => {
  const { actualResponse, expectedOutput } = await req.json();
  
  if (!actualResponse || !expectedOutput) {
    throw new ValidationError("Missing required fields: actualResponse and expectedOutput");
  }
  
  const modelConfig = ModelFactory.getSelectedModelConfig();
  if (!modelConfig) {
    throw new ConfigurationError('No LLM model configured. Please set up a model in settings.');
  }

  const model = ModelFactory.createLangchainModel(
    modelConfig.id,
    modelConfig.apiKey,
    modelConfig.extraParams
  );

  const chain = RunnableSequence.from([
    validationTemplate,
    model,
    new JsonOutputParser<{
      isCorrect: boolean;
      explanation: string;
    }>()
  ]);

  const validation = await chain.invoke({
    expectedOutput,
    actualResponse
  });

  return validation;
});