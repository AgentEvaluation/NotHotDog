/**
 * @file Client-side API request utilities with standardized error handling
 */
import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  ForbiddenError, 
  AuthorizationError, 
  ExternalAPIError 
} from '@/lib/errors';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    type: string;
    statusCode: number;
  };
}

interface FetchOptions extends RequestInit {
  // Optional auth header or other custom options
  addAuthHeader?: boolean;
}

/**
 * Creates a typed error based on HTTP status code
 */
function createErrorFromResponse(response: Response, message: string, errorData?: any): AppError {
  // Map HTTP status codes to appropriate error types
  switch (response.status) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new AuthorizationError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    default:
      return new ExternalAPIError(`API Error (${response.status}): ${message}`, errorData);
  }
}

/**
 * Handles error responses from fetch calls
 */
async function handleErrorResponse(response: Response, endpoint: string): Promise<never> {
  let errorData: { message?: string; type?: string; [key: string]: any } = {};
  
  try {
    // Try to parse error response as JSON
    errorData = await response.json();
  } catch {
    // Fallback for non-JSON responses
    errorData = { message: response.statusText };
  }
  
  const message = errorData.error?.message || errorData.message || `Failed to fetch ${endpoint}`;
  
  throw createErrorFromResponse(response, message, errorData);
}

/**
 * Typed API client for making requests with consistent error handling
 */
class ApiClient {
  /**
   * Make a GET request
   */
  static async get<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      await handleErrorResponse(response, endpoint);
    }

    const result = await response.json() as ApiResponse<T>;
    
    if (!result.success && result.error) {
      throw new ExternalAPIError(result.error.message, result.error);
    }

    return result.data || result as T;
  }

  /**
   * Make a POST request
   */
  static async post<T = any>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });

    if (!response.ok) {
      await handleErrorResponse(response, endpoint);
    }

    const result = await response.json() as ApiResponse<T>;
    
    if (!result.success && result.error) {
      throw new ExternalAPIError(result.error.message, result.error);
    }

    return result.data || result as T;
  }

  /**
   * Make a PUT request
   */
  static async put<T = any>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });

    if (!response.ok) {
      await handleErrorResponse(response, endpoint);
    }

    const result = await response.json() as ApiResponse<T>;
    
    if (!result.success && result.error) {
      throw new ExternalAPIError(result.error.message, result.error);
    }

    return result.data || result as T;
  }

  /**
   * Make a DELETE request
   */
  static async delete<T = any>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });

    if (!response.ok) {
      await handleErrorResponse(response, endpoint);
    }

    const result = await response.json() as ApiResponse<T>;
    
    if (!result.success && result.error) {
      throw new ExternalAPIError(result.error.message, result.error);
    }

    return result.data || result as T;
  }

  /**
   * Generate LLM model API headers
   */
  static getLLMHeaders() {
    const modelConfig = window.localStorage.getItem('model_configs');
    const selectedModelId = window.localStorage.getItem('selected_model_id');

    if (!modelConfig || !selectedModelId) {
      return null;
    }

    try {
      const configs = JSON.parse(modelConfig);
      const selectedConfig = configs.find((config: any) => config.id === selectedModelId);

      if (!selectedConfig) {
        return null;
      }

      return {
        'X-API-Key': selectedConfig.apiKey,
        'X-Model': selectedConfig.id,
        'X-Provider': selectedConfig.provider,
        ...(selectedConfig.extraParams ? { 'X-Extra-Params': JSON.stringify(selectedConfig.extraParams) } : {})
      };
    } catch (e) {
      console.error('Failed to parse model config:', e);
      return null;
    }
  }
}

export default ApiClient;