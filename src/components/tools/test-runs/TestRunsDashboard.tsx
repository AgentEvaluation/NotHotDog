"use client";

import React, { useState } from "react";
import { useTestExecution } from "@/hooks/useTestExecution";
import RunsList from "./RunsList";
import RunDetail from "./RunDetail";
import ChatDetail from "./ChatDetail";

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
  } = useTestExecution();

  const [showWarningDialog, setShowWarningDialog] = useState(false);

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
      error={error}
    />;
  }

  return (
    <RunsList 
      runs={runs}
      onSelectRun={setSelectedRun}
      savedAgentConfigs={savedAgentConfigs}
      onExecuteTest={executeTest}
      error={error}
    />
  );
}