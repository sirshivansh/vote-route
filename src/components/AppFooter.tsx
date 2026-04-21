import { ShieldCheck, ExternalLink, Heart } from "lucide-react";

export function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-base" aria-hidden>🗳️</span>
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight">VoteRoute</div>
                <div className="text-[11px] text-muted-foreground">Your voting GPS</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-xs">
              An independent civic guide that helps first-time voters complete their voting journey, end to end.
            </p>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sources
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a
                  href="https://eci.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors"
                >
                  Election Commission of India
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://voters.eci.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors"
                >
                  voters.eci.gov.in
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://electoralsearch.eci.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors"
                >
                  Booth & roll search
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Trust
            </div>
            <div className="mt-3 inline-flex items-start gap-2 rounded-xl border border-leaf/30 bg-leaf/5 p-3">
              <ShieldCheck className="h-4 w-4 text-leaf shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-foreground/80">
                All guidance is aligned with publicly available Election Commission of India procedures.
                VoteRoute is independent and not affiliated with the ECI.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/50 pt-5 text-[11px] text-muted-foreground">
          <div>© {year} VoteRoute · Built for India's first-time voters</div>
          <div className="inline-flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-saffron" /> for civic participation
          </div>
        </div>
      </div>
    </footer>
  );
}
