export const runtime = 'edge';

import { withApiHandler } from '@/lib/api-utils';
import { validateAnalyzeResultsRequest } from '@/lib/validations';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ModelFactory } from '@/services/llm/modelfactory';
import { ValidationError, ConfigurationError } from '@/lib/errors';

interface AnalysisResult {
  categorizedResults: Record<string, {
    successRate: number;
    averageResponseTime: number;
  }>;
  insights: string[];
  summary: {
    overallSuccess: number;
    averageResponseTime: number;
    performance: string;
  };
  improvements: string[];
}

const analysisTemplate = ChatPromptTemplate.fromMessages([
  ["user", `Analyze these test results and provide insights:
{results}
Return the analysis as JSON with:
1. categorizedResults: Results grouped by test category with success rates and response times
2. insights: Array of strings with key findings and recommendations
3. summary: Overall metrics and performance assessment
4. improvements: Specific suggestions for improvement`]
]);

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const { results } = validateAnalyzeResultsRequest(body);

  const modelConfig = ModelFactory.getSelectedModelConfig();
  if (!modelConfig) {
    throw new ConfigurationError('No LLM model configured. Please set up a model in settings.');
  }

  const model = ModelFactory.createLangchainModel(
    modelConfig.id,
    modelConfig.apiKey,
    modelConfig.extraParams
  );

  const analysisChain = RunnableSequence.from([
    analysisTemplate,
    model,
    new JsonOutputParser<AnalysisResult>()
  ]);

  const analysis = await analysisChain.invoke({
    results: JSON.stringify(results, null, 2)
  });

  return analysis;
});