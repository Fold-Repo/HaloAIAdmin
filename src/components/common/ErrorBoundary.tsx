import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { reportError } from '@/monitoring';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  feature?: string;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(error, {
      feature: this.props.feature,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center"
          role="alert"
        >
          <AlertTriangle className="text-destructive size-12" aria-hidden="true" />
          <h1 className="text-2xl font-semibold">
            {this.props.feature ? `${this.props.feature} failed to load` : 'Something went wrong'}
          </h1>
          <p className="text-muted-foreground max-w-md text-sm">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <Button onClick={this.handleReset}>Return home</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function FeatureErrorBoundary({
  feature,
  children,
}: {
  feature: string;
  children: ReactNode;
}) {
  return <ErrorBoundary feature={feature}>{children}</ErrorBoundary>;
}

