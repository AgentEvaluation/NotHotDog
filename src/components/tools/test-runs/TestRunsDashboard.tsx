"use client";

import React, { useState } from "react";
import { useTestExecution } from "@/hooks/useTestExecution";
import RunsList from "./RunsList";
import RunDetail from "./RunDetail";
import ChatDetail from "./ChatDetail";
import WarningDialog from "@/components/config/WarningDialog";
import { ModelFactory } from "@/services/llm/modelfactory";

export function TestRunsDashboard() {
  const {
    runs,
    selectedRun,
    setSelectedRun,
    selectedChat,
    setSelectedChat,
    savedAgentConfigs,
    executeTest,
    error,
    clearError,
  } = useTestExecution();

  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // Handle model config issues
  const handleExecuteTest = (testId: string) => {
    const modelConfig = ModelFactory.getSelectedModelConfig();
    if (!modelConfig) {
      setShowWarningDialog(true);
      return;
    }
    executeTest(testId);
  };

  if (selectedChat) {
    return <ChatDetail 
      chat={selectedChat} 
      onBack={() => setSelectedChat(null)} 
    />;
  }

  if (selectedRun) {
    return <RunDetail 
      run={selectedRun} 
      onBack={() => setSelectedRun(null)}
      onSelectChat={setSelectedChat}
    />;
  }

  return (
    <>
      <RunsList 
        runs={runs}
        onSelectRun={setSelectedRun}
        savedAgentConfigs={savedAgentConfigs}
        onExecuteTest={handleExecuteTest}
        isLoading={false}
      />

      {showWarningDialog && (
        <WarningDialog
          isOpen={showWarningDialog}
          onClose={() => setShowWarningDialog(false)}
        />
      )}
    </>
  );
}