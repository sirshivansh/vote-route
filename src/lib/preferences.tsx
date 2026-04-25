import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const PREFS_KEY = "vja:prefs";

export type SupportedLanguage = "en" | "hi" | "mr" | "bn";
export type ThemePreference = "light" | "dark" | "system";

/**
 * Global application preferences schema.
 */
export interface AppPreferences {
  language: SupportedLanguage;
  simpleLanguage: boolean;
  largeText: boolean;
  theme: ThemePreference;
}

const DEFAULT_PREFS: AppPreferences = {
  language: "en",
  simpleLanguage: false,
  largeText: false,
  theme: "system",
};

/**
 * Resolves the theme to 'light' or 'dark' based on system settings if 'system' is selected.
 */
function getResolvedTheme(theme: ThemePreference) {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Syncs app preferences to the HTML document attributes (lang, data-*, classes).
 */
function applyDocumentPreferences(preferences: AppPreferences) {
  if (typeof document === "undefined") return;

  const resolvedTheme = getResolvedTheme(preferences.theme);
  document.documentElement.lang = preferences.language;
  document.documentElement.dataset.simpleLanguage = String(preferences.simpleLanguage);
  document.documentElement.dataset.largeText = String(preferences.largeText);
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}

/**
 * Loads preferences from localStorage with fallback to defaults.
 */
function readPrefs(): AppPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    return { ...DEFAULT_PREFS, ...(JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") as Partial<AppPreferences>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

/**
 * Saves preferences to localStorage.
 */
function writePrefs(prefs: AppPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

interface PreferencesContextValue {
  preferences: AppPreferences;
  resolvedTheme: "light" | "dark";
  setLanguage: (language: SupportedLanguage) => void;
  setSimpleLanguage: (value: boolean) => void;
  setLargeText: (value: boolean) => void;
  setTheme: (theme: ThemePreference) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

/**
 * Provider component for global app preferences (Language, Theme, Accessibility).
 */
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFS);
  const resolvedTheme = useMemo(() => getResolvedTheme(preferences.theme), [preferences.theme]);

  useEffect(() => {
    const current = readPrefs();
    setPreferences((prev) => ({ ...prev, ...current }));
  }, []);

  useEffect(() => {
    writePrefs(preferences);
    applyDocumentPreferences(preferences);
    void i18n.changeLanguage(preferences.language);
  }, [i18n, preferences]);

  useEffect(() => {
    if (typeof window === "undefined" || preferences.theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyDocumentPreferences(preferences);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preferences]);

  const value = useMemo<PreferencesContextValue>(() => ({
    preferences,
    resolvedTheme,
    setLanguage: (language) => setPreferences((prev) => ({ ...prev, language })),
    setSimpleLanguage: (simpleLanguage) => setPreferences((prev) => ({ ...prev, simpleLanguage })),
    setLargeText: (largeText) => setPreferences((prev) => ({ ...prev, largeText })),
    setTheme: (theme) => setPreferences((prev) => ({ ...prev, theme })),
  }), [preferences, resolvedTheme]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

/**
 * Hook to access and modify global app preferences.
 */
export function useAppPreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("useAppPreferences must be used within PreferencesProvider");
  return context;
}

/**
 * Returns the human-readable label for a supported language code.
 */
export function getLanguageLabel(language: SupportedLanguage) {
  return { en: "English", hi: "हिंदी", mr: "मराठी", bn: "বাংলা" }[language];
}
