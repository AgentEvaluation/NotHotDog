import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { LLMProvider } from './enums';
import { MODEL_CONFIGS } from './config';

export class ModelFactory {
  static createLangchainModel(modelId: string, apiKey: string, extraParams: Record<string, any> = {}): BaseChatModel {
    const config = MODEL_CONFIGS[modelId];
    if (!config) {
      throw new Error(`Model configuration not found for ${modelId}`);
    }

    switch (config.provider) {
      case LLMProvider.Anthropic:
        return new ChatAnthropic({
          anthropicApiKey: apiKey,
          modelName: config.modelId,
          temperature: config.defaultTemperature,
        });
      case LLMProvider.OpenAI:
        // For OpenAI, we need to handle the organization in their expected format
        return new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: config.modelId,
          temperature: config.defaultTemperature,
          configuration: extraParams.organization ? {
            organization: extraParams.organization
          } : undefined
        });
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }
  
  static getUserModelConfigs(): { configs: any[], selectedModelId: string } {
    const configsJson = typeof localStorage !== 'undefined' ? localStorage.getItem("model_configs") : null;
    const selectedModelId = typeof localStorage !== 'undefined' ? localStorage.getItem("selected_model_id") || "" : "";
    
    if (!configsJson) {
      return { configs: [], selectedModelId };
    }
    
    try {
      const configs = JSON.parse(configsJson);
      return { configs, selectedModelId };
    } catch (error) {
      console.error("Failed to parse model configs:", error);
      return { configs: [], selectedModelId };
    }
  }
  
  static getSelectedModelConfig() {
    const { configs, selectedModelId } = this.getUserModelConfigs();
    if (!selectedModelId || configs.length === 0) return null;
    
    return configs.find((config: any) => config.id === selectedModelId) || null;
  }
}