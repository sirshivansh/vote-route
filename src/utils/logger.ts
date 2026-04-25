/**
 * Visibility Signals Logger
 * Optimized for Google Cloud Run Structured Logging.
 * Outputs JSON that Cloud Logging can automatically parse for severity and categories.
 */

type LogCategory = '🔥 Firestore' | '🤖 AI Decision' | '☁️ System' | '🔐 Auth' | '⚡ Performance';

export const logger = {
  info: (category: LogCategory, message: string, data?: any) => {
    const logEntry = {
      severity: 'INFO',
      message: `${category}: ${message}`,
      category,
      component: 'VoteRouteAssistant',
      timestamp: new Date().toISOString(),
      ...(data && { metadata: data })
    };
    console.log(JSON.stringify(logEntry));
  },
  
  error: (category: LogCategory, message: string, error?: any) => {
    const logEntry = {
      severity: 'ERROR',
      message: `${category} ERROR: ${message}`,
      category,
      component: 'VoteRouteAssistant',
      timestamp: new Date().toISOString(),
      ...(error && { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
    };
    console.error(JSON.stringify(logEntry));
  },
  
  perf: (label: string, duration: number) => {
    const logEntry = {
      severity: 'DEBUG',
      message: `⚡ Performance: ${label} took ${duration.toFixed(2)}ms`,
      category: '⚡ Performance',
      duration_ms: duration,
      timestamp: new Date().toISOString()
    };
    console.log(JSON.stringify(logEntry));
  }
};
