import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import WarningDialog from "@/components/config/WarningDialog";
import { Plus, Edit, Trash, Upload } from "lucide-react";
import { Loading } from "../common/Loading";
import { useTestVariations } from "@/hooks/useTestVariations";
import { TestVariation } from "@/types/variations";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ScenarioFileUpload from "./ScenarioFileUpload";

interface TestCase {
  id: string;
  sourceTestId: string;
  scenario: string;
  expectedOutput: string;
}

interface EditingState {
  scenario: string;
  expectedOutput: string;
}

export function TestCaseVariations({
  selectedTestId,
}: {
  selectedTestId: string | undefined;
}) {
  const [generatedCases, setGeneratedCases] = useState<TestCase[]>([]);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);
  const { 
    variationData, 
    loading, 
    error, 
    addVariation,
    updateVariation,
    deleteVariation,
    setLoading
  } = useTestVariations(selectedTestId);
  
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
      console.error("Missing selected test ID");
      return;
    }

    let apiKey = localStorage.getItem("anthropic_api_key");
    if (!apiKey) {
      setShowApiKeyWarning(true);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`/api/tools/generate-tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey || "",
        },
        body: JSON.stringify({ testId: selectedTestId }),
      });

      const data = await response.json();
      if (data.error) {
        console.error("Generation error:", data.error);
        return;
      }
      setGeneratedCases(data.testCases);
    } catch (error) {
      console.error("Failed to generate test cases:", error);
    } finally {
      setLoading(false);
    }
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

    const existsInServer =
      variationData &&
      variationData.testCases.some((tc) => tc.id === editingId);

    const payload: TestVariation = {
      id: existsInServer ? editingId : crypto.randomUUID(),
      testId: selectedTestId,
      sourceTestId: selectedTestId,
      timestamp: new Date().toISOString(),
      cases: [editedTestCase],
    };

    try {
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
    } catch (error) {
      console.error("Failed to save edit:", error);
    } finally {
      setEditingId(null);
      setEditingState(null);
    }
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

    const updatedCases = generatedCases.filter(
      (tc) => !idsToDelete.includes(tc.id)
    );
    const variation = {
      id: crypto.randomUUID(),
      testId: selectedTestId,
      sourceTestId: selectedTestId,
      timestamp: new Date().toISOString(),
      cases: updatedCases,
    };

    await deleteVariation(variation);

    setGeneratedCases(updatedCases);
    setSelectedIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));

    if (editingId && idsToDelete.includes(editingId)) {
      setEditingId(null);
      setEditingState(null);
    }
  };

  const startEditing = (testCase: TestCase) => {
    setEditingId(testCase.id);
    setEditingState({
      scenario: testCase.scenario,
      expectedOutput: testCase.expectedOutput,
    });
  };

  const handleFileUpload = async (variation: TestVariation) => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error("Failed to add uploaded test cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const showBulkActions = generatedCases.length > 1 && selectedIds.length > 0;

  return (
    <Card className="bg-card text-card-foreground border border-border h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Test Case Variations</CardTitle>
      </CardHeader>

      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-background bg-opacity-50 z-50">
            <Loading size="lg" message="Processing..." />
          </div>
        )}

        {/* Left group: Add / Generate / Upload */}
        <div className="flex gap-2">
          {selectedTestId && (generatedCases.length > 0 ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                onClick={addNewTestCase}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Test Case
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                onClick={() => setShowFileUploadDialog(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={generateTestCases}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Scenarios
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                onClick={() => setShowFileUploadDialog(true)}
                disabled={!selectedTestId}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </>
          ))}
        </div>

        {/* Right group: Select All / Delete Selected */}
        <div className="flex gap-2">
          {generatedCases.length > 0 && (
            <Button size="sm" onClick={selectAllCases}>
              {selectedIds.length === generatedCases.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          )}
          {selectedIds.length > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteTestCases(selectedIds)}
            >
              Delete Selected
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {generatedCases.map((testCase) => (
          <div key={testCase.id}>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.includes(testCase.id)}
                onChange={() => toggleSelectCase(testCase.id)}
                className="mr-2"
              />
              {editingId === testCase.id ? (
                <Card className="bg-card text-card-foreground border border-border p-4 flex-1 rounded-md shadow-sm">
                  <CardContent className="pt-4 space-y-4 flex-1">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
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
                        placeholder="Describe the test scenario in plain English..."
                        className="mt-1 w-full resize-y rounded-md border border-input bg-card text-foreground px-2 py-1 text-sm"
                        />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
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
                        className="mt-1 w-full h-28 overflow-y-auto"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-zinc-800"
                        onClick={() => {
                          setEditingId(null);
                          setEditingState(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveEdit}>
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-card text-card-foreground border border-border rounded-md shadow-sm">
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
          </div>
        ))}

        {!selectedTestId && (
          <div className="text-center py-8 text-muted-foreground">
            Select an agent case to generate variations.
          </div>
        )}

        {selectedTestId && generatedCases.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No test cases yet. Generate or upload test cases to get started.
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

export default TestCaseVariations;