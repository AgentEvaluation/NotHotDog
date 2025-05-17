import { useErrorContext } from "@/hooks/useErrorContext";

/**
 * A higher-order function that wraps an async function with standard error handling
 * @param fn The async function to wrap
 * @param errorContext The error context from useErrorContext hook
 * @param options Additional options for error handling
 * @returns A wrapped function that handles errors consistently
 */
export const withErrorHandling = <T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  errorContext: ReturnType<typeof useErrorContext>,
  options: {
    setLoading?: (loading: boolean) => void;
    onError?: (error: unknown) => void;
    onSuccess?: (result: T) => void;
    loadingState?: boolean;
  } = {}
) => {
  const { setLoading, onError, onSuccess, loadingState = true } = options;
  
  return async (...args: Args): Promise<T | null> => {
    try {
      // Set loading state if provided
      if (loadingState && setLoading) {
        setLoading(true);
      }
      
      // Clear any previous errors
      errorContext.clearError();
      
      // Execute the function
      const result = await fn(...args);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      // Handle the error using the error context
      errorContext.handleError(error);
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
      
      return null;
    } finally {
      // Reset loading state if provided
      if (loadingState && setLoading) {
        setLoading(false);
      }
    }
  };
};

/**
 * Creates a standardized try/catch wrapper for synchronous code blocks
 * @param errorContext The error context from useErrorContext hook
 * @returns Object with safeTry method
 */
export const createSafeExecutor = (errorContext: ReturnType<typeof useErrorContext>) => {
  return {
    /**
     * Executes a function safely, catching and handling any errors
     * @param fn The function to execute
     * @param errorMessage Optional custom error message
     * @returns The result of the function or null if an error occurred
     */
    safeTry: <T>(fn: () => T, errorMessage?: string): T | null => {
      try {
        return fn();
      } catch (error) {
        if (errorMessage && error instanceof Error) {
          error.message = `${errorMessage}: ${error.message}`;
        }
        errorContext.handleError(error);
        return null;
      }
    }
  };
};

/**
 * Hook that provides safe API call methods with standardized error handling
 * @returns Functions for making safe API calls
 */
export function useSafeApiCalls() {
  const errorContext = useErrorContext();
  
  return {
    /**
     * Makes a safe fetch request with error handling
     * @param url The URL to fetch
     * @param options Fetch options
     * @param loadingState Whether to manage loading state
     * @returns The fetch result or null if an error occurred
     */
    safeFetch: async <T>(
      url: string, 
      options?: RequestInit,
      loadingState = true
    ): Promise<T | null> => {
      return await errorContext.withErrorHandling(async () => {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `Request failed with status ${response.status}`;
          throw new Error(errorMessage);
        }
        const result = await response.json();
        return result.data !== undefined ? result.data : result as T;
      }, loadingState);
    }
  };
}