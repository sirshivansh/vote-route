import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, ShieldCheck, Menu, X, LayoutDashboard, Map, Sparkles, Gauge, HelpCircle, User } from "lucide-react";
import type { UserProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/timeline", label: "Timeline", icon: Map },
  { to: "/readiness", label: "Readiness", icon: Gauge },
  { to: "/assistant", label: "Assistant", icon: Sparkles },
  { to: "/help", label: "Help", icon: HelpCircle },
] as const;

export function AppHeader({
  profile,
  onReset,
  showNav = true,
}: {
  profile?: UserProfile | null;
  onReset?: () => void;
  showNav?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hasProfile = !!profile;

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

        {showNav && hasProfile && (
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2 min-w-0">
          {profile ? (
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-w-0"
              title="View profile"
            >
              <MapPin className="h-3.5 w-3.5 text-saffron shrink-0" />
              <span className="truncate max-w-[120px]">
                {profile.city}, {profile.state}
              </span>
            </Link>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-leaf" />
              ECI-aligned
            </span>
          )}

          {showNav && hasProfile && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Open menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {open && showNav && hasProfile && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md animate-fade-in">
          <nav className="mx-auto max-w-6xl px-4 py-2 grid grid-cols-2 gap-1">
            {NAV.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active ? "bg-primary-soft text-primary font-medium" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            {onReset && (
              <button
                onClick={() => {
                  setOpen(false);
                  onReset();
                }}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 text-left"
              >
                <X className="h-4 w-4" />
                Reset everything
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
