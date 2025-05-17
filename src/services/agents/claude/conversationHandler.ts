import { Rule } from './types';

/**
 * ConversationHandler - Helper class for extracting and formatting conversation elements
 * Updated to work with adaptive conversation flow
 */
export class ConversationHandler {
  /**
   * Extract the test message from model response
   * Handles both explicit TEST_MESSAGE format and regular responses
   */
  static extractTestMessage(response: string): string {
    // Try to find explicit TEST_MESSAGE tag
    const testMessageMatch = response.match(/TEST_MESSAGE:\s*(.*?)(?:\n|$)/s);
    if (testMessageMatch && testMessageMatch[1]) {
      return testMessageMatch[1].trim();
    }
    
    // Try to find message with standard prefixes
    const messageMatch = response.match(/(?:Message:|Response:|User message:|Human:)\s*(.*?)(?:\n|$)/s);
    if (messageMatch && messageMatch[1]) {
      return messageMatch[1].trim();
    }
    
    // If no explicit markers, clean up the text and return it
    // Remove any explanations or analyses
    let cleanedResponse = response
      .replace(/ANALYSIS:|EXPLANATION:|REASONING:|PLAN:|CONVERSATION_PLAN:/gi, '\n')
      .replace(/TEST_COMPLETE|\[TEST_COMPLETE\]/gi, '')
      .trim();
      
    // If response has multiple paragraphs, take just the first one
    // as it's likely the actual message
    const paragraphs = cleanedResponse.split(/\n\s*\n/);
    if (paragraphs.length > 1 && paragraphs[0].length < 500) {
      return paragraphs[0].trim();
    }
    
    return cleanedResponse;
  }

  /**
   * Check if a response indicates the test is complete
   */
  static isTestComplete(response: string): boolean {
    return response.includes("TEST_COMPLETE") || 
           response.includes("[TEST_COMPLETE]") ||
           response.includes("test is complete") ||
           response.includes("conversation is complete") ||
           response.includes("evaluation is complete");
  }


  /**
   * Extract chat response from API response using rule configuration
   * Made more robust to handle different response structures
   */
  static extractChatResponse(apiResponse: any, rules: Rule[]): string {
    if (!apiResponse) {
      return "No response received";
    }
    
    // Find the rule that identifies the chat content
    const chatRule = rules.find(rule => rule.condition === "chat");
    if (!chatRule) {
      // Fallback to looking for common response fields
      if (apiResponse.response && typeof apiResponse.response.text === 'string') {
        return apiResponse.response.text;
      }
      if (apiResponse.text && typeof apiResponse.text === 'string') {
        return apiResponse.text;
      }
      if (apiResponse.content && typeof apiResponse.content === 'string') {
        return apiResponse.content;
      }
      if (apiResponse.message && typeof apiResponse.message === 'string') {
        return apiResponse.message;
      }
      
      // If this is already a string, just return it
      if (typeof apiResponse === 'string') {
        return apiResponse;
      }
      
      console.warn("Could not determine response field, returning empty string");
      return "";
    }

    try {
      // Navigate the path to find the value
      const path = chatRule.path.split('.');
      let value = apiResponse;
      
      for (const key of path) {
        if (value === undefined || value === null) {
          throw new Error(`Invalid path ${chatRule.path} for response - key '${key}' not found`);
        }
        value = value[key];
      }

      if (typeof value !== 'string') {
        // If value is not a string, try to convert it
        try {
          return String(value);
        } catch (e) {
          throw new Error(`Chat response at path ${chatRule.path} is not a string and could not be converted`);
        }
      }

      return value;
    } catch (error) {
      // If path extraction fails, try fallback strategies
      console.warn(`Path extraction error: ${error}`);
      
      // Try common response patterns
      if (apiResponse.response && typeof apiResponse.response.text === 'string') {
        return apiResponse.response.text;
      }
      if (apiResponse.text && typeof apiResponse.text === 'string') {
        return apiResponse.text;
      }
      if (apiResponse.content && typeof apiResponse.content === 'string') {
        return apiResponse.content;
      }
      if (apiResponse.message && typeof apiResponse.message === 'string') {
        return apiResponse.message;
      }
      
      // If we've exhausted all options, return a placeholder
      return "Could not extract response text";
    }
  }

  /**
   * Format conversation history into a string
   * Useful for prompts that need formatted history
   */
  static formatConversationHistory(history: any[]): string {
    if (!Array.isArray(history)) {
      return "";
    }
    
    return history
      .map(msg => {
        const role = msg.type === 'human' || msg.role === 'user' ? 'Human' : 'Assistant';
        const content = msg.text || msg.content || '';
        return `${role}: ${content}`;
      })
      .join('\n\n');
  }
}