import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, User, Sparkles, Trash2, RotateCcw, Calendar, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useProfile, clearProfile, saveProfile, getCompleted, setCompleted as persistCompleted, INDIAN_STATES } from "@/lib/storage";
import { OnboardingDialog } from "@/components/OnboardingDialog";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — VoteRoute" },
      { name: "description", content: "Manage your VoteRoute profile, location and progress." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { profile, hydrated, setProfile } = useProfile();
  const [age, setAge] = useState<number | "">("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [firstTime, setFirstTime] = useState<boolean>(true);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (profile) {
      setAge(profile.age);
      setState(profile.state);
      setCity(profile.city);
      setFirstTime(profile.firstTimeVoter);
    }
    setCompletedCount(getCompleted().length);
  }, [profile]);

  function save() {
    if (typeof age !== "number" || !state || !city) return;
    const next = {
      age,
      state,
      city: city.trim(),
      firstTimeVoter: firstTime,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
    };
    saveProfile(next);
    setProfile(next);
  }

  function resetProgress() {
    persistCompleted([]);
    setCompletedCount(0);
  }

  function deleteEverything() {
    clearProfile();
    setProfile(null);
    navigate({ to: "/" });
  }

  if (hydrated && !profile) {
    return (
      <PageShell>
        <OnboardingDialog onComplete={(p) => setProfile(p)} defaultGoal="register" />
      </PageShell>
    );
  }

  return (
    <PageShell crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Profile" }]}>
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Profile & Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your details — your journey adapts to changes.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your details</h2>

          <Field icon={<User className="h-4 w-4" />} label="Age">
            <input
              type="number"
              min={14}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>

          <Field icon={<MapPin className="h-4 w-4" />} label="State">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field icon={<MapPin className="h-4 w-4" />} label="City / Town">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              maxLength={60}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>

          <Field icon={<Sparkles className="h-4 w-4" />} label="First-time voter">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFirstTime(true)}
                className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                  firstTime ? "border-primary bg-primary-soft" : "border-border bg-background"
                }`}
              >
                🌱 Yes
              </button>
              <button
                onClick={() => setFirstTime(false)}
                className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                  !firstTime ? "border-primary bg-primary-soft" : "border-border bg-background"
                }`}
              >
                🗳️ Voted before
              </button>
            </div>
          </Field>

          <button
            onClick={save}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow hover:bg-primary/90"
          >
            Save changes
          </button>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Created</dt>
                <dd className="font-medium">
                  {profile && new Date(profile.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Steps completed</dt>
                <dd className="font-medium tabular-nums">{completedCount} / 8</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-leaf/30 bg-leaf/5 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-leaf">
              <ShieldCheck className="h-4 w-4" /> Your data stays here
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Everything is stored on your device only. We never send your name, age or location to a server.
            </p>
          </section>

          <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
            <div className="mt-3 space-y-2">
              <button
                onClick={resetProgress}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" /> Reset progress
              </button>
              <button
                onClick={deleteEverything}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4" /> Delete everything
              </button>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      {children}
    </label>
  );
}
