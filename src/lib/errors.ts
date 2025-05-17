/**
 * @file Centralized error handling utilities for the NotHotDog platform
 */

/**
 * Custom error classes for better error identification
 */
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;
  
    constructor(message: string, statusCode = 500, isOperational = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class ValidationError extends AppError {
    constructor(message: string) {
      super(message, 400);
      this.name = 'ValidationError';
    }
  }
  
  export class AuthorizationError extends AppError {
    constructor(message = 'Unauthorized access') {
      super(message, 401);
      this.name = 'AuthorizationError';
    }
  }
  
  export class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
      super(message, 403);
      this.name = 'ForbiddenError';
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
      super(message, 404);
      this.name = 'NotFoundError';
    }
  }
  
  export class ConfigurationError extends AppError {
    constructor(message = 'Configuration error') {
      super(message, 500, false);
      this.name = 'ConfigurationError';
    }
  }
  
  export class ExternalAPIError extends AppError {
    public originalError?: any;
    
    constructor(message: string, originalError?: any) {
      super(message, 502);
      this.name = 'ExternalAPIError';
      this.originalError = originalError;
    }
  }
  
  /**
   * Utility functions for handling errors
   */
  
  /**
   * Formats an error for API responses
   */
  export function formatErrorResponse(error: unknown) {
    if (error instanceof AppError) {
      return {
        error: {
          message: error.message,
          type: error.name,
          statusCode: error.statusCode
        }
      };
    }
  
    // Handle unknown errors
    const unknownError = error instanceof Error ? error : new Error(String(error));
    return {
      error: {
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : unknownError.message,
        type: 'UnknownError',
        statusCode: 500
      }
    };
  }
  
  /**
   * Logs errors in a standardized format
   */
  export function logError(error: unknown, context?: string) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const contextInfo = context ? ` [${context}]` : '';
    
    // Structured error logging
    console.error(`[ERROR]${contextInfo} ${errorObj.name}: ${errorObj.message}`);
    
    if (error instanceof AppError) {
      console.error(`Status Code: ${error.statusCode}, Operational: ${error.isOperational}`);
      if (error instanceof ExternalAPIError && error.originalError) {
        console.error('Original error:', error.originalError);
      }
    }
    
    // In development, log the full stack trace
    if (process.env.NODE_ENV !== 'production') {
      console.error(errorObj.stack);
    }
  }
  
  /**
   * Creates a handler that wraps API route handlers and provides consistent error handling
   */
  export function withErrorHandling<T extends (...args: any[]) => Promise<Response>>(handler: T) {
    return async function(...args: Parameters<T>): Promise<Response> {
      try {
        return await handler(...args);
      } catch (error) {
        logError(error, 'API Route');
        
        const { error: formattedError } = formatErrorResponse(error);
        
        return new Response(
          JSON.stringify(formattedError),
          {
            status: formattedError.statusCode,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    };
  }
  
  /**
   * Helper to handle async operations with consistent error management
   * @returns A tuple of [data, error]
   */
  export async function safeAsync<T>(
    promise: Promise<T>
  ): Promise<[T | null, AppError | null]> {
    try {
      const data = await promise;
      return [data, null];
    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : new AppError(
            error instanceof Error ? error.message : String(error),
            500,
            false
          );
      
      logError(appError);
      return [null, appError];
    }
  }