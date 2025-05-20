import { LLMProvider } from "@/services/llm/enums";
import { TokenUsage } from "@/types/metrics";

// Token counting functions based on model type
const estimateOpenAITokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

const estimateAnthropicTokens = (text: string): number => {
  return Math.ceil(text.length / 4.3);
};

export class TokenUsageCalculator {
  /**
   * Estimates token usage for prompt and completion
   */
  static calculateTokenUsage(
    provider: LLMProvider,
    promptText: string,
    completionText: string
  ): TokenUsage {
    let promptTokens = 0;
    let completionTokens = 0;
    
    switch (provider) {
      case LLMProvider.OpenAI:
        promptTokens = estimateOpenAITokens(promptText);
        completionTokens = estimateOpenAITokens(completionText);
        break;
      case LLMProvider.Anthropic:
        promptTokens = estimateAnthropicTokens(promptText);
        completionTokens = estimateAnthropicTokens(completionText);
        break;
      default:
        // Default to OpenAI tokenizer for unknown providers
        promptTokens = estimateOpenAITokens(promptText);
        completionTokens = estimateOpenAITokens(completionText);
    }
    
    return {
      prompt: promptTokens,
      completion: completionTokens,
      total: promptTokens + completionTokens
    };
  }
}

export default TokenUsageCalculator;