import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Integration with error tracking service (e.g., Sentry)
      // logErrorToService(error, errorInfo);
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary();
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  public componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount < 3) {
      this.setState({ retryCount: retryCount + 1 });
      this.resetErrorBoundary();
    } else {
      // Force page reload after 3 attempts
      window.location.reload();
    }
  };

  private getErrorMessage(error: Error): string {
    if (error.message.includes('ChunkLoadError')) {
      return 'Unable to load application resources. This may be due to a network issue or an application update.';
    }
    
    if (error.message.includes('Loading chunk')) {
      return 'Failed to load application components. Please check your internet connection.';
    }
    
    if (error.message.includes('503') || error.message.includes('unavailable')) {
      return 'Service is temporarily unavailable. Please try again in a few moments.';
    }
    
    return 'An unexpected error occurred while loading this component.';
  }

  public render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="p-8 border border-red-200 bg-red-50 rounded-lg">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-red-800 font-medium text-lg mb-2">
              Something went wrong
            </h3>
            <p className="text-red-700 text-sm mb-4">
              {error ? this.getErrorMessage(error) : 'An unexpected error occurred.'}
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={this.handleRetry}
                variant="outline"
                className="mr-2"
                disabled={retryCount >= 3}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {retryCount >= 3 ? 'Reload Page' : 'Try Again'}
              </Button>
              
              {retryCount > 0 && (
                <p className="text-red-600 text-xs">
                  Attempt {retryCount} of 3. After 3 attempts, the page will reload.
                </p>
              )}
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4 text-left">
                <summary className="text-sm font-medium cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-red-100 rounded text-xs overflow-auto max-h-40">
                  {error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}