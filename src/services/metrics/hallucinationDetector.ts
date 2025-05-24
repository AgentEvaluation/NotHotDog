// src/services/metrics/hallucinationDetector.ts
import { ModelFactory } from "@/services/llm/modelfactory";
import { LLMServiceConfig } from "@/services/llm/types";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

interface HallucinationResult {
  isHallucination: boolean;
  reasoning: string;
}

const HALLUCINATION_PROMPT = `You are a hallucination detector. Analyze the following assistant response for potential hallucinations.

AGENT DESCRIPTION: {agentDescription}
CONVERSATION HISTORY: {context}
USER QUERY: {query}
ASSISTANT RESPONSE: {response}

A hallucination occurs when the AI:
1. Presents fictional information as fact
2. Claims knowledge about things not mentioned in the conversation
3. Contradicts information previously stated
4. Makes assertions beyond what can be reasonably inferred
5. Goes off-topic from the query
6. Provides unrequested specific details (dates, names, quantities, etc.)

Respond in this exact JSON format:
{{
  "isHallucination": boolean,
  "reasoning": "Brief explanation of your analysis"
}}

Only output the JSON, nothing else.`;

export class HallucinationDetector {
  private model;
  private agentDescription: string;
  
  constructor(modelConfig: LLMServiceConfig, agentDescription: string) {
    this.agentDescription = agentDescription;
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
  ): Promise<boolean | null> {
    try {
      const prompt = ChatPromptTemplate.fromMessages([
        ["user", HALLUCINATION_PROMPT]
      ]);
      
      const chain = RunnableSequence.from([
        prompt,
        this.model,
        new JsonOutputParser<HallucinationResult>()
      ]);
      
      const result = await chain.invoke({
        agentDescription: this.agentDescription,
        context: context,
        query,
        response
      });
      
      // Log the reasoning for debugging and analysis purposes
      console.log(`Hallucination detection result for query "${query.substring(0, 30)}...": ${result.isHallucination ? "DETECTED" : "NOT DETECTED"}`);
      console.log(`Reasoning: ${result.reasoning}`);
      
      return result.isHallucination;
    } catch (error) {
      console.error("Error detecting hallucination:", error);
      
      // If JsonOutputParser fails, try manual parsing
      try {
        const prompt = ChatPromptTemplate.fromMessages([
          ["user", HALLUCINATION_PROMPT]
        ]);
        
        const chain = RunnableSequence.from([
          prompt,
          this.model
        ]);
        
        const rawResult = await chain.invoke({
          agentDescription: this.agentDescription,
          context: context,
          query,
          response
        });
        
        const responseText = typeof rawResult === 'string' ? rawResult : rawResult.content;
        const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
        
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as HallucinationResult;
          console.log("Successfully parsed hallucination result from raw response");
          return parsed.isHallucination;
        }
      } catch (fallbackError) {
        console.error("Fallback parsing also failed:", fallbackError);
      }
      
      return null;
    }
  }
}

export default HallucinationDetector;