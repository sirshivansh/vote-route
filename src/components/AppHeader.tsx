import { Link } from "@tanstack/react-router";
import { MapPin, Bell } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <span className="text-lg" aria-hidden>🗳️</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">VoteRoute</div>
            <div className="text-[11px] text-muted-foreground">Your voting GPS</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <MapPin className="h-3.5 w-3.5" />
            India · Set location
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
