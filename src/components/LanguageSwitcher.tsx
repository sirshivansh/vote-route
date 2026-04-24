import { Globe, Moon, Sun, Type, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getLanguageLabel, useAppPreferences, type SupportedLanguage } from "@/lib/preferences";
import { useState, useRef, useEffect } from "react";

const LANGUAGES: SupportedLanguage[] = ["en", "hi", "mr", "bn"];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const { preferences, resolvedTheme, setLanguage, setLargeText, setSimpleLanguage, setTheme } = useAppPreferences();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2 min-w-0">
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        type="button"
        aria-label={t("common:theme.toggleAria")}
        title={t("common:theme.toggle")}
      >
        {resolvedTheme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </button>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex min-w-[110px] items-center justify-between gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={t("common:language.switcherAria")}
        >
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 shrink-0" />
            {!compact && <span className="hidden sm:inline text-foreground font-medium">{t("common:language.label")}:</span>}
            <span className="font-medium text-foreground">{getLanguageLabel(preferences.language)}</span>
          </div>
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-2 w-[140px] rounded-xl border border-border bg-card p-1 shadow-glow z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 origin-top-left">
            {LANGUAGES.map((language) => (
              <button
                key={language}
                onClick={() => {
                  setLanguage(language);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  preferences.language === language
                    ? "bg-primary-soft text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {getLanguageLabel(language)}
                {preferences.language === language && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        )}
      </div>

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
