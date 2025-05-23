import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Play, ChevronDown, RefreshCw, CheckCircle2, XCircle, Clock, FileX, ArrowRight } from "lucide-react";
import { TestRun } from "@/types/runs";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { useErrorContext } from "@/hooks/useErrorContext";
import { useRouter } from "next/navigation";

interface RunsListProps {
  runs: TestRun[];
  onSelectRun: (run: TestRun) => void;
  savedAgentConfigs: Array<{ id: string, name: string }>;
  onExecuteTest: (testId: string) => void;
  isLoading?: boolean;
}

function LoadingSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[35%]">Test Run</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead className="text-center">Total Tests</TableHead>
            <TableHead className="text-center">Passed</TableHead>
            <TableHead className="text-center">Failed</TableHead>
            <TableHead className="text-center">Success Rate</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                </div>
              </TableCell>
              <TableCell>
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell className="text-center">
                <div className="h-4 w-8 bg-muted rounded animate-pulse mx-auto" />
              </TableCell>
              <TableCell className="text-center">
                <div className="h-4 w-12 bg-muted rounded animate-pulse mx-auto" />
              </TableCell>
              <TableCell className="text-center">
                <div className="h-4 w-12 bg-muted rounded animate-pulse mx-auto" />
              </TableCell>
              <TableCell className="text-center">
                <div className="space-y-1">
                  <div className="h-3 w-12 bg-muted rounded animate-pulse mx-auto" />
                  <div className="h-2 w-full max-w-[100px] bg-muted rounded animate-pulse mx-auto" />
                </div>
              </TableCell>
              <TableCell>
                <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export default function RunsList({ 
  runs, 
  onSelectRun, 
  savedAgentConfigs, 
  onExecuteTest,
  isLoading = false
}: RunsListProps) {
  const { error, clearError } = useErrorContext();
  const router = useRouter();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'running':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="max-w-8xl mx-auto space-y-4">
      {error && (
        <ErrorDisplay 
          error={error}
          onDismiss={clearError}
          onRetry={error.retry ? () => error.retry?.() : undefined}
          showRetry={!!error.retry}
          className="mb-4"
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-semibold tracking-tight">Test Runs</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor and analyze your AI agent test executions</p>
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

      {isLoading ? (
        <LoadingSkeleton />
      ) : !runs || runs.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <FileX className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No test runs yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Start by configuring an agent and generating test cases to begin testing
            </p>
            <Button onClick={() => router.push('/tools')} variant="default">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      ) : (
        <div className="w-full overflow-x-auto">
        <Card className="overflow-visible">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[30%] min-w-[200px]">Test Run</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-center">Total Tests</TableHead>
                <TableHead className="text-center">Passed</TableHead>
                <TableHead className="text-center">Failed</TableHead>
                <TableHead className="text-center">Success Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs?.map((run) => {
                const successRate = run.metrics.total > 0 
                  ? Math.round((run.metrics.passed / run.metrics.total) * 100)
                  : 0;
                
                return (
                  <TableRow 
                    key={run.id} 
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => onSelectRun(run)}
                  >
                    <TableCell className="font-medium max-w-[300px]">
                      <div className="space-y-1">
                        <div className="font-medium truncate" title={run.name}>{run.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {run.id.slice(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(run.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{run.metrics.total}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-600">{run.metrics.passed}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-600">{run.metrics.failed}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-full max-w-[100px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{successRate}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                successRate >= 80 ? 'bg-green-600' : 
                                successRate >= 50 ? 'bg-yellow-600' : 
                                'bg-red-600'
                              }`}
                              style={{ width: `${successRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(run.status)} className="gap-1">
                        {getStatusIcon(run.status)}
                        {run.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
        </div>
      )}
    </div>
  );
}