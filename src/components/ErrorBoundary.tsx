import { Component, type ReactNode, type ErrorInfo } from "react";
import { logger } from "@/utils/logger";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Standard React Error Boundary to catch UI crashes.
 * Integrated with Structured Cloud Logging.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("☁️ System", `UI Crash Detected: ${error.message}`, {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center bg-card rounded-3xl border border-destructive/20 shadow-soft m-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10 text-destructive mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              We've logged the issue and are looking into it. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
            >
              <RotateCcw className="h-4 w-4" />
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
