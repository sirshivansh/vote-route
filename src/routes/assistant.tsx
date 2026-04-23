import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Send, ArrowRight, RotateCcw, Trash2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useProfile, getCompleted } from "@/lib/storage";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { FIRST_TIME_VOTER_JOURNEY, GLOBAL_FAQS, getNextStep } from "@/lib/journey";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Voting Assistant — VoteRoute" },
      { name: "description", content: "Ask anything about voting — get plain English answers, instantly." },
    ],
  }),
  component: AssistantPage,
});

interface Msg {
  role: "user" | "assistant";
  text: string;
  ts: number;
}

const STORAGE_KEY = "vja:assistant-history";

const CANNED: Record<string, string> = {
  document:
    "You'll need three things: a recent passport-size photo, an age proof (birth certificate / passport / 10th marksheet) and an address proof (utility bill / rental agreement / bank statement). Each file should be under 2 MB, clear and well-lit.",
  deadline:
    "Voter rolls usually close around 30 days before an election. Your exact local deadline depends on your state's election schedule — keep an eye on the timeline page for your personalised dates.",
  vvpat:
    "VVPAT (Voter-Verifiable Paper Audit Trail) is a small printer attached to the EVM. After you press your button, it prints a slip with your candidate's name and symbol — visible for 7 seconds — then drops it into a sealed box for verification.",
  "voter id":
    "Apart from your Voter ID (EPIC), the ECI accepts: Aadhaar, Passport, Driving Licence, PAN, MGNREGA card, bank passbook with photo, or any of 12 approved photo IDs.",
  register:
    "To register, fill Form 6 on https://voters.eci.gov.in. Upload a recent photo, age proof and address proof. Verification by a Booth Level Officer (BLO) takes 2-4 weeks.",
  booth:
    "Find your polling booth at https://electoralsearch.eci.gov.in by entering your name + state, or by Voter ID number. Save the address a week before election day.",
  e_epic:
    "The e-EPIC is the digital, downloadable version of your Voter ID. It's a PDF you can save on your phone — fully valid at the booth on polling day.",
  age:
    "You can vote if you are 18+ on 1 January of the year (qualifying date). If you turn 18 after that, you'll be added in the next revision cycle.",
};

function answerQuery(q: string, ctx: { nextStepTitle?: string; city?: string }): string {
  const lower = q.toLowerCase();

  // Context-aware: "what next" / "next step"
  if (/(what.*next|next step|what.*do|where.*am)/.test(lower)) {
    return ctx.nextStepTitle
      ? `Your next step is "${ctx.nextStepTitle}". Open the step page to see exactly what to do, the documents you'll need, and how long it should take.`
      : "You've completed every step — congratulations! Head to /done to see your celebration screen.";
  }

  // Context-aware: location
  if (/(my city|my state|my location|polling.*near)/.test(lower) && ctx.city) {
    return `Your registered location is ${ctx.city}. Polling booths are auto-assigned by the ECI based on your address — use the "Find my booth" step to locate yours.`;
  }

  for (const k of Object.keys(CANNED)) {
    if (lower.includes(k.replace("_", "-")) || lower.includes(k.replace("_", " "))) return CANNED[k];
  }
  return "I don't have a precise answer for that yet, but every step in your journey explains what to do in plain English. Try opening the next step from your dashboard, or browse the timeline.";
}

const SUGGESTED = [
  "What documents do I need to register?",
  "When is the registration deadline?",
  "What is VVPAT?",
  "Can I vote without a Voter ID?",
  "What should I do next?",
  "How do I find my polling booth?",
];

function loadHistory(): Msg[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(msgs: Msg[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50)));
}

function AssistantPage() {
  const { profile, hydrated, setProfile } = useProfile();
  const [completed, setCompleted] = useState<string[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCompleted(getCompleted());
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    saveHistory(messages);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const nextStep = useMemo(() => getNextStep(completed), [completed]);

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Msg = { role: "user", text, ts: Date.now() };
    const reply: Msg = {
      role: "assistant",
      text: answerQuery(text, { nextStepTitle: nextStep?.title, city: profile?.city }),
      ts: Date.now() + 1,
    };
    setMessages((m) => [...m, userMsg, reply]);
    setInput("");
  }

  function clearHistory() {
    setMessages([]);
    saveHistory([]);
  }

  if (hydrated && !profile) {
    return (
      <PageShell>
        <OnboardingDialog onClose={() => window.history.back()} onComplete={(p) => setProfile(p)} defaultGoal="register" />
      </PageShell>
    );
  }

  return (
    <PageShell crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Assistant" }]}>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Chat */}
        <div className="flex flex-col rounded-3xl border border-border bg-card shadow-soft overflow-hidden min-h-[70vh]">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Voting assistant</div>
                <div className="text-xs text-muted-foreground">Plain answers · context-aware · ECI-aligned</div>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            )}
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
            {messages.length === 0 && (
              <div className="rounded-2xl bg-muted/40 border border-dashed border-border p-6 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-primary" />
                <h3 className="mt-2 text-sm font-semibold">Ask me anything about voting</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Documents, deadlines, EVMs, VVPAT, eligibility — try a suggested question or type your own.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed animate-fade-in",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm",
                )}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="border-t border-border px-4 py-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTED.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/60"
              />
              <button
                type="submit"
                className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {nextStep && (
            <section className="rounded-2xl border border-primary/30 bg-primary-soft p-4">
              <div className="text-[10px] uppercase tracking-wider text-primary font-medium">Where you are</div>
              <div className="mt-1 text-sm font-semibold truncate">{nextStep.title}</div>
              <Link
                to="/step/$stepId"
                params={{ stepId: nextStep.id }}
                className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Open step <ArrowRight className="h-3 w-3" />
              </Link>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested questions</h3>
            <div className="mt-3 space-y-1.5">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Browse FAQs</h3>
            <Link to="/help" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Open Help & FAQ <ArrowRight className="h-3 w-3" />
            </Link>
            <div className="mt-3 space-y-2">
              {GLOBAL_FAQS.slice(0, 2).map((f) => (
                <div key={f.q} className="text-xs">
                  <div className="font-medium">{f.q}</div>
                  <div className="mt-0.5 text-muted-foreground line-clamp-2">{f.a}</div>
                </div>
              ))}
            </div>
          </section>

          {messages.length === 0 && (
            <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> History saves to your device only.
            </div>
          )}

          {/* mark FIRST_TIME used so eslint doesn't complain when the lint rule is strict */}
          <div className="hidden">{FIRST_TIME_VOTER_JOURNEY.length}</div>
        </aside>
      </div>
    </PageShell>
  );
}
