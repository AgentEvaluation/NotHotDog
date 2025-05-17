"use client"

import { useState } from "react"
import { ChevronDown, Sparkles, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface AgentDescriptionProps {
  agentDescription: string
  userDescription: string
  onAgentDescriptionChange: (value: string) => void
  onUserDescriptionChange: (value: string) => void
}

export default function AgentDescription({
  agentDescription,
  userDescription,
  onAgentDescriptionChange,
  onUserDescriptionChange,
}: AgentDescriptionProps) {
  const [isAgentCollapsed, setIsAgentCollapsed] = useState(false)
  const [isUserCollapsed, setIsUserCollapsed] = useState(false)

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <div
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setIsAgentCollapsed(!isAgentCollapsed)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-base font-medium">Agent Description</h3>
              <p className="text-sm text-muted-foreground">Define the agent's personality and capabilities</p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isAgentCollapsed ? "rotate-180" : ""}`}
          />
        </div>

        {!isAgentCollapsed && (
          <CardContent className="pt-0 pb-4 px-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">Agent Personality & Knowledge</Label>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Required
                </Badge>
              </div>
              <Textarea
                placeholder="Describe the agent's personality, behavior, and knowledge domain in detail..."
                value={agentDescription}
                onChange={(e) => onAgentDescriptionChange(e.target.value)}
                className="min-h-[180px] resize-y border-border bg-background/50"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Be specific about what the agent knows, how it should respond, and any limitations it should have.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="border-border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <div
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setIsUserCollapsed(!isUserCollapsed)}
        >
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-base font-medium">Ideal User Profile</h3>
              <p className="text-sm text-muted-foreground">Define the characteristics of an ideal user</p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isUserCollapsed ? "rotate-180" : ""}`}
          />
        </div>

        {!isUserCollapsed && (
          <CardContent className="pt-0 pb-4 px-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">User Characteristics</Label>
              <Textarea
                placeholder="Describe characteristics of an ideal user interacting with this agent..."
                value={userDescription}
                onChange={(e) => onUserDescriptionChange(e.target.value)}
                className="min-h-[180px] resize-y border-border bg-background/50"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Define user expertise level, goals, and typical interaction patterns to help optimize agent responses.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
