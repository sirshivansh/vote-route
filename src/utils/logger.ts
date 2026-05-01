/**
 * Visibility Signals Logger
 * Optimized for Google Cloud Run Structured Logging.
 * Outputs JSON that Cloud Logging can automatically parse for severity and categories.
 * @see https://cloud.google.com/logging/docs/structured-logging
 */

type LogCategory =
  | "🔥 Firestore"
  | "🤖 AI Decision"
  | "☁️ System"
  | "🔐 Auth"
  | "⚡ Performance"
  | "📊 Analytics";

export const logger = {
  /** Log an informational message with optional metadata. */
  info: (category: LogCategory, message: string, data?: Record<string, unknown>) => {
    const logEntry = {
      severity: "INFO",
      message: `${category}: ${message}`,
      category,
      component: "VoteRouteAssistant",
      timestamp: new Date().toISOString(),
      ...(data && { metadata: data }),
    };
    console.log(JSON.stringify(logEntry));
  },

  /** Log an error with optional error object for stack trace capture. */
  error: (category: LogCategory, message: string, error?: unknown) => {
    const logEntry = {
      severity: "ERROR",
      message: `${category} ERROR: ${message}`,
      category,
      component: "VoteRouteAssistant",
      timestamp: new Date().toISOString(),
      ...(error instanceof Object
        ? {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          }
        : { error: String(error) }),
    };
    console.error(JSON.stringify(logEntry));
  },

  /** Log a performance measurement in milliseconds. */
  perf: (label: string, duration: number) => {
    const logEntry = {
      severity: "DEBUG",
      message: `⚡ Performance: ${label} took ${duration.toFixed(2)}ms`,
      category: "⚡ Performance",
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    };
    console.log(JSON.stringify(logEntry));
  },
};
