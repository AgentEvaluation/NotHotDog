import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { QaAgentConfig, TestResult } from './types';
import { ApiHandler } from './apiHandler';
import { ConversationHandler } from './conversationHandler';
import { ResponseValidator } from './validators';
import { TestMessage } from "@/types/runs";
import { v4 as uuidv4 } from 'uuid';
import { ModelFactory } from "@/services/llm/modelfactory";
import { AnthropicModel } from "@/services/llm/enums";
import { SYSTEM_PROMPTS } from "@/services/prompts";
import { dbService } from "@/services/db";

export class QaAgent {
  private model;
  private memory: BufferMemory;
  private config: QaAgentConfig;
  private prompt: ChatPromptTemplate;

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
    
    // Initialize BufferMemory to track conversation context automatically
    this.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
    });

    // Initial prompt setup (persona not integrated here yet)
    this.prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPTS.API_TESTER()],
      ["human", "{input}"]
    ]);
  }

  async runTest(scenario: string, expectedOutput: string): Promise<TestResult> {
    try {
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

      // Clear any previous memory context
      await this.memory.clear();

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
      await this.memory.saveContext(
        { input: initialTestMessage },
        { output: chatResponse }
      );

      const chatId = uuidv4();
      allMessages.push({
        id: uuidv4(),
        chatId: chatId,
        role: 'user',
        content: initialTestMessage,
        metrics: { responseTime: initialResponseTime, validationScore: 1 }
      });
      allMessages.push({
        id: uuidv4(),
        chatId: chatId,
        role: 'assistant',
        content: chatResponse,
        metrics: { responseTime: initialResponseTime, validationScore: 1 }
      });

      // Process multi-turn conversation if a plan exists
      if (conversationPlan && conversationPlan.length > 0) {
        const multiTurnResult = await this.processMultiTurnConversation(conversationPlan, chatResponse, chatId, chain);
        totalResponseTime += multiTurnResult.totalResponseTime;
        allMessages.push(...multiTurnResult.messages);
        chatResponse = multiTurnResult.finalResponse;
      }

      // Validate response format and scenario fulfillment
      const formatValid = ResponseValidator.validateResponseFormat(apiResponse, this.config.apiConfig.outputFormat);
      const conditionMet = ResponseValidator.validateCondition(apiResponse, this.config.apiConfig.rules);

      const memoryVariables = await this.memory.loadMemoryVariables({});
      const fullConversation = memoryVariables.chat_history;

      const conversationValidation = await this.validateFullConversation(
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
    }
  }

  async validateWithMetrics(conversation: string, scenario: string, expectedOutput: string, metrics: any[]) {
    const promptText = `You are evaluating a conversation against expected output and specific metrics.
    
    CONVERSATION: ${conversation}
    SCENARIO: ${scenario}
    EXPECTED OUTPUT: ${expectedOutput}
    METRICS: ${JSON.stringify(metrics.map(m => ({id: m.id, type: m.type, criteria: m.check_criteria})))}
    
    Evaluate both expected output match and each metric. Return JSON with this exact format:
    {"isCorrect": boolean, "explanation": "reason", "metrics": [{"id": "metric-id", "score": number, "reason": "explanation"}]}`;
  
    const result = await this.model.invoke([{ role: 'user', content: promptText }]);
    const content = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
    
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error("Invalid JSON response:", error);
      return {
        isCorrect: false,
        explanation: "Error parsing evaluation results",
        metrics: []
      };
    }
  }
  /**
   * Process multi-turn conversation by leveraging both BufferMemory and custom logging.
   * Each turn loads the current memory context, generates a follow-up prompt, calls the API,
   * and then saves the turn to memory.
   */
  private async processMultiTurnConversation(
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
  
  // public async validateFullConversation(
  //   fullConversation: string,
  //   scenario: string,
  //   expectedOutput: string,
  //   metrics?: any[]
  // ) {

  //   if (metrics && metrics.length > 0) {
  //     return this.validateWithMetrics(fullConversation, scenario, expectedOutput, metrics);
  //   }
  //   // Provide a strict instruction:
  //   const promptText = `You are a strict evaluator. Return ONLY valid JSON. No extra text, no explanations outside the JSON.
  
  // Test Scenario: ${scenario}
  // Expected Output: ${expectedOutput}
  // Complete Conversation:
  // ${fullConversation}
  
  // Return JSON in this EXACT format:
  // {"isCorrect": true or false, "explanation": "Your reason in a single string"}
  // Do NOT include any text outside the braces. Do NOT include code fences.`;
  
  //   const result = await this.model.invoke([{ role: 'user', content: promptText }]);
  
  //   const content = typeof result.content === 'string'
  //     ? result.content
  //     : JSON.stringify(result.content);
  
  //   // Parse or fail gracefully
  //   try {
  //     return JSON.parse(content);
  //   } catch (error) {
  //     console.error("Model did not return valid JSON:", error);
  //     return {
  //       isCorrect: false,
  //       explanation: "Model returned invalid JSON. Prompt the user again or provide fallback."
  //     };
  //   }
  // }


  public async validateFullConversation(
    fullConversation: string,
    scenario: string,
    expectedOutput: string,
    metrics?: any[]
  ) {
    // 1. Expected output-only validation
    const promptWithoutMetrics = `You are a strict evaluator. Return ONLY valid JSON. No extra text.
    
  Test Scenario: ${scenario}
  Expected Output: ${expectedOutput}
  Complete Conversation:
  ${fullConversation}
  
  Return JSON in this EXACT format:
  {"isCorrect": true or false, "explanation": "Your reason in a single string"}
  Do NOT include any text outside the braces.`;
  
    const resultWithoutMetrics = await this.model.invoke([{ role: 'user', content: promptWithoutMetrics }]);
    const contentWithoutMetrics = typeof resultWithoutMetrics.content === 'string'
      ? resultWithoutMetrics.content
      : JSON.stringify(resultWithoutMetrics.content);
    let expectedOutputEvaluation;
    try {
      expectedOutputEvaluation = JSON.parse(contentWithoutMetrics);
    } catch (error) {
      console.error("Model did not return valid JSON for expected output evaluation:", error);
      expectedOutputEvaluation = {
        isCorrect: false,
        explanation: "Model returned invalid JSON during expected output evaluation."
      };
    }
  
    // 2. Metrics-based validation (which also includes expected output)
    const metricsEvaluation = await this.validateWithMetrics(
      fullConversation,
      scenario,
      expectedOutput,
      metrics ?? []
    );
  
    // 3. Combine both JSON responses:
    const combinedIsCorrect = expectedOutputEvaluation.isCorrect && metricsEvaluation.isCorrect;
    const combinedExplanation = `Expected Output Eval: ${expectedOutputEvaluation.explanation}. Metrics Eval: ${metricsEvaluation.explanation}`;
  
    return {
      isCorrect: combinedIsCorrect,
      explanation: combinedExplanation,
      expectedOutputEvaluation,
      metricsEvaluation,
      metrics: metricsEvaluation.metrics || []
    };
  }
  
  
}
