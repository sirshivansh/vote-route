import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Map,
  Gauge,
  RotateCcw,
  CheckCircle2,
  Clock,
  PartyPopper,
  AlertTriangle,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ReadinessRing } from "@/components/ReadinessRing";
import { AssistantFab } from "@/components/AssistantFab";
import { StepCard } from "@/components/StepCard";
import {
  FIRST_TIME_VOTER_JOURNEY,
  PHASES,
  calcReadiness,
  readinessLabel,
  getNextStep,
} from "@/lib/journey";
import { useProfile, getCompleted, toggleCompleted, setCompleted as persistCompleted } from "@/lib/storage";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard — VoteRoute" },
      { name: "description", content: "Your voting journey at a glance — current step, readiness score, and quick actions." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { profile, hydrated, setProfile } = useProfile();
  const steps = FIRST_TIME_VOTER_JOURNEY;
  const [completed, setCompletedState] = useState<string[]>([]);

  useEffect(() => {
    setCompletedState(getCompleted());
  }, []);

  const score = useMemo(() => calcReadiness(completed, steps), [completed, steps]);
  const scoreMeta = readinessLabel(score);
  const nextStep = useMemo(() => getNextStep(completed), [completed]);
  const allDone = score === 100;

  const phaseStatus = useMemo(
    () =>
      PHASES.map((phase) => {
        const phaseSteps = steps.filter((s) => s.phase === phase);
        const doneCount = phaseSteps.filter((s) => completed.includes(s.id)).length;
        return {
          name: phase,
          total: phaseSteps.length,
          done: doneCount,
          complete: doneCount === phaseSteps.length,
        };
      }),
    [completed, steps],
  );

  function markDone(id: string) {
    const next = toggleCompleted(id);
    setCompletedState(next);
  }

  function resetJourney() {
    persistCompleted([]);
    setCompletedState([]);
  }

  if (hydrated && !profile) {
    return (
      <PageShell>
        <OnboardingDialog onComplete={(p) => setProfile(p)} defaultGoal="register" />
      </PageShell>
    );
  }

  return (
    <PageShell crumbs={[{ label: "Dashboard" }]}>
      {/* Welcome */}
      <section className="mb-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {profile && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-saffron" />
              Your journey in {profile.city}, {profile.state}
            </span>
          )}
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight">
          {allDone ? "🎉 You're ready to vote!" : "Welcome back 👋"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {allDone
            ? "Every step done. Save this page and head to your booth on election day."
            : `${completed.length} of ${steps.length} steps complete · Keep going, you're doing great.`}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          {/* Next step hero */}
          {!allDone && nextStep && (
            <section className="overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary-soft via-card to-card p-6 sm:p-7 shadow-soft">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Up next for you
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight">{nextStep.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{nextStep.shortDesc}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-background border border-border px-2 py-1">
                  <Clock className="h-3 w-3" /> {nextStep.estimate}
                </span>
                {nextStep.deadline && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-saffron/15 px-2 py-1 text-saffron-foreground">
                    <AlertTriangle className="h-3 w-3" /> {nextStep.deadline}
                  </span>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to="/step/$stepId"
                  params={{ stepId: nextStep.id }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow hover:scale-[1.02] transition-transform"
                >
                  Open this step
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => markDone(nextStep.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as done
                </button>
              </div>
            </section>
          )}

          {allDone && (
            <Link
              to="/done"
              className="block overflow-hidden rounded-3xl border border-leaf/40 bg-gradient-to-br from-leaf/15 via-card to-card p-7 shadow-soft hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-leaf">
                <PartyPopper className="h-3.5 w-3.5" /> Journey complete
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">View your completion screen →</h2>
              <p className="mt-1 text-sm text-muted-foreground">Share your readiness with friends and family.</p>
            </Link>
          )}

          {/* Phase progress */}
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Phases</h3>
              <Link to="/timeline" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                Full timeline <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {phaseStatus.map((p) => (
                <div
                  key={p.name}
                  className={cn(
                    "rounded-xl border p-3 transition-all",
                    p.complete ? "border-leaf/40 bg-leaf/10" : "border-border bg-background",
                  )}
                >
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {p.name}
                  </div>
                  <div className="mt-1 text-lg font-semibold tabular-nums">
                    {p.done}<span className="text-sm text-muted-foreground">/{p.total}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-700", p.complete ? "bg-leaf" : "bg-primary")}
                      style={{ width: `${(p.done / p.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent / upcoming steps */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Upcoming steps</h3>
              <Link to="/journey" search={{ goal: "register" }} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                View journey <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {steps
                .filter((s) => !completed.includes(s.id))
                .slice(0, 3)
                .map((s) => {
                  const idx = steps.findIndex((x) => x.id === s.id);
                  return (
                    <StepCard
                      key={s.id}
                      step={s}
                      index={idx}
                      isDone={false}
                      isActive={s.id === nextStep?.id}
                      href={`/step/${s.id}`}
                      onComplete={() => markDone(s.id)}
                      compact
                    />
                  );
                })}
              {completed.length === steps.length && (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                  <PartyPopper className="mx-auto h-8 w-8 text-leaf" />
                  <p className="mt-2 text-sm text-muted-foreground">Nothing left to do — you're voting-ready!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft text-center">
            <div className="flex justify-center">
              <ReadinessRing score={score} size={150} stroke={12} label="Readiness" sublabel={scoreMeta.label} />
            </div>
            <Link
              to="/readiness"
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-muted"
            >
              <Gauge className="h-3.5 w-3.5" />
              View readiness report
            </Link>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</h3>
            <div className="mt-3 space-y-2">
              <QuickLink to="/journey" search={{ goal: "register" }} icon={<ArrowRight className="h-4 w-4" />} label="Continue journey" />
              <QuickLink to="/timeline" icon={<Map className="h-4 w-4" />} label="View timeline" />
              <QuickLink to="/assistant" icon={<Sparkles className="h-4 w-4" />} label="Ask the assistant" />
              <QuickLink to="/help" icon={<Gauge className="h-4 w-4" />} label="Help & FAQ" />
            </div>
          </section>

          {completed.length > 0 && (
            <button
              onClick={resetJourney}
              className="inline-flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset progress
            </button>
          )}
        </aside>
      </div>

      <AssistantFab />
    </PageShell>
  );

  // satisfy ts unused
  void navigate;
}

function QuickLink({
  to,
  icon,
  label,
  search,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  search?: Record<string, string>;
}) {
  // Use any-cast on `to` is unavoidable for dynamic helper; we only pass static known routes
  return (
    <Link
      // @ts-expect-error generic helper across known routes
      to={to}
      // @ts-expect-error pass through search
      search={search}
      className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-sm hover:border-primary/40 hover:bg-primary-soft transition-colors group"
    >
      <span className="inline-flex items-center gap-2 text-foreground">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">{icon}</span>
        {label}
      </span>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
