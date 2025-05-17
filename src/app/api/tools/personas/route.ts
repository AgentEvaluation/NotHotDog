import { withApiHandler } from '@/lib/api-utils';
import { dbService } from "@/services/db";
import { auth } from "@clerk/nextjs/server";
import { mapToUIPersona } from "@/lib/utils";
import { generateSystemPromptForPersona } from "@/services/persona";
import { ModelFactory } from "@/services/llm/modelfactory";
import { LLMProvider } from "@/services/llm/enums";
import { AuthorizationError, ValidationError, NotFoundError } from '@/lib/errors';

export const GET = withApiHandler(async () => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new AuthorizationError("Unauthorized");
  }
  
  const dbPersonas = await dbService.getPersonas(userId);
  const personas = dbPersonas.map(mapToUIPersona);

  return personas;
});

export const POST = withApiHandler(async (request: Request) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new AuthorizationError("Unauthorized");
  }

  const profile = await dbService.getProfileByClerkId(userId);
  if (!profile || !profile.org_id) {
    throw new NotFoundError("Profile not found");
  }

  const personaData = await request.json();
  
  if (!personaData.name || personaData.temperature === undefined || 
      !personaData.messageLength || !personaData.primaryIntent ||
      !personaData.communicationStyle) {
    throw new ValidationError("Missing required persona fields");
  }

  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    throw new ValidationError("API key required to generate system prompt");
  }
  
  const modelId = request.headers.get("x-model") || "";
  const providerStr = request.headers.get("x-provider") || "";
  const extraParamsStr = request.headers.get("x-extra-params");
  
  // Convert provider string to LLMProvider enum
  const provider = (providerStr as LLMProvider) || LLMProvider.Anthropic;
  
  let extraParams = {};
  if (extraParamsStr) {
    try {
      extraParams = JSON.parse(extraParamsStr);
    } catch (e) {
      console.error("Failed to parse extra params", e);
    }
  }
  
  const modelConfig = {
    id: modelId,
    provider,
    name: "Model from headers",
    apiKey,
    keyName: "From headers",
    extraParams
  };
  
  const systemPrompt = await generateSystemPromptForPersona(personaData, modelConfig);
  
  const newPersona = await dbService.createPersona({
    ...personaData,
    org_id: profile.org_id,
    systemPrompt
  });
  
  return newPersona;
});