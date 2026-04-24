# Testing Plan - VoteRoute Assistant

This document outlines the testing strategy to ensure the VoteRoute Assistant is robust, accurate, and performant.

## 🧪 1. Functional Test Cases

| Scenario | Input Query | Expected Output | Logic Check |
| :--- | :--- | :--- | :--- |
| **Normal Case** | "What do I do next?" | Exact next milestone in the journey. | Matches `completedCount` to `JOURNEY` array. |
| **Edge Case** | "aadhaar card vs passport" | Guidance on identity and address proofs. | Pattern matching for document keywords. |
| **Invalid Input** | "random gibberish 123" | Fallback guidance about voting journey. | Confidence score < 0.5 triggers default. |
| **Extreme Case** | "Deadline for election tomorrow" | Urgency warning + Timeline link. | Deadline keyword extraction. |
| **Contextual** | "My city" | "Your registered location is [City]." | Injects `profile.city` into decision action. |

---

## ⚡ 2. Performance Testing
- **Target**: AI Decision latency < 150ms.
- **Metric**: Measured via `performance.now()` in `predictor.ts`.
- **Visibility**: Displayed in the `MetricsPanel` in real-time.

---

## 🔒 3. Security & Validation
- **Input Sanitization**: Ensure queries are trimmed and lowered before processing.
- **Error Boundaries**: Try/Catch blocks in `assistant.tsx` prevent app crashes on AI failure.
- **Auth Integrity**: Verify `auth.currentUser` is present before logging to Firestore.

---

## ♿ 4. Accessibility Checklist (WAI-ARIA)
- [x] **Buttons**: All buttons have `aria-label` or clear text content.
- [x] **Live Regions**: Status updates use `role="status"` for screen readers.
- [x] **Keyboard**: Full Tab-index support for chat and navigation.
- [x] **Contrast**: OKLCH colors verified for AA/AAA compliance.

---

## 📈 5. Load & Stress Test
- **Simulation**: Rapid clicking of "Suggested Questions".
- **Result**: `isThinking` state prevents duplicate concurrent processing, maintaining system stability.
