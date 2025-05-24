/**
 * @file Utility functions for standardizing API response formats
 */
import { NextResponse } from 'next/server';
import { formatErrorResponse, AppError, logError } from '@/lib/errors';

type ApiHandler<T> = (req: Request, context?: any) => Promise<T>;

/**
 * Standard response structure
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    type: string;
    statusCode: number;
  };
}

/**
 * Wraps an API handler with standardized response formatting and error handling
 */
export function withApiHandler<T>(handler: ApiHandler<T>) {
  return async (req: Request, context?: any): Promise<NextResponse> => {
    try {
      const result = await handler(req, context);
      
      return NextResponse.json({
        success: true,
        data: result
      } as ApiResponse<T>);
      
    } catch (error) {
      logError(error, 'API Handler');
      
      const { error: formattedError } = formatErrorResponse(error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: formattedError 
        } as ApiResponse<T>,
        { status: formattedError.statusCode }
      );
    }
  };
}

/**
 * Creates a standard success response
 */
export function createSuccessResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data
  });
}

/**
 * Creates a standard error response
 */
export function createErrorResponse(error: unknown): NextResponse {
  const { error: formattedError } = formatErrorResponse(error);
  
  return NextResponse.json(
    { 
      success: false, 
      error: formattedError 
    },
    { status: formattedError.statusCode }
  );
}

