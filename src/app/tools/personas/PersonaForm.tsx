import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CardHeader, CardContent } from "@/components/ui/card";
import { 
  CommunicationStyle, 
  DecisionSpeed, 
  EmotionalState, 
  ErrorTolerance, 
  MessageLength, 
  Persona, 
  PrimaryIntent, 
  SlangUsage, 
  TechSavviness 
} from '@/types';

interface PersonaFormProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>> | React.Dispatch<React.SetStateAction<Persona | null>>;
  mode?: 'dialog' | 'edit';
}

export function PersonaForm({ persona, setPersona, mode = 'dialog' }: PersonaFormProps) {
  const handleChange = (field: keyof Persona, value: any) => {
    if (mode === 'edit') {
      (setPersona as React.Dispatch<React.SetStateAction<Persona | null>>)({ ...persona, [field]: value });
    } else {
      (setPersona as React.Dispatch<React.SetStateAction<Persona>>)({ ...persona, [field]: value });
    }
  };

  if (mode === 'edit') {
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
          <PersonaFormFields persona={persona} handleChange={handleChange} mode={mode} />
        </CardContent>
      </>
    );
  }

  return (
    <div className="grid gap-4 py-4">
      <FormField label="Name" htmlFor="name" mode={mode}>
        <Input 
          id="name" 
          value={persona.name} 
          onChange={(e) => handleChange('name', e.target.value)}
          className={mode === 'dialog' ? "col-span-2" : ""} 
        />
      </FormField>

      <FormField label="Description" htmlFor="description" mode={mode}>
        <Input
          id="description"
          value={persona.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className={mode === 'dialog' ? "col-span-2" : ""}
        />
      </FormField>

      <PersonaFormFields persona={persona} handleChange={handleChange} mode={mode} />
    </div>
  );
}

interface FormFieldProps {
  label: string;
  htmlFor: string;
  mode: 'dialog' | 'edit';
  children: React.ReactNode;
}

function FormField({ label, htmlFor, mode, children }: FormFieldProps) {
  if (mode === 'edit') {
    return (
      <div className="space-y-1">
        <Label htmlFor={htmlFor}>{label}</Label>
        {children}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 items-center gap-4">
      <Label htmlFor={htmlFor} className="text-right w-40">
        {label}
      </Label>
      {children}
    </div>
  );
}

interface PersonaFormFieldsProps {
  persona: Persona;
  handleChange: (field: keyof Persona, value: any) => void;
  mode: 'dialog' | 'edit';
}

function PersonaFormFields({ persona, handleChange, mode }: PersonaFormFieldsProps) {
  const fieldClassName = mode === 'dialog' ? "col-span-2" : "";
  const containerClassName = mode === 'edit' ? "space-y-4" : "";

  const fields = (
    <>
      <FormField 
        label={`Temperature${mode === 'edit' ? '' : `: ${persona.temperature.toFixed(1)}`}`} 
        htmlFor="temperature" 
        mode={mode}
      >
        <div className={mode === 'edit' ? '' : fieldClassName}>
          {mode === 'edit' && (
            <div className="flex justify-between mb-1">
              <span></span>
              <span className="text-sm">{persona.temperature.toFixed(1)}</span>
            </div>
          )}
          <Slider
            id="temperature"
            min={0}
            max={1}
            step={0.1}
            value={[persona.temperature]}
            onValueChange={(value) => handleChange('temperature', value[0])}
          />
        </div>
      </FormField>

      <FormField label="Message Length" htmlFor="messageLength" mode={mode}>
        <Select
          value={persona.messageLength}
          onValueChange={(value) => handleChange('messageLength', value as MessageLength)}
        >
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder="Select length" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Short">Short</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Long">Long</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Primary Intent" htmlFor="primaryIntent" mode={mode}>
        <Select
          value={persona.primaryIntent}
          onValueChange={(value) => handleChange('primaryIntent', value as PrimaryIntent)}
        >
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder="Select intent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Information-seeking">Information-seeking</SelectItem>
            <SelectItem value="Transactional">Transactional</SelectItem>
            <SelectItem value="Support Query">Support Query</SelectItem>
            <SelectItem value="Feedback">Feedback</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Communication Style" htmlFor="communicationStyle" mode={mode}>
        <Select
          value={persona.communicationStyle}
          onValueChange={(value) => handleChange('communicationStyle', value as CommunicationStyle)}
        >
          <SelectTrigger className={fieldClassName}>
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
      </FormField>

      <FormField label="Tech-savviness" htmlFor="techSavviness" mode={mode}>
        <Select
          value={persona.techSavviness}
          onValueChange={(value) => handleChange('techSavviness', value as TechSavviness)}
        >
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Emotional State" htmlFor="emotionalState" mode={mode}>
        <Select
          value={persona.emotionalState}
          onValueChange={(value) => handleChange('emotionalState', value as EmotionalState)}
        >
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Neutral">Neutral</SelectItem>
            <SelectItem value="Frustrated">Frustrated</SelectItem>
            <SelectItem value="Happy">Happy</SelectItem>
            <SelectItem value="Curious">Curious</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Error Tolerance" htmlFor="errorTolerance" mode={mode}>
        <Select
          value={persona.errorTolerance}
          onValueChange={(value) => handleChange('errorTolerance', value as ErrorTolerance)}
        >
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder="Select tolerance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Decision Speed" htmlFor="decisionSpeed" mode={mode}>
        <Select
          value={persona.decisionSpeed}
          onValueChange={(value) => handleChange('decisionSpeed', value as DecisionSpeed)}
        >
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder="Select speed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fast">Fast</SelectItem>
            <SelectItem value="Thoughtful">Thoughtful</SelectItem>
            <SelectItem value="Hesitant">Hesitant</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Slang Usage" htmlFor="slangUsage" mode={mode}>
        <Select
          value={persona.slangUsage}
          onValueChange={(value) => handleChange('slangUsage', value as SlangUsage)}
        >
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder="Select usage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="None">None</SelectItem>
            <SelectItem value="Moderate">Moderate</SelectItem>
            <SelectItem value="Heavy">Heavy</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </>
  );

  return mode === 'edit' ? <div className={containerClassName}>{fields}</div> : <>{fields}</>;
}