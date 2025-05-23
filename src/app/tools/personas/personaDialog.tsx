import { ReactNode } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PersonaForm } from "./PersonaForm";
import { Persona } from "@/types";
import { getModelConfigHeaders } from "@/utils/model-config-checker";
import { useErrorContext } from "@/hooks/useErrorContext";
import ErrorDisplay from "@/components/common/ErrorDisplay";

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
  const errorContext = useErrorContext();

  const handleSave = () => {
    // Check if model config is available
    const headers = getModelConfigHeaders();
    if (!headers) {
      errorContext.handleError(new Error("No LLM model configured. Please add a model in settings."));
      return;
    }
    
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
        
        {errorContext.error && (
          <ErrorDisplay 
            error={errorContext.error} 
            onDismiss={errorContext.clearError}
            className="my-2"
          />
        )}
        
        <PersonaForm persona={persona} setPersona={setPersona} mode="dialog" />
        
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