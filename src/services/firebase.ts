import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { logger } from "@/utils/logger";

// Placeholder config - in a real app, these would come from import.meta.env
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

import type { Analytics } from "firebase/analytics";
import type { Decision } from "@/ai/predictor";

// Initialize Analytics only on the client
export let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      logger.info("🔥 Firebase", "Analytics initialized");
    }
  });
}

export async function logMilestoneEvent(stepId: string) {
  if (analytics) {
    logEvent(analytics, 'milestone_completed', { step_id: stepId });
    logger.info('☁️ System', `Analytics Event: milestone_completed (${stepId})`);
  }
}



/**
 * Initialize anonymous session for tracking
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
 * Log Assistant Interaction to Firestore
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
 * Get System Status for UI indicators
 */
export function getSystemStatus() {
  return {
    firebase: !!app,
    firestore: !!db,
    auth: !!auth.currentUser,
    version: '1.0.4-production'
  };
}
