import { withApiHandler } from '@/lib/api-utils';
import { auth } from '@clerk/nextjs/server';
import { dbService } from '@/services/db';
import { AuthorizationError, NotFoundError, ValidationError, ForbiddenError } from '@/lib/errors';

export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { userId } = await auth();

  if (!userId) {
    throw new AuthorizationError('User not authenticated');
  }
  
  const userProfile = await dbService.getProfileByClerkId(userId);
  if (!userProfile || !userProfile.org_id) {
    throw new ForbiddenError('User organization not found');
  }
  
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
  const { userId } = await auth();
  if (!userId) {
    throw new AuthorizationError('User not authenticated');
  }
  
  const configData = await request.json();
  const userProfile = await dbService.getProfileByClerkId(userId);
  if (!userProfile || !userProfile.org_id) {
    throw new ForbiddenError('User organization not found');
  }
  
  // Set org_id and created_by from the authenticated user's profile
  configData.org_id = userProfile.org_id;
  configData.created_by = userProfile.id;
  
  const result = await dbService.saveAgentConfig(configData);
  return result;
});

export const PUT = withApiHandler(async (request: Request) => {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthorizationError('User not authenticated');
  }
  
  const configData = await request.json();
  if (!configData.id) {
    throw new ValidationError('Config ID is required');
  }
  
  const userProfile = await dbService.getProfileByClerkId(userId);
  if (!userProfile || !userProfile.org_id) {
    throw new ForbiddenError('User organization not found');
  }
  
  // Ensure org_id matches the user's organization
  configData.org_id = userProfile.org_id;
  
  const result = await dbService.saveAgentConfig(configData);
  return result;
});

export const DELETE = withApiHandler(async (request: Request) => {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthorizationError('User not authenticated');
  }
  
  const { configId, org_id } = await request.json();
  if (!configId) {
    throw new ValidationError('configId is required');
  }
  
  const userProfile = await dbService.getProfileByClerkId(userId);
  if (!userProfile || !userProfile.org_id) {
    throw new ForbiddenError('User organization not found');
  }
  
  if (org_id !== userProfile.org_id) {
    throw new ForbiddenError('User does not have access to this organization');
  }    
  
  const result = await dbService.deleteAgentConfig(configId);
  return result;
});