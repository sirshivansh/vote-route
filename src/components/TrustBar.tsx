import { ShieldCheck, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function TrustBar() {
  const { t } = useTranslation();

  return (
    <div className="border-b border-border/50 bg-leaf/[0.04]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="h-3.5 w-3.5 text-leaf shrink-0" />
          <span className="text-foreground/80 truncate">{t("common:trust.aligned")}</span>
        </div>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0" aria-label={t("common:trust.source")}>
                <Info className="h-3 w-3" />
                <span className="hidden sm:inline">{t("common:trust.source")}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[240px] text-[11px] leading-relaxed">
              {t("common:trust.sourceInfo")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
