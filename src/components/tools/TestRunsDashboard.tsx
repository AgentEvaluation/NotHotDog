"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestMessage } from "@/types/runs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, ChevronDown, ChevronUp, BarChart2, FileText } from "lucide-react";
import { useTestExecution } from "@/hooks/useTestExecution";
import WarningDialog from "@/components/config/WarningDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
        <pre className="font-mono text-sm p-4 rounded-xl overflow-x-auto whitespace-pre-wrap max-w-full bg-muted">
          {formattedContent}
        </pre>
      );
    }
    return <div className="p-4 whitespace-pre-wrap text-sm max-w-full">{content}</div>;
  } catch {
    return <div className="p-4 whitespace-pre-wrap text-sm max-w-full">{content}</div>;
  }
}

const CollapsibleSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}> = ({ title, children, defaultOpen = false, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-md overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-sm font-medium bg-muted hover:bg-muted/80 transition-colors"
      >
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <span>{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="bg-background p-4">{children}</div>}
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState("conversation");

  if (selectedChat) {
    return (
      <div className="p-10 space-y-1 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedChat(null)}>
            ← Back to Run
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Test Results</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View evaluation results and metrics for your agent tests
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-background p-1 border rounded-md shadow-sm">
              <TabsTrigger
                value="conversation"
                className="px-4 py-1.5 text-sm rounded-md data-[state=active]:bg-muted data-[state=active]:text-foreground"
              >
                Conversation
              </TabsTrigger>
              <TabsTrigger
                value="metrics"
                className="px-4 py-1.5 text-sm rounded-md data-[state=active]:bg-muted data-[state=active]:text-foreground"
              >
                Metrics Breakdown
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversation" className="pt-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedChat.name}</h2>
                <p className="text-sm text-muted-foreground">
                  View conversation and responses
                </p>
              </div>

              <div className="space-y-6 max-w-[800px] mx-auto p-4">
              {selectedChat.messages.map((message: TestMessage) => (
                <div key={message.id} className="space-y-2">
                  {message.role === "user" ? (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center flex-shrink-0 text-[#2563eb] font-bold">
                        👤
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="bg-[#eff6ff] text-[#1e3a8a] rounded-2xl px-5 py-4 shadow-sm">
                          <CollapsibleJson content={message.content} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex-1 overflow-hidden">
                        <div className="bg-[#dcfce7] text-[#14532d] rounded-2xl px-5 py-4 shadow-sm">
                          <CollapsibleJson content={message.content} />
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#bbf7d0] flex items-center justify-center flex-shrink-0 text-[#15803d] font-bold">
                        🤖
                      </div>
                    </div>
                  )}
                </div>
              ))}


                <div className="mt-6 space-y-4">
                  <CollapsibleSection
                    title="Conversation Metrics"
                    icon={<BarChart2 className="h-4 w-4" />}
                  >
                    {/* <ConversationMetricsSection chat={selectedChat} /> */}
                    Coming soon...
                  </CollapsibleSection>

                  <CollapsibleSection
                    title="Analysis"
                    icon={<FileText className="h-4 w-4" />}
                    defaultOpen={true}
                  >
                    {selectedChat.validationResult && (
                      <div className="p-3 bg-muted rounded-md">
                        <h4 className="text-sm font-medium mb-2">Test Result:</h4>
                        <div
                          className={`font-medium ${
                            selectedChat.validationResult.isCorrect
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {selectedChat.validationResult.isCorrect ? "Pass" : "Fail"}
                        </div>
                        <h4 className="text-sm font-medium mt-4 mb-2">Analysis:</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedChat.validationResult.explanation}
                        </p>
                      </div>
                    )}
                  </CollapsibleSection>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="pt-4">
              <div className="h-64 flex items-center justify-center text-muted-foreground p-4">
                <p>Metrics breakdown will be implemented soon.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  if (selectedRun) {
    return (
      <div className="p-5 space-y-3 max-w-6xl mx-auto">
        {error && (
          <div className="p-4 mb-4 text-red-600 bg-red-100 rounded">
            {error.message}
          </div>
        )}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedRun(null)}>
            ← Back to Runs
          </Button>
        </div>

        <div>
          <h2 className="text-2xl font-semibold">Run #{selectedRun.name}</h2>
          <p className="text-sm text-muted-foreground">
            All conversations in this test run
          </p>
        </div>

        <div className="space-y-2">
          {(selectedRun.chats || []).map((chat) => (
            <div
              key={chat.id}
              className="flex items-center justify-between p-4 bg-background border border-border rounded-xl cursor-pointer hover:bg-muted"
              onClick={() => setSelectedChat(chat)}
            >
              <div className="flex-1">
                <div className="font-medium truncate">{chat.scenarioName ?? "Unknown Scenario"}</div>
                <div className="text-sm text-muted-foreground">{chat.personaName ?? "Unknown Persona"}</div>
                <div className="text-sm text-muted-foreground">{chat.messages.length} messages</div>
              </div>
              <div className="flex items-center gap-3">
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
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Test Runs</h2>
          <p className="text-sm text-muted-foreground">History of all test executions</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Run Test
              <ChevronDown className="w- h-4 ml-2" />
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
            className="flex items-center justify-between p-4 bg-background border border-border rounded-xl cursor-pointer hover:bg-muted"
            onClick={() => setSelectedRun(run)}
          >
            <div className="flex-1">
              <div className="font-medium">{run.name}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(run.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-green-600 font-semibold">✓ {run.metrics.passed}</div>
              <div className="text-red-500 font-semibold">✗ {run.metrics.failed}</div>
              <Badge>{run.status}</Badge>
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
