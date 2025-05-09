import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart2, FileText } from "lucide-react";
import ConversationView from "./ConversationView";
import MetricsView from "./MetricsView";
import ConversationAnalysis from "./ConversationAnalysis";
import { TestChat } from "@/types/chat";

interface ChatDetailProps {
  chat: TestChat;
  onBack: () => void;
}

export default function ChatDetail({ chat, onBack }: ChatDetailProps) {
  const [activeTab, setActiveTab] = useState("conversation");
  const [metricFilter, setMetricFilter] = useState<"All"|"Binary"|"Numerical"|"Critical Only">("All");

  return (
    <div className="p-5 space-y-3 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
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
            <ConversationView chat={chat} />
          </TabsContent>

          <TabsContent value="metrics" className="pt-4">
            <MetricsView 
              metricResults={chat.metrics.metricResults || []} 
              metricFilter={metricFilter}
              setMetricFilter={setMetricFilter}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}