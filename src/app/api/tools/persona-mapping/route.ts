// src-app-api-tools-persona-mapping-route.ts
import { withApiHandler } from "@/lib/api-utils";
import { dbService } from "@/services/db";
import { ValidationError } from "@/lib/errors";

export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  
  if (!agentId) {
    throw new ValidationError("Agent ID required");
  }
  
  const mapping = await dbService.getPersonaMappingByAgentId(agentId);
  return mapping;
});

export const POST = withApiHandler(async (request: Request) => {
  const body = await request.json();
  const { agentId, personaId } = body;
  
  if (!agentId || !personaId) {
    throw new ValidationError("Agent ID and Persona ID required");
  }
  
  const result = await dbService.createPersonaMapping(agentId, personaId);
  return result;
});

export const DELETE = withApiHandler(async (request: Request) => {
  const body = await request.json();
  const { agentId, personaId } = body;
  
  if (!agentId || !personaId) {
    throw new ValidationError("Agent ID and Persona ID required");
  }
  
  const result = await dbService.deletePersonaMapping(agentId, personaId);
  return result;
});