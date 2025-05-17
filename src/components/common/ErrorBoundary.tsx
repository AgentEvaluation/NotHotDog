'use client';

import React, { PropsWithChildren, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logError } from '@/lib/errors';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Global error boundary component for handling uncaught errors
 * throughout the application
 */
export class ErrorBoundary extends React.Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to console in development or to an error tracking service in production
    logError(error, 'React Error Boundary');
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <Card className="max-w-md w-full border border-destructive/20">
            <CardHeader className="bg-destructive/5 text-destructive pb-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle size={20} />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              <div className="mb-6 text-sm text-muted-foreground">
                <p className="mb-4 text-foreground font-medium">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                
                {process.env.NODE_ENV !== 'production' && this.state.error && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-md overflow-auto max-h-48 text-xs font-mono">
                    {this.state.error.stack}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={this.handleReset} 
                  className="gap-2"
                >
                  <RefreshCw size={16} />
                  Try again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Component that attaches global error listeners
 */
export function GlobalErrorListener() {
  useEffect(() => {
    // Handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      logError(event.reason, 'Unhandled Promise Rejection');
    };

    // Handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      logError(event.error, 'Uncaught Error');
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Clean up event listeners
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

/**
 * Combined error handling component that provides both
 * boundary functionality and global error listening
 */
export default function AppErrorHandler({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <GlobalErrorListener />
      {children}
    </ErrorBoundary>
  );
}