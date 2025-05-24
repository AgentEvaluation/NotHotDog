import React from "react";
import { TestMessage } from "@/types/runs";
import { CollapsibleSection } from "./CollapsibleSection";
import { BarChart2, FileText, User, Bot } from "lucide-react";
import ConversationAnalysis from "./ConversationAnalysis";
import { Conversation } from "@/types/chat";
import { Card } from "@/components/ui/card";

interface ConversationViewProps {
  chat: Conversation;
}

export default function ConversationView({ chat }: ConversationViewProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{chat.name}</h2>
        <p className="text-sm text-muted-foreground">
          Conversation between {chat.personaName} and your AI agent
        </p>
      </div>
      <div className="space-y-4">
        {chat.messages && chat.messages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No messages found in this conversation
          </div>
        )}
        {(() => {
          // Precompute message counts for O(n) complexity
          let userCount = 0;
          let assistantCount = 0;
          const messageCountsMap = new Map<string, { userCount: number; assistantCount: number }>();
          
          chat.messages.forEach((msg) => {
            if (msg.role === 'user') userCount++;
            else if (msg.role === 'assistant') assistantCount++;
            messageCountsMap.set(msg.id, { userCount, assistantCount });
          });
          
          return chat.messages.map((message: TestMessage, index) => {
            const counts = messageCountsMap.get(message.id) || { userCount: 0, assistantCount: 0 };
            const userMessageCount = counts.userCount;
            const assistantMessageCount = counts.assistantCount;
            
            return (
          <div key={message.id} className="group">
            {message.role === "user" ? (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="mb-1">
                    <span className="text-sm font-medium">{chat.personaName || "User"}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Message {userMessageCount}
                    </span>
                  </div>
                  <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                    <div className="p-4">
                      <CollapsibleJson content={message.content} />
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium">AI Agent</span>
                    <span className="text-xs text-muted-foreground">
                      Response {assistantMessageCount}
                    </span>
                    {message.metrics?.responseTime && (
                      <span className="text-xs text-muted-foreground">
                        • {message.metrics.responseTime}ms
                      </span>
                    )}
                  </div>
                  <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                    <div className="p-4">
                      <CollapsibleJson content={message.content} />
                    </div>
                  </Card>
                  {message.metrics && (
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      {message.metrics.isHallucination !== null && (
                        <span className={message.metrics.isHallucination ? "text-red-600" : "text-green-600"}>
                          {message.metrics.isHallucination ? "Hallucination detected" : "No hallucination"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
            );
          });
        })()}

        <div className="mt-8 space-y-4">
          <CollapsibleSection
            title="Conversation Analysis"
            icon={<FileText className="h-4 w-4" />}
            defaultOpen={true}
          >
            <ConversationAnalysis validationResult={chat.validationResult} />
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}

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
        <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap max-w-full">
          <code>{formattedContent}</code>
        </pre>
      );
    }
    return <div className="whitespace-pre-wrap text-sm max-w-full">{content}</div>;
  } catch {
    return <div className="whitespace-pre-wrap text-sm max-w-full">{content}</div>;
  }
}