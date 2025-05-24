import { withApiHandler } from '@/lib/api-utils';
import { ValidationError } from '@/lib/errors';

export const POST = withApiHandler(async (request: Request) => {
  const body = await request.json();
  const { endpoint, headers, requestBody } = body;
  
  if (!endpoint) {
    throw new ValidationError('Endpoint URL is required');
  }
  
  // Validate URL format and protocol
  try {
    const url = new URL(endpoint);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new ValidationError('Only HTTP/HTTPS protocols are allowed');
    }
    // Prevent localhost/internal network access in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = url.hostname.toLowerCase();
      if (hostname === 'localhost' || 
          hostname === '127.0.0.1' || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.')) {
        throw new ValidationError('Access to internal networks is not allowed');
      }
    }
  } catch (e) {
    if (e instanceof ValidationError) throw e;
    throw new ValidationError('Invalid endpoint URL format');
  }
  
  if (!requestBody) {
    throw new ValidationError('Request body is required');
  }

  try {
    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    // Make the actual API call to the user's agent
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

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
    
    // Throw error to let withApiHandler handle it properly
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to agent');
  }
});