// src/components/tools/metrics/MetricsPanel.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Zap, CheckCircle, XCircle } from "lucide-react";
import { TokenUsage } from "@/types/metrics";

interface MetricsPanelProps {
  responseTime: number[];
  tokenUsage?: TokenUsage;
  isHallucination?: boolean;
}

export function MetricsPanel({
  responseTime,
  tokenUsage,
  isHallucination
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Response Time Metric */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            Response Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">
              {Math.round(avgResponseTime)}ms
            </span>
            <Badge>
              {responseTimeLevel.label}
            </Badge>
          </div>
          <Progress
            value={Math.min(100, (avgResponseTime / 3000) * 100)}
            className="h-1.5 mt-3"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Average response time across {responseTime.length} messages
          </p>
        </CardContent>
      </Card>

      {/* Token Usage Metric */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Zap className="mr-2 h-4 w-4 text-muted-foreground" />
            Token Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tokenUsage ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {tokenUsage.total.toLocaleString()}
                </span>
                <Badge>
                  Total Tokens
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="text-xs">
                  <span className="text-muted-foreground">Prompt: </span>
                  <span className="font-medium">{tokenUsage.prompt.toLocaleString()}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Completion: </span>
                  <span className="font-medium">{tokenUsage.completion.toLocaleString()}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-16">
              <span className="text-sm text-muted-foreground">
                Token usage data not available
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
          {isHallucination !== undefined ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold flex items-center">
                  {isHallucination ? (
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
                  className={isHallucination ? "bg-destructive" : "bg-green-500"}
                >
                  {isHallucination ? "Failed" : "Passed"}
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