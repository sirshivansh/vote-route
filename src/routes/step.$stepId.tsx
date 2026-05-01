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
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been removed or the link is wrong.
        </p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
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
        <OnboardingDialog
          onClose={() => window.history.back()}
          onComplete={(p) => setProfile(p)}
          defaultGoal="register"
        />
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
        { label: "Journey", to: "/journey" },
        { label: `Step ${idx + 1}` },
      ]}
    >
      {justDone && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center pt-24 animate-in fade-in zoom-in-95">
          <div className="rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-leaf-foreground shadow-glow check-pop inline-flex items-center gap-2 border border-leaf/30 backdrop-blur-md">
            <Check className="h-5 w-5" /> Step Completed! +{step.weight}% Readiness
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        {/* --- HERO SECTION --- */}
        <header className="relative space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
              Phase: {step.phase}
            </div>
            <div className="h-px flex-1 bg-gradient-to-right from-border to-transparent" />
            <div className="text-xs font-medium text-muted-foreground tabular-nums">
              Step {idx + 1} of {FIRST_TIME_VOTER_JOURNEY.length}
            </div>
          </div>

          <div className="relative group">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent leading-[1.1]">
              {step.title}
              <span className="inline-block ml-3 animate-bounce-subtle text-4xl sm:text-5xl">
                {idx === 3 ? "📝" : "✨"}
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
              {step.shortDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-card/40 border border-border shadow-soft backdrop-blur-md">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{step.estimate}</span>
            </div>
            {step.deadline && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-saffron/10 border border-saffron/20 text-saffron-foreground shadow-soft backdrop-blur-md">
                <CalendarDays className="h-4 w-4" />
                <span className="text-sm font-semibold">{step.deadline}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-leaf/10 border border-leaf/20 text-leaf shadow-soft backdrop-blur-md">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">ECI Verified</span>
            </div>
          </div>
        </header>

        {/* --- MAIN BENTO CONTENT --- */}
        <main className="grid gap-6 lg:grid-cols-12">
          {/* Detailed Instructions (Large Bento) */}
          <section className="lg:col-span-8 group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="h-full rounded-[2.5rem] border border-border bg-card/60 p-8 sm:p-10 shadow-soft backdrop-blur-xl relative overflow-hidden transition-all duration-500 hover:border-primary/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Detailed Blueprint
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-lg sm:text-xl leading-relaxed text-foreground/90 font-medium">
                  {step.longDesc}
                </p>

                {step.why && (
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 transition-colors group-hover:bg-primary/[0.08]">
                    <div className="flex items-center gap-2 text-sm font-bold text-primary mb-3">
                      <Lightbulb className="h-4 w-4" /> The "Why" Factor
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed text-foreground/70">
                      {step.why}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Sidebar Area (Nudge + Links) */}
          <aside className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            <div className="rounded-[2.5rem] border border-border bg-card/40 p-8 shadow-soft backdrop-blur-xl space-y-6">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Action Center
                </h3>
                <p className="text-sm text-foreground/60">
                  Tools to help you finish this step faster.
                </p>
              </div>

              <div className="space-y-3">
                {nextSuggested && nextSuggested.id !== step.id && (
                  <Link
                    to="/step/$stepId"
                    params={{ stepId: nextSuggested.id }}
                    className="block group/link rounded-3xl border border-primary/30 bg-primary/5 p-5 transition-all hover:bg-primary/10 hover:border-primary hover:shadow-glow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        Up Next
                      </span>
                      <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover/link:translate-x-1" />
                    </div>
                    <div className="font-bold text-base truncate group-hover/link:text-primary transition-colors">
                      {nextSuggested.title}
                    </div>
                  </Link>
                )}

                <Link
                  to="/assistant"
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-background/50 border border-border hover:border-primary/40 hover:bg-muted transition-all group/sublink"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Stuck? Ask AI</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover/sublink:opacity-100 transition-all" />
                </Link>

                <Link
                  to="/timeline"
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-background/50 border border-border hover:border-primary/40 hover:bg-muted transition-all group/sublink"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Full Road Map</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover/sublink:opacity-100 transition-all" />
                </Link>
              </div>
            </div>

            {step.consequence && (
              <div className="rounded-[2.5rem] border border-saffron/30 bg-saffron/5 p-8 shadow-soft backdrop-blur-md">
                <div className="flex items-center gap-2 text-sm font-bold text-saffron mb-4">
                  <AlertTriangle className="h-4 w-4" /> Crucial Warning
                </div>
                <p className="text-sm leading-relaxed text-foreground/80 font-medium">
                  {step.consequence}
                </p>
              </div>
            )}
          </aside>

          {/* Documents & Checklist Row */}
          {((step.documents && step.documents.length > 0) ||
            (step.checklist && step.checklist.length > 0)) && (
            <section className="lg:col-span-12 grid gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              {step.documents && step.documents.length > 0 && (
                <div className="rounded-[2.5rem] border border-border bg-card/40 p-8 shadow-soft backdrop-blur-xl">
                  <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground mb-6 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Verification Vault
                  </h3>
                  <div className="grid gap-3">
                    {step.documents.map((d: string) => (
                      <div
                        key={d}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-background/40 border border-border/50 transition-colors hover:border-primary/30"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-foreground/80">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step.checklist && step.checklist.length > 0 && (
                <div className="rounded-[2.5rem] border border-border bg-card/40 p-8 shadow-soft backdrop-blur-xl">
                  <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground mb-6">
                    Execution Checklist
                  </h3>
                  <div className="space-y-4">
                    {step.checklist.map((item: string) => (
                      <Checkable key={item} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* FAQs (Full Width Bento) */}
          {step.faqs && step.faqs.length > 0 && (
            <section className="lg:col-span-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
              <div className="rounded-[2.5rem] border border-border bg-card/40 p-8 sm:p-10 shadow-soft backdrop-blur-xl">
                <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground mb-8 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary" /> Knowledge Base
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {step.faqs.map((f: { q: string; a: string }) => (
                    <details
                      key={f.q}
                      className="group rounded-[2rem] border border-border/50 bg-background/30 p-6 transition-all hover:border-primary/40 open:bg-background/50 open:ring-1 open:ring-primary/20"
                    >
                      <summary className="cursor-pointer text-[15px] font-bold list-none flex items-center justify-between gap-4">
                        {f.q}
                        <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center group-open:rotate-90 transition-transform">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </summary>
                      <p className="mt-4 text-[14px] text-muted-foreground leading-relaxed font-medium">
                        {f.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        {/* --- FLOATING COMMAND BAR --- */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl animate-in slide-in-from-bottom-8 duration-1000">
          <div className="rounded-full border border-white/10 bg-black/80 backdrop-blur-2xl p-2 shadow-2xl flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-1 pl-2">
              {prev ? (
                <Link
                  to="/step/$stepId"
                  params={{ stepId: prev.id }}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Previous step"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              ) : (
                <div className="w-10" />
              )}
            </div>

            <div className="flex flex-1 items-center gap-2 justify-center">
              {step.action?.href && (
                <a
                  href={step.action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all border border-white/5"
                >
                  Visit Portal <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                onClick={markDone}
                disabled={justDone}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-[0.1em] transition-all duration-500 shadow-glow",
                  isDone || justDone
                    ? "bg-leaf/20 text-leaf border border-leaf/30 cursor-default"
                    : "bg-leaf text-leaf-foreground hover:scale-[1.05] active:scale-95 pulse-ring",
                )}
              >
                {isDone || justDone ? (
                  <>
                    <Check className="h-4 w-4" /> Finalized
                  </>
                ) : (
                  "Finalize Step"
                )}
              </button>
            </div>

            <div className="flex items-center gap-1 pr-2">
              {next ? (
                <Link
                  to="/step/$stepId"
                  params={{ stepId: next.id }}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Next step"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  to="/done"
                  className="w-10 h-10 rounded-full bg-leaf flex items-center justify-center text-leaf-foreground hover:scale-110 transition-all"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <AssistantFab />
    </PageShell>
  );
}

function Checkable({ item }: { item: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <button
      onClick={() => setChecked((v) => !v)}
      className={cn(
        "flex items-center gap-4 w-full p-4 rounded-3xl border transition-all text-left group",
        checked
          ? "border-leaf/40 bg-leaf/10"
          : "border-border bg-background/50 hover:border-primary/40 hover:bg-muted",
      )}
    >
      <div
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all",
          checked ? "border-leaf bg-leaf shadow-glow" : "border-muted-foreground/30 bg-background",
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 text-leaf-foreground" strokeWidth={3} />}
      </div>
      <span
        className={cn(
          "text-base font-semibold transition-all",
          checked
            ? "line-through text-muted-foreground"
            : "text-foreground/90 group-hover:text-primary",
        )}
      >
        {item}
      </span>
    </button>
  );
}
