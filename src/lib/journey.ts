import i18n, { type TFunction } from "i18next";

export type GoalId = "register" | "eligibility" | "learn" | "voting-day";

export interface StepFaq {
  q: string;
  a: string;
}

export interface JourneyStep {
  id: string;
  phase: "Prepare" | "Register" | "Verify" | "Vote";
  title: string;
  shortDesc: string;
  longDesc: string;
  estimate: string;
  deadline?: string;
  weight: number;
  consequence?: string;
  why?: string;
  documents?: string[];
  action?: { label: string; href?: string };
  checklist?: string[];
  faqs?: StepFaq[];
}

export interface Goal {
  id: GoalId;
  emoji: string;
  title: string;
  subtitle: string;
}

export const PHASES = ["Prepare", "Register", "Verify", "Vote"] as const;

const fallbackT: TFunction = i18n.t.bind(i18n);

export function getGoals(t: TFunction = fallbackT): Goal[] {
  return [
    {
      id: "register",
      emoji: "🗳️",
      title: t("journey:goals.register.title"),
      subtitle: t("journey:goals.register.subtitle"),
    },
    {
      id: "eligibility",
      emoji: "✅",
      title: t("journey:goals.eligibility.title"),
      subtitle: t("journey:goals.eligibility.subtitle"),
    },
    {
      id: "learn",
      emoji: "📘",
      title: t("journey:goals.learn.title"),
      subtitle: t("journey:goals.learn.subtitle"),
    },
    {
      id: "voting-day",
      emoji: "📍",
      title: t("journey:goals.voting-day.title"),
      subtitle: t("journey:goals.voting-day.subtitle"),
    },
  ];
}

function stepFaqs(t: TFunction, stepId: string): StepFaq[] {
  const raw = t(`journey:steps.${stepId}.faqs`, {
    returnObjects: true,
    defaultValue: [],
  }) as StepFaq[];
  return Array.isArray(raw) ? raw : [];
}

function stepList(t: TFunction, key: string) {
  const raw = t(key, { returnObjects: true, defaultValue: [] }) as string[];
  return Array.isArray(raw) ? raw : [];
}

