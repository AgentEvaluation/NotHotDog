import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import WarningDialog from "@/components/config/WarningDialog";
import { Plus, Edit, Trash, Upload, MoreVertical, Sparkles, FileText, CheckCircle } from "lucide-react";
import { Loading } from "../common/Loading";
import { useTestVariations } from "@/hooks/useTestVariations";
import { TestVariation } from "@/types/variations";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ScenarioFileUpload from "./ScenarioFileUpload";
import { ModelFactory } from "@/services/llm/modelfactory";
import { Switch } from "@/components/ui/switch";
import { TestScenario as TestCase } from "@/types/test";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { useErrorContext } from "@/hooks/useErrorContext";
import { cn } from "@/lib/utils";

interface EditingState {
  scenario: string;
  expectedOutput: string;
}

export function TestCaseVariations({
  selectedTestId,
  enhanced = false,
}: {
  selectedTestId: string | undefined;
  enhanced?: boolean;
}) {
  const [generatedCases, setGeneratedCases] = useState<TestCase[]>([]);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);
  const errorContext = useErrorContext();
  
  // Add ref to track if data has been loaded for a test already
  const loadedTestId = useRef<string | null>(null);
  
  const { 
    variationData, 
    loading,
    addVariation,
    updateVariation,
    deleteVariation,
    toggleScenarioEnabled,
    variationData: cachedVariationData,
    loadVariations
  } = useTestVariations(undefined);
  
  // Load variations only when the selected test changes and isn't already loaded
  useEffect(() => {
    if (selectedTestId && selectedTestId !== loadedTestId.current) {
      loadVariations(selectedTestId);
      loadedTestId.current = selectedTestId;
    }
  }, [selectedTestId, loadVariations]);
  
  useEffect(() => {
    if (variationData && selectedTestId) {
      setGeneratedCases(
        variationData.testCases.map((tc) => ({
          ...tc,
          sourceTestId: selectedTestId,
        }))
      );
    }
  }, [variationData, selectedTestId]);
  
  const generateTestCases = async () => {
    if (!selectedTestId) {
      errorContext.handleError(new Error("Missing selected test ID"));
      return;
    }

    let modelConfig = ModelFactory.getSelectedModelConfig();
    if (!modelConfig) {
      setShowApiKeyWarning(true);
      return;
    }

    await errorContext.withErrorHandling(async () => {
      const response = await fetch(`/api/tools/generate-tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": modelConfig?.apiKey || "",
          "X-Model": modelConfig?.id || "",
          "X-Provider": modelConfig?.provider || "",
          ...(modelConfig?.extraParams ? { "X-Extra-Params": JSON.stringify(modelConfig.extraParams) } : {})
        },
        body: JSON.stringify({ testId: selectedTestId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate test cases");
      }
      
      const result = await response.json();
      const data = result.data;
      setGeneratedCases(data.testCases);
    });
  };

  const addNewTestCase = () => {
    if (!selectedTestId) return;

    const newCase = {
      id: crypto.randomUUID(),
      sourceTestId: selectedTestId,
      scenario: "",
      expectedOutput: "",
    };

    setGeneratedCases([newCase, ...generatedCases]);
    setEditingId(newCase.id);
    setEditingState({ scenario: "", expectedOutput: "" });
  };

  const saveEdit = async () => {
    if (!selectedTestId || !editingState || !editingId) return;

    const editedTestCase: TestCase = {
      id: editingId,
      sourceTestId: selectedTestId,
      scenario: editingState.scenario,
      expectedOutput: editingState.expectedOutput,
    };

    const existsInServer = cachedVariationData &&
      cachedVariationData.testCases.some((tc) => tc.id === editingId);

    const payload: TestVariation = {
      id: existsInServer ? editingId : crypto.randomUUID(),
      testId: selectedTestId,
      sourceTestId: selectedTestId,
      timestamp: new Date().toISOString(),
      cases: [editedTestCase],
    };

    await errorContext.withErrorHandling(async () => {
      if (existsInServer) {
        await updateVariation(payload);
      } else {
        await addVariation(payload);
      }

      setGeneratedCases((prev) => {
        const index = prev.findIndex((tc) => tc.id === editingId);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = editedTestCase;
          return updated;
        }
        return [...prev, editedTestCase];
      });
      
      setEditingId(null);
      setEditingState(null);
    });
  };

  const toggleSelectCase = (id: string) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const selectAllCases = () => {
    if (selectedIds.length === generatedCases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(generatedCases.map((test) => test.id));
    }
  };

  const deleteTestCases = async (idsToDelete: string[]) => {
    if (!selectedTestId) return;

    await errorContext.withErrorHandling(async () => {
      await fetch('/api/tools/test-variations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioIds: idsToDelete, testId: selectedTestId }),
      });

      // Update local state after successful deletion
      setGeneratedCases(prevCases => 
        prevCases.filter(tc => !idsToDelete.includes(tc.id))
      );
      
      setSelectedIds(prev => prev.filter(id => !idsToDelete.includes(id)));

      if (editingId && idsToDelete.includes(editingId)) {
        setEditingId(null);
        setEditingState(null);
      }
    });
  };

  const startEditing = (testCase: TestCase) => {
    setEditingId(testCase.id);
    setEditingState({
      scenario: testCase.scenario,
      expectedOutput: testCase.expectedOutput,
    });
  };

  const handleFileUpload = async (variation: TestVariation) => {
    await errorContext.withErrorHandling(async () => {
      await addVariation(variation);
      
      // Update local state with the new cases
      setGeneratedCases(prevCases => {
        const newCases = variation.cases.map(c => ({
          id: c.id,
          sourceTestId: c.sourceTestId,
          scenario: c.scenario,
          expectedOutput: c.expectedOutput
        }));
        return [...newCases, ...prevCases];
      });
      setShowFileUploadDialog(false);
    });
  };

  const showBulkActions = generatedCases.length > 1 && selectedIds.length > 0;

  return (
    <Card className={cn(
      "bg-card text-card-foreground border border-border",
      enhanced ? "h-full overflow-hidden flex flex-col" : "h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
    )}>
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</div>
          <CardTitle className="text-sm font-semibold">Test Scenarios</CardTitle>
          <Badge variant="secondary" className="text-xs ml-auto">
            {generatedCases.filter(tc => tc.enabled !== false).length} active
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">Define test cases for different situations</p>

        {errorContext.error && (
          <ErrorDisplay 
            error={errorContext.error} 
            onDismiss={errorContext.clearError} 
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 -mt-1">
        {/* Loading indicator in header */}
        {(loading || errorContext.isLoading) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
            <div className="animate-spin h-3 w-3 border border-muted-foreground/30 border-t-muted-foreground rounded-full" />
            <span>Generating scenarios...</span>
          </div>
        )}

        {/* Left group: Add / Generate / Upload */}
        <div className="flex gap-1">
          {selectedTestId && (generatedCases.length > 0 ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={addNewTestCase}
                disabled={loading || errorContext.isLoading}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setShowFileUploadDialog(true)}
                disabled={loading || errorContext.isLoading}
              >
                <Upload className="h-3 w-3 mr-1" />
                Import
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={generateTestCases}
                disabled={loading || errorContext.isLoading}
                className="h-7 px-3 text-xs"
              >
                {loading || errorContext.isLoading ? (
                  <>
                    <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full mr-1" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generate
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setShowFileUploadDialog(true)}
                disabled={!selectedTestId || loading || errorContext.isLoading}
              >
                <Upload className="h-3 w-3 mr-1" />
                Import
              </Button>
            </>
          ))}
        </div>

        {/* Right group: Select All / Delete Selected */}
        <div className="flex gap-1">
          {generatedCases.length > 0 && (
            <Button size="sm" onClick={selectAllCases} variant="ghost" className="h-7 px-2 text-xs">
              {selectedIds.length === generatedCases.length
                ? "None"
                : "All"}
            </Button>
          )}
          {selectedIds.length > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteTestCases(selectedIds)}
              className="h-7 px-2 text-xs"
            >
              Delete ({selectedIds.length})
            </Button>
          )}
        </div>
        </div>
      </CardHeader>

      <CardContent className={cn(
        enhanced ? "flex-1 overflow-y-auto space-y-4 p-4" : "space-y-4 p-4"
      )}>
        {generatedCases.map((testCase) => (
          <div key={testCase.id} className="flex items-center gap-3 w-full">
            <input
              type="checkbox"
              checked={selectedIds.includes(testCase.id)}
              onChange={() => toggleSelectCase(testCase.id)}
              className="flex-shrink-0"
            />
            {editingId === testCase.id ? (
              <div className="border border-primary rounded-lg bg-card p-4 flex-1 shadow-sm">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Test Scenario
                    </label>
                    <Textarea
                      value={editingState?.scenario || ""}
                      onChange={(e) =>
                        setEditingState((prev) => ({
                          ...prev!,
                          scenario: e.target.value,
                        }))
                      }
                      placeholder="Describe the test scenario..."
                      className="w-full resize-none text-sm h-16 p-3 rounded-lg"
                      />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Expected Output
                    </label>
                    <Textarea
                      value={editingState?.expectedOutput || ""}
                      onChange={(e) =>
                        setEditingState((prev) => ({
                          ...prev!,
                          expectedOutput: e.target.value,
                        }))
                      }
                      placeholder="Describe what should happen..."
                      className="w-full resize-none text-sm h-16 p-3 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-sm rounded-lg"
                      onClick={() => {
                        setEditingId(null);
                        setEditingState(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveEdit} className="h-8 px-4 text-sm rounded-lg">
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ) : enhanced ? (
              <div className="border rounded-lg hover:shadow-md transition-all bg-card flex-1 shadow-sm">
                <div className="p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm line-clamp-1">
                        {testCase.scenario || "Untitled scenario"}
                      </span>
                      {testCase.enabled !== false && (
                        <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {testCase.expectedOutput || "No expected output defined"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={testCase.enabled !== false}
                      onCheckedChange={(checked) => {
                        if (selectedTestId) {
                          toggleScenarioEnabled(selectedTestId, testCase.id, checked);
                        }
                      }}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-lg">
                        <DropdownMenuItem onClick={() => startEditing(testCase)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteTestCases([testCase.id])}
                          className="text-destructive"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ) : (
                <Card className="bg-card text-card-foreground border border-border rounded-md shadow-sm w-full">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Test Scenario
                          </h4>
                          <p className="text-sm mt-1 text-foreground">
                            {testCase.scenario}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Expected Output
                          </h4>
                          <p className="text-sm mt-1 text-muted-foreground">
                            {testCase.expectedOutput}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center mr-4">
                        <Switch
                          checked={testCase.enabled !== false}
                          onCheckedChange={(checked) => {
                            if (selectedTestId) {
                              toggleScenarioEnabled(selectedTestId, testCase.id, checked);
                            }
                          }}
                          id={`enable-${testCase.id}`}
                        />
                        <label 
                          htmlFor={`enable-${testCase.id}`}
                          className="ml-2 text-xs text-muted-foreground cursor-pointer"
                        >
                          {testCase.enabled !== false ? "Enabled" : "Disabled"}
                        </label>
                      </div>

                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(testCase)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTestCases([testCase.id])}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        ))}

        {!selectedTestId && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="rounded-full bg-muted p-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-sm mb-1">No agent selected</h3>
            <p className="text-xs text-muted-foreground">
              Select an agent to create test scenarios
            </p>
          </div>
        )}

        {selectedTestId && generatedCases.length === 0 && !loading && !errorContext.isLoading && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="rounded-full bg-muted p-2 mb-3">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-sm mb-1">Ready to create scenarios</h3>
            <p className="text-xs text-muted-foreground">
              Use the "Generate" button above to create test scenarios automatically
            </p>
          </div>
        )}
      </CardContent>

      {showApiKeyWarning && (
        <WarningDialog
          isOpen={showApiKeyWarning}
          onClose={() => setShowApiKeyWarning(false)}
        />
      )}

      <Dialog open={showFileUploadDialog} onOpenChange={setShowFileUploadDialog}>
        <DialogContent className="sm:max-w-2xl w-full p-0 overflow-hidden border border-border">
          <div className="bg-muted py-4 px-6 border-b border-border mb-2">
            <h2 className="text-xl font-semibold">Import Test Scenarios</h2>
            <p className="text-sm text-muted-foreground mt-1">Upload a CSV or Excel file with scenarios and expected outputs</p>
          </div>
          
          {selectedTestId && (
            <div className="p-6">
              <ScenarioFileUpload
                selectedTestId={selectedTestId}
                onFileProcessed={handleFileUpload}
                onClose={() => setShowFileUploadDialog(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}