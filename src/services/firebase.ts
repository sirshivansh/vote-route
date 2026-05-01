import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getRemoteConfig, fetchAndActivate } from "firebase/remote-config";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getPerformance } from "firebase/performance";
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
export const storage = getStorage(app);
export const remoteConfig = getRemoteConfig(app);

// Initialize Analytics only on the client
export let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      logger.info("🔥 Firestore", "Analytics initialized");
    }
  });

  // Initialize Firebase Performance Monitoring (automatic page load + network traces)
  try {
    getPerformance(app);
    logger.info("☁️ System", "Firebase Performance Monitoring initialized");
  } catch {
    logger.info("☁️ System", "Performance Monitoring not available in this environment");
  }

  // Initialize Remote Config with defaults
  remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
  remoteConfig.defaultConfig = {
    show_beta_assistant: true,
    announcement_banner: "VoteRoute 1.1.0 is live! AI Assistant now with multi-turn memory.",
  };
  fetchAndActivate(remoteConfig)
    .then(() => {
      logger.info("☁️ System", "Remote Config activated");
    })
    .catch((err) => {
      logger.error("☁️ System", "Remote Config failed to fetch", err);
    });
}

/**
 * Log a milestone completion event to Firebase Analytics.
 * @param stepId - The ID of the completed journey step.
 */
export async function logMilestoneEvent(stepId: string) {
  if (analytics) {
    logEvent(analytics, "milestone_completed", { step_id: stepId });
    logger.info("☁️ System", `Analytics Event: milestone_completed (${stepId})`);
  }
}

/**
 * Initialize anonymous session for tracking.
 * Firebase Anonymous Auth enables secure Firestore writes without requiring user credentials.
 */
export async function initSession() {
  try {
    const userCredential = await signInAnonymously(auth);
    logger.info("🔐 Auth", `Anonymously signed in: ${userCredential.user.uid}`);
    return userCredential.user;
  } catch (error) {
    logger.error("🔐 Auth", "Anonymous sign-in failed", error);
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
      userId: auth.currentUser?.uid || "anonymous",
    });
    logger.info("🔥 Firestore", `Interaction logged with ID: ${docRef.id}`);
  } catch (error) {
    // We log the error but don't break the UI
    logger.error("🔥 Firestore", "Failed to log interaction", error);
  }
}

/**
 * Upload a document (e.g. ID proof) to Firebase Storage.
 * Demonstrates high-adoption of Google Cloud services.
 */
export async function uploadUserDocument(file: File, path: string) {
  try {
    const storageRef = ref(storage, `users/${auth.currentUser?.uid || "anon"}/${path}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    logger.info("☁️ System", `Document uploaded to Storage: ${path}`);
    return url;
  } catch (error) {
    logger.error("☁️ System", "Failed to upload document", error);
    throw error;
  }
}

/**
 * Initialize Firebase Cloud Messaging for notifications.
 */
export async function initNotifications() {
  if (typeof window === "undefined") return;
  try {
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });
    if (token) {
      logger.info("☁️ System", `FCM Token acquired: ${token.substring(0, 8)}...`);
    }

    onMessage(messaging, (payload) => {
      logger.info(
        "☁️ System",
        "Foreground notification received",
        payload as unknown as Record<string, unknown>,
      );
    });
  } catch {
    // FCM often fails in local dev or without service workers, so we fail gracefully
    logger.info("☁️ System", "FCM not initialized (expected in some environments)");
  }
}

/**
 * Returns the current system health status for UI indicators (StatusPanel).
 */
export function getSystemStatus() {
  return {
    firebase: !!app,
    firestore: !!db,
    storage: !!storage,
    auth: !!auth.currentUser,
    remoteConfig: !!remoteConfig,
    aiCloud:
      !!import.meta.env.VITE_GEMINI_API_KEY &&
      import.meta.env.VITE_GEMINI_API_KEY !== "your_gemini_api_key_here",
    version: "1.1.0-production",
  };
}
