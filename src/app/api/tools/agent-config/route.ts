import { withApiHandler, requireAuthWithProfile } from '@/lib/api-utils';
import { auth } from '@clerk/nextjs/server';
import { dbService } from '@/services/db';
import { AuthorizationError, NotFoundError, ValidationError, ForbiddenError } from '@/lib/errors';
import { agentConfigSchema, safeValidateRequest } from '@/lib/validations/api';

export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { userId, profile: userProfile } = await requireAuthWithProfile();
  
  if (id) {
    const config = await dbService.getAgentConfigAll(id);
    if (!config) {
      throw new NotFoundError('Agent not found');
    }
    if (config.org_id !== userProfile.org_id) {
      throw new ForbiddenError('User does not have access to this Agent');
    }
    return config;
  }

  const configs = await dbService.getAgentConfigs(userId);
  return configs;
});

export const POST = withApiHandler(async (request: Request) => {
  const { profile: userProfile } = await requireAuthWithProfile();
  
  const body = await request.json();
  
  const validation = safeValidateRequest(agentConfigSchema, body);
  if (!validation.success) {
    throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
  }
  
  const configData = validation.data;
  
  // Set org_id and created_by from the authenticated user's profile
  configData.org_id = userProfile.org_id;
  configData.created_by = userProfile.id;
  
  const result = await dbService.saveAgentConfig(configData);
  return result;
});

export const PUT = withApiHandler(async (request: Request) => {
  const { profile: userProfile } = await requireAuthWithProfile();
  
  const body = await request.json();
  if (!body.id) {
    throw new ValidationError('Config ID is required');
  }
  
  const validation = safeValidateRequest(agentConfigSchema, body);
  if (!validation.success) {
    throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
  }
  
  const configData = validation.data;
  
  // Ensure org_id matches the user's organization
  configData.org_id = userProfile.org_id;
  
  const result = await dbService.saveAgentConfig(configData);
  return result;
});

export const DELETE = withApiHandler(async (request: Request) => {
  const { profile: userProfile } = await requireAuthWithProfile();
  
  const { configId, org_id } = await request.json();
  if (!configId) {
    throw new ValidationError('configId is required');
  }
  
  if (org_id !== userProfile.org_id) {
    throw new ForbiddenError('User does not have access to this organization');
  }    
  
  const result = await dbService.deleteAgentConfig(configId);
  return result;
});