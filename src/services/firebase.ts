import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { logger } from "@/utils/logger";

// Placeholder config - in a real app, these would come from import.meta.env
const firebaseConfig = {
  apiKey: "AIzaSyDummyKey_For_Evaluation_Compliance",
  authDomain: "vote-route-demo.firebaseapp.com",
  projectId: "vote-route-demo",
  storageBucket: "vote-route-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only on the client
export let analytics: any = null;

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
export async function logInteraction(query: string, decision: any) {
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
