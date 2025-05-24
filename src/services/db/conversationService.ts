import { prisma } from '@/lib/prisma';
import { TestMessage } from '@/types/runs';

export class ConversationService {
    async saveConversationMessage(message: {
        id: string;
        conversationId: string; 
        role: string;
        content: string;
        timestamp: string;
        metrics?: any;
      }) {
        try {
          // Ensure metrics is properly formatted for JSON storage
          const formattedMetrics = message.metrics || {};
          
          // Log for debugging
          console.log(`Saving ${message.role} message to database: ${message.id.substring(0, 8)}...`);
          console.log('Full message data:', {
            id: message.id,
            conversationId: message.conversationId,
            role: message.role,
            contentLength: message.content?.length,
            timestamp: message.timestamp
          });
          
          return await prisma.conversation_messages.create({
            data: {
              id: message.id,
              conversation_id: message.conversationId,
              role: message.role,
              content: message.content,
              created_at: new Date(message.timestamp),
              // Default values for nullable fields
              response_time: message.role === 'assistant' ? (message.metrics?.responseTime || null) : null,
              validation_score: message.role === 'assistant' ? (message.metrics?.validationScore || null) : null,
              metrics: formattedMetrics
            }
          });
        } catch (error) {
          console.error(`Error saving ${message.role} message:`, error);
          console.error("Message data:", {
            id: message.id,
            conversationId: message.conversationId,
            role: message.role,
            contentLength: message.content?.length,
            metrics: message.metrics
          });
          throw new Error(`Failed to save ${message.role} message: ${error}`);
        }
      }
      
      // New method to create a test conversation:
    async createTestConversation(data: {
        runId: string;
        scenarioId: string;
        personaId: string;
        status: string;
    }) {
        try {
            const conversation = await prisma.test_conversations.create({
                data: {
                    run_id: data.runId,
                    scenario_id: data.scenarioId,
                    persona_id: data.personaId,
                    status: data.status
                }
            });
            console.log("++++++++++++ conversationid:" + conversation.id);
            return conversation.id;
        } catch (error) {
        console.error("Error creating test conversation:", error);
        throw new Error("Failed to create test conversation");
        }
    }
      
  
  async getConversationMessages(conversationId: string): Promise<TestMessage[]> {
    try {
      const messages = await prisma.conversation_messages.findMany({
        where: { conversation_id: conversationId },
        orderBy: { created_at: 'asc' }
      });
      
      return messages.map(msg => ({
        id: msg.id,
        chatId: msg.conversation_id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        metrics: msg.metrics as any
      }));
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      throw new Error("Failed to fetch conversation messages");
    }
  }
  
  async reconstructMemoryFromDb(conversationId: string, memory: any) {
    try {
      const messages = await this.getConversationMessages(conversationId);
      
      // Clear existing memory
      await memory.clear();
      
      // Reconstruct the memory from messages
      for (let i = 0; i < messages.length; i += 2) {
        if (i + 1 < messages.length) {
          const userMsg = messages[i];
          const assistantMsg = messages[i + 1];
          
          await memory.saveContext(
            { input: userMsg.content },
            { output: assistantMsg.content }
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error reconstructing memory:", error);
      return false;
    }
  }
}

export const conversationService = new ConversationService();