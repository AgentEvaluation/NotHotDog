import { ModelFactory } from "@/services/llm/modelfactory";
import { AnthropicModel } from "@/services/llm/enums";
import { Persona } from "@/types";
import { LLMServiceConfig } from "../llm/types";

export async function generateSystemPromptForPersona(
  persona: Persona, 
  modelConfig: LLMServiceConfig
): Promise<string> {
  const prompt = `Based on the following persona details, generate a detailed system prompt for an AI agent that fully reflects the persona's characteristics, tone, and behavior.
Description: ${persona.description}
Primary Intent: ${persona.primaryIntent}
Communication Style: ${persona.communicationStyle}
Tech Savviness: ${persona.techSavviness}
Emotional State: ${persona.emotionalState}
Error Tolerance: ${persona.errorTolerance}
Decision Speed: ${persona.decisionSpeed}
Slang Usage: ${persona.slangUsage}
Temperature: ${persona.temperature}
Message Length: ${persona.messageLength}


FORMAT YOUR RESPONSE AS A DIRECT DESCRIPTION of:
1. Defining personality traits and behaviors
2. Specific communication style elements
3. Emotional expressions and reactions
4. Vocabulary and language preferences
5. Response patterns and tendencies

Include specific examples of phrases and reactions this personality would exhibit.`;


  const model = ModelFactory.createLangchainModel(
    modelConfig.id,
    modelConfig.apiKey,
    modelConfig.extraParams
  );
  
  const result = await model.invoke([{ role: "user", content: prompt }]);
  const content = typeof result.content === "string" 
    ? result.content 
    : JSON.stringify(result.content);
    
  return content.trim();
}