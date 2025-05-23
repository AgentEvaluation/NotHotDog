import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      <div className="h-64 flex items-center justify-center text-muted-foreground p-4">
        <p>No custom metrics data available for this conversation.</p>
      </div>
    );
  }

  return (
    <>
      {/* filter buttons */}
      <div className="flex gap-2 mb-4">
        {["All", "Binary", "Numerical", "Critical Only"].map(f => (
          <Button
            key={f}
            size="sm"
            variant={metricFilter === f ? "outline" : "ghost"}
            onClick={() => setMetricFilter(f as any)}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* metrics table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="p-3 text-left">Metric</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Criticality</th>
              <th className="p-3 text-left">Result</th>
              <th className="p-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {filteredMetrics.map(m => (
              <tr key={m.id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-muted-foreground">{m.reason}</div>
                </td>
                <td className="p-3">
                  <Badge variant="outline">
                    {m.name?.toLowerCase().includes("time") ? "Numerical" : 
                    m.name?.toLowerCase().includes("flow") ? "Binary Workflow" : 
                    "Binary Qualitative"}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge 
                    variant={m.name?.toLowerCase().includes("hallucination") ? "destructive" : "outline"}
                  >
                    {m.name?.toLowerCase().includes("hallucination") ? "High" : "Medium"}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge 
                    variant="outline" 
                    className={m.score === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {m.score === 1 ? "PASSED" : "FAILED"}
                  </Badge>
                </td>
                <td className="p-3 text-right">{(m.score * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}