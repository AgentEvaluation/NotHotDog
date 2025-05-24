import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestRun } from "@/types/runs";
import { Conversation } from "@/types/chat";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { useErrorContext } from "@/hooks/useErrorContext";
import { ArrowLeft, MessageSquare, User, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

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
      
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Runs
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{run.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Executed on {new Date(run.timestamp).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              {run.chats.every(chat => chat.messages?.length === 0) && (
                <span className="ml-2 text-yellow-600">(Legacy run - no messages stored)</span>
              )}
            </p>
          </div>
          <div className="flex gap-4">
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Passed</p>
                  <p className="text-xl font-bold text-green-600">{run.metrics.passed}</p>
                </div>
              </div>
            </Card>
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-xl font-bold text-red-600">{run.metrics.failed}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Conversations</CardTitle>
          <CardDescription>Click on a conversation to view details and metrics</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {(run.chats || []).map((chat) => {
              const getStatusIcon = () => {
                switch (chat.status) {
                  case 'passed':
                    return <CheckCircle2 className="w-4 h-4 text-green-600" />;
                  case 'failed':
                    return <XCircle className="w-4 h-4 text-red-600" />;
                  default:
                    return <AlertCircle className="w-4 h-4 text-yellow-600" />;
                }
              };

              return (
                <div
                  key={chat.id}
                  className="flex items-center justify-between gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => onSelectChat(chat)}
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="mt-1 flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate flex-1">{chat.scenarioName ?? "Unknown Scenario"}</h4>
                        <div className="flex-shrink-0">{getStatusIcon()}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <User className="w-3 h-3" />
                        <span className="truncate">{chat.personaName ?? "Unknown Persona"}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{chat.messages?.length || 0} messages</span>
                        <span>•</span>
                        <span>
                          {chat.metrics?.responseTime?.length > 0
                            ? `Avg response: ${Math.round(
                                chat.metrics.responseTime.reduce((a, b) => a + b, 0) / 
                                chat.metrics.responseTime.length
                              )}ms`
                            : 'No timing data'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant={
                        chat.status === "passed"
                          ? "default"
                          : chat.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                      className="capitalize whitespace-nowrap"
                    >
                      {chat.status}
                    </Badge>
                    <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180 flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}