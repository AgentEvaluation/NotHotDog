import { v4 as uuidv4 } from 'uuid';
import { ApiHandler } from './apiHandler';
import { QaAgentConfig } from './types';
import { ConversationHandler } from './conversationHandler';
import { TestMessage } from '@/types/runs';
import { RunnableSequence } from '@langchain/core/runnables';
import { BufferMemory } from 'langchain/memory';
import { dbService } from '@/services/db';

export class ConversationProcessor {
  private model;
  private config: QaAgentConfig;

  constructor(model: any, config: QaAgentConfig) {
    this.model = model;
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
    chain: RunnableSequence,
    memory: BufferMemory
  ): Promise<{ messages: TestMessage[], finalResponse: string, totalResponseTime: number }> {
    const messages: TestMessage[] = [];
    let currentResponse = initialResponse;
    let totalResponseTime = 0;

    for (const plannedTurn of conversationPlan) {
      const memoryVariables = await memory.loadMemoryVariables({});
      console.log("Memory before turn:", JSON.stringify(memoryVariables.chat_history));

      const chatHistory = memoryVariables.chat_history;
      
    //   const followUpInputText = `Chat History: ${chatHistory}\n\nPrevious API response: "${currentResponse}"\n\nGiven this response and your plan: "${plannedTurn}"\n\nContinue the conversation naturally.`;
      
      // Ensure followUpInputText is properly formatted and includes sufficient context
      const followUpInputText = `
        CONVERSATION HISTORY:
        ${JSON.stringify(chatHistory)}
        
        PREVIOUS RESPONSE: "${currentResponse}"
        
        NEXT STEP IN PLAN: "${plannedTurn}"
        
        IMPORTANT: 
        1. Continue the conversation naturally
        2. Address the conversation directly
        3. Do not repeat yourself or use generic responses
        4. Be specific and substantive in your response
        `;
      
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

      // Save this turn into the provided memory instance for context in subsequent turns
      await memory.saveContext(
        { input: followUpMessage },
        { output: currentResponse }
      );

      const verifyMemory = await memory.loadMemoryVariables({});
      console.log("Memory after saving:", JSON.stringify(verifyMemory.chat_history));



      // Log turn details in our custom array as well
      messages.push({
        id: uuidv4(),
        chatId: chatId,
        role: 'user',
        content: followUpMessage,
        metrics: { responseTime: 0, validationScore: 1 }
      });

      const userMsgId = messages[messages.length-1].id;
        await dbService.saveConversationMessage({
            id: userMsgId,
            conversationId: chatId,
            role: 'user',
            content: followUpMessage,
            timestamp: new Date().toISOString(),
            metrics: { responseTime: 0, validationScore: 1 }
        });
      
      messages.push({
        id: uuidv4(),
        chatId: chatId,
        role: 'assistant',
        content: currentResponse,
        metrics: { responseTime: turnResponseTime, validationScore: 1 }
      });

      // Save assistant response to database
      const responseId = messages[messages.length-1].id;
      await dbService.saveConversationMessage({
        id: responseId,
        conversationId: chatId,
        role: 'assistant',
        content: currentResponse,
        timestamp: new Date().toISOString(),
        metrics: { responseTime: turnResponseTime, validationScore: 1 }
      });
    }

    return { messages, finalResponse: currentResponse, totalResponseTime };
  }
}