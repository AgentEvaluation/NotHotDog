import { ModelFactory } from "@/services/llm/modelfactory";
import { AnthropicModel } from "@/services/llm/enums";
import { Persona } from "@/types";

export async function generateSystemPromptForPersona(
  persona: Persona, 
  userApiKey: string
): Promise<string> {
  const prompt = `Based on the following persona details, generate a detailed system prompt for an AI agent that fully reflects the persona's characteristics, tone, and behavior.
Persona Name: ${persona.name}
Description: ${persona.description || "No description provided"}
Primary Intent: ${persona.primaryIntent}
Communication Style: ${persona.communicationStyle}
Tech Savviness: ${persona.techSavviness}
Emotional State: ${persona.emotionalState}
Error Tolerance: ${persona.errorTolerance}
Decision Speed: ${persona.decisionSpeed}
Slang Usage: ${persona.slangUsage}
Temperature: ${persona.temperature}
Message Length: ${persona.messageLength}

Return ONLY the generated system prompt text without any extra commentary.`;

  const model = ModelFactory.createLangchainModel(
    AnthropicModel.Sonnet3_5, 
    userApiKey
  );
  
  const result = await model.invoke([{ role: "user", content: prompt }]);
  const content = typeof result.content === "string" 
    ? result.content 
    : JSON.stringify(result.content);
    
  return content.trim();
}