import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileDown, AlertCircle, Check } from "lucide-react";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { TestVariation } from "@/types/variations";
import { v4 as uuidv4 } from 'uuid';
import { useErrorContext } from '@/hooks/useErrorContext';
import ErrorDisplay from '@/components/common/ErrorDisplay';

interface ScenarioFileUploadProps {
  selectedTestId: string;
  onFileProcessed: (scenarios: TestVariation) => void;
  onClose: () => void;
}

const SAMPLE_CSV_DATA = `scenario,expectedOutput
"User asks about refund policy","Agent should explain the refund policy within 30 days"
"User wants to change their shipping address","Agent should offer to update the shipping address and ask for the new address"
"User complains about product quality","Agent should apologize and offer a replacement or refund"
`;

const ScenarioFileUpload: React.FC<ScenarioFileUploadProps> = ({ selectedTestId, onFileProcessed, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [validationMessage, setValidationMessage] = useState<{ type: 'success' | 'info', message: string } | null>(null);
  const [parsedData, setParsedData] = useState<{ scenario: string, expectedOutput: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorContext = useErrorContext();

  const resetState = () => {
    setFile(null);
    setValidationMessage(null);
    setParsedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadSample = () => {
    errorContext.withErrorHandling(async () => {
      const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample_scenarios.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return Promise.resolve();
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Reset validation message
      setValidationMessage(null);
      errorContext.clearError();
      
      // Process file based on type
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (fileType === 'csv') {
        processCSV(selectedFile);
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        processExcel(selectedFile);
      } else {
        errorContext.handleError(new Error('Unsupported file type. Please upload a CSV or Excel file.'));
      }
    }
  };

  const processCSV = (file: File) => {
    errorContext.withErrorHandling(async () => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => validateAndProcessData(results.data),
        error: (error) => {
          errorContext.handleError(new Error(`Error parsing CSV: ${error.message}`));
        }
      });
      return Promise.resolve();
    });
  };

  const processExcel = (file: File) => {
    errorContext.withErrorHandling(async () => {
      const reader = new FileReader();
      
      return new Promise<void>((resolve, reject) => {
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            if (!data) throw new Error("Failed to read file");
            
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            validateAndProcessData(jsonData);
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
        
        reader.readAsBinaryString(file);
      });
    });
  };

  const validateAndProcessData = (data: any[]) => {
    // Check if data exists
    if (!data || data.length === 0) {
      errorContext.handleError(new Error('File is empty or contains no valid data'));
      return;
    }

    // Validate column headers
    const firstRow = data[0];
    const hasScenarioColumn = 'scenario' in firstRow || 'Scenario' in firstRow;
    const hasExpectedOutputColumn = 'expectedOutput' in firstRow || 'ExpectedOutput' in firstRow || 'expected_output' in firstRow || 'Expected Output' in firstRow;

    if (!hasScenarioColumn || !hasExpectedOutputColumn) {
      errorContext.handleError(new Error('File must contain "scenario" and "expectedOutput" columns'));
      return;
    }

    // Normalize data
    const normalizedData = data.map(row => {
      const scenario = row.scenario || row.Scenario || '';
      const expectedOutput = row.expectedOutput || row.ExpectedOutput || row.expected_output || row['Expected Output'] || '';
      
      return { scenario, expectedOutput };
    }).filter(row => row.scenario && row.expectedOutput); // Filter out rows with empty values

    if (normalizedData.length === 0) {
      errorContext.handleError(new Error('No valid scenarios found in file'));
      return;
    }

    setParsedData(normalizedData);
    setValidationMessage({
      type: 'success',
      message: `Successfully parsed ${normalizedData.length} scenarios`
    });
  };

  const handleProceed = () => {
    errorContext.withErrorHandling(async () => {
      if (parsedData.length === 0 || !selectedTestId) {
        return;
      }

      const timestamp = new Date().toISOString();
      const newVariation: TestVariation = {
        id: uuidv4(),
        testId: selectedTestId,
        sourceTestId: selectedTestId,
        timestamp,
        cases: parsedData.map(item => ({
          id: uuidv4(),
          sourceTestId: selectedTestId,
          scenario: item.scenario,
          expectedOutput: item.expectedOutput
        }))
      };

      await onFileProcessed(newVariation);
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Scenarios</CardTitle>
        <CardDescription>
          Upload a CSV or Excel file with test scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorContext.error && (
          <ErrorDisplay 
            error={errorContext.error}
            onDismiss={errorContext.clearError}
            className="mb-4"
          />
        )}

        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={downloadSample} 
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Download Sample CSV
          </Button>
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                CSV or Excel files supported
              </p>
            </div>
          </label>
          {file && (
            <div className="mt-4">
              <p className="text-sm">
                Selected file: <span className="font-medium">{file.name}</span>
              </p>
            </div>
          )}
        </div>

        {validationMessage && (
          <Alert variant={validationMessage.type === 'success' ? 'default' : 'default'}>
            {validationMessage.type === 'success' && <Check className="h-4 w-4" />}
            <AlertDescription>
              {validationMessage.message}
            </AlertDescription>
          </Alert>
        )}

        {parsedData.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div className="max-h-32 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Scenario</th>
                    <th className="px-4 py-2 text-left">Expected Output</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 3).map((row, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 truncate max-w-[200px]">{row.scenario}</td>
                      <td className="px-4 py-2 truncate max-w-[200px]">{row.expectedOutput}</td>
                    </tr>
                  ))}
                  {parsedData.length > 3 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-center text-muted-foreground">
                        And {parsedData.length - 3} more scenarios...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            resetState();
            errorContext.clearError();
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleProceed}
          disabled={parsedData.length === 0 || errorContext.isLoading}
        >
          {errorContext.isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
              Adding...
            </>
          ) : (
            "Add Scenarios"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScenarioFileUpload;