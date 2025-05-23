import { withApiHandler } from '@/lib/api-utils';
import { dbService } from "@/services/db";
import { auth } from "@clerk/nextjs/server";
import { AuthorizationError, ValidationError, NotFoundError } from '@/lib/errors';
import { updateMetricSchema, safeValidateRequest } from '@/lib/validations/api';

export const GET = withApiHandler(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const { userId } = await auth();
  
  if (!userId) {
    throw new AuthorizationError("Unauthorized");
  }

  const metric = await dbService.getMetricById(id);
  if (!metric) {
    throw new NotFoundError("Metric not found");
  }
  
  return metric;
});

export const PUT = withApiHandler(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const { userId } = await auth();
  
  if (!userId) {
    throw new AuthorizationError("Unauthorized");
  }

  const body = await request.json();
  
  const validation = safeValidateRequest(updateMetricSchema, { ...body, id });
  if (!validation.success) {
    throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
  }
  
  const metricData = validation.data;
  
  const updatedMetric = await dbService.updateMetric(id, metricData);
  return updatedMetric;
});

export const DELETE = withApiHandler(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const { userId } = await auth();
  
  if (!userId) {
    throw new AuthorizationError("Unauthorized");
  }

  await dbService.deleteMetric(id);
  return { success: true };
});