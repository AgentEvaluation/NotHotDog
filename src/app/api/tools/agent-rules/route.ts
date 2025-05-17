import { withApiHandler } from '@/lib/api-utils';
import { dbService } from "@/services/db";
import { ValidationError, NotFoundError } from '@/lib/errors';

export const GET = withApiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");

  if (!agentId) {
    throw new ValidationError("Agent ID is required");
  }

  const config = await dbService.getAgentConfigAll(agentId);
  if (!config) {
    throw new NotFoundError("Config not found");
  }
  
  return config.rules;
});

export const POST = withApiHandler(async (req: Request) => {
  const data = await req.json();
  const { agentId, rules } = data;

  if (!agentId || !rules) {
    throw new ValidationError("Agent ID and rules are required");
  }

  const updated = await dbService.updateValidationRules(agentId, rules);
  
  return { success: true, updated: updated || {} };
});