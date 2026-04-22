import { Type, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppPreferences } from "@/lib/preferences";

export function PreferenceControls() {
  const { t } = useTranslation();
  const { preferences, setLargeText, setSimpleLanguage } = useAppPreferences();

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("common:language.preferences")}</h2>
      <div className="mt-4 space-y-3">
        <PreferenceRow
          icon={<Languages className="h-4 w-4 text-primary" />}
          title={t("common:language.simpleMode")}
          body={t("common:language.simpleModeHint")}
          checked={preferences.simpleLanguage}
          onChange={() => setSimpleLanguage(!preferences.simpleLanguage)}
        />
        <PreferenceRow
          icon={<Type className="h-4 w-4 text-primary" />}
          title={t("common:language.largeText")}
          body={t("common:language.largeTextHint")}
          checked={preferences.largeText}
          onChange={() => setLargeText(!preferences.largeText)}
        />
      </div>
    </section>
  );
}

function PreferenceRow({ icon, title, body, checked, onChange }: { icon: React.ReactNode; title: string; body: string; checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className="flex w-full items-start justify-between gap-3 rounded-xl border border-border bg-background p-4 text-left hover:border-primary/30">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{title}</div>
          <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</div>
        </div>
      </div>
      <span className={`mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors ${checked ? "bg-primary" : "bg-muted"}`}>
        <span className={`h-4 w-4 rounded-full bg-card transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </span>
    </button>
  );
}
