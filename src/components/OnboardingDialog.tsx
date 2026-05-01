import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowLeft, MapPin, User, Sparkles, ShieldCheck } from "lucide-react";
import { saveProfile, INDIAN_STATES, type UserProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface Props {
  onComplete?: (p: UserProfile) => void;
  defaultGoal?: string;
  onClose?: () => void;
}

export function OnboardingDialog({ onComplete, defaultGoal = "register", onClose }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<number | "">("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [firstTime, setFirstTime] = useState<boolean | null>(null);

  function handleBack() {
    if (step > 0) {
      setStep((s) => Math.max(0, s - 1));
      return;
    }

    if (onClose) {
      onClose();
      return;
    }

    navigate({ to: "/" });
  }

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={t("common:onboarding.dialogTitle", { defaultValue: "Set up your profile" })}
    >
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card shadow-glow overflow-hidden">
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-leaf transition-all duration-500"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground gap-3">
            <span>{t("common:onboarding.stepCounter", { current: step + 1, total: 3 })}</span>
            <span className="inline-flex items-center gap-1 text-right">
              <ShieldCheck className="h-3 w-3 text-leaf" /> {t("common:onboarding.staysOnDevice")}
            </span>
          </div>

          {step === 0 && (
            <StepShell
              icon={<User className="h-5 w-5" />}
              title={t("common:onboarding.ageTitle")}
              hint={t("common:onboarding.ageHint")}
            >
              <label htmlFor="onboarding-age" className="sr-only">
                {t("common:onboarding.ageTitle")}
              </label>
              <input
                id="onboarding-age"
                type="number"
                inputMode="numeric"
                min={14}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                placeholder={t("common:onboarding.agePlaceholder")}
                aria-describedby={typeof age === "number" && age < 18 ? "age-warning" : undefined}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-2xl font-semibold tracking-tight outline-none focus:border-primary"
                autoFocus
              />
              {typeof age === "number" && age < 18 && (
                <p
                  id="age-warning"
                  role="alert"
                  className="mt-3 text-sm text-saffron-foreground bg-saffron/15 rounded-xl px-3 py-2 leading-relaxed"
                >
                  {t("common:onboarding.under18")}
                </p>
              )}
            </StepShell>
          )}

          {step === 1 && (
            <StepShell
              icon={<MapPin className="h-5 w-5" />}
              title={t("common:onboarding.locationTitle")}
              hint={t("common:onboarding.locationHint")}
            >
              <div className="space-y-3">
                <label htmlFor="onboarding-state" className="sr-only">
                  {t("common:onboarding.locationTitle")}
                </label>
                <select
                  id="onboarding-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  aria-label={t("common:onboarding.statePlaceholder", {
                    defaultValue: "Select your state",
                  })}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
                >
                  <option value="">{t("common:onboarding.statePlaceholder")}</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {t(`common:states.${s}`, { defaultValue: s })}
                    </option>
                  ))}
                </select>
                <label htmlFor="onboarding-city" className="sr-only">
                  {t("common:onboarding.cityPlaceholder", { defaultValue: "Your city or town" })}
                </label>
                <input
                  id="onboarding-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t("common:onboarding.cityPlaceholder")}
                  aria-label={t("common:onboarding.cityPlaceholder", {
                    defaultValue: "Your city or town",
                  })}
                  maxLength={60}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
                />
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              icon={<Sparkles className="h-5 w-5" />}
              title={t("common:onboarding.firstTimeTitle")}
              hint={t("common:onboarding.firstTimeHint")}
            >
              <div
                className="grid grid-cols-2 gap-3"
                role="radiogroup"
                aria-label={t("common:onboarding.firstTimeTitle", {
                  defaultValue: "First-time voter selection",
                })}
              >
                <ChoiceCard
                  selected={firstTime === true}
                  onClick={() => setFirstTime(true)}
                  emoji="🌱"
                  label={t("common:onboarding.firstTimeYes")}
                />
                <ChoiceCard
                  selected={firstTime === false}
                  onClick={() => setFirstTime(false)}
                  emoji="🗳️"
                  label={t("common:onboarding.firstTimeNo")}
                />
              </div>
            </StepShell>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> {t("common:actions.back")}
            </button>
            <button
              onClick={() => (step === 2 ? finish() : setStep((s) => s + 1))}
              disabled={!canNext}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-all",
                "hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
              )}
            >
              {step === 2 ? t("common:onboarding.buildJourney") : t("common:actions.continue")}
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
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{hint}</p>
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
      role="radio"
      aria-checked={selected}
      className={cn(
        "flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-background px-4 py-5 text-sm font-medium text-center transition-all",
        selected
          ? "border-primary bg-primary-soft shadow-glow scale-[1.02]"
          : "border-border hover:border-primary/40",
      )}
    >
      <span className="text-3xl" aria-hidden="true">
        {emoji}
      </span>
      <span className="leading-snug">{label}</span>
    </button>
  );
}
