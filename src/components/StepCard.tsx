import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Check, Clock, CalendarDays, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JourneyStep } from "@/lib/journey";

interface Props {
  step: JourneyStep;
  index: number;
  isDone: boolean;
  isActive?: boolean;
  href?: string;
  onComplete?: () => void;
  compact?: boolean;
}

export function StepCard({ step, index, isDone, isActive, href, onComplete, compact }: Props) {
  const { t } = useTranslation();

  return (
    <div className={cn("group relative flex gap-4 rounded-2xl border bg-card p-5 transition-all", isActive ? "border-primary/50 shadow-glow" : isDone ? "border-leaf/30" : "border-border shadow-soft hover:border-primary/30 hover:-translate-y-0.5")}>
      <div className="hidden sm:flex shrink-0 flex-col items-center">
        <div className={cn("z-10 grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-semibold transition-all", isDone ? "border-leaf bg-leaf text-leaf-foreground" : isActive ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground")}>
          {isDone ? <Check className="h-4 w-4" /> : index + 1}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">{t(`journey:phases.${step.phase}`)}</span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {step.estimate}</span>
          {step.deadline && (
            <span className="inline-flex items-center gap-1 rounded-full bg-saffron/15 px-2 py-0.5 text-xs text-saffron-foreground"><CalendarDays className="h-3 w-3" /> {step.deadline}</span>
          )}
          {isDone && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-leaf"><Check className="h-3 w-3" /> {t("common:status.done")}</span>
          )}
        </div>

        <h3 className={cn("mt-2 text-base sm:text-lg font-semibold tracking-tight break-words", isDone && "text-muted-foreground")}>{step.title}</h3>
        {!compact && <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.shortDesc}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          {href && (
            <Link to={href} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              {isDone ? t("common:actions.reviewStep") : t("common:actions.openStep")}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
          {!isDone && onComplete && (
            <button onClick={onComplete} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors">
              <Check className="h-3 w-3" />
              {t("common:actions.markDone")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
