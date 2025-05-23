import { withApiHandler, requireAuthWithProfile } from '@/lib/api-utils';
import { dbService } from "@/services/db";
import { auth } from "@clerk/nextjs/server";
import { AuthorizationError, ValidationError, NotFoundError } from '@/lib/errors';
import { createMetricSchema, safeValidateRequest } from '@/lib/validations/api';

export const GET = withApiHandler(async () => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new AuthorizationError("Unauthorized");
  }
  
  const metrics = await dbService.getMetrics(userId);
  return metrics;
});

export const POST = withApiHandler(async (request: Request) => {
  const { profile } = await requireAuthWithProfile();

  const body = await request.json();
  
  const validation = safeValidateRequest(createMetricSchema, body);
  if (!validation.success) {
    throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
  }
  
  const metricData = validation.data;
  
  const newMetric = await dbService.createMetric({
    ...metricData,
    org_id: profile.org_id,
    created_by: profile.id,
    agentIds: metricData.agentIds || []
  });
  
  return newMetric;
});