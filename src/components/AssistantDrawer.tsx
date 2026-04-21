import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

const STARTERS = [
  "What documents do I need?",
  "When is the registration deadline?",
  "Can I vote without a Voter ID?",
  "What is VVPAT?",
];

const CANNED: Record<string, string> = {
  document:
    "You'll need: a recent passport-size photo, an age proof (birth certificate / passport / school certificate) and an address proof (utility bill / rental agreement / bank statement).",
  deadline:
    "Most voter rolls close ~30 days before an election. Check your local Electoral Office for the exact cut-off — VoteRoute will show your deadline once you set your location.",
  vvpat:
    "VVPAT (Voter-Verifiable Paper Audit Trail) prints a slip showing your vote for 7 seconds so you can confirm it was recorded correctly before it drops into a sealed box.",
  "voter id":
    "On polling day you can also use Aadhaar, Passport, Driving Licence, PAN, or any of the 12 ECI-approved photo IDs if your name is on the roll.",
};

function answer(q: string): string {
  const lower = q.toLowerCase();
  for (const k in CANNED) if (lower.includes(k)) return CANNED[k];
  return "Great question! In the full build I'll connect to an AI assistant. For now, follow the steps in your journey — each one explains exactly what to do next.";
}

export function AssistantDrawer() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi! I'm your voting assistant. Ask me anything about the process — or pick a quick question below.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages, open]);

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "assistant", text: answer(text) }]);
    setInput("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-glow hover:scale-105 transition-transform"
      >
        <MessageCircle className="h-4 w-4" />
        Ask assistant
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <div
          className={cn(
            "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-card shadow-2xl transition-transform",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Smart assistant</div>
                <div className="text-xs text-muted-foreground">Quick answers, no jargon</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
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
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40"
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
                placeholder="Ask anything…"
                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary/60"
              />
              <button
                type="submit"
                className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
