import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Persona } from '@/types';
import { useErrorContext } from '@/hooks/useErrorContext';
import ErrorDisplay from '@/components/common/ErrorDisplay';

interface PersonaSelectorProps {
  selectedTest: string;
}

export default function PersonaSelector({ selectedTest }: PersonaSelectorProps) {
  const [mapping, setMapping] = useState<{ personaIds: string[] } | null>(null);
  const selectedPersonas = mapping?.personaIds || [];
  const [personas, setPersonas] = useState<Persona[]>([]);
  const errorContext = useErrorContext();

  useEffect(() => {
    const fetchPersonas = async () => {
      await errorContext.withErrorHandling(async () => {
        const res = await fetch('/api/tools/personas');
        const data = await res.json();
        setPersonas(data.data);
      });
    };
    
    fetchPersonas();
  }, [errorContext]);
  
  useEffect(() => {
    if (!selectedTest) return;
    
    const fetchMapping = async () => {
      await errorContext.withErrorHandling(async () => {
        const res = await fetch(`/api/tools/persona-mapping?agentId=${selectedTest}`);
        const data = await res.json();
        setMapping(data.data);
      });
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
    <Card className="bg-card text-card-foreground border border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Select Testing Personas</CardTitle>
      </CardHeader>
      
      {errorContext.error && (
        <div className="px-6 mb-4">
          <ErrorDisplay 
            error={errorContext.error}
            onDismiss={errorContext.clearError}
          />
        </div>
      )}
      
      <CardContent>
        {errorContext.isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {personas.map((persona) => (
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
              <div className="text-center py-4 text-muted-foreground">
                No personas available.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}