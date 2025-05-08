import { LLMProvider } from "./enums";

export interface ModelConfig {
    provider: LLMProvider;
    modelId: string;
    name: string;
    contextWindow: number;
    maxOutputTokens: number;
    defaultTemperature: number;
  }
  
export interface LLMServiceConfig {
  id: string;
  provider: LLMProvider;
  name: string;
  apiKey: string;
  keyName: string;
  extraParams?: Record<string, any>;
}

export interface UserModelConfigs {
  configs: LLMServiceConfig[];
  selectedModelId: string;
}