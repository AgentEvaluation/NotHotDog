import { withApiHandler } from '@/lib/api-utils';
import { dbService } from '@/services/db';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { agentConfigSchema, safeValidateRequest } from '@/lib/validations/api';

export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (id) {
    const config = await dbService.getAgentConfigAll(id);
    if (!config) {
      throw new NotFoundError('Agent not found');
    }
    return config;
  }

  // Return all configs since we don't have user context
  const configs = await dbService.getAllAgentConfigs();
  return configs;
});

export const POST = withApiHandler(async (request: Request) => {
  const body = await request.json();
  
  const validation = safeValidateRequest(agentConfigSchema, body);
  if (!validation.success) {
    throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
  }
  
  const configData = validation.data;
  
  // Remove org_id and created_by since we don't have auth
  delete configData.org_id;
  delete configData.created_by;
  
  const result = await dbService.saveAgentConfig(configData);
  return result;
});

export const PUT = withApiHandler(async (request: Request) => {
  const body = await request.json();
  if (!body.id) {
    throw new ValidationError('Config ID is required');
  }
  
  const validation = safeValidateRequest(agentConfigSchema, body);
  if (!validation.success) {
    throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
  }
  
  const configData = validation.data;
  
  // Remove org_id since we don't have auth
  delete configData.org_id;
  
  const result = await dbService.saveAgentConfig(configData);
  return result;
});

export const DELETE = withApiHandler(async (request: Request) => {
  const { configId } = await request.json();
  if (!configId) {
    throw new ValidationError('configId is required');
  }
  
  const result = await dbService.deleteAgentConfig(configId);
  return result;
});