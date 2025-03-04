import { CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { PersonaType } from "./types";

interface PersonaEditFormProps {
  persona: PersonaType;
  setPersona: React.Dispatch<React.SetStateAction<PersonaType | null>>;
}

export function PersonaEditForm({ persona, setPersona }: PersonaEditFormProps) {
  const handleChange = (field: keyof PersonaType, value: any) => {
    setPersona({ ...persona, [field]: value });
  };

  return (
    <>
      <CardHeader className="pb-2">
        <Input
          value={persona.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="font-bold text-lg"
          placeholder="Persona name"
        />
        <Input
          value={persona.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="text-sm text-muted-foreground mt-2"
          placeholder="Description"
        />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label>Temperature</Label>
              <span className="text-sm">{persona.temperature.toFixed(1)}</span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[persona.temperature]}
              onValueChange={(value) => handleChange('temperature', value[0])}
            />
          </div>
          <div className="space-y-1">
            <Label>Message Length</Label>
            <Select
              value={persona.messageLength}
              onValueChange={(value) => handleChange('messageLength', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Short">Short</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Primary Intent</Label>
            <Select
              value={persona.primaryIntent}
              onValueChange={(value) => handleChange('primaryIntent', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Information-seeking">Information-seeking</SelectItem>
                <SelectItem value="Transactional">Transactional</SelectItem>
                <SelectItem value="Support Query">Support Query</SelectItem>
                <SelectItem value="Feedback">Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Communication Style</Label>
            <Select
              value={persona.communicationStyle}
              onValueChange={(value) => handleChange('communicationStyle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Formal">Formal</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Sarcastic">Sarcastic</SelectItem>
                <SelectItem value="Concise">Concise</SelectItem>
                <SelectItem value="Detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Tech-savviness</Label>
            <Select
              value={persona.techSavviness}
              onValueChange={(value) => handleChange('techSavviness', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Emotional State</Label>
            <Select
              value={persona.emotionalState}
              onValueChange={(value) => handleChange('emotionalState', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Neutral">Neutral</SelectItem>
                <SelectItem value="Frustrated">Frustrated</SelectItem>
                <SelectItem value="Happy">Happy</SelectItem>
                <SelectItem value="Curious">Curious</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Error Tolerance</Label>
            <Select
              value={persona.errorTolerance}
              onValueChange={(value) => handleChange('errorTolerance', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Decision Speed</Label>
            <Select
              value={persona.decisionSpeed}
              onValueChange={(value) => handleChange('decisionSpeed', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fast">Fast</SelectItem>
                <SelectItem value="Thoughtful">Thoughtful</SelectItem>
                <SelectItem value="Hesitant">Hesitant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Slang Usage</Label>
            <Select
              value={persona.slangUsage}
              onValueChange={(value) => handleChange('slangUsage', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Heavy">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor={`memory-${persona.id}`}>History-based Memory</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id={`memory-${persona.id}`}
                checked={persona.historyBasedMemory}
                onCheckedChange={(checked) => handleChange('historyBasedMemory', checked)}
              />
              <Label htmlFor={`memory-${persona.id}`}>
                {persona.historyBasedMemory ? "Yes" : "No"}
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
}