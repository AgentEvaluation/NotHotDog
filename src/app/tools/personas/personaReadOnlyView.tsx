import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Persona } from "@/types";

interface PersonaReadOnlyViewProps {
  persona: Persona;
}

export function PersonaReadOnlyView({ persona }: PersonaReadOnlyViewProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between">
          <Label>Temperature</Label>
          <span className="text-sm">{persona.temperature.toFixed(1)}</span>
        </div>
        <Slider disabled min={0} max={1} step={0.1} value={[persona.temperature]} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Message Length</Label>
          <p>{persona.messageLength}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Primary Intent</Label>
          <p>{persona.primaryIntent}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Communication Style</Label>
          <p>{persona.communicationStyle}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Tech-savviness</Label>
          <p>{persona.techSavviness}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Emotional State</Label>
          <p>{persona.emotionalState}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Error Tolerance</Label>
          <p>{persona.errorTolerance}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Decision Speed</Label>
          <p>{persona.decisionSpeed}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Slang Usage</Label>
          <p>{persona.slangUsage}</p>
        </div>
        {/* <div>
          <Label className="text-xs text-muted-foreground">History-based Memory</Label>
          <p>{persona.historyBasedMemory ? "Yes" : "No"}</p>
        </div> */}
      </div>
    </div>
  );
}