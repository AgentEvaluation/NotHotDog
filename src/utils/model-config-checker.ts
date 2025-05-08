// src/utils/model-config-checker.ts
import { ModelFactory } from '@/services/llm/modelfactory';

/**
 * Checks if a valid LLM model configuration exists and returns appropriate headers
 * @returns Object containing API headers if configuration exists, or null if missing
 */
export function getModelConfigHeaders(): Record<string, string> | null {
  const modelConfig = ModelFactory.getSelectedModelConfig();
  
  if (!modelConfig || !modelConfig.apiKey) {
    return null;
  }
  
  // Prepare headers for API requests
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': modelConfig.apiKey,
    'X-Model': modelConfig.id,
    'X-Provider': modelConfig.provider,
  };
  
  // Add extra parameters if available
  if (modelConfig.extraParams) {
    headers['X-Extra-Params'] = JSON.stringify(modelConfig.extraParams);
  }
  
  return headers;
}