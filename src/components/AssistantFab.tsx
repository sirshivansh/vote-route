import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AssistantFab() {
  const { t } = useTranslation();

  return (
    <Link
      to="/assistant"
      className="fixed bottom-20 sm:bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-glow hover:scale-105 transition-transform"
    >
      <Sparkles className="h-4 w-4" />
      {t("common:actions.askAssistant")}
    </Link>
  );
}
