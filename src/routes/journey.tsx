import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  CalendarDays,
  CircleDot,
  Lock,
  ExternalLink,
  AlertTriangle,
  Share2,
  Sparkles,
  RotateCcw,
  MapPin,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { TrustBar } from "@/components/TrustBar";
import { AssistantFab } from "@/components/AssistantFab";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { ReadinessRing } from "@/components/ReadinessRing";
import { Confetti } from "@/components/Confetti";
import {
  getGoals,
  getJourneySteps,
  PHASES,
  calcReadiness,
  readinessLabel,
  type JourneyStep,
} from "@/lib/journey";
import { clearProfile, getCompleted, toggleCompleted, useProfile, setCompleted as persistCompleted } from "@/lib/storage";
import { checkMilestones, resetMilestones } from "@/lib/milestones";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  goal: fallback(z.enum(["register", "eligibility", "learn", "voting-day"]), "register").default("register"),
});

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Your Voting Journey — VoteRoute" },
      {
        name: "description",
        content:
          "Your personalised, step-by-step voting journey. See where you are, what's next, and your readiness score.",
      },
      { property: "og:title", content: "My Voting Journey — VoteRoute" },
      {
        property: "og:description",
        content: "From 'I want to vote' to 'I have voted' — guided, every step of the way.",
      },
    ],
  }),
  validateSearch: zodValidator(searchSchema),
  component: JourneyPage,
});

