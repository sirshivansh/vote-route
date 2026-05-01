import { Moon, Sun, Monitor } from "lucide-react";
import { useAppPreferences, type ThemePreference } from "@/lib/preferences";

/**
 * Cycles through theme modes: system → light → dark → system.
 * Displays the current mode icon with smooth transition.
 */
export function ThemeToggle() {
  const { preferences, setTheme, resolvedTheme } = useAppPreferences();

  const nextTheme: Record<ThemePreference, ThemePreference> = {
    system: "light",
    light: "dark",
    dark: "system",
  };

  const icons: Record<ThemePreference, React.ReactNode> = {
    system: <Monitor className="h-4 w-4" />,
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
  };

  const labels: Record<ThemePreference, string> = {
    system: "System theme",
    light: "Light mode",
    dark: "Dark mode",
  };

  return (
    <button
      onClick={() => setTheme(nextTheme[preferences.theme])}
      className="inline-flex items-center justify-center rounded-full border border-border bg-background p-2 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all hover:scale-105 active:scale-95"
      aria-label={`Current: ${labels[preferences.theme]}. Click to switch to ${labels[nextTheme[preferences.theme]]}`}
      title={labels[preferences.theme]}
    >
      <span key={resolvedTheme} className="animate-in fade-in zoom-in-75 duration-200">
        {icons[preferences.theme]}
      </span>
    </button>
  );
}