export function getJourneySteps(t: TFunction = fallbackT): JourneyStep[] {
  return [
    {
      id: "s1",
      phase: "Prepare",
      title: t("journey:steps.s1.title"),
      shortDesc: t("journey:steps.s1.shortDesc"),
      longDesc: t("journey:steps.s1.longDesc"),
      estimate: t("journey:steps.s1.estimate"),
      weight: 8,
      why: t("journey:steps.s1.why"),
      consequence: t("journey:steps.s1.consequence"),
      checklist: stepList(t, "journey:steps.s1.checklist"),
      faqs: stepFaqs(t, "s1"),
      action: { label: t("journey:steps.s1.action") },
    },
    {
      id: "s2",
      phase: "Prepare",
      title: t("journey:steps.s2.title"),
      shortDesc: t("journey:steps.s2.shortDesc"),
      longDesc: t("journey:steps.s2.longDesc"),
      estimate: t("journey:steps.s2.estimate"),
      weight: 10,
      why: t("journey:steps.s2.why"),
      consequence: t("journey:steps.s2.consequence"),
      documents: stepList(t, "journey:steps.s2.documents"),
      checklist: stepList(t, "journey:steps.s2.checklist"),
      faqs: stepFaqs(t, "s2"),
      action: { label: t("journey:steps.s2.action") },
    },
    {
      id: "s3",
      phase: "Register",
      title: t("journey:steps.s3.title"),
      shortDesc: t("journey:steps.s3.shortDesc"),
      longDesc: t("journey:steps.s3.longDesc"),
      estimate: t("journey:steps.s3.estimate"),
      deadline: t("journey:steps.s3.deadline"),
      weight: 18,
      why: t("journey:steps.s3.why"),
      consequence: t("journey:steps.s3.consequence"),
      faqs: stepFaqs(t, "s3"),
      action: { label: t("journey:steps.s3.action"), href: "https://voters.eci.gov.in/" },
    },
    {
      id: "s4",
      phase: "Register",
      title: t("journey:steps.s4.title"),
      shortDesc: t("journey:steps.s4.shortDesc"),
      longDesc: t("journey:steps.s4.longDesc"),
      estimate: t("journey:steps.s4.estimate"),
      weight: 12,
      why: t("journey:steps.s4.why"),
      consequence: t("journey:steps.s4.consequence"),
      action: { label: t("journey:steps.s4.action") },
    },
    {
      id: "s5",
      phase: "Verify",
      title: t("journey:steps.s5.title"),
      shortDesc: t("journey:steps.s5.shortDesc"),
      longDesc: t("journey:steps.s5.longDesc"),
      estimate: t("journey:steps.s5.estimate"),
      weight: 10,
      why: t("journey:steps.s5.why"),
      consequence: t("journey:steps.s5.consequence"),
      action: { label: t("journey:steps.s5.action") },
    },
    {
      id: "s6",
      phase: "Verify",
      title: t("journey:steps.s6.title"),
      shortDesc: t("journey:steps.s6.shortDesc"),
      longDesc: t("journey:steps.s6.longDesc"),
      estimate: t("journey:steps.s6.estimate"),
      weight: 12,
      why: t("journey:steps.s6.why"),
      consequence: t("journey:steps.s6.consequence"),
      action: { label: t("journey:steps.s6.action") },
    },
    {
      id: "s7",
      phase: "Vote",
      title: t("journey:steps.s7.title"),
      shortDesc: t("journey:steps.s7.shortDesc"),
      longDesc: t("journey:steps.s7.longDesc"),
      estimate: t("journey:steps.s7.estimate"),
      deadline: t("journey:steps.s7.deadline"),
      weight: 12,
      why: t("journey:steps.s7.why"),
      consequence: t("journey:steps.s7.consequence"),
      action: { label: t("journey:steps.s7.action") },
    },
    {
      id: "s8",
      phase: "Vote",
      title: t("journey:steps.s8.title"),
      shortDesc: t("journey:steps.s8.shortDesc"),
      longDesc: t("journey:steps.s8.longDesc"),
      estimate: t("journey:steps.s8.estimate"),
      deadline: t("journey:steps.s8.deadline"),
      weight: 18,
      why: t("journey:steps.s8.why"),
      consequence: t("journey:steps.s8.consequence"),
      checklist: stepList(t, "journey:steps.s8.checklist"),
      faqs: stepFaqs(t, "s8"),
      action: { label: t("journey:steps.s8.action") },
    },
  ];
}

export function getGlobalFaqs(t: TFunction = fallbackT): StepFaq[] {
  const raw = t("journey:globalFaqs", { returnObjects: true, defaultValue: [] }) as StepFaq[];
  return Array.isArray(raw) ? raw : [];
}

export function calcReadiness(completedIds: string[], steps: JourneyStep[]): number {
  const total = steps.reduce((sum, s) => sum + s.weight, 0);
  const earned = steps
    .filter((s) => completedIds.includes(s.id))
    .reduce((sum, s) => sum + s.weight, 0);
  return Math.round((earned / total) * 100);
}

export function readinessLabel(
  score: number,
  t: TFunction = fallbackT,
): { label: string; tone: "muted" | "primary" | "leaf" } {
  if (score === 0) return { label: t("journey:readinessLabels.0"), tone: "muted" };
  if (score < 40) return { label: t("journey:readinessLabels.40"), tone: "primary" };
  if (score < 80) return { label: t("journey:readinessLabels.80"), tone: "primary" };
  if (score < 100) return { label: t("journey:readinessLabels.close"), tone: "leaf" };
  return { label: t("journey:readinessLabels.100"), tone: "leaf" };
}

export function getStepById(id: string, t: TFunction = fallbackT): JourneyStep | undefined {
  return getJourneySteps(t).find((step) => step.id === id);
}

export function getNextStep(
  completedIds: string[],
  steps: JourneyStep[] = getJourneySteps(),
): JourneyStep | undefined {
  return steps.find((step) => !completedIds.includes(step.id));
}

export const GOALS = getGoals();
export const FIRST_TIME_VOTER_JOURNEY = getJourneySteps();
export const GLOBAL_FAQS = getGlobalFaqs();
