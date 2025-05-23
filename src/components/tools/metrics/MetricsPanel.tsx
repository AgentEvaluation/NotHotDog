// src/components/tools/metrics/MetricsPanel.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Zap, CheckCircle, XCircle } from "lucide-react";
import { TestMessage } from "@/types/runs"; // Add this import

interface MetricsPanelProps {
  responseTime: number[];
  isHallucination?: boolean; // Keep this for backward compatibility
  messages?: TestMessage[]; // Add this new prop
}

export function MetricsPanel({
  responseTime,
  isHallucination,
  messages
}: MetricsPanelProps) {
  // Calculate average response time
  const avgResponseTime = responseTime.length > 0
    ? responseTime.reduce((sum: number, time: number) => sum + time, 0) / responseTime.length
    : 0;

  // Get response time level
  const getResponseTimeLevel = (time: number) => {
    if (time < 300) return { label: "Fast", color: "green-500" };
    if (time < 1000) return { label: "Moderate", color: "yellow-500" };
    return { label: "Slow", color: "orange-500" };
  };

  const responseTimeLevel = getResponseTimeLevel(avgResponseTime);
  
  // Determine hallucination status from messages if available
  const hasHallucination = messages 
    ? messages.some(msg => msg.role === 'assistant' && msg.metrics?.isHallucination === true)
    : isHallucination;

  const hallucinationChecked = messages
    ? messages.some(msg => msg.role === 'assistant' && msg.metrics?.isHallucination !== null)
    : isHallucination !== undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Response Time Metric */}
      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
            Hallucination Check
            </CardTitle>
        </CardHeader>
        <CardContent>
            {hallucinationChecked ? (
            <>
                <div className="flex justify-between items-center">
                <span className="text-2xl font-bold flex items-center">
                    {hasHallucination ? (
                    <>
                        <XCircle className="mr-2 h-6 w-6 text-destructive" />
                        <span className="text-destructive">Detected</span>
                    </>
                    ) : (
                    <>
                        <CheckCircle className="mr-2 h-6 w-6 text-green-500" />
                        <span className="text-green-500">None Detected</span>
                    </>
                    )}
                </span>
                <Badge
                    className={hasHallucination ? "bg-destructive" : "bg-green-500"}
                >
                    {hasHallucination ? "Failed" : "Passed"}
                </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                Automated check for factual inaccuracies in the response
                </p>
            </>
            ) : (
            <div className="flex flex-col items-center justify-center h-16">
                <span className="text-2xl font-bold text-muted-foreground">N/A</span>
                <span className="text-sm text-muted-foreground mt-2">
                Hallucination check not available
                </span>
            </div>
            )}
        </CardContent>
       </Card>

      {/* Hallucination Detection Metric */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
            Hallucination Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasHallucination !== undefined ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold flex items-center">
                  {hasHallucination ? (
                    <>
                      <XCircle className="mr-2 h-6 w-6 text-destructive" />
                      <span className="text-destructive">Detected</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-6 w-6 text-green-500" />
                      <span className="text-green-500">None Detected</span>
                    </>
                  )}
                </span>
                <Badge
                  className={hasHallucination ? "bg-destructive" : "bg-green-500"}
                >
                  {hasHallucination ? "Failed" : "Passed"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Automated check for factual inaccuracies in the response
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-16">
              <span className="text-sm text-muted-foreground">
                Hallucination check not available
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}