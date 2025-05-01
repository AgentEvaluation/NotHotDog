import { ReactNode } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PersonaDialogForm } from "./personaDialogForm";
import { PersonaType } from "./types";

interface PersonaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: PersonaType;
  setPersona: React.Dispatch<React.SetStateAction<PersonaType>>;
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
        
        <PersonaDialogForm persona={persona} setPersona={setPersona} />
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
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