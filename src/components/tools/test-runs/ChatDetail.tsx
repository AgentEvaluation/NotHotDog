import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ConversationView from "./ConversationView";
import MetricsView from "./MetricsView";
import { Conversation } from "@/types/chat";
import { MetricsPanel } from "../metrics/MetricsPanel";
import { AlertTriangle, Clock, Zap } from "lucide-react";

interface ChatDetailProps {
  chat: Conversation;
  onBack: () => void;
}

export default function ChatDetail({ chat, onBack }: ChatDetailProps) {
    const [activeTab, setActiveTab] = useState("conversation");
    const [metricFilter, setMetricFilter] = useState<"All"|"Binary"|"Numerical"|"Critical Only">("All");
  
    return (
      <div className="w-full">
        <div className="-mt-1 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back to Run
          </Button>
        </div>
  
        {/* Dashboard metrics cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-background rounded-md border p-3 flex justify-between items-center">
                <div>
                <p className="text-xs text-muted-foreground">Response Time</p>
                <p className="text-lg font-semibold">
                    {chat.metrics.responseTime.length > 0 
                        ? Math.round(chat.metrics.responseTime.reduce((sum, time) => sum + time, 0) / 
                                    chat.metrics.responseTime.length)
                        : 0}ms
                    </p>
                </div>
                <Clock className="h-5 w-5 text-primary opacity-70" />
            </div>
            <div className="bg-background rounded-md border p-3 flex justify-between items-center">
                <div>
                    <p className="text-xs text-muted-foreground">Hallucination</p>
                    <p className="text-lg font-semibold">
                        {chat.messages.some(msg => msg.role === 'assistant' && msg.metrics?.isHallucination === true) ? 
                            <span className="text-red-500">Yes</span> : 
                            chat.messages.some(msg => msg.role === 'assistant' && msg.metrics?.isHallucination === false) ?
                            <span className="text-green-500">No</span> :
                            <span className="text-muted-foreground">N/A</span>}
                    </p>
                </div>
            <AlertTriangle className="h-5 w-5 text-primary opacity-70" />
            </div>
        </div>
  
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-background border rounded-md shadow-sm mb-2">
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
                <TabsTrigger value="metrics">Metrics Breakdown</TabsTrigger>
            </TabsList>
  
            <TabsContent value="conversation" className="pt-2">
                <ConversationView chat={chat} />
            </TabsContent>
  
            <TabsContent value="metrics" className="pt-2">
                <MetricsView 
                  metricResults={chat.metrics.metricResults || []} 
                  metricFilter={metricFilter}
                  setMetricFilter={setMetricFilter}
                />
            </TabsContent>
        </Tabs>
      </div>
    );
  }