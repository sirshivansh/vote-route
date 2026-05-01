import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./firebase";
import { logger } from "@/utils/logger";

/**
 * Structured analytics event type for type-safe telemetry.
 */
export interface AnalyticsEvent {
  event: string;
  metadata: Record<string, unknown>;
}

/**
 * Tracks a structured analytics event to Firestore.
 * Used for journey milestones, AI interactions, and readiness score changes.
 * @param event - The event name (e.g., "milestone_completed", "ai_query").
 * @param metadata - Additional context for the event.
 */
export async function trackEvent(event: string, metadata: Record<string, unknown> = {}) {
  try {
    await addDoc(collection(db, "analytics_events"), {
      event,
      metadata,
      timestamp: serverTimestamp(),
      userId: auth.currentUser?.uid || "anonymous",
      sessionId: typeof window !== "undefined" ? window.sessionStorage.getItem("vr:sid") : null,
      url: typeof window !== "undefined" ? window.location.pathname : null,
    });
    logger.info("📊 Analytics", `Event tracked: ${event}`);
  } catch {
    // Analytics is non-critical — fail silently
    logger.info("📊 Analytics", `Event tracking failed for: ${event} (non-critical)`);
  }
}

/**
 * Tracks an AI assistant interaction with latency and engine metadata.
 * @param query - The user's query text.
 * @param engine - Whether the response came from "cloud" or "local".
 * @param latencyMs - Round-trip time in milliseconds.
 * @param confidence - AI confidence score (0-1).
 */
export async function trackAIInteraction(
  query: string,
  engine: "cloud" | "local",
  latencyMs: number,
  confidence: number,
) {
  await trackEvent("ai_interaction", {
    queryLength: query.length,
    engine,
    latencyMs: Math.round(latencyMs),
    confidence,
  });
}

/**
 * Tracks readiness score changes for progression analytics.
 * @param prevScore - The previous readiness score.
 * @param newScore - The new readiness score after step completion.
 * @param stepId - The step that was just completed.
 */
export async function trackReadinessChange(prevScore: number, newScore: number, stepId: string) {
  await trackEvent("readiness_change", {
    prevScore,
    newScore,
    delta: newScore - prevScore,
    stepId,
  });
}

/**
 * Initialize a unique session ID for analytics grouping.
 * Called once on app load.
 */
export function initAnalyticsSession() {
  if (typeof window === "undefined") return;
  if (!window.sessionStorage.getItem("vr:sid")) {
    window.sessionStorage.setItem("vr:sid", crypto.randomUUID());
  }
}
