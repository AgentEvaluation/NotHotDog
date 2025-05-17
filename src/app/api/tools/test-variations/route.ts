import { withApiHandler } from '@/lib/api-utils';
import { dbService } from '@/services/db';
import { ValidationError } from '@/lib/errors';

export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const testId = searchParams.get('testId');

  if (!testId) {
    throw new ValidationError('Test ID is required');
  }

  const result = await dbService.getTestVariations(testId);
  return result;
});

export const POST = withApiHandler(async (request: Request) => {
  const { variation } = await request.json();
  
  if (!variation || !variation.testId) {
    throw new ValidationError('Valid variation data is required');
  }
  
  const result = await dbService.createTestVariation(variation);
  return result;
});

export const PUT = withApiHandler(async (request: Request) => {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  // Handle toggle-enabled action
  if (action === 'toggleEnabled') {
    const { scenarioId, enabled } = await request.json();
    if (!scenarioId) {
      throw new ValidationError('Scenario ID is required');
    }
    const result = await dbService.updateScenarioEnabled(scenarioId, enabled);
    return { success: true, scenario: result };
  }
  
  // Handle normal variation update
  const { variation } = await request.json();
  if (!variation || !variation.id) {
    throw new ValidationError('Valid variation data with ID is required');
  }
  
  const result = await dbService.updateTestVariation(variation);
  return result;
});

export const DELETE = withApiHandler(async (request: Request) => {
  const { scenarioIds, testId } = await request.json();
  
  if (!scenarioIds || !Array.isArray(scenarioIds) || !testId) {
    throw new ValidationError('Scenario IDs and test ID are required');
  }
  
  const result = await dbService.deleteTestScenarios(testId, scenarioIds);
  return result;
});