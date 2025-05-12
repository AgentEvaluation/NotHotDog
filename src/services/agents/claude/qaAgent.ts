import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { QaAgentConfig, TestResult } from './types';
import { ApiHandler } from './apiHandler';
import { ConversationHandler } from './conversationHandler';
import { v4 as uuidv4 } from 'uuid';
import { ModelFactory } from "@/services/llm/modelfactory";
import { AnthropicModel } from "@/services/llm/enums";
import { SYSTEM_PROMPTS } from "@/services/prompts";
import { dbService } from "@/services/db";
import { ConversationProcessor } from './conversationProcessor';
import { ValidationService } from './validationService';
import { TestMessage } from "@/types/runs";
import { ResponseValidator } from './validators';


export class QaAgent {
  private model;
  private config: QaAgentConfig;
  private prompt: ChatPromptTemplate;
  private conversationProcessor: ConversationProcessor;
  private validationService: ValidationService;

  constructor(config: QaAgentConfig) {
    this.config = config;
  
    const apiKey = config.userApiKey || "";
    if (!apiKey) {
      throw new Error("Anthropic API key not provided to QaAgent.");
    }

    this.model = ModelFactory.createLangchainModel(
      config.modelId || AnthropicModel.Sonnet3_5,
      apiKey,
      config.extraParams || {}
    );
    
    // Initial prompt setup
    this.prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPTS.API_TESTER()],
      ["human", "{input}"]
    ]);
    
    this.conversationProcessor = new ConversationProcessor(this.model, this.config);
    this.validationService = new ValidationService(this.model);
  }

  async runTest(scenario: string, expectedOutput: string): Promise<TestResult> {
    // Use the provided conversation ID or generate a new one
    const chatId = this.config.conversationId || uuidv4();
    
    // Create a new memory instance for each test to ensure complete isolation
    const memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
    });
    
    try {
      // Clear memory for safety
      await memory.clear();
      
      // Retrieve persona prompt if applicable
      let personaSystemPrompt;
      if (this.config.persona) {
        try {
          const persona = await dbService.getPersonaById(this.config.persona);
          if (persona && persona.system_prompt) {
            personaSystemPrompt = persona.system_prompt;
          }
        } catch (error) {
          console.error('Error fetching persona:', error);
        }
      }
      
      // Update prompt using persona if provided
      this.prompt = ChatPromptTemplate.fromMessages([
        ["system", SYSTEM_PROMPTS.API_TESTER(personaSystemPrompt)],
        ["human", "{input}"]
      ]);

      // Build the chain: prompt -> model -> output parser
      const chain = RunnableSequence.from([
        this.prompt,
        this.model,
        new StringOutputParser()
      ]);

      // Generate initial conversation plan and test message
      const planInput = `Test this scenario: ${scenario}\nExpected behavior: ${expectedOutput}\n\nPlan and start a natural conversation to test this scenario.`;
      const planResult = await chain.invoke({ input: planInput });
      const initialTestMessage = ConversationHandler.extractTestMessage(planResult);
      const conversationPlan = ConversationHandler.extractConversationPlan(planResult);
      
      // We'll keep a custom log alongside memory for additional metrics/validation
      const allMessages: TestMessage[] = [];
      let totalResponseTime = 0;

      // Process the initial API call
      const formattedInput = ApiHandler.formatInput(initialTestMessage, this.config.apiConfig.inputFormat);
      let startTime = Date.now();
      let apiResponse = await ApiHandler.callEndpoint(
        this.config.endpointUrl, 
        this.config.headers, 
        formattedInput
      );
      let chatResponse = apiResponse?.response?.text || ConversationHandler.extractChatResponse(apiResponse, this.config.apiConfig.rules);
      const initialResponseTime = Date.now() - startTime;
      totalResponseTime += initialResponseTime;

      // Save initial turn to BufferMemory
      await memory.saveContext(
        { input: initialTestMessage },
        { output: chatResponse }
      );

      // Save user message to allMessages array
      const userMsgId = uuidv4();
      allMessages.push({
        id: userMsgId,
        chatId: chatId,
        role: 'user',
        content: initialTestMessage,
        metrics: { responseTime: 0, validationScore: 1 }
      });

      await dbService.saveConversationMessage({
        id: userMsgId,
        conversationId: chatId,
        role: 'user',
        content: initialTestMessage,
        timestamp: new Date().toISOString(),
        metrics: { responseTime: 0, validationScore: 1 }
      });
      
      
      // Save assistant message to allMessages array
      const assistantMsgId = uuidv4();
      allMessages.push({
        id: assistantMsgId,
        chatId: chatId,
        role: 'assistant',
        content: chatResponse,
        metrics: { responseTime: initialResponseTime, validationScore: 1 }
      });

      await dbService.saveConversationMessage({
        id: assistantMsgId,
        conversationId: chatId,
        role: 'assistant',
        content: chatResponse,
        timestamp: new Date().toISOString(),
        metrics: { responseTime: initialResponseTime, validationScore: 1 }
      });

      // Process multi-turn conversation if a plan exists
      if (conversationPlan && conversationPlan.length > 0) {
        const multiTurnResult = await this.conversationProcessor.processMultiTurnConversation(
          conversationPlan, chatResponse, chatId, chain, memory
        );
        totalResponseTime += multiTurnResult.totalResponseTime;
        allMessages.push(...multiTurnResult.messages);
        chatResponse = multiTurnResult.finalResponse;
      }

      // Validate response format and scenario fulfillment
      const formatValid = ResponseValidator.validateResponseFormat(apiResponse, this.config.apiConfig.outputFormat);
      const conditionMet = ResponseValidator.validateCondition(apiResponse, this.config.apiConfig.rules);

      const memoryVariables = await memory.loadMemoryVariables({});
      const fullConversation = memoryVariables.chat_history;

      const conversationValidation = await this.validationService.validateFullConversation(
        fullConversation,
        scenario,
        expectedOutput
      );

      // Mark the final message with validation results
      const validatedMessages = allMessages.map(msg => ({
        ...msg,
        isCorrect: msg.id === allMessages[allMessages.length - 1].id ? 
          conversationValidation.isCorrect : 
          true,
        explanation: msg.id === allMessages[allMessages.length - 1].id ? 
          conversationValidation.explanation : 
          undefined
      }));

      return {
        conversation: {
          humanMessage: initialTestMessage,
          rawInput: formattedInput,
          rawOutput: apiResponse,
          chatResponse,
          allMessages: validatedMessages
        },
        validation: {
          passedTest: formatValid && conditionMet && conversationValidation.isCorrect,
          formatValid,
          conditionMet,
          explanation: conversationValidation.explanation,
          conversationResult: conversationValidation,
          metrics: { responseTime: totalResponseTime }
        }
      };
    } catch (error) {
      console.error('Error in runTest:', error);
      throw error;
    } finally {
      // Ensure memory is cleared after the test is done
      await memory.clear();
    }
  }

  public async validateFullConversation(
    messages: string[] | string,
    scenario: string,
    expectedOutput: string,
    metrics?: any[]
  ) {
    // Convert array of messages to string if needed
    const conversation = Array.isArray(messages) 
      ? messages.join('\n\n')
      : messages;
      
    return this.validationService.validateFullConversation(
      conversation,
      scenario,
      expectedOutput,
      metrics
    );
  }
}