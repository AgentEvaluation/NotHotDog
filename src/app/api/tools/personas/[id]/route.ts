import { withApiHandler } from '@/lib/api-utils';
import { dbService } from "@/services/db";
import { auth } from "@clerk/nextjs/server";
import { AuthorizationError, NotFoundError, ValidationError } from '@/lib/errors';
import { generateSystemPromptForPersona } from "@/services/persona";

export const DELETE = withApiHandler(async (
  request: Request,
  context: { params: any }
) => {
  const { id: personaId } = await context.params;

  if (!personaId) {
    throw new NotFoundError("Missing persona ID");
  }

  const { userId } = await auth();
  if (!userId) {
    throw new AuthorizationError("Unauthorized");
  }

  const persona = await dbService.getPersonaById(personaId);
  if (!persona) {
    throw new NotFoundError("Persona not found");
  }

  await dbService.deletePersona(personaId);
  return { success: true };
});

export const PUT = withApiHandler(async (
  request: Request,
  context: { params: any }
) => {
  const { id: personaId } = await context.params;

  if (!personaId) {
    throw new NotFoundError("Missing persona ID");
  }

  const { userId } = await auth();
  if (!userId) {
    throw new AuthorizationError("Unauthorized");
  }

  const persona = await dbService.getPersonaById(personaId);
  if (!persona) {
    throw new NotFoundError("Persona not found");
  }

  const body = await request.json();
  const { name, description, traits, communicationStyle, goals, constraints, temperature, messageLength, primaryIntent, techSavviness, emotionalState, errorTolerance, decisionSpeed, slangUsage } = body;

  if (!name || !description) {
    throw new ValidationError("Name and description are required");
  }

  const apiKey = request.headers.get('x-api-key');
  const provider = request.headers.get('x-provider');
  const modelId = request.headers.get('x-model');

  if (!apiKey || !provider || !modelId) {
    throw new ValidationError("Model configuration headers are required");
  }

  const modelConfig = {
    id: modelId,
    apiKey,
    provider,
    extraParams: {}
  };

  const updatedPersonaData = {
    ...body,
    name,
    description,
    traits: traits || [],
    communicationStyle: communicationStyle || "",
    goals: goals || [],
    constraints: constraints || []
  };

  const systemPrompt = await generateSystemPromptForPersona(updatedPersonaData, modelConfig);

  const updatedPersona = await dbService.updatePersona(personaId, {
    ...updatedPersonaData,
    systemPrompt
  });

  return updatedPersona;
});