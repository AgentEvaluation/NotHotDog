/**
 * Enhanced error handling hook for client-side components
 */
import { useState, useCallback, useRef } from 'react';
import { 
  AppError, 
  ValidationError, 
  AuthorizationError, 
  NotFoundError, 
  ExternalAPIError,
  ConfigurationError 
} from '@/lib/errors';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorState {
  message: string;
  type: ErrorSeverity;
  name?: string;
  statusCode?: number;
  details?: unknown;
  retry?: () => void;
}

/**
 * Hook for handling errors in a consistent way across the application
 */
export function useAppError() {
  const [error, setError] = useState<ErrorState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // Use refs to prevent recreation of callback functions
  const stableHandlers = useRef({
    setError,
    setLoading
  });

  /**
   * Process an error into a standardized format
   */
  const processError = useCallback((error: unknown): ErrorState => {
    // Skip logging to prevent potential issues
    
    // Handle null or undefined errors
    if (!error) {
      return {
        message: 'An unknown error occurred',
        type: 'error'
      };
    }
    
    // Handle our custom AppError hierarchy
    if (error instanceof AppError) {
      return {
        message: error.message,
        type: 'error',
        name: error.name,
        statusCode: error.statusCode,
        details: error.stack
      };
    }
    
    // Handle standard Error objects
    if (error instanceof Error) {
      return {
        message: error.message,
        type: 'error',
        name: error.name,
        details: error.stack
      };
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return {
        message: error,
        type: 'error'
      };
    }
    
    // Handle unknown error types
    return {
      message: 'An unexpected error occurred',
      type: 'error',
      details: error
    };
  }, []);

  /**
   * Handle an error, setting the error state
   */
  const handleError = useCallback((error: unknown) => {
    const processedError = processError(error);
    stableHandlers.current.setError(processedError);
    return error;
  }, [processError]);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    stableHandlers.current.setError(null);
  }, []);

  /**
   * Show a warning message
   */
  const showWarning = useCallback((message: string, details?: unknown) => {
    stableHandlers.current.setError({ message, type: 'warning', details });
  }, []);

  /**
   * Show an info message
   */
  const showInfo = useCallback((message: string, details?: unknown) => {
    stableHandlers.current.setError({ message, type: 'info', details });
  }, []);

  /**
   * Wrap an async function with error handling and loading state
   */
  const withErrorHandling = useCallback(
    async <T,>(asyncFn: () => Promise<T>, loadingState = true): Promise<T | null> => {
      try {
        if (loadingState) stableHandlers.current.setLoading(true);
        clearError();
        return await asyncFn();
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        if (loadingState) stableHandlers.current.setLoading(false);
      }
    },
    [] // Empty dependency array to prevent recreation
  );

  /**
   * Create typed error instances for different error scenarios
   */
  const createError = {
    validation: (message: string) => new ValidationError(message),
    authorization: (message?: string) => new AuthorizationError(message),
    notFound: (message?: string) => new NotFoundError(message),
    external: (message: string, originalError?: any) => new ExternalAPIError(message, originalError),
    configuration: (message?: string) => new ConfigurationError(message)
  };

  return {
    error,
    loading,
    isLoading: loading,
    handleError,
    clearError,
    showWarning,
    showInfo,
    withErrorHandling,
    createError
  };
}