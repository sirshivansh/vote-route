import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

/**
 * Floating "Ask assistant" launcher. Routes to the full assistant page
 * instead of opening a drawer — keeps the experience multi-page.
 */
export function AssistantFab() {
  return (
    <Link
      to="/assistant"
      className="fixed bottom-20 sm:bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-glow hover:scale-105 transition-transform"
    >
      <Sparkles className="h-4 w-4" />
      Ask assistant
    </Link>
  );
}
