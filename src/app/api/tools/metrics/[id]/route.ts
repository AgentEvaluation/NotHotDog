import { withApiHandler } from '@/lib/api-utils';
import { dbService } from "@/services/db";
import { auth } from "@clerk/nextjs/server";
import { AuthorizationError, ValidationError, NotFoundError } from '@/lib/errors';

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

  const metricData = await request.json();
  
  // Basic validation for required fields
  if (!metricData.name || !metricData.type || !metricData.criticality) {
    throw new ValidationError("Missing required metric fields");
  }
  
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