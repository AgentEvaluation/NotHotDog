import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { PersonaType } from "./types";

interface PersonaDialogFormProps {
  persona: PersonaType;
  setPersona: React.Dispatch<React.SetStateAction<PersonaType>>;
}

export function PersonaDialogForm({ persona, setPersona }: PersonaDialogFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="name" className="text-right w-40">
          Name
        </Label>
        <Input 
          id="name" 
          value={persona.name} 
          onChange={(e) => setPersona({ ...persona, name: e.target.value })} 
          className="col-span-2" 
        />
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="description" className="text-right w-40">
          Description
        </Label>
        <Input
          id="description"
          value={persona.description}
          onChange={(e) => setPersona({ ...persona, description: e.target.value })}
          className="col-span-2"
        />
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="temperature" className="text-right w-40">
          Temperature: {persona.temperature.toFixed(1)}
        </Label>
        <div className="col-span-2">
          <Slider
            id="temperature"
            min={0}
            max={1}
            step={0.1}
            value={[persona.temperature]}
            onValueChange={(value) => setPersona({ ...persona, temperature: value[0] })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="messageLength" className="text-right w-40">
          Message Length
        </Label>
        <Select
          value={persona.messageLength}
          onValueChange={(value) => setPersona({ ...persona, messageLength: value })}
        >
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Select length" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Short">Short</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Long">Long</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="primaryIntent" className="text-right w-40">
          Primary Intent
        </Label>
        <Select
          value={persona.primaryIntent}
          onValueChange={(value) => setPersona({ ...persona, primaryIntent: value })}
        >
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Select intent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Information-seeking">Information-seeking</SelectItem>
            <SelectItem value="Transactional">Transactional</SelectItem>
            <SelectItem value="Support Query">Support Query</SelectItem>
            <SelectItem value="Feedback">Feedback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="communicationStyle" className="text-right w-40">
          Communication Style
        </Label>
        <Select
          value={persona.communicationStyle}
          onValueChange={(value) => setPersona({ ...persona, communicationStyle: value })}
        >
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Select style" />
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

      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="techSavviness" className="text-right w-40">
          Tech-savviness
        </Label>
        <Select
          value={persona.techSavviness}
          onValueChange={(value) => setPersona({ ...persona, techSavviness: value })}
        >
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="emotionalState" className="text-right w-40">
          Emotional State
        </Label>
        <Select
          value={persona.emotionalState}
          onValueChange={(value) => setPersona({ ...persona, emotionalState: value })}
        >
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Neutral">Neutral</SelectItem>
            <SelectItem value="Frustrated">Frustrated</SelectItem>
            <SelectItem value="Happy">Happy</SelectItem>
            <SelectItem value="Curious">Curious</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="errorTolerance" className="text-right w-40">
          Error Tolerance
        </Label>
        <Select
          value={persona.errorTolerance}
          onValueChange={(value) => setPersona({ ...persona, errorTolerance: value })}
        >
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Select tolerance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="decisionSpeed" className="text-right w-40">
          Decision Speed
        </Label>
        <Select
          value={persona.decisionSpeed}
          onValueChange={(value) => setPersona({ ...persona, decisionSpeed: value })}
        >
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Select speed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fast">Fast</SelectItem>
            <SelectItem value="Thoughtful">Thoughtful</SelectItem>
            <SelectItem value="Hesitant">Hesitant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="slangUsage" className="text-right w-40">
          Slang Usage
        </Label>
        <Select
          value={persona.slangUsage}
          onValueChange={(value) => setPersona({ ...persona, slangUsage: value })}
        >
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Select usage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="None">None</SelectItem>
            <SelectItem value="Moderate">Moderate</SelectItem>
            <SelectItem value="Heavy">Heavy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="historyBasedMemory" className="text-right w-40">
          History-based Memory
        </Label>
        <div className="flex items-center space-x-2 col-span-2">
          <Switch
            id="historyBasedMemory"
            checked={persona.historyBasedMemory}
            onCheckedChange={(checked) => setPersona({ ...persona, historyBasedMemory: checked })}
          />
          <Label htmlFor="historyBasedMemory">{persona.historyBasedMemory ? "Yes" : "No"}</Label>
        </div>
      </div>
    </div>
  );
}