import React from "react";
import { TestMessage } from "@/types/runs";
import { CollapsibleSection } from "./CollapsibleSection";
import { BarChart2, FileText } from "lucide-react";
import ConversationAnalysis from "./ConversationAnalysis";
import { Conversation } from "@/types/chat";

interface ConversationViewProps {
  chat: Conversation;
}

export default function ConversationView({ chat }: ConversationViewProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{chat.name}</h2>
      <p className="text-sm text-muted-foreground">
        View conversation and responses
      </p>
      <div className="space-y-6 max-w-[800px] mx-auto p-4">
        {chat.messages.map((message: TestMessage) => (
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
            Coming soon...
          </CollapsibleSection>

          <CollapsibleSection
            title="Analysis"
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