import React, { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Persona } from '@/types';
import { useErrorContext } from '@/hooks/useErrorContext';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import { dbService } from '@/services/db';

interface PersonaSelectorProps {
  selectedTest: string;
  enhanced?: boolean;
}

export default function PersonaSelector({ selectedTest, enhanced = false }: PersonaSelectorProps) {
  const [mapping, setMapping] = useState<{ personaIds: string[] } | null>(null);
  const selectedPersonas = mapping?.personaIds || [];
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const errorContext = useErrorContext();
  
  // Use string for tracking the last loaded test ID instead of a boolean
  const lastLoadedTestId = useRef<string | null>(null);
  const hasFetchedPersonas = useRef<boolean>(false);

  // Fetch personas only once (now using hardcoded personas)
  useEffect(() => {
    if (hasFetchedPersonas.current) return;
    
    const fetchPersonas = async () => {
      setIsLocalLoading(true);
      await errorContext.withErrorHandling(async () => {
        const personaList = await dbService.getPersonas();
        setPersonas(personaList);
        hasFetchedPersonas.current = true;
      }, false); // Don't use global loading state
      setIsLocalLoading(false);
    };
    
    fetchPersonas();
  }, [errorContext]);
  
  // Fetch mapping only when selectedTest changes and is not empty
  useEffect(() => {
    // Skip if no test selected or if it's the same test we already loaded
    if (!selectedTest || selectedTest === lastLoadedTestId.current) return;
    
    const fetchMapping = async () => {
      setIsLocalLoading(true);
      await errorContext.withErrorHandling(async () => {
        const res = await fetch(`/api/tools/persona-mapping?agentId=${selectedTest}`);
        const data = await res.json();
        setMapping(data.data);
        lastLoadedTestId.current = selectedTest;
      }, false); // Don't use global loading state
      setIsLocalLoading(false);
    };
    
    fetchMapping();
  }, [selectedTest, errorContext]);

  const handlePersonaSelect = async (personaId: string) => {
    if (!selectedTest) return;
    
    await errorContext.withErrorHandling(async () => {
      if (selectedPersonas.includes(personaId)) {
        const res = await fetch('/api/tools/persona-mapping', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: selectedTest, personaId })
        });
        
        if (!res.ok) throw new Error('Failed to delete mapping');
        const data = await res.json();
        setMapping(data.data);
      } else {
        const res = await fetch('/api/tools/persona-mapping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: selectedTest, personaId })
        });
        
        if (!res.ok) throw new Error('Failed to create mapping');
        const data = await res.json();
        setMapping(data.data);
      }
    }, true);
  };

  return (
    <Card className={cn(
      "bg-card text-card-foreground border border-border",
      enhanced ? "h-full" : "h-full"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</div>
          <CardTitle className="text-sm font-semibold">Map Personas</CardTitle>
          <Badge variant="secondary" className="text-xs ml-auto">
            {selectedPersonas.length} selected
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">Choose user types to test scenarios with</p>
      </CardHeader>
      
      {errorContext.error && (
        <div className="px-6 mb-4">
          <ErrorDisplay 
            error={errorContext.error}
            onDismiss={errorContext.clearError}
          />
        </div>
      )}
      
      <CardContent className={cn(
        "p-4",
        enhanced && "overflow-y-auto max-h-[calc(100vh-18rem)]"
      )}>
        {isLocalLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {personas.map((persona) => enhanced ? (
              <div 
                key={persona.id} 
                className={cn(
                  "border rounded-lg p-4 cursor-pointer transition-all shadow-sm",
                  selectedPersonas.includes(persona.id)
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:shadow-md"
                )}
                onClick={() => handlePersonaSelect(persona.id)}
              >
                <div className="flex items-start gap-3">
                  <UserCircle className={cn(
                    "h-5 w-5 mt-0.5 flex-shrink-0",
                    selectedPersonas.includes(persona.id)
                      ? "text-primary"
                      : "text-muted-foreground"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-sm">
                        {persona.name}
                      </h3>
                      {selectedPersonas.includes(persona.id) && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {persona.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div key={persona.id} className="w-full">
                <Button
                  variant="outline"
                  className={cn(
                    "relative w-full h-auto p-3 flex flex-col items-start justify-start rounded-md transition-colors",
                    "text-left whitespace-normal break-words min-h-[70px]",
                    selectedPersonas.includes(persona.id)
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-border bg-card hover:bg-muted text-foreground"
                  )}
                  onClick={() => handlePersonaSelect(persona.id)}
                  disabled={errorContext.isLoading}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <h3 className="font-medium text-base">
                      {persona.name}
                    </h3>
                    {selectedPersonas.includes(persona.id) && (
                      <Badge className="bg-emerald-100 text-emerald-800 ml-2 rounded-md px-2 py-1 text-sm">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm w-full break-words text-muted-foreground">
                    {persona.description}
                  </p>
                </Button>
              </div>
            ))}

            {personas.length === 0 && !errorContext.isLoading && (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <div className="rounded-full bg-muted p-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1 text-sm">No personas available</h3>
                <p className="text-xs text-muted-foreground">
                  Create personas to test different user behaviors
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}