import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/design-system/components/Button';
import { useAccessibility } from '@/accessibility/AccessibilityProvider';
import { 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  Wifi,
  RefreshCw,
  ArrowLeft,
  Bug,
  Shield,
  Clock,
  Info
} from 'lucide-react';

// Base error component
interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'error' | 'warning' | 'info' | 'offline' | 'unauthorized' | 'notFound' | 'timeout';
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function ErrorState({
  title,
  description,
  icon,
  variant = 'error',
  actions,
  className,
  children
}: ErrorStateProps) {
  const { announce } = useAccessibility();

  // Auto-announce errors for screen readers
  React.useEffect(() => {
    if (title) {
      announce(`Error: ${title}`, 'assertive');
    }
  }, [title, announce]);

  const variantConfig = {
    error: {
      bgColor: 'bg-error-50 border-error-200',
      iconColor: 'text-error-600',
      titleColor: 'text-error-800',
      descColor: 'text-error-700',
      defaultIcon: <XCircle className="w-12 h-12" />,
      defaultTitle: 'Something went wrong',
      defaultDescription: 'An unexpected error occurred. Please try again.',
    },
    warning: {
      bgColor: 'bg-warning-50 border-warning-200',
      iconColor: 'text-warning-600',
      titleColor: 'text-warning-800',
      descColor: 'text-warning-700',
      defaultIcon: <AlertTriangle className="w-12 h-12" />,
      defaultTitle: 'Warning',
      defaultDescription: 'Please review the information and try again.',
    },
    info: {
      bgColor: 'bg-primary-50 border-primary-200',
      iconColor: 'text-primary-600',
      titleColor: 'text-primary-800',
      descColor: 'text-primary-700',
      defaultIcon: <Info className="w-12 h-12" />,
      defaultTitle: 'Information',
      defaultDescription: 'Here\'s what you need to know.',
    },
    offline: {
      bgColor: 'bg-neutral-50 border-neutral-200',
      iconColor: 'text-neutral-600',
      titleColor: 'text-neutral-800',
      descColor: 'text-neutral-700',
      defaultIcon: <Wifi className="w-12 h-12" />,
      defaultTitle: 'Connection Lost',
      defaultDescription: 'Please check your internet connection and try again.',
    },
    unauthorized: {
      bgColor: 'bg-error-50 border-error-200',
      iconColor: 'text-error-600',
      titleColor: 'text-error-800',
      descColor: 'text-error-700',
      defaultIcon: <Shield className="w-12 h-12" />,
      defaultTitle: 'Access Denied',
      defaultDescription: 'You don\'t have permission to access this resource.',
    },
    notFound: {
      bgColor: 'bg-neutral-50 border-neutral-200',
      iconColor: 'text-neutral-600',
      titleColor: 'text-neutral-800',
      descColor: 'text-neutral-700',
      defaultIcon: <AlertCircle className="w-12 h-12" />,
      defaultTitle: 'Not Found',
      defaultDescription: 'The requested resource could not be found.',
    },
    timeout: {
      bgColor: 'bg-warning-50 border-warning-200',
      iconColor: 'text-warning-600',
      titleColor: 'text-warning-800',
      descColor: 'text-warning-700',
      defaultIcon: <Clock className="w-12 h-12" />,
      defaultTitle: 'Request Timeout',
      defaultDescription: 'The request took too long to complete. Please try again.',
    },
  };

  const config = variantConfig[variant];

  return (
    <div 
      className={cn(
        'p-8 border rounded-lg',
        config.bgColor,
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center max-w-md mx-auto space-y-4">
        {/* Icon */}
        <div className={cn('mx-auto', config.iconColor)} aria-hidden="true">
          {icon || config.defaultIcon}
        </div>

        {/* Title */}
        <h3 className={cn('font-medium text-lg', config.titleColor)}>
          {title || config.defaultTitle}
        </h3>

        {/* Description */}
        <p className={cn('text-sm', config.descColor)}>
          {description || config.defaultDescription}
        </p>

        {/* Custom content */}
        {children}

        {/* Actions */}
        {actions && (
          <div className="pt-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// Service unavailable error (for our no-mock-data principle)
interface ServiceUnavailableProps {
  serviceName?: string;
  onRetry?: () => void;
  showContactSupport?: boolean;
  className?: string;
}

export function ServiceUnavailable({
  serviceName = 'service',
  onRetry,
  showContactSupport = true,
  className
}: ServiceUnavailableProps) {
  return (
    <ErrorState
      variant="error"
      title={`${serviceName} Unavailable`}
      description={`The ${serviceName} is currently unavailable. No placeholder data is displayed to ensure data accuracy.`}
      className={className}
      actions={
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              variant="primary"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </Button>
          )}
          {showContactSupport && (
            <Button variant="outline">
              Contact Support
            </Button>
          )}
        </div>
      }
    >
      <div className="mt-4 p-3 bg-white/50 rounded-md border border-current/20">
        <p className="text-xs font-medium text-error-800">Important:</p>
        <p className="text-xs text-error-700 mt-1">
          No mock data is provided to prevent incorrect business decisions.
        </p>
      </div>
    </ErrorState>
  );
}

// Network error component
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      variant="offline"
      title="Connection Problem"
      description="Unable to connect to our servers. Please check your internet connection."
      actions={
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              variant="primary"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retry Connection
            </Button>
          )}
          <Button variant="outline">
            Check Network Settings
          </Button>
        </div>
      }
    />
  );
}

