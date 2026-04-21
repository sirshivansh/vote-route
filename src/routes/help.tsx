import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle, Sparkles, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { GLOBAL_FAQS, FIRST_TIME_VOTER_JOURNEY } from "@/lib/journey";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & FAQ — VoteRoute" },
      { name: "description", content: "Frequently asked questions about voting, the voter journey, and using VoteRoute." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  // collect step-level FAQs flattened
  const stepFaqs = FIRST_TIME_VOTER_JOURNEY.flatMap((s) =>
    (s.faqs ?? []).map((f) => ({ ...f, stepId: s.id, stepTitle: s.title })),
  );

  return (
    <PageShell crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Help" }]}>
      <header className="mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          <HelpCircle className="h-3.5 w-3.5" /> Help center
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight">Help & frequently asked questions</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Everything you need to know about voting in India and using VoteRoute. Can't find your answer? Ask the assistant.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">General</h2>
            <div className="mt-3 space-y-2">
              {GLOBAL_FAQS.map((f) => (
                <details key={f.q} className="group rounded-xl border border-border bg-background p-4">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-2 text-sm font-medium">
                    {f.q}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">By journey step</h2>
            {stepFaqs.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No step questions yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {stepFaqs.map((f, i) => (
                  <details key={i} className="group rounded-xl border border-border bg-background p-4">
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{f.q}</div>
                        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          From: {f.stepTitle}
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-open:rotate-90 transition-transform shrink-0" />
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                    <Link
                      to="/step/$stepId"
                      params={{ stepId: f.stepId }}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Open step <ArrowRight className="h-3 w-3" />
                    </Link>
                  </details>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <Link
            to="/assistant"
            className="block rounded-2xl border border-primary/30 bg-primary-soft p-5 hover:scale-[1.01] transition-transform"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="mt-2 text-sm font-semibold">Still stuck?</div>
            <div className="mt-1 text-xs text-muted-foreground">Ask the assistant — answers in plain English.</div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
              Open assistant <ArrowRight className="h-3 w-3" />
            </div>
          </Link>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <ShieldCheck className="h-5 w-5 text-leaf" />
            <div className="mt-2 text-sm font-semibold">Official sources only</div>
            <div className="mt-1 text-xs text-muted-foreground">
              All guidance is based on Election Commission of India procedures.
            </div>
            <a
              href="https://eci.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Visit eci.gov.in <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div className="mt-2 text-sm font-semibold">Found a bug?</div>
            <div className="mt-1 text-xs text-muted-foreground">VoteRoute is open & evolving. Tell us anything that didn't work.</div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
