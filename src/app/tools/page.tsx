"use client"

import { useState } from "react"
import { useAgentConfig } from "@/hooks/useAgentConfig"
import { useErrorContext } from "@/hooks/useErrorContext"
import { ChevronDown, MessageSquare, Save, Server, Settings, FileCode, Sparkles, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import ErrorDisplay from "@/components/common/ErrorDisplay"
import AgentSetup from "@/components/tools/AgentSetup"
import AgentResponse from "@/components/tools/AgentResponse"
import AgentRules from "@/components/tools/AgentRules"
import AgentDescription from "@/components/tools/agentDescription"

export default function ToolsPage() {
  const {
    testName,
    setTestName,
    agentEndpoint,
    setAgentEndpoint,
    headers,
    setHeaders,
    manualResponse,
    loading,
    responseTime,
    rules,
    setRules,
    savedAgents,
    agentDescription,
    setAgentDescription,
    userDescription,
    setUserDescription,
    isEditMode,
    loadAgent,
    testManually,
    saveTest,
    currentAgentId,
    body,
    setbody,
  } = useAgentConfig()

  const [activeTab, setActiveTab] = useState("description")
  const { error, clearError } = useErrorContext()

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-background/80 p-6">
      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={clearError}
          className="mb-6 animate-in fade-in-50 slide-in-from-top-5 duration-300"
        />
      )}

      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configure Agent</h1>
            <p className="text-muted-foreground mt-1">Set up and test your AI agent with validation rules</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto border-border flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span>Load Agent</span>
                  <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Saved Agents</div>
                <Separator className="my-1" />
                {savedAgents.length > 0 ? (
                  savedAgents.map((agent) => (
                    <DropdownMenuItem
                      key={agent.id}
                      onClick={() => loadAgent(agent.id)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <FileCode className="h-4 w-4 text-primary/70" />
                      {agent.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled className="text-muted-foreground/70">
                    No saved agents
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="Enter test name"
                value={testName ?? ""}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full sm:w-64 bg-background border-border"
              />
              <Button onClick={saveTest} disabled={!manualResponse || !testName || loading} className="shrink-0 gap-2">
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">{isEditMode ? "Update" : "Save"}</span>
              </Button>
            </div>
          </div>
        </div>

        <Card className="border-border bg-card/30 backdrop-blur-sm shadow-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full items-start">
            <CardHeader className="pb-0">
              <TabsList className="bg-background/50 p-0.5 h-auto border border-border/50 w-full sm:w-auto justify-start">
                <TabsTrigger
                  value="description"
                  className="
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    data-[state=active]:shadow-sm
                    transition-all
                    rounded-md
                    items-left
                  "
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Agent Details
                </TabsTrigger>
                <TabsTrigger
                  value="testing"
                  className="
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    data-[state=active]:shadow-sm
                    transition-all
                    rounded-md
                  "
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Testing Setup
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="description" className="mt-0 space-y-4">
                <AgentDescription
                  agentDescription={agentDescription}
                  userDescription={userDescription}
                  onAgentDescriptionChange={setAgentDescription}
                  onUserDescriptionChange={setUserDescription}
                />
                <div className="flex justify-end mt-6">
                  <Button onClick={() => setActiveTab("testing")} className="gap-2">
                    Next
                    <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="testing" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                  <div className="space-y-6">
                    <AgentSetup
                      agentEndpoint={agentEndpoint}
                      setAgentEndpoint={setAgentEndpoint}
                      headers={headers}
                      setHeaders={setHeaders}
                      body={body}
                      setBody={setbody}
                    />
                    <Button
                      onClick={testManually}
                      disabled={loading || !body || !agentEndpoint}
                      className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Testing Agent...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4" />
                          Test Agent
                        </>
                      )}
                    </Button>
                  </div>

                  <div>
                    <AgentRules
                      manualResponse={manualResponse}
                      rules={rules}
                      setRules={setRules}
                      agentId={currentAgentId ?? ""}
                    />
                  </div>
                </div>

                {manualResponse && (
                  <div className="mt-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                    <AgentResponse
                      manualResponse={manualResponse}
                      responseTime={responseTime}
                      rules={rules}
                      setRules={setRules}
                    />
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
