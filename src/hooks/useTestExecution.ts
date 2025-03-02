import { useEffect, useState } from 'react';
import { ChatMessage, TestChat } from '@/types/chat';
import { useTestRuns } from './useTestRuns';

export type TestExecutionStatus = 'idle' | 'connecting' | 'running' | 'completed' | 'failed';
export type TestExecutionError = {
  message: string;
  code?: string;
  details?: string;
};

export function useTestExecution() {
  const { runs, addRun, updateRun, selectedRun, setSelectedRun } = useTestRuns();
  const [status, setStatus] = useState<TestExecutionStatus>('idle');
  const [error, setError] = useState<TestExecutionError | null>(null);
  const [progress, setProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChat, setSelectedChat] = useState<TestChat | null>(null);
  
  const [savedAgentConfigs, setSavedAgentConfigs] = useState<Array<{ id: string, name: string }>>([]);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch("/api/tools/agent-config");
        const data = await res.json();
        setSavedAgentConfigs(data.map((cfg: any) => ({
          id: cfg.id,
          name: cfg.name
        })));
      } catch (err) {
        console.error("Failed to fetch agent configs:", err);
      }
    }
    fetchAgents();
  }, []);

  const executeTest = async (testId: string) => {
    setStatus('connecting');
    setError(null);

    const userApiKey = localStorage.getItem("anthropic_api_key") || "";
    const userModel = localStorage.getItem("anthropic_model") || "";
    
    if (!userApiKey || !userModel) {
      setStatus('failed');
      setError({ message: "Anthropic API key or model is missing. Please configure them." });
      return;
    }

    try {
      const response = await fetch('/api/tools/test-runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': userApiKey,
          'X-Model': userModel,
        },
        body: JSON.stringify({ testId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute test');
      }
      
      setStatus('running');
      
      const completedRun = await response.json();
      setStatus('completed');
    } catch (error: any) {
      console.error('Test execution failed:', error);
      setStatus('failed');
      setError({ message: error.message, details: error.stack });
    }
  };
  const resetState = () => {
    setStatus('idle');
    setError(null);
    setProgress({ completed: 0, total: 0 });
  };

  return {
    executeTest,
    resetState,
    status,
    error,
    progress,
    isExecuting: status === 'connecting' || status === 'running',
    currentMessages,
    isTyping,
    runs,
    selectedRun,
    setSelectedRun,
    selectedChat,
    setSelectedChat,
    savedAgentConfigs
  };
}
