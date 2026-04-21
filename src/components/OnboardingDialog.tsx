import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, MapPin, User, Sparkles, ShieldCheck } from "lucide-react";
import { saveProfile, INDIAN_STATES, type UserProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface Props {
  onComplete?: (p: UserProfile) => void;
  defaultGoal?: string;
}

export function OnboardingDialog({ onComplete, defaultGoal = "register" }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<number | "">("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [firstTime, setFirstTime] = useState<boolean | null>(null);

  const canNext =
    (step === 0 && typeof age === "number" && age >= 14 && age <= 120) ||
    (step === 1 && state && city.trim().length >= 2) ||
    (step === 2 && firstTime !== null);

  function finish() {
    if (typeof age !== "number" || !state || !city || firstTime === null) return;
    const profile: UserProfile = {
      age,
      state,
      city: city.trim(),
      firstTimeVoter: firstTime,
      createdAt: new Date().toISOString(),
    };
    saveProfile(profile);
    onComplete?.(profile);
    navigate({ to: "/dashboard" });
    void defaultGoal;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card shadow-glow overflow-hidden">
        {/* Progress */}
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-leaf transition-all duration-500"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of 3</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-leaf" /> Stays on your device
            </span>
          </div>

          {step === 0 && (
            <StepShell
              icon={<User className="h-5 w-5" />}
              title="How old are you?"
              hint="We use this to check if you're voting-eligible."
            >
              <input
                type="number"
                inputMode="numeric"
                min={14}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                placeholder="e.g. 19"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-2xl font-semibold tracking-tight outline-none focus:border-primary"
                autoFocus
              />
              {typeof age === "number" && age < 18 && (
                <p className="mt-3 text-sm text-saffron-foreground bg-saffron/15 rounded-xl px-3 py-2">
                  You're not 18 yet — but you can pre-register and we'll guide you when you turn 18.
                </p>
              )}
            </StepShell>
          )}

          {step === 1 && (
            <StepShell
              icon={<MapPin className="h-5 w-5" />}
              title="Where do you live?"
              hint="Your journey changes based on your state's election timeline."
            >
              <div className="space-y-3">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
                >
                  <option value="">Select your state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City / town (e.g. Bengaluru)"
                  maxLength={60}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
                />
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              icon={<Sparkles className="h-5 w-5" />}
              title="Is this your first time voting?"
              hint="First-time voters get extra guidance for registration."
            >
              <div className="grid grid-cols-2 gap-3">
                <ChoiceCard
                  selected={firstTime === true}
                  onClick={() => setFirstTime(true)}
                  emoji="🌱"
                  label="Yes, first time"
                />
                <ChoiceCard
                  selected={firstTime === false}
                  onClick={() => setFirstTime(false)}
                  emoji="🗳️"
                  label="I've voted before"
                />
              </div>
            </StepShell>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={() => (step === 2 ? finish() : setStep((s) => s + 1))}
              disabled={!canNext}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-all",
                "hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
              )}
            >
              {step === 2 ? "Build my journey" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepShell({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary">
        {icon}
      </div>
      <h2 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ChoiceCard({
  selected,
  onClick,
  emoji,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border-2 bg-background px-4 py-5 text-sm font-medium transition-all",
        selected
          ? "border-primary bg-primary-soft shadow-glow scale-[1.02]"
          : "border-border hover:border-primary/40",
      )}
    >
      <span className="text-3xl">{emoji}</span>
      {label}
    </button>
  );
}
