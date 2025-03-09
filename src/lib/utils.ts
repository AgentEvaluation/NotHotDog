import { Persona } from "@/types"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDuration(ms: number): string {
  return `${ms.toFixed(0)}ms`
}

export function mapToUIPersona(dbPersona: any): Persona {
  return {
    id: dbPersona.id,
    name: dbPersona.name,
    description: dbPersona.description,
    systemPrompt: dbPersona.system_prompt,
    isDefault: dbPersona.is_default,
    temperature: dbPersona.temperature,
    messageLength: dbPersona.message_length,
    primaryIntent: dbPersona.primary_intent,
    communicationStyle: dbPersona.communication_style,
    techSavviness: dbPersona.tech_savviness,
    emotionalState: dbPersona.emotional_state,
    errorTolerance: dbPersona.error_tolerance,
    decisionSpeed: dbPersona.decision_speed,
    slangUsage: dbPersona.slang_usage,
    historyBasedMemory: false,
    createdAt: dbPersona.created_at,
    updatedAt: dbPersona.updated_at
  };
}