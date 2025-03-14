import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Persona } from '@/types';

interface PersonaSelectorProps {
  selectedTest: string;
}

export default function PersonaSelector({ selectedTest }: PersonaSelectorProps) {
  const [mapping, setMapping] = useState<{ personaIds: string[] } | null>(null);
  const selectedPersonas = mapping?.personaIds || [];
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/tools/personas')
      .then(res => res.json())
      .then(data => setPersonas(data))
      .catch(err => console.error("Error fetching personas:", err));
  }, []);
  
  useEffect(() => {
    if (!selectedTest) return;
    fetch(`/api/tools/persona-mapping?agentId=${selectedTest}`)
      .then(res => res.json())
      .then(data => setMapping(data))
      .catch(err => console.error("Error fetching persona mappings:", err));
  }, [selectedTest]);

  const handlePersonaSelect = async (personaId: string) => {
    if (!selectedTest) return;
    try {
      setLoading(true);
      
      if (selectedPersonas.includes(personaId)) {
        const res = await fetch('/api/tools/persona-mapping', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: selectedTest, personaId })
        });
        if (!res.ok) throw new Error('Failed to delete mapping');
        const data = await res.json();
        setMapping(data);
      } else {
        const res = await fetch('/api/tools/persona-mapping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: selectedTest, personaId })
        });
        if (!res.ok) throw new Error('Failed to create mapping');
        const data = await res.json();
        setMapping(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card text-card-foreground border border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Select Testing Personas</CardTitle>
      </CardHeader>
      <CardContent>
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
        </div>
      </CardContent>
    </Card>
  );
}