import i18n, { type TFunction } from "i18next";
import { toast } from "sonner";

const SHOWN_KEY = "vja:milestones-shown";
const MILESTONES = [25, 50, 75, 100] as const;

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

function getMilestoneCopy(t: TFunction, at: number) {
  if (at === 25) return { title: "25% complete", body: t("journey:readinessLabels.40") };
  if (at === 50) return { title: "50% complete", body: t("journey:dashboard.howReadinessBody") };
  if (at === 75) return { title: "75% complete", body: t("journey:readinessLabels.close") };
  return { title: "100% complete", body: t("journey:readinessLabels.100") };
}

export function checkMilestones(prevScore: number, nextScore: number, t: TFunction = i18n.t.bind(i18n)) {
  if (nextScore <= prevScore) return;
  const shown = getShown();
  const newShown = [...shown];
  for (const at of MILESTONES) {
    if (prevScore < at && nextScore >= at && !shown.includes(at)) {
      const copy = getMilestoneCopy(t, at);
      toast.success(copy.title, { description: copy.body, duration: 3500 });
      newShown.push(at);
    }
  }
  if (newShown.length !== shown.length) setShown(newShown);
}

export function resetMilestones() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SHOWN_KEY);
}
