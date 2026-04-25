import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { TrustBar } from "@/components/TrustBar";
import { useProfile, clearProfile } from "@/lib/storage";

export interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  crumbs?: Crumb[];
  children: React.ReactNode;
  showAssistantFab?: boolean;
  showTrustBar?: boolean;
  showFooter?: boolean;
}

export function PageShell({ crumbs, children, showTrustBar = true, showFooter = true }: Props) {
  const { profile, setProfile } = useProfile();
  const { t } = useTranslation();

  function handleReset() {
    clearProfile();
    setProfile(null);
  }

  const resolvedCrumbs = crumbs?.map((crumb) => ({ ...crumb, label: crumb.label || t("common:app.name") }));

  return (
    <div className="flex min-h-screen flex-col pb-16 sm:pb-0">
      <AppHeader profile={profile} onReset={handleReset} />
      {showTrustBar && <TrustBar />}
      {resolvedCrumbs && resolvedCrumbs.length > 0 && (
        <div className="mx-auto w-full max-w-6xl px-4 pt-4">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {resolvedCrumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
                {c.to ? (
                  <Link to={c.to} className="hover:text-foreground transition-colors truncate max-w-[160px] sm:max-w-none">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      )}
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      {showFooter && <AppFooter />}
    </div>
  );
}
