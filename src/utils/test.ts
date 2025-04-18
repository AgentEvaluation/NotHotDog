import { TestRun } from '@/types/runs';
import { TestChat } from '@/types/chat';
import { ChatMetrics, TestMetrics } from '@/types/metrics';

export function calculateChatMetrics(chat: TestChat): ChatMetrics {
  return chat.messages.reduce(
    (metrics, message) => ({
      correct: message.role === 'assistant' && message.isCorrect ? metrics.correct + 1 : metrics.correct,
      incorrect: message.role === 'assistant' && !message.isCorrect ? metrics.incorrect + 1 : metrics.incorrect,
      responseTime: metrics.responseTime || [],
      validationScores: metrics.validationScores || [],
      contextRelevance: metrics.contextRelevance || [],
    }),
    { 
      correct: 0, 
      incorrect: 0,
      responseTime: [],
      validationScores: [],
      contextRelevance: []
    }
  );
}

export function calculateRunMetrics(chats: TestChat[]): TestMetrics {
  return chats.reduce(
    (metrics, chat) => {
      const chatMetrics = calculateChatMetrics(chat);
      metrics.passed += chatMetrics.correct;
      metrics.failed += chatMetrics.incorrect;
      metrics.total = metrics.passed + metrics.failed;
      metrics.chats = chats.length;
      metrics.correct = metrics.passed;
      metrics.incorrect = metrics.failed;
      return metrics;
    },
    { total: 0, passed: 0, failed: 0, chats: 0, correct: 0, incorrect: 0 }
  );
}
