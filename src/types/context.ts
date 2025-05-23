export interface ConversationContext {
    variables: Record<string, any>;
    messageHistory: string[];
    currentPath: string[];
    metrics: {
      responseTime: number[];
      contextRelevance: number[];
    };
  }