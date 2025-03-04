export type MessageLength = "Short" | "Medium" | "Long";
export type PrimaryIntent = "Information-seeking" | "Transactional" | "Support Query" | "Feedback";
export type CommunicationStyle = "Formal" | "Casual" | "Sarcastic" | "Concise" | "Detailed";
export type TechSavviness = "Beginner" | "Intermediate" | "Advanced";
export type EmotionalState = "Neutral" | "Frustrated" | "Happy" | "Curious";
export type ErrorTolerance = "Low" | "Medium" | "High";
export type DecisionSpeed = "Fast" | "Thoughtful" | "Hesitant";
export type SlangUsage = "None" | "Moderate" | "Heavy";

export interface PersonaType {
  id: number;
  name: string;
  description: string;
  temperature: number;
  messageLength: MessageLength;
  primaryIntent: PrimaryIntent;
  communicationStyle: CommunicationStyle;
  techSavviness: TechSavviness;
  emotionalState: EmotionalState;
  errorTolerance: ErrorTolerance;
  decisionSpeed: DecisionSpeed;
  slangUsage: SlangUsage;
  historyBasedMemory: boolean;
}

export const defaultPersona: Omit<PersonaType, 'id'> = {
  name: "",
  description: "",
  temperature: 0.5,
  messageLength: "Medium",
  primaryIntent: "Information-seeking",
  communicationStyle: "Casual",
  techSavviness: "Intermediate",
  emotionalState: "Neutral",
  errorTolerance: "Medium",
  decisionSpeed: "Thoughtful",
  slangUsage: "None",
  historyBasedMemory: false,
};