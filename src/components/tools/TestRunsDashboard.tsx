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
import { MetricType, Criticality } from "@/types/metrics";

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
  const [metricFilter, setMetricFilter] = useState<"All"|"Binary"|"Numerical"|"Critical Only">("All");
  // const filteredMetrics = (selectedChat?.metrics.metricResults || []).filter(m => {
  //   if (metricFilter === "All") return true;
  //   if (metricFilter === "Binary") return m.type?.toLowerCase().includes("binary");
  //   if (metricFilter === "Numerical") return m.type?.toLowerCase().includes("numeric");
  //   if (metricFilter === "Critical Only") return m.criticality?.toLowerCase() === "high";
  //   return false;
  // });

  if (selectedChat) {
    return (
      <div className="p-5 space-y-3 max-w-6xl mx-auto">
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
            {(() => {
              console.log("Selected Chat:", selectedChat);
              console.log("Metrics:", selectedChat?.metrics);
              return null; // Return null so nothing renders
            })()}

              {selectedChat?.metrics.metricResults && selectedChat.metrics.metricResults.length > 0 ? (
                <>
                  {/* filter buttons */}
                  <div className="flex gap-2 mb-4">
                    {["All", "Binary", "Numerical", "Critical Only"].map(f => (
                      <Button
                        key={f}
                        size="sm"
                        variant={metricFilter === f ? "outline" : "ghost"}
                        onClick={() => setMetricFilter(f as any)}
                      >
                        {f}
                      </Button>
                    ))}
                  </div>

                  {/* metrics table */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-3 text-left">Metric</th>
                          <th className="p-3 text-left">Type</th>
                          <th className="p-3 text-left">Criticality</th>
                          <th className="p-3 text-left">Result</th>
                          <th className="p-3 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedChat.metrics.metricResults
                          .filter(m => {
                            // Apply filter based on the metric filter selection
                            if (metricFilter === "All") return true;
                            // Add simple string matching for the other filters since we might not have the complete data
                            if (metricFilter === "Binary") return true; // Show all metrics for now, adjust as needed
                            if (metricFilter === "Numerical") return m.name.toLowerCase().includes("time");
                            if (metricFilter === "Critical Only") return m.name.toLowerCase().includes("hallucination");
                            return false;
                          })
                          .map(m => (
                            <tr key={m.id} className="border-t">
                              <td className="p-3">
                                <div className="font-medium">{m.name}</div>
                                <div className="text-sm text-muted-foreground">{m.reason}</div>
                              </td>
                              <td className="p-3">
                                {/* Infer type from name if not available */}
                                {m.name.toLowerCase().includes("time") ? "Numerical" : 
                                m.name.toLowerCase().includes("flow") ? "Binary Workflow" : 
                                "Binary Qualitative"}
                              </td>
                              <td className="p-3">
                                <Badge 
                                  variant={m.name.toLowerCase().includes("hallucination") ? "destructive" : "outline"}
                                >
                                  {m.name.toLowerCase().includes("hallucination") ? "High" : "Medium"}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <Badge 
                                  variant="outline" 
                                  className={m.score === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                >
                                  {m.score === 1 ? "PASSED" : "FAILED"}
                                </Badge>
                              </td>
                              <td className="p-3 text-right">{(m.score * 100).toFixed(0)}%</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground p-4">
                  <p>No custom metrics data available for this conversation.</p>
                </div>
              )}
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
