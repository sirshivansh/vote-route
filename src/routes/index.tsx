import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Compass, Gauge, Heart } from "lucide-react";
import { GOALS, type GoalId } from "@/lib/journey";
import { AppHeader } from "@/components/AppHeader";
import { AssistantFab } from "@/components/AssistantFab";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { useProfile, clearProfile } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoteRoute — Your Personal Voting Journey Assistant" },
      {
        name: "description",
        content:
          "VoteRoute is the GPS for your vote. From registration to election day — personalised, step by step, in plain English.",
      },
      { property: "og:title", content: "VoteRoute — The GPS for your vote" },
      {
        property: "og:description",
        content: "Don't just understand elections — complete your voting journey, step by step.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { profile, hydrated, setProfile } = useProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingGoal, setPendingGoal] = useState<GoalId>("register");

  function pickGoal(goal: GoalId) {
    setPendingGoal(goal);
    if (profile) {
      if (goal === "register") {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/journey", search: { goal } });
      }
    } else {
      setShowOnboarding(true);
    }
  }

  function handleReset() {
    clearProfile();
    setProfile(null);
  }

  return (
    <div className="min-h-screen pb-12">
      <AppHeader profile={profile} onReset={handleReset} />

      <main className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="relative pt-10 sm:pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-leaf animate-pulse" />
            Built for first-time voters
          </div>
          <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight">
            The <span className="text-primary">GPS</span> for your vote.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-muted-foreground">
            Don't just read about elections.{" "}
            <span className="text-foreground font-medium">Complete</span> your voting journey —
            personalised, step by step, in plain English.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => (profile ? navigate({ to: "/dashboard" }) : setShowOnboarding(true))}
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-glow hover:scale-[1.02] transition-transform"
            >
              {profile ? "Open my dashboard" : "Start my journey"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <span className="text-xs text-muted-foreground">⏱️ Takes 60 seconds to personalise</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <Badge icon={<ShieldCheck className="h-3.5 w-3.5 text-leaf" />}>ECI-aligned guidance</Badge>
            <Badge icon={<MapPin className="h-3.5 w-3.5 text-saffron" />}>Location-aware</Badge>
            <Badge icon={<Gauge className="h-3.5 w-3.5 text-primary" />}>Readiness score</Badge>
            <Badge icon={<Sparkles className="h-3.5 w-3.5 text-primary" />}>Plain language</Badge>
          </div>
        </section>

        {/* Goal selection */}
        <section className="rounded-3xl border border-border bg-card/70 p-6 sm:p-10 shadow-soft backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Compass className="h-3.5 w-3.5" /> Step 1 of your journey
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
            What do you want to do?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a goal — we'll build your personalised journey instantly.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {GOALS.map((g) => (
              <GoalCard key={g.id} {...g} onPick={() => pickGoal(g.id)} />
            ))}
          </div>
        </section>

        {/* Why */}
        <section className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            { n: "01", t: "Personalised journey", d: "Steps adapt to your age, location and progress." },
            { n: "02", t: "Readiness score", d: "Watch your 0–100 score climb as you complete steps." },
            { n: "03", t: "Smart assistant", d: "Ask anything — get plain answers, not legal jargon." },
          ].map((f) => (
            <div key={f.n} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="text-xs font-mono text-primary">{f.n}</div>
              <div className="mt-1 text-base font-semibold">{f.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.d}</div>
            </div>
          ))}
        </section>

        {/* Trust strip */}
        <section className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 p-5 text-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-leaf/15 text-leaf">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">Based on Election Commission of India guidelines</div>
              <div className="text-xs text-muted-foreground">No misinformation. Verified sources only.</div>
            </div>
          </div>
          <a
            href="https://eci.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Visit eci.gov.in →
          </a>
        </section>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Made with <Heart className="inline h-3 w-3 -mt-0.5 text-saffron" /> for India's first-time voters
        </p>
      </main>

      {hydrated && showOnboarding && (
        <OnboardingDialog
          defaultGoal={pendingGoal}
          onComplete={(p) => {
            setProfile(p);
            setShowOnboarding(false);
          }}
        />
      )}

      <AssistantFab />
    </div>
  );
}

function Badge({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 border border-border">
      {icon} {children}
    </span>
  );
}

function GoalCard({
  emoji,
  title,
  subtitle,
  onPick,
  id,
}: {
  id: GoalId;
  emoji: string;
  title: string;
  subtitle: string;
  onPick: () => void;
}) {
  const recommended = id === "register";
  return (
    <button
      onClick={onPick}
      className="group relative flex items-start gap-4 rounded-2xl border border-border bg-background p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-2xl">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold">{title}</span>
          {recommended && (
            <span className="rounded-full bg-leaf/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-leaf">
              Recommended
            </span>
          )}
        </div>
        <div className="mt-0.5 text-sm text-muted-foreground">{subtitle}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-1" />
    </button>
  );
}
