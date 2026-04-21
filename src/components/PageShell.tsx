import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useProfile, clearProfile } from "@/lib/storage";

export interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  crumbs?: Crumb[];
  children: React.ReactNode;
  showAssistantFab?: boolean;
}

export function PageShell({ crumbs, children }: Props) {
  const { profile, setProfile } = useProfile();

  function handleReset() {
    clearProfile();
    setProfile(null);
  }

  return (
    <div className="min-h-screen pb-16">
      <AppHeader profile={profile} onReset={handleReset} />
      {crumbs && crumbs.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {c.to ? (
                  <Link to={c.to} className="hover:text-foreground transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
