import { ShieldCheck, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Slim trust strip — sits under the header on key pages.
 * Communicates official-grade credibility without being heavy.
 */
export function TrustBar() {
  return (
    <div className="border-b border-border/50 bg-leaf/[0.04]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="h-3.5 w-3.5 text-leaf shrink-0" />
          <span className="text-foreground/80 truncate">
            Aligned with Election Commission of India guidelines
          </span>
        </div>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Source information"
              >
                <Info className="h-3 w-3" />
                <span className="hidden sm:inline">Source</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[240px] text-[11px]">
              All steps and timelines are based on publicly available ECI documentation. Always verify deadlines on eci.gov.in for your state.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
