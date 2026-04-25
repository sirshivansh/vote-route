import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";
import type { Decision } from "@/ai/predictor";
import { logger } from "@/utils/logger";

/**
 * Firebase Configuration — loaded from environment variables.
 * Uses Vite's import.meta.env for build-time injection.
 * @see .env.example for required keys
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only on the client
export let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      logger.info("🔥 Firestore", "Analytics initialized");
    }
  });
}

/**
 * Log a milestone completion event to Firebase Analytics.
 * @param stepId - The ID of the completed journey step.
 */
export async function logMilestoneEvent(stepId: string) {
  if (analytics) {
    logEvent(analytics, 'milestone_completed', { step_id: stepId });
    logger.info('☁️ System', `Analytics Event: milestone_completed (${stepId})`);
  }
}

/**
 * Initialize anonymous session for tracking.
 * Firebase Anonymous Auth enables secure Firestore writes without requiring user credentials.
 */
export async function initSession() {
  try {
    const userCredential = await signInAnonymously(auth);
    logger.info('🔐 Auth', `Anonymously signed in: ${userCredential.user.uid}`);
    return userCredential.user;
  } catch (error) {
    logger.error('🔐 Auth', 'Anonymous sign-in failed', error);
    return null;
  }
}

/**
 * Log an Assistant interaction to Firestore for analytics and debugging.
 * @param query - The user's raw query string.
 * @param decision - The AI engine's structured decision output.
 */
export async function logInteraction(query: string, decision: Decision) {
  try {
    const docRef = await addDoc(collection(db, "interactions"), {
      query,
      decision,
      timestamp: serverTimestamp(),
      userId: auth.currentUser?.uid || 'anonymous'
    });
    logger.info('🔥 Firestore', `Interaction logged with ID: ${docRef.id}`);
  } catch (error) {
    // We log the error but don't break the UI
    logger.error('🔥 Firestore', 'Failed to log interaction', error);
  }
}

/**
 * Returns the current system health status for UI indicators (StatusPanel).
 */
export function getSystemStatus() {
  return {
    firebase: !!app,
    firestore: !!db,
    auth: !!auth.currentUser,
    version: '1.0.5-production'
  };
}
