import { useEffect, useState } from 'react';
import { TestChat } from '@/types/chat';
import { useTestRuns } from './useTestRuns';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { TestMessage, TestRun } from '@/types/runs';

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
  const [currentMessages, setCurrentMessages] = useState<TestMessage[]>([]);
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

  useEffect(() => {
    // When new messages come in, update the selected run and its chats
    if (currentMessages.length > 0 && selectedRun) {
      // Get the latest message
      const latestMessage = currentMessages[currentMessages.length - 1];
      
      // Find the chat in the selectedRun that should contain this message
      const chatIndex = selectedRun.chats.findIndex(chat => 
        chat.id === latestMessage.chatId
      );
      
      if (chatIndex !== -1) {
        // Update the chat with the new message
        const updatedChats = [...selectedRun.chats];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          messages: [...updatedChats[chatIndex].messages, latestMessage]
        };
        
        // Update the run
        const updatedRun: TestRun = {
          ...selectedRun,
          chats: updatedChats
        };
        
        // Update the selected run and runs state
        setSelectedRun(updatedRun);
        updateRun(updatedRun);
      } else {
        // If we don't have a matching chat, we might need additional metadata from the event
        // This will be handled separately in the onmessage handler when we receive the chat_info event
        console.log("Message received for unknown chat:", latestMessage.chatId);
      }
    }
  }, [currentMessages, selectedRun]);

  const executeTest = async (testId: string) => {
    setStatus('connecting');
    setError(null);
    setCurrentMessages([]); // clear previous messages
    
    const userApiKey = localStorage.getItem("anthropic_api_key") || "";
    const userModel = localStorage.getItem("anthropic_model") || "";
    
    if (!userApiKey || !userModel) {
      setStatus('failed');
      setError({ message: "Anthropic API key or model is missing. Please configure them." });
      return;
    }
    const newRun: TestRun = {
      id: crypto.randomUUID(),
      name: `Run ${new Date().toLocaleString()}`,
      timestamp: new Date().toISOString(),
      status: 'running',
      metrics: {
        total: 0, passed: 0, failed: 0, chats: 0, correct: 0, incorrect: 0,
        sentimentScores: { positive: 0, neutral: 0, negative: 0 }
      },
      chats: [],
      results: [],
      agentId: testId,
      createdBy: ""
    };

    addRun(newRun);
    setSelectedRun(newRun);
    
    const controller = new AbortController();

    fetchEventSource(`/api/tools/test-runs?testId=${encodeURIComponent(testId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": userApiKey,
        "X-Model": userModel,
      },
      body: JSON.stringify({ testId }),
      signal: controller.signal,
      onopen: async (res: Response) => {
        if (!res.ok) {
          console.error("Client side error, terminating connection");
          controller.abort();
          setStatus('failed');
          setError({ message: `Connection error: ${res.status}` });
          throw new Error("Client side error");
        }
      },
      onmessage(event) {
        if (!event.data) {
          console.error("Received empty data");
          return;
        }
        try {
          const data = JSON.parse(event.data);
          console.log("Received SSE event:", data);
          
          if (data.type === "message") {
            // Add the message to our current set of messages
            setCurrentMessages(prev => [...prev, data.message]);
            
            // Add typing indicator if it's a user message and we'll be expecting a response
            if (data.message.role === 'user') {
              setIsTyping(true);
            } else if (data.message.role === 'assistant') {
              setIsTyping(false);
            }
            
            // Check if we need to create a new chat for this message
            if (selectedRun && !selectedRun.chats.some(chat => chat.id === data.message.chatId)) {
              // This is a message for a chat we don't know about yet
              // Create a new chat with metadata provided in the event
              const newChat = {
                id: data.message.chatId,
                name: data.scenarioName || "New Conversation",
                scenario: data.scenarioId || "",
                status: 'running' as const,
                messages: [data.message],
                metrics: {
                  correct: 0,
                  incorrect: 0,
                  responseTime: [],
                  validationScores: [],
                  contextRelevance: []
                },
                timestamp: new Date().toISOString(),
                personaId: data.personaId || ""
              };
              
              const updatedRun = {
                ...selectedRun,
                chats: [...selectedRun.chats, newChat]
              };
              
              setSelectedRun(updatedRun);
              updateRun(updatedRun);
            }
          } 
          else if (data.type === "chat_info") {
            // This event provides metadata about a chat
            if (selectedRun) {
              // Check if we already have this chat
              const chatIndex = selectedRun.chats.findIndex(c => c.id === data.chatId);
              
              if (chatIndex === -1) {
                // Create a new chat
                const newChat = {
                  id: data.chatId,
                  name: data.scenarioName || data.scenarioId || "New Conversation",
                  scenario: data.scenarioId || "",
                  status: 'running' as const,
                  messages: [],
                  metrics: {
                    correct: 0,
                    incorrect: 0,
                    responseTime: [],
                    validationScores: [],
                    contextRelevance: []
                  },
                  timestamp: new Date().toISOString(),
                  personaId: data.personaId || ""
                };
                
                const updatedRun = {
                  ...selectedRun,
                  chats: [...selectedRun.chats, newChat]
                };
                
                setSelectedRun(updatedRun);
                updateRun(updatedRun);
              }
            }
          }
          else if (data.type === "chat_complete") {
            // Update a completed chat
            if (selectedRun) {
              const updatedRun = { ...selectedRun };
              
              // Find if the chat exists
              const existingChatIndex = updatedRun.chats.findIndex(c => c.id === data.chat.id);
              
              if (existingChatIndex >= 0) {
                // Update existing chat
                updatedRun.chats[existingChatIndex] = data.chat;
              } else {
                // Add new chat
                updatedRun.chats.push(data.chat);
              }
              
              setSelectedRun(updatedRun);
              updateRun(updatedRun);
            }
          }
          else if (data.type === "complete") {
            // Finalize run, update state & DB
            if (selectedRun) {
              const finalRun: TestRun = {
                ...selectedRun,
                status: 'completed',
                metrics: {
                  ...selectedRun.metrics,
                  total: selectedRun.chats.length,
                  passed: selectedRun.chats.filter(c => c.status === 'passed').length,
                  failed: selectedRun.chats.filter(c => c.status === 'failed').length,
                },
              };
              setSelectedRun(finalRun);
              updateRun(finalRun);
            }
            controller.abort(); // Close the connection
          }
          else if (data.type === "error") {
            setError({ message: data.error });
            setStatus('failed');
            controller.abort(); // Close the connection
          }
        } catch (err) {
          console.error("Error parsing SSE data", err);
        }
      },
      onerror(err) {
        console.error("SSE error:", err);
        setError({ message: "An error occurred with the live update connection." });
        setStatus('failed');
        controller.abort(); // Stop the stream
        return -1; // Signal to fetchEventSource not to retry
      },
      onclose() {
        console.log("Connection closed by server");
        setStatus('completed');
      },
    });
    
    setStatus("running");
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