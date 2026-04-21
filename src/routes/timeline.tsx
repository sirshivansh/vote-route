import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Clock, CalendarDays, CircleDot, MapPin } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AssistantFab } from "@/components/AssistantFab";
import { FIRST_TIME_VOTER_JOURNEY, PHASES, calcReadiness } from "@/lib/journey";
import { useProfile, getCompleted } from "@/lib/storage";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Voting Timeline — VoteRoute" },
      { name: "description", content: "Visual timeline of your voting journey, with deadlines and step-by-step progress." },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  const { profile, hydrated, setProfile } = useProfile();
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => setCompleted(getCompleted()), []);

  const score = useMemo(() => calcReadiness(completed, FIRST_TIME_VOTER_JOURNEY), [completed]);

  if (hydrated && !profile) {
    return (
      <PageShell>
        <OnboardingDialog onComplete={(p) => setProfile(p)} defaultGoal="register" />
      </PageShell>
    );
  }

  return (
    <PageShell crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Timeline" }]}>
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Your voting timeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-saffron" />
              {profile.city}, {profile.state} · {score}% ready
            </span>
          )}
        </p>
      </header>

      {/* Phase headers */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PHASES.map((phase) => {
          const phaseSteps = FIRST_TIME_VOTER_JOURNEY.filter((s) => s.phase === phase);
          const done = phaseSteps.filter((s) => completed.includes(s.id)).length;
          const isComplete = done === phaseSteps.length;
          return (
            <div
              key={phase}
              className={cn(
                "rounded-xl border p-3",
                isComplete ? "border-leaf/40 bg-leaf/10" : "border-border bg-card",
              )}
            >
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {isComplete ? <Check className="h-3 w-3 text-leaf" /> : <CircleDot className="h-3 w-3 text-primary" />}
                {phase}
              </div>
              <div className="mt-1 text-sm font-semibold">{done}/{phaseSteps.length} done</div>
            </div>
          );
        })}
      </div>

      {/* Vertical timeline */}
      <div className="relative">
        <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-0.5 bg-border" aria-hidden />
        <ol className="space-y-4">
          {FIRST_TIME_VOTER_JOURNEY.map((step, i) => {
            const isDone = completed.includes(step.id);
            const isNext = !isDone && FIRST_TIME_VOTER_JOURNEY.slice(0, i).every((s) => completed.includes(s.id));
            return (
              <li key={step.id} className="relative pl-12 sm:pl-14">
                <span
                  className={cn(
                    "absolute left-0 top-3 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border-2 text-xs font-semibold transition-all",
                    isDone
                      ? "border-leaf bg-leaf text-leaf-foreground"
                      : isNext
                        ? "border-primary bg-primary text-primary-foreground shadow-glow"
                        : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : i + 1}
                </span>

                <Link
                  to="/step/$stepId"
                  params={{ stepId: step.id }}
                  className={cn(
                    "block rounded-2xl border bg-card p-4 sm:p-5 shadow-soft transition-all hover:-translate-y-0.5",
                    isNext ? "border-primary/50" : isDone ? "border-leaf/30" : "border-border hover:border-primary/30",
                  )}
                >
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
                    {isNext && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
                        Up next
                      </span>
                    )}
                    {isDone && (
                      <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-leaf">
                        <Check className="h-3 w-3" /> Done
                      </span>
                    )}
                  </div>
                  <h3 className={cn("mt-2 text-base sm:text-lg font-semibold tracking-tight", isDone && "text-muted-foreground")}>
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.shortDesc}</p>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      <AssistantFab />
    </PageShell>
  );
}