function JourneyPage() {
  const { goal } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, hydrated, setProfile } = useProfile();
  const steps = useMemo(() => getJourneySteps(t), [t]);
  const goals = useMemo(() => getGoals(t), [t]);
  const goalMeta = goals.find((g) => g.id === goal) ?? goals[0];

  const [completed, setCompletedState] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string>(steps[0].id);
  const [celebrate, setCelebrate] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const c = getCompleted();
    setCompletedState(c);
    const firstUndone = steps.find((s) => !c.includes(s.id));
    setActiveId(firstUndone ? firstUndone.id : steps[steps.length - 1].id);
    if (c.length === steps.length) setShowShare(true);
  }, [steps]);

  const score = useMemo(() => calcReadiness(completed, steps), [completed, steps]);
  const scoreMeta = readinessLabel(score);
  const allDone = score === 100;

  function completeStep(id: string) {
    const wasDone = completed.includes(id);
    const prevScore = calcReadiness(completed, steps);
    const next = toggleCompleted(id);
    setCompletedState(next);
    const nextScore = calcReadiness(next, steps);
    if (!wasDone) {
      const step = steps.find((s) => s.id === id);
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1400);
      toast.success("Step completed successfully", {
        description: step ? `${step.title} · +${step.weight}% readiness` : undefined,
      });
      checkMilestones(prevScore, nextScore);
      const idx = steps.findIndex((s) => s.id === id);
      const nextStep = steps[idx + 1];
      if (nextStep) setActiveId(nextStep.id);
      if (next.length === steps.length) setTimeout(() => setShowShare(true), 800);
    }
  }

  function resetJourney() {
    persistCompleted([]);
    resetMilestones();
    setCompletedState([]);
    setActiveId(steps[0].id);
    setShowShare(false);
    toast("Progress reset", { description: "Starting fresh." });
  }

  function resetAll() {
    clearProfile();
    setProfile(null);
    setCompletedState([]);
  }

  const activeStep = steps.find((s) => s.id === activeId) ?? steps[0];
  const activeIdx = steps.findIndex((s) => s.id === activeId);

  const phaseStatus = useMemo(() => {
    return PHASES.map((phase) => {
      const phaseSteps = steps.filter((s) => s.phase === phase);
      const doneCount = phaseSteps.filter((s) => completed.includes(s.id)).length;
      return {
        name: phase,
        total: phaseSteps.length,
        done: doneCount,
        complete: doneCount === phaseSteps.length,
        active: phaseSteps.some((s) => s.id === activeId),
      };
    });
  }, [completed, activeId, steps]);

  // Onboarding gate
  if (hydrated && !profile) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <OnboardingDialog
          defaultGoal={goal}
          onComplete={(p) => setProfile(p)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 sm:pb-16">
      <AppHeader profile={profile} onReset={resetAll} />
      <TrustBar />

      {/* Confetti on full completion */}
      <Confetti active={celebrate && allDone} />

      {/* Step-completion banner */}
      {celebrate && !allDone && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-start justify-center pt-24">
          <div className="rounded-full bg-leaf px-5 py-2 text-sm font-medium text-leaf-foreground shadow-glow check-pop inline-flex items-center gap-2">
            <Check className="h-4 w-4" /> Step completed successfully
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Change goal
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <span className="hidden sm:inline shrink-0">Goal:</span>
            <span className="text-foreground font-medium truncate">{goalMeta.title}</span>
          </div>
        </div>

        {/* Hero: readiness ring + journey title */}
        <section className="mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center">
            <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />

            {/* Readiness ring */}
            <div className="relative flex justify-center md:justify-start">
              <ReadinessRing
                score={score}
                label="Readiness"
                sublabel={scoreMeta.label}
              />
            </div>

            <div className="relative">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {profile && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-saffron" />
                    Your journey in {profile.city}, {profile.state}
                  </span>
                )}
              </div>
              <h1 className="mt-1 text-[1.625rem] sm:text-3xl font-semibold tracking-tight leading-tight break-words">
                {allDone
                  ? "You are fully prepared to vote"
                  : profile?.firstTimeVoter
                    ? "Your first-time voter journey"
                    : "Your voting journey"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {allDone
                  ? "Every step complete. Save this page and head to your booth on election day."
                  : `${completed.length} of ${steps.length} steps complete · Up next: ${activeStep.title}`}
              </p>

              {/* Phase chips */}
              <div className="mt-5 grid grid-cols-4 gap-2">
                {phaseStatus.map((p) => (
                  <div
                    key={p.name}
                    className={cn(
                      "rounded-xl border px-2 sm:px-3 py-2 text-left transition-colors",
                      p.complete
                        ? "border-leaf/40 bg-leaf/10"
                        : p.active
                          ? "border-primary/50 bg-primary-soft"
                          : "border-border bg-background",
                    )}
                  >
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {p.complete ? (
                        <Check className="h-3 w-3 text-leaf" />
                      ) : p.active ? (
                        <CircleDot className="h-3 w-3 text-primary" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      <span className="truncate">{p.name}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-foreground">
                      {p.done}/{p.total}
                    </div>
                  </div>
                ))}
              </div>

              {!allDone && (
                <button
                  onClick={() => {
                    document
                      .getElementById(`step-${activeStep.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow hover:scale-[1.02] transition-transform"
                >
                  <Sparkles className="h-4 w-4" />
                  What should I do next?
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Vertical phase rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Timeline
              </div>
              <ol className="mt-3 space-y-1">
                {steps.map((s, i) => {
                  const isDone = completed.includes(s.id);
                  const isActive = s.id === activeId;
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() => {
                          setActiveId(s.id);
                          document
                            .getElementById(`step-${s.id}`)
                            ?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                          isActive ? "bg-primary-soft text-foreground" : "hover:bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-semibold transition-all",
                            isDone
                              ? "border-leaf bg-leaf text-leaf-foreground"
                              : isActive
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground",
                          )}
                        >
                          {isDone ? <Check className="h-3 w-3" /> : i + 1}
                        </span>
                        <span className="truncate">{s.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <button
                onClick={resetJourney}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> Reset progress
              </button>
            </div>
          </aside>

          {/* Step cards */}
          <div className="relative space-y-4">
            {steps.map((step, i) => (
              <StepCard
                key={step.id}
                step={step}
                index={i}
                isActive={step.id === activeId}
                isDone={completed.includes(step.id)}
                onActivate={() => setActiveId(step.id)}
                onComplete={() => completeStep(step.id)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Sticky mobile next-step CTA */}
      {!allDone && (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur-md sm:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Next step · {score}%
              </div>
              <div className="text-sm font-medium truncate">{activeStep.title}</div>
            </div>
            <button
              onClick={() => {
                document
                  .getElementById(`step-${activeStep.id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-glow shrink-0"
            >
              Take me there <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Share / celebration modal */}
      {showShare && allDone && profile && (
        <ShareModal
          profile={profile}
          onClose={() => setShowShare(false)}
          onRestart={() => {
            resetJourney();
            navigate({ to: "/" });
          }}
        />
      )}

      <AssistantFab />
    </div>
  );
}

function StepCard({
  step,
  index,
  isActive,
  isDone,
  onActivate,
  onComplete,
}: {
  step: JourneyStep;
  index: number;
  isActive: boolean;
  isDone: boolean;
  onActivate: () => void;
  onComplete: () => void;
}) {
  const [showConsequence, setShowConsequence] = useState(false);

  return (
    <div
      id={`step-${step.id}`}
      className={cn(
        "relative flex gap-4 rounded-2xl border bg-card p-5 transition-all cursor-pointer",
        isActive
          ? "border-primary/50 shadow-glow"
          : isDone
            ? "border-leaf/30"
            : "border-border shadow-soft hover:border-primary/30",
      )}
      onClick={onActivate}
    >
      <div className="hidden sm:flex shrink-0 flex-col items-center">
        <div
          className={cn(
            "z-10 grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-semibold transition-all",
            isDone
              ? "border-leaf bg-leaf text-leaf-foreground scale-100"
              : isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground",
          )}
        >
          {isDone ? <Check className="h-4 w-4" /> : index + 1}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
            {step.phase}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {step.estimate}
          </span>
          {step.deadline && (
            <span className="inline-flex items-center gap-1 rounded-full bg-saffron/15 px-2 py-0.5 text-xs text-saffron-foreground">
              <CalendarDays className="h-3 w-3" /> {step.deadline}
            </span>
          )}
          {isDone && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-leaf">
              <Check className="h-3 w-3" /> One step closer
            </span>
          )}
        </div>

        <h3 className={cn("mt-2 text-lg font-semibold tracking-tight", isDone && "text-muted-foreground")}>
          {step.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{step.shortDesc}</p>

        {isActive && (
          <>
            <div className="mt-3 text-sm leading-relaxed text-foreground/80">{step.longDesc}</div>

            {step.checklist && (
              <ul className="mt-4 space-y-2">
                {step.checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border border-border bg-background">
                      <Check className="h-3 w-3 text-muted-foreground/40" />
                    </span>
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {step.consequence && (
              <div className="mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConsequence((v) => !v);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-saffron-foreground hover:underline"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-saffron" />
                  {showConsequence ? "Hide" : "What happens if I skip this step?"}
                </button>
                {showConsequence && (
                  <div className="mt-2 rounded-xl border border-saffron/30 bg-saffron/10 p-3 text-sm text-foreground/80">
                    {step.consequence}
                  </div>
                )}
              </div>
            )}

            {step.action && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {step.action.href && (
                  <a
                    href={step.action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {step.action.label} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    step.action.href
                      ? "border border-border bg-background text-foreground hover:bg-muted"
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                  {step.action.href ? "Mark this done" : step.action.label}
                </button>
              </div>
            )}
          </>
        )}

        {isDone && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
}

function ShareModal({
  profile,
  onClose,
  onRestart,
}: {
  profile: { city: string; state: string };
  onClose: () => void;
  onRestart: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = `🎉 I completed my voting journey on VoteRoute! Ready to vote in ${profile.city}, ${profile.state}. Start yours →`;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "I'm ready to vote!", text, url });
        return;
      } catch {
        // fall through to copy
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card shadow-glow overflow-hidden">
        <div className="bg-gradient-to-br from-primary via-primary to-leaf p-8 text-center text-primary-foreground">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-foreground/20 backdrop-blur-sm">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">You are ready to vote!</h2>
          <p className="mt-2 text-sm opacity-90">
            Every step complete. You're all set for election day in {profile.city}.
          </p>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={share}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Share2 className="h-4 w-4" />
            {copied ? "Copied to clipboard ✓" : "Share my voting journey"}
          </button>
          <button
            onClick={onClose}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium hover:bg-muted"
          >
            Back to my journey
          </button>
          <button
            onClick={onRestart}
            className="inline-flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Start over
          </button>
        </div>
      </div>
    </div>
  );
}
