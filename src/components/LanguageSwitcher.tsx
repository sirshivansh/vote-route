import { Globe, Moon, Sun, Type } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getLanguageLabel, useAppPreferences, type SupportedLanguage } from "@/lib/preferences";

const LANGUAGES: SupportedLanguage[] = ["en", "hi", "mr", "bn"];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const { preferences, resolvedTheme, setLanguage, setLargeText, setSimpleLanguage, setTheme } = useAppPreferences();

  return (
    <div className="flex items-center gap-2 min-w-0">
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        type="button"
        aria-label={t("common:theme.toggleAria")}
        title={t("common:theme.toggle")}
      >
        {resolvedTheme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </button>

      <label className="inline-flex min-w-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
        <Globe className="h-3.5 w-3.5 shrink-0" />
        {!compact && <span className="hidden sm:inline">{t("common:language.label")}</span>}
        <select
          aria-label={t("common:language.switcherAria")}
          value={preferences.language}
          onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
          className="max-w-[7.5rem] bg-transparent text-foreground outline-none"
        >
          {LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {getLanguageLabel(language)}
            </option>
          ))}
        </select>
      </label>

      {!compact && (
        <div className="hidden lg:flex items-center gap-1 rounded-full border border-border bg-card p-1 text-[11px]">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors ${resolvedTheme === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            type="button"
            aria-label={t("common:theme.toggleAria")}
            title={t("common:theme.toggle")}
          >
            {resolvedTheme === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
            {t("common:theme.toggle")}
          </button>
          <button
            onClick={() => setSimpleLanguage(!preferences.simpleLanguage)}
            className={`rounded-full px-2 py-1 transition-colors ${preferences.simpleLanguage ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            type="button"
          >
            {t("common:language.simpleMode")}
          </button>
          <button
            onClick={() => setLargeText(!preferences.largeText)}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors ${preferences.largeText ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            type="button"
          >
            <Type className="h-3 w-3" />
            {t("common:language.largeText")}
          </button>
        </div>
      )}
    </div>
  );
}
