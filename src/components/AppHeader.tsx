import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  MapPin,
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  Map,
  Sparkles,
  Gauge,
  HelpCircle,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { to: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { to: "/timeline", key: "timeline", icon: Map },
  { to: "/readiness", key: "readiness", icon: Gauge },
  { to: "/assistant", key: "assistant", icon: Sparkles },
  { to: "/help", key: "help", icon: HelpCircle },
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
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 group min-w-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow shrink-0">
            <span className="text-lg" aria-hidden>
              🗳️
            </span>
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-sm font-semibold tracking-tight truncate">
              {t("common:app.name")}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {t("common:app.tagline")}
            </div>
          </div>
        </Link>

        {showNav && hasProfile && (
          <nav className="hidden md:flex items-center gap-1 min-w-0">
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
                  {t(`common:nav.${item.key}`)}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <LanguageSwitcher compact />
          <ThemeToggle />
          {profile ? (
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-w-0"
              title={t("common:header.profileTitle")}
            >
              <MapPin className="h-3.5 w-3.5 text-saffron shrink-0" />
              <span className="truncate max-w-[120px]">
                {profile.city},{" "}
                {t(`common:states.${profile.state}`, { defaultValue: profile.state })}
              </span>
            </Link>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-leaf" />
              {t("common:trust.eciAligned")}
            </span>
          )}

          {showNav && hasProfile && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label={open ? t("common:header.menuClose") : t("common:header.menuOpen")}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

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
                    active
                      ? "bg-primary-soft text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {t(`common:nav.${item.key}`)}
                </Link>
              );
            })}
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
            >
              <User className="h-4 w-4" />
              {t("common:nav.profile")}
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
                {t("common:header.resetEverything")}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
