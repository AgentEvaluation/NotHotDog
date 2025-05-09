import { v4 as uuidv4 } from 'uuid';
import { ApiHandler } from './apiHandler';
import { QaAgentConfig } from './types';
import { ConversationHandler } from './conversationHandler';
import { TestMessage } from '@/types/runs';
import { RunnableSequence } from '@langchain/core/runnables';
import { BufferMemory } from 'langchain/memory';

export class ConversationProcessor {
  private model;
  private memory: BufferMemory;
  private config: QaAgentConfig;

  constructor(model: any, memory: BufferMemory, config: QaAgentConfig) {
    this.model = model;
    this.memory = memory;
    this.config = config;
  }

  /**
   * Process multi-turn conversation by leveraging both BufferMemory and custom logging.
   * Each turn loads the current memory context, generates a follow-up prompt, calls the API,
   * and then saves the turn to memory.
   */
  async processMultiTurnConversation(
    conversationPlan: string[],
    initialResponse: string,
    chatId: string,
    chain: RunnableSequence
  ): Promise<{ messages: TestMessage[], finalResponse: string, totalResponseTime: number }> {
    const messages: TestMessage[] = [];
    let currentResponse = initialResponse;
    let totalResponseTime = 0;

    for (const plannedTurn of conversationPlan) {
      // Load conversation context from BufferMemory
      const memoryVariables = await this.memory.loadMemoryVariables({});
      // The memory is stored under the key "chat_history" (as set in the constructor)
      const chatHistory = memoryVariables.chat_history;
      
      const followUpInputText = `Chat History: ${chatHistory}\n\nPrevious API response: "${currentResponse}"\n\nGiven this response and your plan: "${plannedTurn}"\n\nContinue the conversation naturally.`;
      const followUpResult = await chain.invoke({ input: followUpInputText });
      const followUpMessage = ConversationHandler.extractTestMessage(followUpResult);
      
      const formattedFollowUpInput = ApiHandler.formatInput(followUpMessage, this.config.apiConfig.inputFormat);

      const startTime = Date.now();
      let apiResponse;
      try {
        apiResponse = await ApiHandler.callEndpoint(
          this.config.endpointUrl,
          this.config.headers,
          formattedFollowUpInput,
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('API request timed out after 10 seconds');
        }
        throw error;
      }
      currentResponse = apiResponse?.response?.text || ConversationHandler.extractChatResponse(apiResponse, this.config.apiConfig.rules);
      const turnResponseTime = Date.now() - startTime;
      totalResponseTime += turnResponseTime;

      // Save this turn into BufferMemory for context in subsequent turns
      await this.memory.saveContext(
        { input: followUpMessage },
        { output: currentResponse }
      );

      // Log turn details in our custom array as well
      messages.push({
        id: uuidv4(),
        chatId: chatId,
        role: 'user',
        content: followUpMessage,
        metrics: { responseTime: turnResponseTime, validationScore: 1 }
      });
      messages.push({
        id: uuidv4(),
        chatId: chatId,
        role: 'assistant',
        content: currentResponse,
        metrics: { responseTime: turnResponseTime, validationScore: 1 }
      });
    }

    return { messages, finalResponse: currentResponse, totalResponseTime };
  }
}