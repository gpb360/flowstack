import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-full items-center justify-center bg-background p-4">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
              <AlertTriangle className="h-8 w-8 text-error" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-text-primary">
              Something went wrong
            </h2>
            <p className="mb-2 text-sm text-text-secondary">
              An unexpected error occurred. This has been logged for review.
            </p>
            {this.state.error?.message && (
              <p className="mb-6 rounded-lg bg-surface p-3 font-mono text-xs text-text-muted">
                {this.state.error.message}
              </p>
            )}
            <div className="flex items-center justify-center gap-3">
              <ButtonUntitled
                variant="outline"
                onClick={this.handleRetry}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Try Again
              </ButtonUntitled>
              <ButtonUntitled
                variant="primary"
                onClick={this.handleGoHome}
                leftIcon={<Home className="h-4 w-4" />}
              >
                Go to Dashboard
              </ButtonUntitled>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
