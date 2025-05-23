"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestCaseVariations } from "@/components/tools/TestCaseVariations";
import { AgentConfig } from "@/types";
import PersonaSelector from "@/components/tools/personaSelector";
import { useErrorContext } from "@/hooks/useErrorContext";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { 
  Search, 
  FileText, 
  Clock, 
  CheckCircle, 
  ChevronRight,
  Users,
  Bot,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function SkeletonLoader() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-24 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function TestCasesPage() {
  const [agentCases, setAgentCases] = useState<AgentConfig[]>([]);
  const [selectedCase, setSelectedCase] = useState<AgentConfig | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { error, clearError, handleError, withErrorHandling } = useErrorContext();
  const hasFetchedAgentCases = useRef<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!hasFetchedAgentCases.current) {
      fetchSavedTests();
    }
  }, []);


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        selectAllCases();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedIds]);
  
  const fetchSavedTests = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const response = await fetch("/api/tools/agent-config");
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch saved tests");
      }
      
      const data = await response.json();
      // Just use the data as-is without adding mock test data
      setAgentCases(data.data);
      hasFetchedAgentCases.current = true;
    }, true);
    setLoading(false);
  };
  
  const handleCaseSelect = (test: AgentConfig) => {
    setSelectedCase(test);
  };

  const toggleSelectCase = (id: string) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const selectAllCases = () => {
    if (selectedIds.length === filteredAgentCases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAgentCases.map((test) => test.id));
    }
  };


  // Filter logic
  const filteredAgentCases = useMemo(() => {
    return agentCases.filter(agent => {
      const matchesSearch = agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.endpoint?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [agentCases, searchQuery]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header with Workflow */}
      <div className="px-4 py-2 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-semibold">Test Scenarios</h1>
            <p className="text-xs text-muted-foreground">
              Create test scenarios and map personas to your AI agents
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            <span>Search</span>
          </div>
        </div>
        
        {/* Workflow Steps */}
        <div className="flex items-center justify-center gap-3 py-1">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
            "bg-primary text-primary-foreground"
          )}>
            <Bot className="h-3 w-3" />
            <span>1. Choose Agent</span>
          </div>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
            selectedCase ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <FileText className="h-3 w-3" />
            <span>2. Create Scenarios</span>
          </div>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
            selectedCase ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <Users className="h-3 w-3" />
            <span>3. Map Personas</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-6 pt-0">
          <ErrorDisplay 
            error={error} 
            onDismiss={clearError} 
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 h-full overflow-hidden">
          {/* Agent Selection Panel */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            {/* Search and Filter Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  id="search-input"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-8 text-xs"
                />
              </div>
            </div>

            {/* Agent Cards */}
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>
                  <CardTitle className="text-sm font-semibold">Choose Agent</CardTitle>
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {filteredAgentCases.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Select an AI agent to test</p>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[calc(100vh-20rem)] px-3">
                {loading ? (
                  <SkeletonLoader />
                ) : filteredAgentCases.length > 0 ? (
                  <div className="space-y-3">
                    {filteredAgentCases.map((test) => (
                      <Card
                        key={test.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md border-l-4 p-4 rounded-lg",
                          selectedCase?.id === test.id
                            ? "border-l-primary bg-primary/5 shadow-md"
                            : "border-l-transparent hover:border-l-primary/50 shadow-sm"
                        )}
                        onClick={() => handleCaseSelect(test)}
                      >
                        <h3 className="font-medium text-sm line-clamp-1 mb-2">
                          {test.name || "Unnamed Agent"}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate leading-relaxed">
                          {test.endpoint || 'No endpoint configured'}
                        </p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <div className="rounded-full bg-muted p-2 mb-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">No agents found</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {searchQuery ? "Try adjusting your search" : "Create your first testing agent"}
                    </p>
                    {!searchQuery && (
                      <Button size="sm" variant="default" onClick={() => router.push('/tools')} className="h-7 text-xs">
                        Create Agent
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Test Cases Panel */}
          <div className={cn(
            "lg:col-span-5 h-full overflow-hidden transition-opacity",
            !selectedCase && "opacity-50"
          )}>
            {selectedCase ? (
              <TestCaseVariations 
                selectedTestId={selectedCase.id} 
                enhanced={true}
              />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold mb-2 mx-auto">2</div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Create Scenarios</h3>
                  <p className="text-xs text-muted-foreground">Select an agent first to create test scenarios</p>
                </div>
              </Card>
            )}
          </div>

          {/* Personas Panel */}
          <div className={cn(
            "lg:col-span-4 transition-opacity",
            !selectedCase && "opacity-50"
          )}>
            {selectedCase ? (
              <PersonaSelector 
                selectedTest={selectedCase.id} 
                enhanced={true}
              />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold mb-2 mx-auto">3</div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Map Personas</h3>
                  <p className="text-xs text-muted-foreground">Define user types to test your scenarios</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}