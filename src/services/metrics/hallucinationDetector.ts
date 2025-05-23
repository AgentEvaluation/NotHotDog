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

const HALLUCINATION_PROMPT = `Analyze the following assistant response for potential hallucinations or inaccuracies.

AGENT DESCRIPTION: {agentDescription}
CONVERSATION HISTORY: {context}
CURRENT QUERY: {query}
ASSISTANT RESPONSE: {response}

A hallucination occurs when the AI:
1. Presents fictional information as fact
2. Claims knowledge about things not mentioned in the conversation history
3. Contradicts information previously stated in the conversation
4. Makes assertions that go beyond what can be reasonably inferred
5. Drifts to completely unrelated topics (e.g., answering about weather when asked about laptop prices)
6. Acts outside its described capabilities

Consider the agent's described purpose and capabilities when evaluating. The agent should:
- Stay on topic and relevant to the conversation
- Only claim capabilities mentioned in its description
- Provide reasonable responses within its stated domain

Return ONLY a JSON object with:
- isHallucination: boolean (true if there's hallucination, false if not)
- reasoning: brief explanation of your analysis`;

export class HallucinationDetector {
  private model;
  private chain: RunnableSequence;
  private agentDescription: string;
  
  constructor(modelConfig: LLMServiceConfig, agentDescription: string) {
    this.agentDescription = agentDescription;
    this.model = ModelFactory.createLangchainModel(
      modelConfig.id,
      modelConfig.apiKey,
      modelConfig.extraParams
    );
    
    // Initialize the chain in constructor
    this.chain = RunnableSequence.from([
      ChatPromptTemplate.fromTemplate(HALLUCINATION_PROMPT),
      this.model,
      new JsonOutputParser<HallucinationResult>()
    ]);
  }
  
  async detectHallucination(
    context: string, 
    query: string, 
    response: string
  ): Promise<boolean> {
    try {
      const result = await this.chain.invoke({
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
      
      // Try to extract JSON from error message if it's a parsing issue
      if (error instanceof Error && error.message.includes('JSON')) {
        try {
          const jsonMatch = error.message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.isHallucination || false;
          }
        } catch (parseError) {
          console.error("Failed to parse JSON from error:", parseError instanceof Error ? parseError.message : String(parseError));
        }
      }
      
      return false; // Default to false on error
    }
  }
}

export default HallucinationDetector;