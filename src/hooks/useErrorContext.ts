'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAppError } from '@/hooks/useAppError';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import { ErrorState } from '@/hooks/useAppError';

// Create context with default values
interface ErrorContextType {
  error: ErrorState | null;
  loading: boolean;
  isLoading: boolean;
  handleError: (error: unknown) => unknown;
  clearError: () => void;
  showWarning: (message: string, details?: unknown) => void;
  showInfo: (message: string, details?: unknown) => void;
  withErrorHandling: <T>(asyncFn: () => Promise<T>, loadingState?: boolean) => Promise<T | null>;
  createError: {
    validation: (message: string) => Error;
    authorization: (message?: string) => Error;
    notFound: (message?: string) => Error;
    external: (message: string, originalError?: any) => Error;
    configuration: (message?: string) => Error;
  };
}

// Create the context with proper default value
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Provider component
export function ErrorProvider({ children }: { children: ReactNode }) {
  const errorHandler = useAppError();

  const errorDisplay = errorHandler.error ? 
    React.createElement('div', { 
      className: "fixed top-0 left-0 right-0 z-50 px-4 py-2" 
    }, 
    React.createElement(ErrorDisplay, {
      error: errorHandler.error,
      onDismiss: errorHandler.clearError,
      className: "mx-auto max-w-2xl shadow-lg"
    })
  ) : null;

  return React.createElement(
    ErrorContext.Provider, 
    { value: errorHandler },
    [errorDisplay, children]
  );
}

// Custom hook to use the error context
export function useErrorContext(): ErrorContextType {
  const context = useContext(ErrorContext);
  
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  
  return context;
}