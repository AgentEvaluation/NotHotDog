import { LLMProvider, AnthropicModel, OpenAIModel } from './enums';
import { ModelConfig } from './types';

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // Anthropic models
  [AnthropicModel.Sonnet3_5]: {
    provider: LLMProvider.Anthropic,
    modelId: AnthropicModel.Sonnet3_5,
    name: 'Claude 3.5 Sonnet',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    defaultTemperature: 0.7
  },
  [AnthropicModel.Opus3]: {
    provider: LLMProvider.Anthropic,
    modelId: AnthropicModel.Opus3,
    name: 'Claude 3 Opus',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    defaultTemperature: 0.7
  },
  [AnthropicModel.Haiku3]: {
    provider: LLMProvider.Anthropic,
    modelId: AnthropicModel.Haiku3,
    name: 'Claude 3 Haiku',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    defaultTemperature: 0.7
  },
  
  // OpenAI models
  [OpenAIModel.GPT4]: {
    provider: LLMProvider.OpenAI,
    modelId: OpenAIModel.GPT4,
    name: 'GPT-4',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    defaultTemperature: 0.7
  },
  [OpenAIModel.GPT4Turbo]: {
    provider: LLMProvider.OpenAI,
    modelId: OpenAIModel.GPT4Turbo,
    name: 'GPT-4 Turbo',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    defaultTemperature: 0.7
  },
  [OpenAIModel.GPT35Turbo]: {
    provider: LLMProvider.OpenAI,
    modelId: OpenAIModel.GPT35Turbo,
    name: 'GPT-3.5 Turbo',
    contextWindow: 16385,
    maxOutputTokens: 4096,
    defaultTemperature: 0.7
  }
};

// Group models by provider for easier UI selection
export const PROVIDER_MODELS = {
  [LLMProvider.Anthropic]: [
    AnthropicModel.Sonnet3_5,
    AnthropicModel.Opus3,
    AnthropicModel.Haiku3
  ],
  [LLMProvider.OpenAI]: [
    OpenAIModel.GPT4,
    OpenAIModel.GPT4Turbo,
    OpenAIModel.GPT35Turbo
  ]
};