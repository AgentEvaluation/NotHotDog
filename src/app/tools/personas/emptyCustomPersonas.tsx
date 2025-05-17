import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useErrorContext } from "@/hooks/useErrorContext";

interface EmptyCustomPersonasProps {
  onCreateNew: () => void;
}

export function EmptyCustomPersonas({ onCreateNew }: EmptyCustomPersonasProps) {
  const { handleError } = useErrorContext();

  const handleCreateClick = () => {
    try {
      onCreateNew();
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Plus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Custom Personas Yet</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        Create your own custom personas to define how your AI agents interact with users.
      </p>
      <Button onClick={handleCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        New Persona
      </Button>
    </div>
  );
}