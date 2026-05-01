import { useEffect, useState } from "react";

export interface UserProfile {
  age: number;
  state: string;
  city: string;
  firstTimeVoter: boolean;
  createdAt: string;
}

const PROFILE_KEY = "vja:profile";
const COMPLETED_KEY = "vja:completed-steps";

/** All 28 Indian states supported for voter registration. */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

/**
 * Retrieve the saved user profile from localStorage.
 * Returns null if no profile is stored or if running on the server.
 */
export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persist a user profile to localStorage.
 * @param p - The profile object to save.
 */
export function saveProfile(p: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

/**
 * Clear all stored user data (profile + completed steps).
 * Used during profile reset flows.
 */
export function clearProfile() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(COMPLETED_KEY);
}

/**
 * Get the list of completed journey step IDs.
 * Returns an empty array if none are stored.
 */
export function getCompleted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Persist the full list of completed step IDs.
 * @param ids - Array of step IDs to mark as completed.
 */
export function setCompleted(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(ids));
}

/**
 * Toggle a step's completion status (add if missing, remove if present).
 * @param id - The step ID to toggle.
 * @returns The updated array of completed step IDs.
 */
export function toggleCompleted(id: string): string[] {
  const current = getCompleted();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  setCompleted(next);
  return next;
}

/**
 * React hook for safe, hydration-aware profile access.
 * Defers localStorage read to useEffect to prevent SSR mismatches.
 */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
    setHydrated(true);
  }, []);

  return { profile, hydrated, setProfile };
}
