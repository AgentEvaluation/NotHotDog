// src/services/metrics/hallucinationDetector.ts
import { ModelFactory } from "@/services/llm/modelfactory";
import { LLMServiceConfig } from "@/services/llm/types";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

interface HallucinationResult {
  isHallucination: boolean;
  reasoning: string;
  confidence: number;
}

const HALLUCINATION_PROMPT = `Analyze the following assistant response for potential hallucinations or inaccuracies.

CONTEXT: {context}
QUERY: {query}
RESPONSE: {response}

A hallucination is when an AI generates information that is not supported by the given context or makes claims that are untrue or cannot be verified.

Carefully analyze the response and determine if it contains hallucinations:
1. If it presents fictional information as fact
2. If it claims knowledge about things not mentioned in the context
3. If it contradicts information in the context

Return ONLY a JSON object with:
- isHallucination: boolean (true if there's hallucination, false if not)
- reasoning: brief explanation of your analysis
- confidence: number between 0 and 1 indicating how confident you are in your assessment`;

export class HallucinationDetector {
  private model;
  
  constructor(modelConfig: LLMServiceConfig) {
    this.model = ModelFactory.createLangchainModel(
      modelConfig.id,
      modelConfig.apiKey,
      modelConfig.extraParams
    );
  }
  
  async detectHallucination(
    context: string, 
    query: string, 
    response: string
  ): Promise<boolean> {
    try {
      const chain = RunnableSequence.from([
        ChatPromptTemplate.fromTemplate(HALLUCINATION_PROMPT),
        this.model,
        new JsonOutputParser<HallucinationResult>()
      ]);
      
      const result = await chain.invoke({
        context: context || "No context provided",
        query,
        response
      });
      
      return result.isHallucination;
    } catch (error) {
      console.error("Error detecting hallucination:", error);
      return false; // Default to false on error
    }
  }
}

export default HallucinationDetector;