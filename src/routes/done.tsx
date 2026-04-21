import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Share2, RotateCcw, ArrowRight, MapPin, PartyPopper, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ReadinessRing } from "@/components/ReadinessRing";
import { Confetti } from "@/components/Confetti";
import { FIRST_TIME_VOTER_JOURNEY, calcReadiness } from "@/lib/journey";
import { useProfile, getCompleted, setCompleted as persistCompleted } from "@/lib/storage";
import { resetMilestones } from "@/lib/milestones";

export const Route = createFileRoute("/done")({
  head: () => ({
    meta: [
      { title: "You're ready to vote 🎉 — VoteRoute" },
      { name: "description", content: "Celebration: you've completed your voting journey. Share to encourage friends." },
      { property: "og:title", content: "I'm ready to vote 🎉" },
      { property: "og:description", content: "I just completed my full voting journey on VoteRoute — start yours." },
    ],
  }),
  component: DonePage,
});

function DonePage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [completed, setCompleted] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    setCompleted(getCompleted());
    // brief delay so the user sees the page settle, then celebrate
    const t = setTimeout(() => setCelebrate(true), 250);
    return () => clearTimeout(t);
  }, []);

  const score = calcReadiness(completed, FIRST_TIME_VOTER_JOURNEY);
  const allDone = score === 100;

  async function share() {
    const city = profile?.city ?? "my city";
    const text = `I just completed my voting journey on VoteRoute — fully prepared to vote in ${city}. Start yours →`;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      try {
        await (navigator as Navigator).share({ title: "I'm ready to vote", text, url });
        toast.success("Shared", { description: "Thanks for spreading civic awareness." });
        return;
      } catch {
        // fall through
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      toast.success("Copied to clipboard", { description: "Paste it anywhere to share." });
      setTimeout(() => setCopied(false), 2200);
    }
  }

  function restart() {
    persistCompleted([]);
    resetMilestones();
    setCompleted([]);
    toast("Journey reset", { description: "Ready for the next election." });
    navigate({ to: "/dashboard" });
  }

  if (!allDone) {
    return (
      <PageShell crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Completion" }]}>
        <div className="rounded-3xl border border-dashed border-border p-10 text-center">
          <PartyPopper className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-3 text-xl font-semibold">Not quite there yet — {score}% ready</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
            Finish every step in your journey to unlock your celebration screen.
          </p>
          <Link
            to="/dashboard"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Back to dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Completion" }]}>
      <Confetti active={celebrate} />
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-glow">
          <div className="relative bg-gradient-to-br from-primary via-primary to-leaf p-8 sm:p-10 text-center text-primary-foreground">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary-foreground/20 backdrop-blur-sm pulse-ring">
              <PartyPopper className="h-10 w-10" />
            </div>
            <h1 className="mt-5 text-[1.75rem] sm:text-4xl font-bold tracking-tight leading-tight">
              You are fully prepared to vote
            </h1>
            <p className="mt-2 text-sm opacity-90">
              You're doing your civic duty — respect.
            </p>
            {profile && (
              <p className="mt-3 text-xs opacity-90 inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {profile.city}, {profile.state}
              </p>
            )}
            <div className="mt-6 inline-block rounded-2xl bg-primary-foreground/15 backdrop-blur-sm p-4">
              <ReadinessRing score={100} size={140} stroke={12} label="Readiness" sublabel="Complete" />
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-3">
            <div className="rounded-2xl border border-leaf/30 bg-leaf/5 p-4 text-sm text-foreground/80 leading-relaxed">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-leaf shrink-0 mt-0.5" />
                <p>
                  Save this page or take a screenshot. On election day, head to your polling booth between
                  <span className="font-medium"> 7 AM – 6 PM </span>
                  with your Voter ID or any ECI-approved photo identification.
                </p>
              </div>
            </div>

            <button
              onClick={share}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-glow transition-all"
            >
              <Share2 className="h-4 w-4" />
              {copied ? "Copied to clipboard" : "Share my voting journey"}
            </button>

            <Link
              to="/timeline"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              View my timeline
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={restart}
              className="inline-flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Start over for the next election
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
