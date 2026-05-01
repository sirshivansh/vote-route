import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  ArrowRight,
  RotateCcw,
  Trash2,
  BrainCircuit,
  MessageSquareQuote,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useProfile, getCompleted } from "@/lib/storage";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { getNextStep } from "@/lib/journey";
import { cn } from "@/lib/utils";
import type { Decision } from "@/ai/predictor";
import { logInteraction, initSession } from "@/services/firebase";
import { StatusPanel } from "@/components/StatusPanel";
import { MetricsPanel } from "@/components/MetricsPanel";
import { logger } from "@/utils/logger";

import AIWorker from "../ai/ai.worker.ts?worker";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Voting Assistant — VoteRoute" },
      {
        name: "description",
        content: "Ask anything about voting — get plain English answers, instantly.",
      },
    ],
  }),
  component: AssistantPage,
});

interface Msg {
  role: "user" | "assistant";
  text: string;
  ts: number;
  decision?: Decision;
}

const STORAGE_KEY = "vja:assistant-history";

const SUGGESTED = [
  "What documents do I need to register?",
  "When is the registration deadline?",
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
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSendRef = useRef(0);

  useEffect(() => {
    setCompleted(getCompleted());
    setMessages(loadHistory());

    // Initialize Firebase Session
    initSession().then(() => {
      logger.info("☁️ System", "Assistant ready for interaction");
    });
  }, []);

  useEffect(() => {
    saveHistory(messages);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const nextStep = useMemo(() => getNextStep(completed), [completed]);

  function speakText(text: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      logger.info("☁️ System", "Web Speech API activated");
    } else {
      logger.error("☁️ System", "Web Speech API not supported in this browser");
    }
  }

  function sanitizeInput(str: string) {
    return str.replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[tag] || tag,
    );
  }

  async function send(rawText: string) {
    const text = sanitizeInput(rawText);
    if (!text.trim() || isThinking) return;

    // Rate limiting: 1 query per second
    const now = Date.now();
    if (now - lastSendRef.current < 1000) return;
    lastSendRef.current = now;

    setIsThinking(true);
    const userMsg: Msg = { role: "user", text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    const startTime = performance.now();

    try {
      // AI DECISION ENGINE VIA WEB WORKER (Efficiency & Non-blocking)
      const decision = await new Promise<Decision>((resolve, reject) => {
        const aiWorker = new AIWorker();

        const messageId = Date.now().toString();

        aiWorker.onmessage = (e) => {
          if (e.data.id === messageId) {
            if (e.data.error) reject(new Error(e.data.error));
            else resolve(e.data.decision);
            aiWorker.terminate(); // Clean up
          }
        };

        aiWorker.onerror = (e) => {
          reject(new Error("Web Worker failed to load or crashed: " + e.message));
          aiWorker.terminate();
        };

        aiWorker.postMessage({
          id: messageId,
          query: text,
          context: {
            nextStep,
            city: profile?.city,
            completedCount: completed.length,
            firstTimeVoter: profile?.firstTimeVoter,
            apiKey: import.meta.env.VITE_GEMINI_API_KEY,
          },
        });
      });

      const duration = performance.now() - startTime;
      window.dispatchEvent(new CustomEvent("ai-perf", { detail: { duration } }));

      const reply: Msg = {
        role: "assistant",
        text: decision.action,
        decision,
        ts: Date.now() + 1,
      };

      setMessages((m) => [...m, reply]);

      // FIREBASE PERSISTENCE
      await logInteraction(text, decision);
    } catch (error) {
      logger.error("☁️ System", "Assistant query failed", error);
      const errorReply: Msg = {
        role: "assistant",
        text: "I encountered an error while processing your request. Please try again.",
        ts: Date.now() + 1,
      };
      setMessages((m) => [...m, errorReply]);
    } finally {
      setIsThinking(false);
      // Accessibility Focus Management
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function clearHistory() {
    setMessages([]);
    saveHistory([]);
    logger.info("☁️ System", "History cleared");
    inputRef.current?.focus();
  }

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
    <PageShell crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Assistant" }]}>
      <StatusPanel />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Chat */}
        <div className="flex flex-col rounded-3xl border border-border bg-card shadow-soft overflow-hidden min-h-[70vh]">
          <header className="flex items-center justify-between border-b border-border px-5 py-4 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary ring-4 ring-primary-soft/30">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Smart Voting Assistant</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ECI-Aligned Logic · Context-Aware
                </div>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-6 space-y-6"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.length === 0 && (
              <div className="rounded-2xl bg-muted/20 border border-dashed border-border p-8 text-center max-w-md mx-auto my-12">
                <div className="w-12 h-12 rounded-full bg-primary-soft text-primary mx-auto grid place-items-center mb-4">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold">How can I help you today?</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Ask about voter registration, documents, or your personalized next steps. I use
                  structured logic to guide you.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-2">
                  {SUGGESTED.slice(0, 3).map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs text-left p-3 rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-primary-soft/30 transition-all text-muted-foreground hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col gap-2 animate-fade-in",
                  m.role === "user" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted/80 text-foreground rounded-bl-sm border border-border pr-10",
                  )}
                >
                  {m.text}
                  {m.role === "assistant" && (
                    <button
                      onClick={() => speakText(m.text)}
                      className="absolute right-2 top-2 p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-background/80"
                      aria-label="Read aloud"
                      title="Read aloud"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {m.decision && (
                  <div className="max-w-[85%] rounded-xl border border-border bg-background/50 p-3 space-y-2 animate-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <MessageSquareQuote className="w-3 h-3" /> Logical Reasoning
                    </div>
                    <div className="text-xs text-muted-foreground italic leading-relaxed">
                      "{m.decision.explanation}"
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Confidence: {(m.decision.confidence * 100).toFixed(0)}%
                        </span>
                        {m.decision.engine === "cloud" && (
                          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded animate-pulse">
                            Gemini 2.0 Powered
                          </span>
                        )}
                      </div>
                      {m.decision.suggestedSteps && m.decision.suggestedSteps.length > 0 && (
                        <Link
                          to="/step/$stepId"
                          params={{ stepId: m.decision.suggestedSteps[0] }}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                        >
                          View Step <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground italic animate-pulse">
                <BrainCircuit className="h-3 w-3" /> AI Decision Engine is processing...
              </div>
            )}
          </div>

          <div className="border-t border-border bg-background/50 backdrop-blur-sm px-4 py-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={isThinking}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary-soft/50 transition-all disabled:opacity-50"
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
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about registration, deadlines, or your next step..."
                disabled={isThinking}
                className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isThinking || !input.trim()}
                className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <MetricsPanel />

          {nextStep && (
            <section className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit className="w-12 h-12" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-primary font-bold">
                Your Next Milestone
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground">{nextStep.title}</div>
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {nextStep.shortDesc}
              </p>
              <Link
                to="/step/$stepId"
                params={{ stepId: nextStep.id }}
                className="mt-4 w-full justify-center inline-flex items-center gap-2 text-xs font-bold bg-primary text-primary-foreground py-2.5 rounded-xl hover:bg-primary/90 transition-all"
              >
                Start Milestone <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Privacy & Security
            </h3>
            <div className="mt-4 space-y-3">
              <div className="flex gap-3">
                <RotateCcw className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Anonymous session tracking via <strong>Firebase Auth</strong> ensures your
                  identity remains private.
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  All interactions are logged to <strong>Firestore</strong> for system quality
                  assurance and ECI alignment.
                </div>
              </div>
            </div>
          </section>

          <div className="px-2">
            <Link
              to="/help"
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              Browse Help Center <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
