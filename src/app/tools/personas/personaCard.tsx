import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Persona } from "@/types";
import { PersonaReadOnlyView } from "./personaReadOnlyView";
import { PersonaForm } from "./PersonaForm";
import { Edit, Trash2, X, Check, Loader2 } from "lucide-react";

interface PersonaCardProps {
  persona: Persona;
  editingPersona: Persona | null;
  setEditingPersona: React.Dispatch<React.SetStateAction<Persona | null>>;
  onEdit: (persona: Persona) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  standardOnly?: boolean;
  isSaving?: boolean;
}

export function PersonaCard({
  persona,
  editingPersona,
  setEditingPersona,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  standardOnly = false,
  isSaving = false,
}: PersonaCardProps) {
  const isEditing = editingPersona && editingPersona.id === persona.id;

  return (
    <Card className="relative">
      {isSaving && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Updating persona...</span>
          </div>
        </div>
      )}
      {isEditing ? (
        <>
          <PersonaForm persona={editingPersona} setPersona={setEditingPersona} mode="edit" />
          <CardFooter className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={onCancel} disabled={isSaving}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="default" onClick={onSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader className="pb-2">
            <CardTitle>{persona.name}</CardTitle>
            <CardDescription>{persona.description}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <PersonaReadOnlyView persona={persona} />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {!standardOnly && (
              <Button size="sm" variant="ghost" onClick={() => onDelete(persona.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onEdit(persona)}>
              <Edit className="h-4 w-4" />
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}