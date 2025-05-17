import { withApiHandler } from '@/lib/api-utils';
import { dbService } from "@/services/db";
import { auth } from "@clerk/nextjs/server";
import { AuthorizationError, ValidationError, NotFoundError } from '@/lib/errors';

export const GET = withApiHandler(async () => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new AuthorizationError("Unauthorized");
  }
  
  const metrics = await dbService.getMetrics(userId);
  return metrics;
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

  const metricData = await request.json();
  
  if (!metricData.name || !metricData.type || !metricData.criticality) {
    throw new ValidationError("Missing required metric fields");
  }
  
  const newMetric = await dbService.createMetric({
    ...metricData,
    org_id: profile.org_id,
    created_by: profile.id,
    agentIds: metricData.agentIds || []
  });
  
  return newMetric;
});