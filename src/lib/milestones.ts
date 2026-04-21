import { toast } from "sonner";

const SHOWN_KEY = "vja:milestones-shown";
const MILESTONES: { at: number; title: string; body: string }[] = [
  { at: 25, title: "25% complete", body: "Great start — momentum builds from here." },
  { at: 50, title: "Halfway there", body: "You've crossed the midpoint of your voting journey." },
  { at: 75, title: "75% complete", body: "Almost there — only the final stretch remains." },
  { at: 100, title: "Journey complete", body: "You are fully prepared to vote." },
];

function getShown(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SHOWN_KEY) || "[]");
  } catch {
    return [];
  }
}

function setShown(arr: number[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SHOWN_KEY, JSON.stringify(arr));
}

/**
 * Fire a milestone toast the first time the user crosses 25/50/75/100%.
 * Idempotent across reloads — uses localStorage to remember.
 */
export function checkMilestones(prevScore: number, nextScore: number) {
  if (nextScore <= prevScore) return;
  const shown = getShown();
  const newShown = [...shown];
  for (const m of MILESTONES) {
    if (prevScore < m.at && nextScore >= m.at && !shown.includes(m.at)) {
      toast.success(m.title, {
        description: m.body,
        duration: 3500,
      });
      newShown.push(m.at);
    }
  }
  if (newShown.length !== shown.length) setShown(newShown);
}

export function resetMilestones() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SHOWN_KEY);
}
