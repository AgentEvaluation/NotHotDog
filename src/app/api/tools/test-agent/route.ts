import { withApiHandler } from '@/lib/api-utils';
import { ValidationError } from '@/lib/errors';

export const POST = withApiHandler(async (request: Request) => {
  const body = await request.json();
  const { endpoint, headers, requestBody } = body;
  
  if (!endpoint) {
    throw new ValidationError('Endpoint URL is required');
  }
  
  if (!requestBody) {
    throw new ValidationError('Request body is required');
  }

  try {
    // Make the actual API call to the user's agent
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data,
      status: response.status
    };
  } catch (error) {
    console.error('Error testing agent:', error);
    
    // Return error details for the UI to handle
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to agent',
      status: 500
    };
  }
});