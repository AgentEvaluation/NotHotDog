import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ValidationResult } from "@/types/chat";

interface ConversationValidationDisplayProps {
  validationResult?: ValidationResult;
}

export function ConversationValidationDisplay({ 
  validationResult 
}: ConversationValidationDisplayProps) {
  const [expanded, setExpanded] = useState(true);

  if (!validationResult) return null;

  const { isCorrect, explanation } = validationResult;

  return (
    <Card className={cn(
      "mt-6 border",
      isCorrect 
        ? "border-green-500/30 bg-green-500/5" 
        : "border-red-500/30 bg-red-500/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
            isCorrect ? "bg-green-500/20" : "bg-red-500/20"
          )}>
            {isCorrect ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center">
              <Badge
                variant={isCorrect ? "outline" : "destructive"}
                className={cn(
                  isCorrect 
                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                )}
              >
                {isCorrect ? "Test Passed" : "Test Failed"}
              </Badge>
              
              {explanation && (
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className="ml-2 flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  {expanded ? "Hide Details" : "Show Details"}
                </button>
              )}
            </div>
            
            {expanded && explanation && (
              <div className="mt-3 p-3 rounded-md bg-background/50 border border-border text-sm">
                <h4 className="text-sm font-medium mb-1">Analysis:</h4>
                <p>{explanation}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}