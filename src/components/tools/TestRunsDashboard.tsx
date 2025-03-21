"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestMessage } from "@/types/runs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, ChevronDown } from "lucide-react";
import { useTestExecution } from "@/hooks/useTestExecution";
import WarningDialog from "@/components/config/WarningDialog";
import { ConversationValidationDisplay } from "./ConversationValidationDisplay";


function CollapsibleJson({ content }: { content: string }) {
  let formattedContent = content;
  try {
    if (
      typeof content === "string" &&
      (content.startsWith("{") || content.startsWith("["))
    ) {
      const parsed = JSON.parse(content);
      formattedContent = JSON.stringify(parsed, null, 2);
      return (
        <pre className="font-mono text-sm p-4 rounded-[var(--radius)] overflow-x-auto whitespace-pre-wrap max-w-full">
          {formattedContent}
        </pre>
      );
    }
    return (
      <div className="p-4 whitespace-pre-wrap text-sm max-w-full">
        {content}
      </div>
    );
  } catch (e) {
    return (
      <div className="p-4 whitespace-pre-wrap text-sm max-w-full">
        {content}
      </div>
    );
  }
}

export function TestRunsDashboard() {
  const {
    runs,
    selectedRun,
    setSelectedRun,
    selectedChat,
    setSelectedChat,
    savedAgentConfigs,
    executeTest,
    error
  } = useTestExecution();

  const [showWarningDialog, setShowWarningDialog] = useState(false); // State to control the WarningDialog dialog
  const [testIdToExecute, setTestIdToExecute] = useState<string | null>(null); // State to store the test ID to execute after API key check

  if (selectedChat) {
    return (
      <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedChat(null)}>
            ← Back to Run
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold">{selectedChat.name}</h2>
          <p className="text-sm text-muted-foreground">
            View conversation and responses
          </p>
        </div>

        <div className="space-y-6 max-w-[800px] mx-auto">
          {selectedChat.messages.map((message: TestMessage) => (
            <div key={message.id} className="space-y-2">
              {message.role === "user" ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="bg-blue-500/20 rounded-[var(--radius)]">
                      <CollapsibleJson content={message.content} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-1 overflow-hidden">
                    <div className="bg-emerald-500/10 rounded-[var(--radius)]">
                      <CollapsibleJson content={message.content} />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🤖</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          {selectedChat.validationResult && (
            <ConversationValidationDisplay validationResult={selectedChat.validationResult} />
          )}

        </div>
      </div>
    );
  }

  if (selectedRun) {
    return (
      <div className="p-6 space-y-6">
        {error && (
          <div className="p-4 mb-4 text-red-600 bg-red-100 rounded">
            {error.message}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setSelectedRun(null)}>
              ← Back to Runs
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Run #{selectedRun.name}</h2>
          <p className="text-sm text-muted-foreground">
            All conversations in this test run
          </p>
        </div>

        <div className="space-y-2">
          {(selectedRun.chats || []).map((chat) => (
            <div
              key={chat.id}
              className="flex items-center p-4 bg-background border border-border rounded-[var(--radius)] cursor-pointer hover:bg-background/30"
              onClick={() => setSelectedChat(chat)}
            >
              <div className="w-[60%] truncate">
                <div className="font-medium">
                  {chat.scenarioName ?? "Unknown Scenario"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {chat.personaName ?? "Unknown Persona"}
                </div>
                <p className="text-sm text-muted-foreground">
                  {chat.messages.length} messages
                </p>
              </div>

              <div className="w-[40%] flex items-center justify-end gap-4">
                <Badge
                  variant={
                    chat.status === "passed" 
                      ? "outline" 
                      : chat.status === "failed" 
                      ? "destructive" 
                      : "secondary"
                  }
                >
                  {chat.status}
                </Badge>
                <span className="text-muted-foreground">→</span>
              </div>

              <div className="w-[40%] flex items-center justify-end">
                <span className="text-muted-foreground">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Test Runs</h2>
          <p className="text-sm text-muted-foreground">
            History of all test executions
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Run Test
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="cursor-pointer">
            {savedAgentConfigs.length > 0 ? (
              savedAgentConfigs.map((test) => (
                <DropdownMenuItem 
                  key={test.id}
                  onSelect={() => executeTest(test.id)}
                  className="cursor-pointer"
                >
                  {test.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No saved tests found</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        {runs.map((run) => (
          <div
            key={run.id}
            className="flex items-center p-4 bg-background border border-border rounded-[var(--radius)] cursor-pointer hover:bg-background/30"
            onClick={() => setSelectedRun(run)}
          >
            <div className="w-[30%] flex items-center gap-2">
              <span className="font-medium">{run.name}</span>
              <span className="text-muted-foreground text-sm">
                {new Date(run.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="w-[50%] flex items-center gap-4">
              <span className="text-muted-foreground">
                Tests: {run.metrics.total || 0}
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-green-500">✓</span>
                  <span>{run.metrics.passed}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-red-500">✗</span>
                  <span>{run.metrics.failed}</span>
                </div>
              </div>
            </div>

            <div className="w-[20%] flex items-center justify-end gap-2">
              <Badge>{run.status}</Badge>
              <span className="text-muted-foreground">→</span>
            </div>
          </div>
        ))}

        {runs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No test runs yet. Generate and run some tests to get started.
          </div>
        )}
      </div>
      {showWarningDialog && (
        <WarningDialog
          isOpen={showWarningDialog}
          onClose={() => setShowWarningDialog(false)}
        />
      )}
    </div>
  );
}
