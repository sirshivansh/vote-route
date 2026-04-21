import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Compass } from "lucide-react";
import { GOALS, type GoalId } from "@/lib/journey";
import { AppHeader } from "@/components/AppHeader";
import { AssistantDrawer } from "@/components/AssistantDrawer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoteRoute — Your Personal Voting Journey Assistant" },
      {
        name: "description",
        content:
          "VoteRoute is a step-by-step GPS for voting. From registration to election day — know exactly what to do next.",
      },
      { property: "og:title", content: "VoteRoute — Your Personal Voting Journey Assistant" },
      {
        property: "og:description",
        content: "Don't just understand elections — complete your voting journey, step by step.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 pb-24">
        {/* Hero */}
        <section className="relative pt-10 sm:pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-leaf animate-pulse" />
            Trusted by first-time voters
          </div>
          <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight">
            Your <span className="text-primary">GPS</span> for voting.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-muted-foreground">
            Don't just read about elections. <span className="text-foreground font-medium">Complete</span> your
            voting journey — guided, personalised, step by step.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 border border-border">
              <ShieldCheck className="h-3.5 w-3.5 text-leaf" /> Official sources
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 border border-border">
              <MapPin className="h-3.5 w-3.5 text-saffron" /> Location-aware
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 border border-border">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Plain-language
            </span>
          </div>
        </section>

        {/* Goal selection */}
        <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-10 shadow-soft backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Compass className="h-3.5 w-3.5" /> Step 1 of your journey
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">What do you want to do?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a goal and we'll build a personalised journey for you.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {GOALS.map((g) => (
              <GoalCard key={g.id} id={g.id} emoji={g.emoji} title={g.title} subtitle={g.subtitle} />
            ))}
          </div>
        </section>

        {/* Why */}
        <section className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            { n: "01", t: "Personalised journey", d: "Steps adapt to your goal, location and progress." },
            { n: "02", t: "Visual timeline", d: "See where you are, what's next, and every deadline." },
            { n: "03", t: "Smart assistant", d: "Ask anything — get plain answers, not legal jargon." },
          ].map((f) => (
            <div key={f.n} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="text-xs font-mono text-primary">{f.n}</div>
              <div className="mt-1 text-base font-semibold">{f.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.d}</div>
            </div>
          ))}
        </section>
      </main>

      <AssistantDrawer />
    </div>
  );
}

function GoalCard({ id, emoji, title, subtitle }: { id: GoalId; emoji: string; title: string; subtitle: string }) {
  const enabled = id === "register";
  return (
    <Link
      to="/journey"
      search={{ goal: id }}
      className={
        "group relative flex items-start gap-4 rounded-2xl border border-border bg-background p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
      }
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-2xl">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{title}</span>
          {!enabled && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              Demo: register flow
            </span>
          )}
        </div>
        <div className="mt-0.5 text-sm text-muted-foreground">{subtitle}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-1" />
    </Link>
  );
}
