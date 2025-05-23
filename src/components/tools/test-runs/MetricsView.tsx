import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface MetricResult {
  id: string;
  name: string;
  score: number;
  reason: string;
  type?: string;
}

interface MetricsViewProps {
  metricResults: MetricResult[];
  metricFilter: "All" | "Binary" | "Numerical" | "Critical Only";
  setMetricFilter: (filter: "All" | "Binary" | "Numerical" | "Critical Only") => void;
}

export default function MetricsView({ 
  metricResults, 
  metricFilter, 
  setMetricFilter 
}: MetricsViewProps) {
  
  const filteredMetrics = metricResults.filter(m => {
    if (!m || !m.name) return false; // Skip invalid metrics
    if (metricFilter === "All") return true;
    if (metricFilter === "Binary") return true; // Simplified for now
    if (metricFilter === "Numerical") return m.name.toLowerCase().includes("time");
    if (metricFilter === "Critical Only") return m.name.toLowerCase().includes("hallucination");
    return false;
  });

  if (metricResults.length === 0) {
    return (
      <Card className="border-dashed">
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground p-4">
          <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-center">No custom metrics data available for this conversation.</p>
          <p className="text-sm text-center mt-2">Metrics will appear here once configured and evaluated.</p>
        </div>
      </Card>
    );
  }

  const getMetricIcon = (score: number) => {
    return score === 1 ? (
      <CheckCircle2 className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getCriticalityColor = (metricName: string) => {
    if (metricName?.toLowerCase().includes("hallucination")) return "text-red-600";
    if (metricName?.toLowerCase().includes("critical")) return "text-orange-600";
    return "text-yellow-600";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Metrics Evaluation</CardTitle>
          <CardDescription>Detailed breakdown of metric results for this conversation</CardDescription>
        </CardHeader>
        <CardContent>
          {/* filter buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["All", "Binary", "Numerical", "Critical Only"].map(f => (
              <Button
                key={f}
                size="sm"
                variant={metricFilter === f ? "default" : "outline"}
                onClick={() => setMetricFilter(f as any)}
                className="transition-all"
              >
                {f}
              </Button>
            ))}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Metrics</p>
                  <p className="text-2xl font-bold">{metricResults.length}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
            <Card className="p-4 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Passed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredMetrics.filter(m => m.score === 1).length}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </Card>
            <Card className="p-4 bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredMetrics.filter(m => m.score !== 1).length}
                  </p>
                </div>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </Card>
          </div>

          {/* metrics table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Metric Details</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Criticality</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMetrics.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getMetricIcon(m.score)}
                          <span className="font-medium">{m.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{m.reason}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {m.name?.toLowerCase().includes("time") ? "Numerical" : 
                        m.name?.toLowerCase().includes("flow") ? "Workflow" : 
                        "Qualitative"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getCriticalityColor(m.name)}`}>
                        {m.name?.toLowerCase().includes("hallucination") ? "High" : 
                         m.name?.toLowerCase().includes("critical") ? "Medium" : 
                         "Low"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={m.score === 1 ? "default" : "destructive"}
                        className="gap-1"
                      >
                        {m.score === 1 ? "PASSED" : "FAILED"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(m.score * 100).toFixed(0)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}