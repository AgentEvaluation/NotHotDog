/**
 * Enhanced error display component for consistent error presentation
 */
import React from 'react';
import { AlertCircle, Info, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/hooks/useAppError';

interface ErrorDisplayProps {
  error: ErrorState | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  showDismiss?: boolean;
  showRetry?: boolean;
  showIcon?: boolean;
  compact?: boolean;
}

export function ErrorDisplay({ 
  error, 
  onDismiss, 
  onRetry,
  className = '',
  showDismiss = true,
  showRetry = false,
  showIcon = true,
  compact = false
}: ErrorDisplayProps) {
  if (!error) return null;

  // Determine the variant based on error type
  const getVariant = () => {
    switch (error.type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'default';
      default: return 'destructive';
    }
  };

  // Get the appropriate icon based on error type
  const Icon = () => {
    if (!showIcon) return null;
    
    switch (error.type) {
      case 'error': return <AlertCircle className="h-4 w-4 shrink-0" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 shrink-0" />;
      case 'info': return <Info className="h-4 w-4 shrink-0" />;
      default: return <AlertCircle className="h-4 w-4 shrink-0" />;
    }
  };

  return (
    <Alert 
      variant={getVariant()} 
      className={`${compact ? 'py-2' : 'py-3'} ${className}`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-start gap-2">
          <Icon />
          <AlertDescription className={`${compact ? 'text-xs' : 'text-sm'}`}>
            {error.message}
            {error.name && !compact && (
              <span className="block text-xs opacity-80 mt-1">
                {error.name}{error.statusCode ? ` (${error.statusCode})` : ''}
              </span>
            )}
          </AlertDescription>
        </div>
        
        <div className="flex items-center gap-2 ml-4 shrink-0">
          {showRetry && onRetry && (
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-2 rounded-full ${compact ? 'w-8 p-0' : ''}`}
              onClick={onRetry}
              title="Retry"
            >
              <RefreshCw className={`h-4 w-4 ${compact ? '' : 'mr-1'}`} />
              {!compact && <span>Retry</span>}
            </Button>
          )}
          
          {showDismiss && onDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full" 
              onClick={onDismiss}
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

export default ErrorDisplay;