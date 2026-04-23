import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  CalendarDays,
  ExternalLink,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  FileText,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AssistantFab } from "@/components/AssistantFab";
import { InfoTip } from "@/components/InfoTip";
import { FIRST_TIME_VOTER_JOURNEY, getStepById, getNextStep, calcReadiness } from "@/lib/journey";
import { getCompleted, toggleCompleted, useProfile } from "@/lib/storage";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { checkMilestones } from "@/lib/milestones";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/step/$stepId")({
  loader: ({ params }) => {
    const step = getStepById(params.stepId);
    if (!step) throw notFound();
    return { step };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.step.title ?? "Step"} — VoteRoute` },
      { name: "description", content: loaderData?.step.shortDesc ?? "Voting journey step" },
    ],
  }),
  notFoundComponent: () => (
    <PageShell crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Step not found" }]}>
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <h2 className="text-lg font-semibold">We couldn't find that step</h2>
        <p className="mt-1 text-sm text-muted-foreground">It may have been removed or the link is wrong.</p>
        <Link to="/dashboard" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Back to dashboard
        </Link>
      </div>
    </PageShell>
  ),
  component: StepDetailPage,
});

function StepDetailPage() {
  const { step } = Route.useLoaderData();
  const navigate = useNavigate();
  const { profile, hydrated, setProfile } = useProfile();
  const [completed, setCompletedState] = useState<string[]>([]);
  const [justDone, setJustDone] = useState(false);

  useEffect(() => {
    setCompletedState(getCompleted());
  }, []);

  if (hydrated && !profile) {
    return (
      <PageShell>
        <OnboardingDialog onClose={() => window.history.back()} onComplete={(p) => setProfile(p)} defaultGoal="register" />
      </PageShell>
    );
  }

  const isDone = completed.includes(step.id);
  const idx = FIRST_TIME_VOTER_JOURNEY.findIndex((s) => s.id === step.id);
  const prev = FIRST_TIME_VOTER_JOURNEY[idx - 1];
  const next = FIRST_TIME_VOTER_JOURNEY[idx + 1];
  const nextSuggested = getNextStep(completed);

  function markDone() {
    const wasDone = isDone;
    const prevScore = calcReadiness(completed, FIRST_TIME_VOTER_JOURNEY);
    const newCompleted = toggleCompleted(step.id);
    setCompletedState(newCompleted);
    const nextScore = calcReadiness(newCompleted, FIRST_TIME_VOTER_JOURNEY);
    if (!wasDone) {
      setJustDone(true);
      toast.success("Step completed successfully", {
        description: `${step.title} · +${step.weight}% readiness`,
      });
      checkMilestones(prevScore, nextScore);
      setTimeout(() => {
        if (next) navigate({ to: "/step/$stepId", params: { stepId: next.id } });
        else navigate({ to: "/done" });
      }, 1100);
    } else {
      toast("Marked as not done", { description: step.title });
    }
  }

  return (
    <PageShell
      crumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Journey", to: "/journey", },
        { label: `Step ${idx + 1}` },
      ]}
    >
      {justDone && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-start justify-center pt-24 animate-fade-in">
          <div className="rounded-full bg-leaf px-5 py-2 text-sm font-medium text-leaf-foreground shadow-glow check-pop inline-flex items-center gap-2">
            <Check className="h-4 w-4" /> Step completed successfully
          </div>
        </div>
      )}

      <article className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
              {step.phase}
            </span>
            <span className="text-xs text-muted-foreground">Step {idx + 1} of {FIRST_TIME_VOTER_JOURNEY.length}</span>
            {isDone && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-leaf/15 px-2 py-0.5 text-xs font-medium text-leaf">
                <Check className="h-3 w-3" /> Completed
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl sm:text-[1.875rem] font-semibold tracking-tight leading-tight break-words">
            {step.title}
          </h1>
          <p className="mt-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed">{step.shortDesc}</p>

          {/* Meta strip */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-foreground font-medium">{step.estimate}</span>
            </span>
            {step.deadline && (
              <span className="inline-flex items-center gap-1 rounded-full bg-saffron/15 px-3 py-1.5 text-saffron-foreground">
                <CalendarDays className="h-3 w-3" /> {step.deadline}
                <InfoTip label="Deadline source">
                  Deadlines follow ECI's standard 30-day cutoff. Verify your state's exact dates on eci.gov.in.
                </InfoTip>
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-leaf/30 bg-leaf/5 px-3 py-1.5 text-[11px] text-leaf">
              <ShieldCheck className="h-3 w-3" /> ECI-aligned
            </span>
          </div>

          {/* Long description */}
          <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">What you need to do</h2>
            <p className="mt-3 text-base leading-relaxed text-foreground/90">{step.longDesc}</p>
          </section>

          {/* Why */}
          {step.why && (
            <section className="mt-4 rounded-2xl border border-primary/20 bg-primary-soft/40 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Lightbulb className="h-4 w-4" /> Why this matters
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{step.why}</p>
            </section>
          )}

          {/* Documents */}
          {step.documents && step.documents.length > 0 && (
            <section className="mt-4 rounded-2xl border border-border bg-card p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" /> Required documents
              </h3>
              <ul className="mt-3 space-y-2">
                {step.documents.map((d: string) => (
                  <li key={d} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border border-border bg-background">
                      <Check className="h-3 w-3 text-muted-foreground/40" />
                    </span>
                    <span className="text-foreground/80">{d}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Checklist */}
          {step.checklist && step.checklist.length > 0 && (
            <section className="mt-4 rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Quick checklist</h3>
              <ul className="mt-3 space-y-2">
                {step.checklist.map((item: string) => (
                  <Checkable key={item} item={item} />
                ))}
              </ul>
            </section>
          )}

          {/* Consequence */}
          {step.consequence && (
            <section className="mt-4 rounded-2xl border border-saffron/30 bg-saffron/10 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-saffron-foreground">
                <AlertTriangle className="h-4 w-4 text-saffron" /> What happens if you skip this
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{step.consequence}</p>
            </section>
          )}

          {/* FAQs */}
          {step.faqs && step.faqs.length > 0 && (
            <section className="mt-4 rounded-2xl border border-border bg-card p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <HelpCircle className="h-4 w-4 text-primary" /> Common questions
              </h3>
              <div className="mt-3 space-y-3">
                {step.faqs.map((f: { q: string; a: string }) => (
                  <details key={f.q} className="group rounded-xl border border-border bg-background p-3">
                    <summary className="cursor-pointer text-sm font-medium list-none flex items-center justify-between gap-2">
                      {f.q}
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Action */}
          <section className="mt-6 flex flex-wrap items-center gap-3">
            {step.action?.href && (
              <a
                href={step.action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow hover:scale-[1.02] transition-transform"
              >
                {step.action.label} <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={markDone}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-sm font-medium transition-all",
                isDone
                  ? "border border-border bg-background text-muted-foreground hover:text-foreground"
                  : "bg-leaf text-leaf-foreground hover:scale-[1.02] shadow-glow",
              )}
            >
              <Check className="h-4 w-4" />
              {isDone ? "Mark as not done" : "Mark as done"}
            </button>
          </section>

          {/* Prev/Next nav */}
          <nav className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
            {prev ? (
              <Link
                to="/step/$stepId"
                params={{ stepId: prev.id }}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs hover:border-primary/40 transition-colors min-w-0"
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                <span className="text-left min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Previous</span>
                  <span className="block truncate font-medium">{prev.title}</span>
                </span>
              </Link>
            ) : <div />}
            {next ? (
              <Link
                to="/step/$stepId"
                params={{ stepId: next.id }}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs hover:border-primary/40 transition-colors min-w-0 text-right"
              >
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Next</span>
                  <span className="block truncate font-medium">{next.title}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </Link>
            ) : (
              <Link
                to="/done"
                className="inline-flex items-center gap-1.5 rounded-full bg-leaf px-4 py-2 text-xs font-medium text-leaf-foreground"
              >
                Finish journey <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </nav>
        </div>

        {/* Side info */}
        <aside className="space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sticky top-24">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Need a nudge?</div>
            {nextSuggested && nextSuggested.id !== step.id && (
              <Link
                to="/step/$stepId"
                params={{ stepId: nextSuggested.id }}
                className="mt-3 block rounded-xl border border-primary/30 bg-primary-soft p-3 text-sm hover:border-primary"
              >
                <div className="text-[10px] uppercase tracking-wider text-primary font-medium">Suggested next</div>
                <div className="mt-0.5 font-medium truncate">{nextSuggested.title}</div>
              </Link>
            )}
            <div className="mt-3 space-y-2">
              <Link
                to="/assistant"
                className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
              >
                <Sparkles className="h-4 w-4 text-primary" /> Ask the assistant
              </Link>
              <Link
                to="/timeline"
                className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
              >
                <CalendarDays className="h-4 w-4 text-primary" /> Full timeline
              </Link>
            </div>
          </div>
        </aside>
      </article>

      <AssistantFab />
    </PageShell>
  );
}

function Checkable({ item }: { item: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <li className="flex items-start gap-2 text-sm">
      <button
        onClick={() => setChecked((v) => !v)}
        className={cn(
          "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border transition-all",
          checked ? "border-leaf bg-leaf" : "border-border bg-background",
        )}
        aria-label={checked ? "Uncheck" : "Check"}
      >
        {checked && <Check className="h-3 w-3 text-leaf-foreground" />}
      </button>
      <span className={cn("text-foreground/80", checked && "line-through text-muted-foreground")}>{item}</span>
    </li>
  );
}
