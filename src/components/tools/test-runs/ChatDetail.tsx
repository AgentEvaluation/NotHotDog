import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ConversationView from "./ConversationView";
import MetricsView from "./MetricsView";
import { Conversation } from "@/types/chat";
import { MetricsPanel } from "../metrics/MetricsPanel";
import { AlertTriangle, Clock, Zap, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

interface ChatDetailProps {
  chat: Conversation;
  onBack: () => void;
}

export default function ChatDetail({ chat, onBack }: ChatDetailProps) {
    const [activeTab, setActiveTab] = useState("conversation");
    const [metricFilter, setMetricFilter] = useState<"All"|"Binary"|"Numerical"|"Critical Only">("All");
  
    return (
      <div className="w-full">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Run Details
          </Button>
        </div>
  
        {/* Dashboard metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                        <p className="text-2xl font-bold">
                            {chat.metrics.responseTime.length > 0 
                                ? Math.round(chat.metrics.responseTime.reduce((sum, time) => sum + time, 0) / 
                                            chat.metrics.responseTime.length)
                                : 0}ms
                        </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </Card>
            
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Hallucination Status</p>
                        <div className="text-2xl font-bold">
                            {chat.messages.some(msg => msg.role === 'assistant' && msg.metrics?.isHallucination === true) ? (
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                    <span className="text-red-600">Detected</span>
                                </div>
                            ) : chat.messages.some(msg => msg.role === 'assistant' && msg.metrics?.isHallucination === false) ? (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    <span className="text-green-600">None</span>
                                </div>
                            ) : (
                                <span className="text-muted-foreground text-base">Not analyzed</span>
                            )}
                        </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                </div>
            </Card>
            
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                        <p className="text-2xl font-bold">{chat.messages.length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
            </Card>
        </div>
  
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conversation" className="data-[state=active]:bg-background">
                    Conversation
                </TabsTrigger>
                <TabsTrigger value="metrics" className="data-[state=active]:bg-background">
                    Metrics Breakdown
                </TabsTrigger>
            </TabsList>
  
            <TabsContent value="conversation" className="mt-6">
                <ConversationView chat={chat} />
            </TabsContent>
  
            <TabsContent value="metrics" className="mt-6">
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