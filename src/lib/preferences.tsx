import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const PREFS_KEY = "vja:prefs";

export type SupportedLanguage = "en" | "hi" | "mr" | "bn";

export interface AppPreferences {
  language: SupportedLanguage;
  simpleLanguage: boolean;
  largeText: boolean;
}

const DEFAULT_PREFS: AppPreferences = {
  language: "en",
  simpleLanguage: false,
  largeText: false,
};

function readPrefs(): AppPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    return { ...DEFAULT_PREFS, ...(JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") as Partial<AppPreferences>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function writePrefs(prefs: AppPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

interface PreferencesContextValue {
  preferences: AppPreferences;
  setLanguage: (language: SupportedLanguage) => void;
  setSimpleLanguage: (value: boolean) => void;
  setLargeText: (value: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [preferences, setPreferences] = useState<AppPreferences>(() => readPrefs());

  useEffect(() => {
    const current = readPrefs();
    setPreferences((prev) => ({ ...prev, ...current }));
  }, []);

  useEffect(() => {
    writePrefs(preferences);
    document.documentElement.lang = preferences.language;
    document.documentElement.dataset.simpleLanguage = String(preferences.simpleLanguage);
    document.documentElement.dataset.largeText = String(preferences.largeText);
    void i18n.changeLanguage(preferences.language);
  }, [i18n, preferences]);

  const value = useMemo<PreferencesContextValue>(() => ({
    preferences,
    setLanguage: (language) => setPreferences((prev) => ({ ...prev, language })),
    setSimpleLanguage: (simpleLanguage) => setPreferences((prev) => ({ ...prev, simpleLanguage })),
    setLargeText: (largeText) => setPreferences((prev) => ({ ...prev, largeText })),
  }), [preferences]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("useAppPreferences must be used within PreferencesProvider");
  return context;
}

export function getLanguageLabel(language: SupportedLanguage) {
  return { en: "English", hi: "हिंदी", mr: "मराठी", bn: "বাংলা" }[language];
}
