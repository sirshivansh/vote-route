# 🗳️ VoteRoute — Production-Grade Civic Dashboard

VoteRoute is a high-fidelity, AI-driven civic dashboard designed to help citizens navigate the election process with absolute clarity. Built for production-grade reliability, it transforms complex Election Commission of India (ECI) data into a personalized, accessible roadmap.

## 🚀 Live Demo
**URL:** [https://vote-route-444118208432.asia-south1.run.app](https://vote-route-444118208432.asia-south1.run.app)

---

## 💡 The Problem & Approach
Traditional election guides are often dense, state-specific, and hard to navigate for first-time voters. VoteRoute reduces this **"Civic Friction"** by:
1. **Dynamic Roadmapping**: Generating a personalized 8-step journey based on user context.
2. **AI Assistance**: Providing instant, context-aware answers in plain English.
3. **Visibility First**: Showing real-time system signals (logs/status) to build trust.

---

## 🤖 Advanced AI Architecture
The heart of VoteRoute is a hybrid decision engine designed for 100% uptime:

- **Cloud Inference (Primary)**: Uses **Google Gemini 1.5 Flash** for sophisticated natural language understanding and context enrichment.
- **Local Rule Engine (Fallback)**: A robust rule-based engine that triggers if cloud services are unreachable, ensuring users are never left without guidance.
- **Context-Aware Decisions**: Analyzes 5+ variables (Profile, City, Journey Progress, Voter Type, Time-of-Day) before generating actions.
- **Main-Thread Efficiency**: The AI engine runs entirely inside **Web Workers**, keeping the UI responsive even during complex predictions.

---

## ☁️ Google Cloud & Firebase Integration
VoteRoute is fully integrated with Google's production ecosystem:

- **Firebase Auth**: Anonymous authentication for secure, privacy-preserving session tracking.
- **Cloud Firestore**: Real-time logging of every AI interaction for auditability.
- **Firebase Analytics**: Tracks milestone conversions (e.g., registration completion).
- **Cloud Run**: Fully containerized deployment on Google Cloud's serverless infrastructure.
- **Cloud Logging**: Structured JSON logs are automatically ingested for system monitoring.

---

## 🛡️ Production Standards
- **Strict Type Safety**: 100% TypeScript with **0 `any` types** across the entire codebase.
- **Security Headers**: Enterprise-grade protection including **CSP, HSTS, Permissions-Policy, and XSS Protection**.
- **Rate Limiting**: Integrated client-side throttlers to prevent AI service abuse.
- **Accessibility (A11y)**: WCAG 2.1 compliant with ARIA live regions, skip links, and semantic HTML.
- **Comprehensive Testing**: 18+ automated unit tests covering the journey engine, storage, AI predictor, and milestones.

---

## 🛠️ Tech Stack
- **Framework**: TanStack Start (Vite + React)
- **State/Routing**: TanStack Router + Query
- **Styling**: Vanilla CSS + Tailwind
- **Icons/UI**: Lucide React + Radix UI
- **Testing**: Vitest + JSDom
- **Runtime**: Node.js (Nitro Server)

---

## ✅ Deployment & Verification
To run the project locally or verify the build:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

---
*Created for the Prompt Wars Challenge — Final Submission State.*
