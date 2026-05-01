# 🗳️ VoteRoute — Production-Grade Civic Dashboard

VoteRoute is a high-fidelity, AI-driven civic dashboard designed to help citizens navigate the election process with absolute clarity. Built for production-grade reliability, it transforms complex Election Commission of India (ECI) data into a personalized, accessible roadmap.

## 🚀 Live Demo
**URL:** [https://vote-route-444118208432.asia-south1.run.app](https://vote-route-444118208432.asia-south1.run.app)

---

## 🏛️ Vertical: Civic Tech & Election Assistance
VoteRoute operates in the **Civic Technology** vertical. Its primary goal is to solve "Civic Friction" — the barrier of complex, fragmented information that prevents citizens from participating in democratic processes. By providing a clear, personalized path to the polling booth, VoteRoute empowers voters and strengthens democratic engagement.

## 💡 Approach & Logic
Our approach is centered on **Contextual Guidance**. Unlike static guides, VoteRoute uses a logic engine that adapts based on user attributes:
1. **Dynamic Profiling**: Users specify their voter type (General, Overseas, PwD, etc.) and location.
2. **Path Generation**: A specialized engine calculates an 8-step journey tailored to that profile.
3. **Progressive Disclosure**: Information is presented in bite-sized, actionable milestones to prevent cognitive overload.
4. **Hybrid Decision Engine**: A dual-layer logic system (Cloud-based LLM + Local Rule Engine) ensures that users always get reliable advice, even in low-connectivity environments.

## 🛠️ How the Solution Works
The application functions as a smart, stateful assistant:
- **State Management**: Uses TanStack Router and Query to maintain a robust, type-safe state of the user's journey.
- **AI Integration**: **Google Gemini 1.5 Flash** acts as the core brain, providing natural language answers to voting queries and predicting the user's "Readiness Score."
- **Telemetry & Trust**: Every AI interaction and milestone is logged to **Cloud Firestore** and **Cloud Logging**, providing transparency and auditability while the **TrustBar** shows real-time system signals to the user.
- **Privacy First**: Uses Firebase Anonymous Auth to track progress without requiring sensitive PII, keeping user data safe and private.

## 📋 Key Assumptions
1. **ECI Data Patterns**: We assume ECI procedures follow a standard multi-phase lifecycle (Registration, Verification, Polling, Results).
2. **Device Capability**: The app assumes modern browser support for Web Workers and LocalStorage to handle AI logic and state persistence.
3. **Data Freshness**: AI responses are contextually enriched with the current time and state-specific variables provided by the user.

---

## ⚙️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Framework** | [TanStack Start](https://tanstack.com/start) (Vite + React 19) |
| **Language** | TypeScript 5.8 (strict mode, 0 `any` types) |
| **Styling** | Tailwind CSS 4 + Radix UI primitives |
| **AI Engine** | Google Gemini 1.5 Flash (Cloud) + Local Rule Engine (Fallback) |
| **Auth** | Firebase Anonymous Authentication |
| **Database** | Cloud Firestore (interaction logging) |
| **Storage** | Firebase Cloud Storage (document uploads) |
| **Config** | Firebase Remote Config |
| **Messaging** | Firebase Cloud Messaging |
| **Analytics** | Firebase Analytics (milestone events) |
| **Hosting** | Google Cloud Run (containerized) |
| **CI/CD** | Google Cloud Build |
| **Testing** | Vitest 4 (31+ unit tests) |
| **Linting** | ESLint 9 + Prettier |
| **i18n** | i18next (English, Hindi, Marathi, Bengali) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  React UI   │  │  Web Worker  │  │  LocalStorage  │  │
│  │  (TanStack) │◄─┤  AI Engine   │  │  (Profile/     │  │
│  │             │  │              │  │   Progress)    │  │
│  └──────┬──────┘  └──────┬───────┘  └────────────────┘  │
│         │                │                               │
└─────────┼────────────────┼───────────────────────────────┘
          │                │
    ┌─────▼──────┐   ┌─────▼──────┐
    │  Firebase   │   │  Gemini    │
    │  Suite      │   │  API       │
    │ ─ Auth      │   │  (Cloud    │
    │ ─ Firestore │   │   Inference│
    │ ─ Storage   │   │   Primary) │
    │ ─ Analytics │   └─────┬──────┘
    │ ─ FCM       │         │
    │ ─ Remote    │   ┌─────▼──────┐
    │   Config    │   │  Local Rule│
    └─────────────┘   │  Engine    │
                      │  (Fallback)│
                      └────────────┘
```

---

## 🤖 Advanced AI Architecture
- **Cloud Inference (Primary)**: Uses **Google Gemini 1.5 Flash** for sophisticated natural language understanding and context enrichment.
- **Local Rule Engine (Fallback)**: A robust rule-based engine that triggers if cloud services are unreachable, ensuring users are never left without guidance.
- **Main-Thread Efficiency**: The AI engine runs entirely inside **Web Workers**, keeping the UI responsive even during complex predictions.

---

## ☁️ Google Cloud & Firebase Integration
- **Firebase Auth**: Anonymous authentication for secure, privacy-preserving session tracking.
- **Cloud Firestore**: Real-time logging of every AI interaction for auditability.
- **Firebase Storage**: Secure document upload (ID proofs) with user-scoped access rules.
- **Firebase Remote Config**: Live A/B testing and feature flags without redeployment.
- **Firebase Cloud Messaging**: Push notification infrastructure for election reminders.
- **Firebase Analytics**: Custom event tracking for milestone completion.
- **Cloud Run**: Fully containerized deployment on Google Cloud's serverless infrastructure.
- **Cloud Build**: Automated CI/CD pipeline with lint, test, and build steps.
- **Cloud Logging**: Structured JSON logs are automatically ingested for system monitoring.

---

## 🛡️ Production Standards
- **Strict Type Safety**: 100% TypeScript with **0 `any` types** across the entire codebase.
- **Security Headers**: Enterprise-grade protection including **CSP, HSTS, Permissions-Policy, XSS Protection, X-Frame-Options**.
- **XSS Prevention**: HTML escaping in server error pages, input sanitization in the assistant.
- **Path Traversal Protection**: Static file serving validates resolved paths stay within the client directory.
- **Firestore Security Rules**: Schema-validated writes, owner-scoped reads, default deny-all.
- **Accessibility (A11y)**: WCAG 2.1 compliant with ARIA roles, labels, live regions, skip links, and semantic HTML.
- **Comprehensive Testing**: 31+ automated unit tests covering the journey engine, storage, AI predictor, milestones, and services.

---

## 📐 Evaluation Alignment

| Challenge Requirement | Implementation |
|:---|:---|
| **Smart, dynamic assistant** | Hybrid AI engine (Gemini Cloud + Local Rule Engine) with Web Worker offloading |
| **Logical decision making** | Multi-variate context analysis: 5 variables (time, location, progress, voter type, query intent) |
| **Google Services** | Firebase Auth, Firestore, Storage, Analytics, FCM, Remote Config, Gemini API, Cloud Run, Cloud Build |
| **Practical usability** | 8-step ECI-aligned journey with real deadlines, checklists, document lists, and FAQs |
| **Clean code** | 0 `any` types, strict ESLint/Prettier, full JSDoc, modular architecture |
| **Security** | CSP, HSTS, XSS escaping, path traversal guard, Firestore rules with schema validation |
| **Testing** | 31+ unit tests across 6 test suites with edge case coverage |
| **Accessibility** | WCAG 2.1: skip links, ARIA labels, roles, live regions, semantic HTML, focus management |

---

## ✅ Deployment & Verification
```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Environment Variables
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_GEMINI_API_KEY=...
VITE_GOOGLE_MAPS_API_KEY=...
VITE_FIREBASE_VAPID_KEY=...
```

---
*Created for the Prompt Wars Challenge — Final Submission State.*
