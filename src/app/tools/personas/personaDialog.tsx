// src/app/tools/personas/personaDialog.tsx
import { ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PersonaDialogForm } from "./personaDialogForm";
import { Persona } from "@/types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getModelConfigHeaders } from "@/utils/model-config-checker";

interface PersonaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  buttonText: string;
  children: ReactNode;
  isSaving?: boolean;
}

export function PersonaDialog({
  open,
  onOpenChange,
  persona,
  setPersona,
  onSave,
  onCancel,
  title,
  buttonText,
  children,
  isSaving = false,
}: PersonaDialogProps) {
  const [modelConfigError, setModelConfigError] = useState<string | null>(null);

  const handleSave = () => {
    // Check if model config is available
    const headers = getModelConfigHeaders();
    if (!headers) {
      setModelConfigError("No LLM model configured. Please add a model in settings.");
      return;
    }
    
    // Clear any previous errors
    setModelConfigError(null);
    
    // Proceed with save
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <div>Define a new AI personality with custom traits and behaviors.</div>
        </DialogHeader>
        
        {modelConfigError && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{modelConfigError}</AlertDescription>
          </Alert>
        )}
        
        <PersonaDialogForm persona={persona} setPersona={setPersona} />
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                {buttonText}
              </>
            ) : (
              buttonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}