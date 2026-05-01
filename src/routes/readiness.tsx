import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, ArrowRight, Check, AlertTriangle, Gauge } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ReadinessRing } from "@/components/ReadinessRing";
import { AssistantFab } from "@/components/AssistantFab";
import {
  FIRST_TIME_VOTER_JOURNEY,
  calcReadiness,
  readinessLabel,
  getNextStep,
} from "@/lib/journey";
import { useProfile, getCompleted } from "@/lib/storage";
import { OnboardingDialog } from "@/components/OnboardingDialog";

export const Route = createFileRoute("/readiness")({
  head: () => ({
    meta: [
      { title: "Readiness Report — VoteRoute" },
      {
        name: "description",
        content:
          "Your personalised readiness report — see what's complete, what's missing, and recommended next actions.",
      },
    ],
  }),
  component: ReadinessPage,
});

function ReadinessPage() {
  const { profile, hydrated, setProfile } = useProfile();
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => setCompleted(getCompleted()), []);

  const score = useMemo(() => calcReadiness(completed, FIRST_TIME_VOTER_JOURNEY), [completed]);
  const meta = readinessLabel(score);
  const doneSteps = FIRST_TIME_VOTER_JOURNEY.filter((s) => completed.includes(s.id));
  const missingSteps = FIRST_TIME_VOTER_JOURNEY.filter((s) => !completed.includes(s.id));
  const nextStep = getNextStep(completed);

  if (hydrated && !profile) {
    return (
      <PageShell>
        <OnboardingDialog
          onClose={() => window.history.back()}
          onComplete={(p) => setProfile(p)}
          defaultGoal="register"
        />
      </PageShell>
    );
  }

  return (
    <PageShell crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Readiness" }]}>
      <header className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft">
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex justify-center md:justify-start">
            <ReadinessRing
              score={score}
              size={170}
              stroke={14}
              label="Readiness"
              sublabel={meta.label}
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
              <Gauge className="h-3 w-3 text-primary" /> Voting readiness report
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight">
              {score === 100 ? "You're 100% ready 🎉" : `You're ${score}% ready to vote`}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg">
              {score === 100
                ? "Every step is done. Save this report and head to the booth on election day."
                : `Complete the remaining ${missingSteps.length} step${missingSteps.length === 1 ? "" : "s"} below to reach 100% and be fully voting-ready.`}
            </p>
            {nextStep && (
              <Link
                to="/step/$stepId"
                params={{ stepId: nextStep.id }}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow hover:scale-[1.02] transition-transform"
              >
                <Sparkles className="h-4 w-4" />
                Take the next step
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Complete */}
        <section className="rounded-2xl border border-leaf/30 bg-leaf/5 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-leaf">
            <Check className="h-4 w-4" /> What you've completed ({doneSteps.length})
          </h2>
          {doneSteps.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-leaf/30 p-6 text-center text-sm text-muted-foreground">
              Nothing yet — your completed steps will show up here.
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {doneSteps.map((s) => (
                <li
                  key={s.id}
                  className="flex items-start gap-2 rounded-xl bg-card p-3 border border-border"
                >
                  <Check className="h-4 w-4 text-leaf shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <Link
                      to="/step/$stepId"
                      params={{ stepId: s.id }}
                      className="text-sm font-medium hover:underline truncate block"
                    >
                      {s.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">+{s.weight}% to readiness</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Missing */}
        <section className="rounded-2xl border border-saffron/30 bg-saffron/5 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-saffron-foreground">
            <AlertTriangle className="h-4 w-4 text-saffron" /> Still to do ({missingSteps.length})
          </h2>
          {missingSteps.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-leaf/30 p-6 text-center text-sm text-leaf">
              🎉 All done! No outstanding steps.
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {missingSteps.map((s) => (
                <li key={s.id} className="rounded-xl bg-card p-3 border border-border">
                  <Link
                    to="/step/$stepId"
                    params={{ stepId: s.id }}
                    className="text-sm font-medium hover:underline block"
                  >
                    {s.title}
                  </Link>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {s.estimate} · +{s.weight}% to readiness
                    {s.deadline && <span className="text-saffron-foreground"> · {s.deadline}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Recommendations */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Smart recommendations
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Recommendation
            title={
              score < 30 ? "Start with the basics" : score < 80 ? "Keep momentum" : "Almost there"
            }
            body={
              nextStep
                ? `Open "${nextStep.title}" — it's ${nextStep.estimate} and adds ${nextStep.weight}% to your readiness.`
                : "You've completed every step!"
            }
            cta={
              nextStep
                ? { label: "Open step", to: `/step/${nextStep.id}` }
                : { label: "View completion", to: "/done" }
            }
          />
          <Recommendation
            title="Have a question?"
            body="Get plain-English answers to anything voting-related — our assistant is one tap away."
            cta={{ label: "Ask assistant", to: "/assistant" }}
          />
        </div>
      </section>

      <AssistantFab />
    </PageShell>
  );
}

function Recommendation({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { label: string; to: string };
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
      <Link
        to={cta.to as never}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        {cta.label} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
