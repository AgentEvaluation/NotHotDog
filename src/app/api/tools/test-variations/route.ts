import { NextResponse } from 'next/server';
import { dbService } from '@/services/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testId = searchParams.get('testId');

  if (!testId) {
    return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
  }

  try {
    const result = await dbService.getTestVariations(testId);
    // The result will be of the shape: { testId: string, testCases: [ { id, scenario, expectedOutput } ] }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching test variations:', error);
    return NextResponse.json({ error: 'Failed to fetch test variations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
      const { variation } = await request.json();
      const result = await dbService.createTestVariation(variation);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to create variation' }, { status: 500 });
    }
  }
  
  export async function PUT(request: Request) {
    try {
      const url = new URL(request.url);
      const action = url.searchParams.get('action');
      
      // Handle toggle-enabled action
      if (action === 'toggleEnabled') {
        const { scenarioId, enabled } = await request.json();
        if (!scenarioId) {
          return NextResponse.json({ error: 'Scenario ID is required' }, { status: 400 });
        }
        const result = await dbService.updateScenarioEnabled(scenarioId, enabled);
        return NextResponse.json({ success: true, scenario: result });
      }
      
      // Handle normal variation update
      const { variation } = await request.json();
      const result = await dbService.updateTestVariation(variation);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to update variation' }, { status: 500 });
    }
  }

  export async function DELETE(request: Request) {
    try {
      const { scenarioIds, testId } = await request.json();
      
      if (!scenarioIds || !Array.isArray(scenarioIds) || !testId) {
        return NextResponse.json({ error: 'Scenario IDs and test ID are required' }, { status: 400 });
      }
      
      const result = await dbService.deleteTestScenarios(testId, scenarioIds);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error deleting scenarios:', error);
      return NextResponse.json({ error: 'Failed to delete scenarios' }, { status: 500 });
    }
  }
    