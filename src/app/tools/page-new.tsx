"use client"

import { useState } from "react"
import AgentConfigWizard from "@/components/tools/AgentConfigWizard"
import { Button } from "@/components/ui/button"
import { ChevronDown, FileCode, Server } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useAgentConfig } from "@/hooks/useAgentConfig"

export default function ToolsPageNew() {
  const { savedAgents, loadAgent } = useAgentConfig()
  const [showWizard, setShowWizard] = useState(true)

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-background/80 p-6">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configure Agent</h1>
            <p className="text-muted-foreground mt-1">Set up and test your AI agent with validation rules</p>
          </div>

          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
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
                      onClick={() => {
                        loadAgent(agent.id)
                        setShowWizard(false)
                      }}
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

            <Button 
              onClick={() => setShowWizard(true)}
              variant={showWizard ? "default" : "outline"}
            >
              New Agent
            </Button>
          </div>
        </div>

        {showWizard ? (
          <AgentConfigWizard />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Select a saved agent or create a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}