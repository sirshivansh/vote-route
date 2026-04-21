import { Link } from "@tanstack/react-router";
import { MapPin, ShieldCheck } from "lucide-react";
import type { UserProfile } from "@/lib/storage";

export function AppHeader({ profile, onReset }: { profile?: UserProfile | null; onReset?: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 group min-w-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow shrink-0">
            <span className="text-lg" aria-hidden>🗳️</span>
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-sm font-semibold tracking-tight truncate">VoteRoute</div>
            <div className="text-[11px] text-muted-foreground truncate">Your voting GPS</div>
          </div>
        </Link>

        <div className="flex items-center gap-2 min-w-0">
          {profile ? (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-w-0"
              title="Reset profile"
            >
              <MapPin className="h-3.5 w-3.5 text-saffron shrink-0" />
              <span className="truncate max-w-[140px]">
                {profile.city}, {profile.state}
              </span>
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-leaf" />
              ECI-aligned
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
