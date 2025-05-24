import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { QaAgentConfig, TestResult } from './types';
import { ApiHandler } from './apiHandler';
import { ConversationHandler } from './conversationHandler';
import { v4 as uuidv4 } from 'uuid';
import { ModelFactory } from "@/services/llm/modelfactory";
import { AnthropicModel, LLMProvider } from "@/services/llm/enums";
import { SYSTEM_PROMPTS } from "@/services/prompts";
import { dbService } from "@/services/db";
import { ConversationProcessor } from './conversationProcessor';
import { ValidationService } from './validationService';
import { TestMessage } from "@/types/runs";
import { ResponseValidator } from './validators';
import HallucinationDetector from "@/services/metrics/hallucinationDetector";
import { LLMServiceConfig } from "@/services/llm/types";

/**
 * QaAgent - A comprehensive agent for testing conversational AI systems
 * Updated to use adaptive conversation flow and better persona integration
 */
export class QaAgent {
  private model;
  private config: QaAgentConfig;
  private prompt: ChatPromptTemplate;
  private validationService: ValidationService;
  private memory: BufferMemory;
  private personaPrompt: string | null = null;

  constructor(config: QaAgentConfig) {
    this.config = config;
  
    const apiKey = config.userApiKey || "";
    if (!apiKey) {
      throw new Error("API key not provided to QaAgent.");
    }

    this.model = ModelFactory.createLangchainModel(
      config.modelId || AnthropicModel.Sonnet3_5,
      apiKey,
      config.extraParams || {}
    );
    
    // Initialize with basic prompt - will update with persona when loaded
    this.prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPTS.API_TESTER()],
      ["human", "{input}"]
    ]);
    
    this.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
    });
    
    this.validationService = new ValidationService(this.model);
  }

  /**
   * Load persona information and update prompt accordingly
   * Called early in the test process to ensure persona integration
   */
  private async loadPersona(): Promise<void> {
    if (!this.config.persona) return;
    
    try {
      const persona = await dbService.getPersonaById(this.config.persona);
      if (persona && persona.system_prompt) {
        this.personaPrompt = persona.system_prompt;
        
        // Update prompt template with persona characteristics
        this.prompt = ChatPromptTemplate.fromMessages([
          ["system", SYSTEM_PROMPTS.API_TESTER(this.personaPrompt)],
          ["human", "{input}"]
        ]);
      }
    } catch (error) {
      console.error('Error loading persona:', error);
    }
  }

  private async generateInitialMessage(scenario: string, expectedOutput: string): Promise<string> {
    // Build the chain with persona-aware prompt
    const chain = RunnableSequence.from([
      this.prompt,
      this.model,
      new StringOutputParser()
    ]);

    const initialInput = `
      AS A HUMAN USER with the personality traits described earlier,
      you need to: ${scenario}
      
      The expected outcome is: ${expectedOutput}
      
      Write your first message to the AI assistant.
      
      IMPORTANT REMINDERS:
      - Write ONLY what a real human would type in a chat interface
      - DO NOT include any roleplaying elements or action descriptions
      - DO NOT include theatrical elements like "*sighs*" or "*frustrated voice*"
      - Keep your message realistic and authentic to how people actually type
      
      Also add on a separate line after your message whether this conversation is complete:
      COMPLETE: false (since this is just starting)
    `;
    
    const result = await chain.invoke({ input: initialInput });
    // Extract just the message part, removing any completion signals
    return this.extractUserMessage(result);
  }

  /**
   * Generate subsequent messages for the conversation
   * Responds as a human user would to the AI's previous message
   */
  private async generateNextMessage(
    conversationHistory: string,
    scenario: string,
    expectedOutput: string
  ): Promise<{ message: string; isComplete: boolean }> {
    const chain = RunnableSequence.from([
      this.prompt,
      this.model,
      new StringOutputParser()
    ]);

    const followUpInput = `
      AS A HUMAN USER with the personality traits described earlier,
      your goal is: ${scenario}
      
      Here's the conversation so far:
      ${conversationHistory}
      
      Write your next message to the AI assistant.
      
      IMPORTANT REMINDERS:
      - Write ONLY what a real human would type in a chat interface
      - NO roleplaying elements (like "*sighs*" or "*excited tone*")
      - NO theatrical descriptions of actions or emotions
      - Just write plain text like a normal person typing a message
      
      After your message, on a separate line, indicate if the conversation should end:
      COMPLETE: true (if the AI has successfully addressed your needs)
      COMPLETE: false (if you still need more information or help)
    `;
    
    const result = await chain.invoke({ input: followUpInput });
    
    // Check if the model indicated the conversation is complete
    const isComplete = result.includes("COMPLETE: true");
    
    // Extract just the user's message without any control signals
    const message = this.extractUserMessage(result);
    
    return { message, isComplete };
  }
  
  /**
   * Extract just the user message from the model output
   * Removes any control signals or formatting
   */
  private extractUserMessage(fullResponse: string): string {
    // Remove any completion markers
    const withoutCompletionMarkers = fullResponse
      .replace(/COMPLETE:\s*(true|false)/gi, '')
      .replace(/\[CONVERSATION_(COMPLETE|INCOMPLETE)\]/gi, '');
    
    // Remove any roleplaying elements
    const withoutRoleplaying = withoutCompletionMarkers
      .replace(/\*[^*]+\*/g, '') // Remove anything between asterisks
      .replace(/\([^)]+\)/g, ''); // Remove anything in parentheses
    
    // Clean up the text
    return withoutRoleplaying
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();
  }

  private async processTurn(message: string, chatId: string): Promise<{
    response: string;
    responseTime: number;
    messages: TestMessage[];
  }> {
    // Format the user message according to target API requirements
    const formattedInput = ApiHandler.formatInput(message, this.config.apiConfig.inputFormat);
    
    // Call the target agent's endpoint and measure response time
    const startTime = Date.now();
    let apiResponse;
    try {
      apiResponse = await ApiHandler.callEndpoint(
        this.config.endpointUrl,
        this.config.headers,
        formattedInput
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Target agent request timed out after timeout period');
      }
      throw error;
    }
    const responseTime = Date.now() - startTime;
    
    // Extract the AI assistant's response text from the API response
    const assistantResponse = apiResponse?.response?.text || 
      ConversationHandler.extractChatResponse(apiResponse, this.config.apiConfig.rules);
    
    // Save this conversation turn to memory
    await this.memory.saveContext(
      { input: message },
      { output: assistantResponse }
    );
  
    // Create message objects for tracking
    const userMsgId = uuidv4();
    const assistantMsgId = uuidv4();
  
    // Create the messages array
    const messages: TestMessage[] = [
      {
        id: userMsgId,
        chatId: chatId,
        role: 'user',  // This is the simulated human user
        content: message,
        metrics: { responseTime: 0 }
      },
      {
        id: assistantMsgId,
        chatId: chatId,
        role: 'assistant',  // This is the target AI agent's response
        content: assistantResponse,
        metrics: { responseTime }
      }
    ];
  
    // Skip hallucination detection if it's been failing consistently
    const skipHallucinationDetection = process.env.SKIP_HALLUCINATION_DETECTION === 'true';
    
    if (!skipHallucinationDetection) {
      try {
        const modelConfig: LLMServiceConfig = {
          id: this.config.modelId || AnthropicModel.Sonnet3_5,
          provider: this.config.provider as LLMProvider || LLMProvider.Anthropic, // Fix type cast
          name: "QA Agent Model",
          apiKey: this.config.userApiKey,
          keyName: "QA Agent Key",
          extraParams: this.config.extraParams || {}
        };

        const memoryVariables = await this.memory.loadMemoryVariables({});
        const conversationHistory = ConversationHandler.formatConversationHistory(
          memoryVariables.chat_history
        );
        
        const detector = new HallucinationDetector(modelConfig, this.config.agentDescription);
        const isHallucination = await detector.detectHallucination(
          conversationHistory,
          message,
          assistantResponse
        );
        
        messages[1].metrics!.isHallucination = isHallucination;
      } catch (error) {
        console.error("Error during hallucination detection:", error);
        messages[1].metrics = {
          ...messages[1].metrics,
          isHallucination: null
        };
      }
    } else {
      // Hallucination detection disabled
      messages[1].metrics!.isHallucination = null;
    }
  
    // Save to database for logging and analysis
    await dbService.saveConversationMessage({
      id: userMsgId,
      conversationId: chatId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      metrics: { responseTime: 0 }
    });
    
    await dbService.saveConversationMessage({
      id: assistantMsgId,
      conversationId: chatId,
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date().toISOString(),
      metrics: messages[1].metrics // Use the metrics object that includes hallucination detection result
    });
    
    return { response: assistantResponse, responseTime, messages };
  }

  async runTest(scenario: string, expectedOutput: string): Promise<TestResult> {
    // Use the provided conversation ID or generate a new one
    const chatId = this.config.conversationId || uuidv4();
    
    // Clear memory for this test
    await this.memory.clear();
    
    // Load persona early to ensure integration from the start
    await this.loadPersona();
    
    // Track messages and response time
    let allMessages: TestMessage[] = [];
    let totalResponseTime = 0;
    let finalApiResponse: any = null;
    
    try {
      // Generate and send initial message as the human user
      const initialMessage = await this.generateInitialMessage(scenario, expectedOutput);
      const firstTurn = await this.processTurn(initialMessage, chatId);
      
      allMessages.push(...firstTurn.messages);
      totalResponseTime += firstTurn.responseTime;
      let currentResponse = firstTurn.response;
      
      // Run adaptive conversation up to max turns
      const maxTurns = 5;
      for (let i = 0; i < maxTurns - 1; i++) {
        // Get current conversation history from memory
        const memoryVariables = await this.memory.loadMemoryVariables({});
        const conversationHistory = ConversationHandler.formatConversationHistory(
          memoryVariables.chat_history
        );
        
        // Generate next message based on conversation so far
        const nextMessageResult = await this.generateNextMessage(
          conversationHistory,
          scenario,
          expectedOutput
        );
        
        // If the simulated user is satisfied, stop the conversation
        if (nextMessageResult.isComplete) {
          break;
        }
        
        // Process the next turn
        const nextTurn = await this.processTurn(nextMessageResult.message, chatId);
        allMessages.push(...nextTurn.messages);
        totalResponseTime += nextTurn.responseTime;
        currentResponse = nextTurn.response;
        finalApiResponse = nextTurn; // Store last response for validation
      }
      
      // Get full conversation for validation
      const memoryVariables = await this.memory.loadMemoryVariables({});
      const fullConversation = ConversationHandler.formatConversationHistory(
        memoryVariables.chat_history
      );
      
      // Validate the conversation against expected outcome
      const conversationValidation = await this.validationService.validateFullConversation(
        fullConversation,
        scenario,
        expectedOutput
      );
      
      // Messages don't need individual validation - it's done at conversation level
      const validatedMessages = allMessages;

      // Format the final result
      return {
        conversation: {
          humanMessage: initialMessage,
          rawInput: ApiHandler.formatInput(initialMessage, this.config.apiConfig.inputFormat),
          rawOutput: finalApiResponse || {},
          chatResponse: currentResponse,
          allMessages: allMessages
        },
        validation: {
          passedTest: conversationValidation.isCorrect,
          formatValid: ResponseValidator.validateResponseFormat(
            finalApiResponse, 
            this.config.apiConfig.outputFormat
          ),
          conditionMet: ResponseValidator.validateCondition(
            finalApiResponse, 
            this.config.apiConfig.rules
          ),
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
      await this.memory.clear();
    }
  }

  /**
   * Validate a conversation without running a new test
   * Used for evaluating existing conversations
   */
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