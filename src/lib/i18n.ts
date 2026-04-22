import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const modules = import.meta.glob("../locales/*/*.json", { eager: true });

function buildResources() {
  const resources: Record<string, Record<string, unknown>> = {};

  Object.entries(modules).forEach(([path, mod]) => {
    const match = path.match(/\.\.\/locales\/(.+?)\/(.+?)\.json$/);
    if (!match) return;
    const [, lng, ns] = match;
    resources[lng] ??= {};
    resources[lng][ns] = (mod as { default?: unknown }).default ?? mod;
  });

  return resources;
}

const resources = buildResources();

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      supportedLngs: ["en", "hi", "mr", "bn"],
      ns: ["common", "journey", "assistant"],
      defaultNS: "common",
      interpolation: { escapeValue: false },
      detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
    });
}

export default i18n;
