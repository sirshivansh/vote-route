/**
 * Visibility Signals Logger
 * Provides structured, emoji-prefixed logs for easy debugging and evaluation.
 */

type LogCategory = '🔥 Firestore' | '🤖 AI Decision' | '☁️ System' | '🔐 Auth' | '⚡ Performance';

export const logger = {
  info: (category: LogCategory, message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${category}: ${message}`, data || '');
  },
  error: (category: LogCategory, message: string, error?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`[${timestamp}] ❌ ${category} ERROR: ${message}`, error || '');
  },
  perf: (label: string, duration: number) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ⚡ Performance: ${label} took ${duration.toFixed(2)}ms`);
  }
};
