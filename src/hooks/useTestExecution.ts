import { useEffect, useState } from 'react';
import { ChatMessage, Conversation } from '@/types/chat';
import { useTestRuns } from './useTestRuns';
import { ModelFactory } from '@/services/llm/modelfactory';
import { useErrorContext } from './useErrorContext';
import ApiClient from '@/lib/api-client';

export type TestExecutionStatus = 'idle' | 'connecting' | 'running' | 'completed' | 'failed';

export function useTestExecution() {
  const { runs, addRun, updateRun, selectedRun, setSelectedRun } = useTestRuns();
  const errorContext = useErrorContext();
  
  const [status, setStatus] = useState<TestExecutionStatus>('idle');
  const [progress, setProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  
  const [savedAgentConfigs, setSavedAgentConfigs] = useState<Array<{ id: string, name: string }>>([]);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const data = await ApiClient.get('/api/tools/agent-config');
        setSavedAgentConfigs(data.map((cfg: any) => ({
          id: cfg.id,
          name: cfg.name
        })));
      } catch (error) {
        console.error('Failed to load agent configs:', error);
      }
    };
    
    loadConfigs();
  }, []); // Empty dependency array - only run once on mount

  /**
   * Executes a test for the given test ID
   */
  const executeTest = async (testId: string) => {
    try {
      // Clear any previous errors and set initial state
      errorContext.clearError();
      setStatus('connecting');

      return await errorContext.withErrorHandling(async () => {
        // Validate model configuration
        const modelConfig = ModelFactory.getSelectedModelConfig();
        if (!modelConfig) {
          throw errorContext.createError.configuration("No LLM model configured. Please add a model in settings.");
        }
        
        const headers = ApiClient.getLLMHeaders();
        if (!headers) {
          throw errorContext.createError.configuration("Could not generate LLM headers. Please reconfigure your model.");
        }
        
        // Update status to running
        setStatus('running');
        
        // Execute the test run
        const response = await ApiClient.post('/api/tools/test-runs', { testId }, { headers });
        const completedRun = response.data || response;
        
        // Update status to completed
        setStatus('completed');
        
        // Update the test runs list
        addRun(completedRun);
        
        return completedRun;
      });
    } catch (error) {
      setStatus('failed');
      throw error;
    }
  };

  /**
   * Resets the test execution state
   */
  const resetState = () => {
    setStatus('idle');
    errorContext.clearError();
    setProgress({ completed: 0, total: 0 });
  };

  return {
    executeTest,
    resetState,
    status,
    error: errorContext.error,
    progress,
    isExecuting: status === 'connecting' || status === 'running',
    currentMessages,
    isTyping,
    runs,
    selectedRun,
    setSelectedRun,
    selectedChat,
    setSelectedChat,
    savedAgentConfigs,
    loading: errorContext.isLoading,
    clearError: errorContext.clearError
  };
}