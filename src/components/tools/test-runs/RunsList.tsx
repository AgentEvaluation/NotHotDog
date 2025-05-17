import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, ChevronDown, RefreshCw } from "lucide-react";
import { TestRun } from "@/types/runs";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { useErrorContext } from "@/hooks/useErrorContext";

interface RunsListProps {
  runs: TestRun[];
  onSelectRun: (run: TestRun) => void;
  savedAgentConfigs: Array<{ id: string, name: string }>;
  onExecuteTest: (testId: string) => void;
  isLoading?: boolean;
}

export default function RunsList({ 
  runs, 
  onSelectRun, 
  savedAgentConfigs, 
  onExecuteTest,
  isLoading = false
}: RunsListProps) {
  const { error, clearError } = useErrorContext();

  return (
    <div className="p-10 space-y-6 max-w-6xl mx-auto">
      {error && (
        <ErrorDisplay 
          error={error}
          onDismiss={clearError}
          onRetry={error.retry ? () => error.retry?.() : undefined}
          showRetry={!!error.retry}
          className="mb-4"
        />
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Test Runs</h2>
          <p className="text-sm text-muted-foreground mt-1">History of all test executions</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Test
                  <ChevronDown className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="cursor-pointer">
            {savedAgentConfigs.length > 0 ? (
              savedAgentConfigs.map((test) => (
                <DropdownMenuItem
                  key={test.id}
                  onSelect={() => onExecuteTest(test.id)}
                  className="cursor-pointer"
                  disabled={isLoading}
                >
                  {test.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No saved tests found</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        {runs.map((run) => (
          <div
            key={run.id}
            className="flex items-center justify-between p-4 bg-background border border-border rounded-xl cursor-pointer hover:bg-muted"
            onClick={() => onSelectRun(run)}
          >
            <div className="flex-1">
              <div className="font-medium">{run.name}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(run.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-green-600 font-semibold">✓ {run.metrics.passed}</div>
              <div className="text-red-500 font-semibold">✗ {run.metrics.failed}</div>
              <Badge 
                variant={
                  run.status === 'completed' ? 'outline' : 
                  run.status === 'failed' ? 'destructive' : 
                  'secondary'
                }
              >
                {run.status}
              </Badge>
            </div>
          </div>
        ))}

        {runs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No test runs yet. Generate and run some tests to get started.
          </div>
        )}
      </div>
    </div>
  );
}