// Form validation error summary
interface FormErrorSummaryProps {
  errors: Array<{
    field: string;
    message: string;
  }>;
  onFieldFocus?: (field: string) => void;
  className?: string;
}

export function FormErrorSummary({ errors, onFieldFocus, className }: FormErrorSummaryProps) {
  const { announce } = useAccessibility();
  
  React.useEffect(() => {
    if (errors.length > 0) {
      announce(
        `Form has ${errors.length} error${errors.length === 1 ? '' : 's'}: ${errors.map(e => e.message).join(', ')}`,
        'assertive'
      );
    }
  }, [errors, announce]);

  if (errors.length === 0) return null;

  return (
    <div 
      className={cn(
        'p-4 border border-error-200 bg-error-50 rounded-lg',
        className
      )}
      role="alert"
      aria-labelledby="error-summary-title"
    >
      <div className="flex items-start space-x-3">
        <XCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 id="error-summary-title" className="font-medium text-error-800 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="text-sm text-error-700 underline hover:text-error-800 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-1 rounded"
                  onClick={() => onFieldFocus?.(error.field)}
                >
                  {error.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Inline field error
interface FieldErrorProps {
  error?: string;
  fieldId?: string;
  className?: string;
}

export function FieldError({ error, fieldId, className }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p 
      id={fieldId ? `${fieldId}-error` : undefined}
      className={cn('text-sm text-error-600 mt-1', className)}
      role="alert"
      aria-live="polite"
    >
      {error}
    </p>
  );
}

// Global error boundary fallback
interface ErrorBoundaryFallbackProps {
  error: Error;
  onReset?: () => void;
  onReport?: (error: Error) => void;
}

export function ErrorBoundaryFallback({ 
  error, 
  onReset, 
  onReport 
}: ErrorBoundaryFallbackProps) {
  const isChunkError = error.message.includes('Loading chunk') || 
                      error.message.includes('ChunkLoadError');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorState
        variant="error"
        title={isChunkError ? "App Update Available" : "Application Error"}
        description={
          isChunkError 
            ? "A new version of the app is available. Please refresh to update."
            : "An unexpected error occurred. Our team has been notified."
        }
        icon={isChunkError ? <RefreshCw className="w-12 h-12" /> : <Bug className="w-12 h-12" />}
        actions={
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              {isChunkError ? 'Refresh App' : 'Reload Page'}
            </Button>
            {onReset && (
              <Button variant="outline" onClick={onReset}>
                Try Again
              </Button>
            )}
            {onReport && !isChunkError && (
              <Button 
                variant="outline" 
                onClick={() => onReport(error)}
                leftIcon={<Bug className="w-4 h-4" />}
              >
                Report Issue
              </Button>
            )}
          </div>
        }
        className="max-w-lg"
      >
        {!isChunkError && process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-sm font-medium cursor-pointer text-error-700">
              Error Details
            </summary>
            <pre className="mt-2 p-3 bg-error-100 rounded text-xs overflow-auto max-h-40 text-error-800">
              {error.toString()}
            </pre>
          </details>
        )}
      </ErrorState>
    </div>
  );
}

// Success state component for positive feedback
interface SuccessStateProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SuccessState({
  title = "Success!",
  description = "The operation completed successfully.",
  actions,
  className
}: SuccessStateProps) {
  const { announce } = useAccessibility();

  React.useEffect(() => {
    announce(`Success: ${title}`, 'polite');
  }, [title, announce]);

  return (
    <div 
      className={cn(
        'p-8 border border-success-200 bg-success-50 rounded-lg',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="text-center max-w-md mx-auto space-y-4">
        <div className="text-success-600 mx-auto" aria-hidden="true">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-medium text-lg text-success-800">{title}</h3>
        <p className="text-sm text-success-700">{description}</p>
        {actions && <div className="pt-2">{actions}</div>}
      </div>
    </div>
  );
}