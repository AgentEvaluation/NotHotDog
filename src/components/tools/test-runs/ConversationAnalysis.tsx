import React from "react";
import { ValidationResult } from "@/types/chat";

interface ConversationAnalysisProps {
  validationResult?: ValidationResult;
}

export default function ConversationAnalysis({ validationResult }: ConversationAnalysisProps) {
  if (!validationResult) {
    return (
      <div className="p-3 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">No validation data available.</p>
      </div>
    );
  }

  return (
    <div className="p-3 bg-muted rounded-md">
      <h4 className="text-sm font-medium mb-2">Test Result:</h4>
      <div
        className={`font-medium ${
          validationResult.isCorrect
            ? "text-green-500"
            : "text-red-500"
        }`}
      >
        {validationResult.isCorrect ? "Pass" : "Fail"}
      </div>
      <h4 className="text-sm font-medium mt-4 mb-2">Analysis:</h4>
      <p className="text-sm text-muted-foreground">
        {validationResult.explanation}
      </p>
    </div>
  );
}