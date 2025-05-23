import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestRun } from "@/types/runs";
import { Conversation } from "@/types/chat";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { useErrorContext } from "@/hooks/useErrorContext";

interface RunDetailProps {
  run: TestRun;
  onBack: () => void;
  onSelectChat: (chat: Conversation) => void;
}

export default function RunDetail({ 
  run, 
  onBack, 
  onSelectChat
}: RunDetailProps) {
  const { error, clearError } = useErrorContext();
  
  return (
    <div className="w-full mx-auto">
      {error && (
        <ErrorDisplay 
          error={error}
          onDismiss={clearError}
          className="mb-3"
        />
      )}
      
      <div className="-mt-1 mb-1">
        <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back to Runs
        </Button>
      </div>

      <div className="mb-1">
        <h2 className="text-xl font-semibold">{run.name}</h2>
      </div>

      <div className="space-y-2 w-full">
        {(run.chats || []).map((chat) => (
          <div
            key={chat.id}
            className="flex items-center justify-between p-2 bg-background border border-border rounded-md cursor-pointer hover:bg-muted overflow-hidden w-full"
            onClick={() => onSelectChat(chat)}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{chat.scenarioName ?? "Unknown Scenario"}</div>
              <div className="text-sm text-muted-foreground truncate">{chat.personaName ?? "Unknown Persona"}</div>
              <div className="text-sm text-muted-foreground">{chat.messages.length} messages</div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-3">
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