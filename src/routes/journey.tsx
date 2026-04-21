import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  CalendarDays,
  CircleDot,
  PartyPopper,
  Lock,
  ExternalLink,
} from "lucide-react";
import { z } from "zod";
import { AppHeader } from "@/components/AppHeader";
import { AssistantDrawer } from "@/components/AssistantDrawer";
import {
  FIRST_TIME_VOTER_JOURNEY,
  GOALS,
  PHASES,
  type GoalId,
  type JourneyStep,
} from "@/lib/journey";
import { getCompleted, toggleCompleted } from "@/lib/storage";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  goal: z.enum(["register", "eligibility", "learn", "voting-day"]).default("register"),
});

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Your Voting Journey — VoteRoute" },
      {
        name: "description",
        content:
          "Your personalised, step-by-step voting journey. See exactly where you are and what to do next.",
      },
      { property: "og:title", content: "Your Voting Journey — VoteRoute" },
      {
        property: "og:description",
        content: "A guided execution system to take you from 'I want to vote' to 'I have voted'.",
      },
    ],
  }),
  validateSearch: searchSchema,
  component: JourneyPage,
});

function JourneyPage() {
  const { goal } = Route.useSearch();
  const steps = FIRST_TIME_VOTER_JOURNEY;
  const goalMeta = GOALS.find((g) => g.id === goal) ?? GOALS[0];

  const [completed, setCompletedState] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string>(steps[0].id);

  useEffect(() => {
    const c = getCompleted();
    setCompletedState(c);
    const firstUndone = steps.find((s) => !c.includes(s.id));
    if (firstUndone) setActiveId(firstUndone.id);
  }, [steps]);

  const completeStep = (id: string) => {
    const next = toggleCompleted(id);
    setCompletedState(next);
    if (next.includes(id)) {
      const idx = steps.findIndex((s) => s.id === id);
      const nextStep = steps[idx + 1];
      if (nextStep) setActiveId(nextStep.id);
    }
  };

  const progressPct = Math.round((completed.filter((id) => steps.some((s) => s.id === id)).length / steps.length) * 100);
  const allDone = progressPct === 100;
  const activeStep = steps.find((s) => s.id === activeId) ?? steps[0];
  const activeIdx = steps.findIndex((s) => s.id === activeId);
  const nextStep = steps[activeIdx + 1];

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

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Change goal
          </Link>
          <div className="text-xs text-muted-foreground">
            Goal: <span className="text-foreground font-medium">{goalMeta.title}</span>
          </div>
        </div>

        {/* Progress hero */}
        <section className="mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
            <div className="relative">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Your journey</div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-semibold">
                {allDone ? "🎉 You are ready to vote!" : "First-time voter registration → voting day"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {allDone
                  ? "Every step complete. Save this page and head to your booth on election day."
                  : `Step ${Math.min(activeIdx + 1, steps.length)} of ${steps.length} · ${progressPct}% complete`}
              </p>

              {/* Progress bar */}
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-leaf transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Phase chips */}
              <div className="mt-5 grid grid-cols-4 gap-2">
                {phaseStatus.map((p) => (
                  <div
                    key={p.name}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left transition-colors",
                      p.complete
                        ? "border-leaf/40 bg-leaf/10"
                        : p.active
                          ? "border-primary/50 bg-primary-soft"
                          : "border-border bg-background",
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {p.complete ? (
                        <Check className="h-3 w-3 text-leaf" />
                      ) : p.active ? (
                        <CircleDot className="h-3 w-3 text-primary" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {p.name}
                    </div>
                    <div className="mt-0.5 text-xs text-foreground">
                      {p.done}/{p.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What's next CTA */}
            <div className="relative md:w-72">
              <div className="rounded-2xl border border-primary/30 bg-primary text-primary-foreground p-5 shadow-glow">
                <div className="text-xs uppercase tracking-wider opacity-80">
                  {allDone ? "All done" : "What should I do next?"}
                </div>
                <div className="mt-1 text-base font-semibold leading-snug">
                  {allDone ? "Vote on election day 🗳️" : activeStep.title}
                </div>
                {!allDone && (
                  <button
                    onClick={() => {
                      const el = document.getElementById(`step-${activeStep.id}`);
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground px-4 py-2 text-xs font-medium text-primary hover:opacity-90"
                  >
                    Take me there <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {allDone && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-leaf/40 bg-leaf/10 p-4 text-sm">
            <PartyPopper className="h-5 w-5 text-leaf" />
            <div>
              <div className="font-semibold text-foreground">Journey complete</div>
              <div className="text-muted-foreground">
                You've finished every step. Tell a friend to start their journey too.
              </div>
            </div>
          </div>
        )}

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
                            "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-semibold",
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
            </div>
          </aside>

          {/* Step cards */}
          <div className="relative space-y-4">
            <div className="absolute left-[19px] top-2 bottom-2 hidden w-px bg-border sm:block" />
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

            {nextStep && !allDone && (
              <div className="ml-0 sm:ml-12 rounded-2xl border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">
                Up next: <span className="text-foreground font-medium">{nextStep.title}</span>
              </div>
            )}
          </div>
        </section>
      </main>

      <AssistantDrawer />
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
  return (
    <div
      id={`step-${step.id}`}
      className={cn(
        "relative flex gap-4 rounded-2xl border bg-card p-5 transition-all sm:ml-0",
        isActive
          ? "border-primary/50 shadow-glow"
          : isDone
            ? "border-leaf/30"
            : "border-border shadow-soft",
      )}
      onClick={onActivate}
    >
      {/* Node */}
      <div className="hidden sm:flex shrink-0 flex-col items-center">
        <div
          className={cn(
            "z-10 grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-semibold",
            isDone
              ? "border-leaf bg-leaf text-leaf-foreground"
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
              <Check className="h-3 w-3" /> Completed
            </span>
          )}
        </div>

        <h3 className={cn("mt-2 text-lg font-semibold", isDone && "text-muted-foreground line-through decoration-1")}>
          {step.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{step.shortDesc}</p>

        {(isActive || (!isDone && !isActive)) && (
          <div className={cn("mt-3 text-sm leading-relaxed text-foreground/80", !isActive && "hidden")}>
            {step.longDesc}
          </div>
        )}

        {isActive && step.checklist && (
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

        {isActive && step.action && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {step.action.href ? (
              <a
                href={step.action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {step.action.label} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
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
