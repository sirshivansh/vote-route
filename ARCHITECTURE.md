# 🏗️ VoteRoute Architecture

> A detailed technical overview of VoteRoute's system architecture, data flow, and design decisions.

---

## System Overview

VoteRoute is a hybrid client-server application built on **TanStack Start** (Vite + React 19) with a Node.js production entry point. It uses a dual-layer AI architecture (Cloud + Local) to ensure users always receive guidance, even in offline or degraded-network scenarios.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
│  │   React UI   │  │  Web Worker   │  │    LocalStorage      │  │
│  │  (TanStack   │◄─┤  AI Engine    │  │  ─ Profile           │  │
│  │   Router)    │  │  (Predictor)  │  │  ─ Completed Steps   │  │
│  │              │  │              │  │  ─ Chat History       │  │
│  │  ┌────────┐  │  │  ┌─────────┐ │  │  ─ Preferences       │  │
│  │  │ Theme  │  │  │  │ Multi-  │ │  └──────────────────────┘  │
│  │  │ Toggle │  │  │  │ Turn    │ │                             │
│  │  │ (Dark/ │  │  │  │ Memory  │ │  ┌──────────────────────┐  │
│  │  │ Light) │  │  │  └─────────┘ │  │   SessionStorage     │  │
│  │  └────────┘  │  └──────┬───────┘  │  ─ Analytics SID     │  │
│  └──────┬───────┘         │          └──────────────────────┘  │
│         │                 │                                     │
└─────────┼─────────────────┼─────────────────────────────────────┘
          │                 │
    ┌─────▼──────┐    ┌─────▼──────┐
    │  Firebase   │    │  Gemini    │
    │  Suite      │    │  2.0 Flash │
    │ ─ Auth      │    │  (Cloud    │
    │ ─ Firestore │    │   Primary) │
    │ ─ Storage   │    │            │
    │ ─ Analytics │    │ systemInst │
    │ ─ FCM       │    │ multiTurn  │
    │ ─ Remote    │    └─────┬──────┘
    │   Config    │          │
    │ ─ Perf Mon  │    ┌─────▼──────┐
    └─────────────┘    │  Local Rule│
                       │  Engine    │
                       │  (Fallback)│
                       └────────────┘
```

---

## Module Dependency Graph

```
src/
├── ai/
│   ├── predictor.ts        # Decision engine (cloud + local fallback)
│   └── ai.worker.ts        # Web Worker proxy for non-blocking AI
├── components/
│   ├── AppHeader.tsx        # Global nav + ThemeToggle + LanguageSwitcher
│   ├── PageShell.tsx        # Layout wrapper with page-enter animation
│   ├── ThemeToggle.tsx      # Dark/Light/System mode toggle
│   ├── ReadinessRing.tsx    # Animated SVG progress ring
│   ├── ErrorBoundary.tsx    # React error boundary + Cloud Logging
│   ├── BoothMap.tsx         # Google Maps SDK integration
│   └── ui/                  # Radix UI primitives (shadcn/ui)
├── services/
│   ├── firebase.ts          # Firebase init + Auth/Firestore/Storage/FCM/Perf
│   ├── gemini.ts            # Gemini 2.0 Flash API (systemInstruction + multiTurn)
│   └── analytics.ts         # Structured Firestore analytics events
├── lib/
│   ├── journey.ts           # 8-step journey engine + readiness calculation
│   ├── storage.ts           # LocalStorage abstraction (profile + progress)
│   ├── preferences.tsx      # Theme/Language/A11y preferences context
│   ├── milestones.ts        # Achievement system (toast notifications)
│   └── i18n.ts              # i18next config (en/hi/mr/bn)
├── routes/
│   ├── __root.tsx            # HTML shell + SEO meta + ErrorBoundary
│   ├── index.tsx             # Landing page + goal selection
│   ├── dashboard.tsx         # Bento dashboard + phases + booth map
│   ├── assistant.tsx         # AI chat interface + confidence viz
│   ├── journey.tsx           # Full 8-step journey view
│   ├── step.$stepId.tsx      # Deep-dive step detail (checklists, FAQs)
│   ├── readiness.tsx         # Readiness report with breakdown
│   ├── timeline.tsx          # Visual election timeline
│   ├── profile.tsx           # User profile management
│   ├── help.tsx              # FAQ + help center
│   └── done.tsx              # Completion celebration + share
└── utils/
    └── logger.ts             # Structured JSON logger (Cloud Logging format)
```

---

## AI Decision Flow

```
User Query → Web Worker → Predictor Engine
                              │
                    ┌─────────┼─────────┐
                    │                   │
              Cloud Path          Local Fallback
              (Gemini 2.0)        (Rule Engine)
                    │                   │
         ┌─────────┴─────────┐  ┌──────┴──────┐
         │ systemInstruction  │  │ Intent      │
         │ Multi-turn context │  │ Detection   │
         │ Generation config  │  │ (6 rules)   │
         └─────────┬─────────┘  └──────┬──────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                    Structured Decision
                    {action, explanation,
                     confidence, category,
                     engine, suggestedSteps}
                              │
                    ┌─────────┼─────────┐
                    │         │         │
               UI Display  Firebase  Analytics
               (Chat +     (Firestore (Structured
                Conf Bar)   Log)      Event)
```

---

## Security Model

| Layer              | Protection                                                             |
| :----------------- | :--------------------------------------------------------------------- |
| **Transport**      | HSTS (31536000s), Strict-Origin Referrer                               |
| **Content**        | CSP (script/style/connect-src locked), X-Content-Type-Options: nosniff |
| **Framing**        | X-Frame-Options: DENY                                                  |
| **XSS**            | HTML escaping in server error pages, input sanitization in assistant   |
| **Path Traversal** | Static file serving validates resolved paths stay within client dir    |
| **Auth**           | Firebase Anonymous Auth (no PII required)                              |
| **Database**       | Schema-validated writes, owner-scoped reads, default deny-all          |
| **Permissions**    | camera=(), microphone=(), geolocation=()                               |

---

## Data Flow

1. **User Profile** → LocalStorage → Preferences Context → all routes
2. **Journey Progress** → LocalStorage → `calcReadiness()` → ReadinessRing
3. **AI Query** → Web Worker → Gemini API (cloud) || Rule Engine (local) → Chat UI + Firestore + Analytics
4. **Milestone Events** → Firebase Analytics `logEvent()` + Firestore `analytics_events`
5. **Document Uploads** → Firebase Storage (user-scoped path)
6. **Theme** → Preferences Context → `document.documentElement.classList.toggle("dark")`

---

## Testing Strategy

- **Unit Tests**: 54+ tests across 8 suites (Vitest + jsdom)
- **Coverage Areas**: AI predictor, journey engine, storage, milestones, Firebase service, analytics, Gemini service, logger
- **Mocking**: Firebase and Gemini are fully mocked to test logic in isolation
- **CI Integration**: `npm test` runs in Cloud Build before every deployment

---

## Deployment Pipeline

```
Developer Push → Cloud Build Trigger
                    │
              ┌─────┴─────┐
              │ npm install│
              ├────────────┤
              │ npm lint   │
              ├────────────┤
              │ npm test   │
              ├────────────┤
              │ npm build  │
              ├────────────┤
              │ Docker     │
              │ Build      │
              ├────────────┤
              │ Push to    │
              │ Artifact   │
              │ Registry   │
              ├────────────┤
              │ Deploy to  │
              │ Cloud Run  │
              └────────────┘
```

---

_Architecture documentation for VoteRoute v1.1.0 — Prompt Wars Challenge submission._
