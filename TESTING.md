# Testing Strategy — VoteRoute

## Overview

VoteRoute uses **Vitest** for unit testing, with test files co-located alongside their source modules.

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

## Test Suite

| Module                 | File                         | Tests | Coverage                                                  |
| :--------------------- | :--------------------------- | :---: | :-------------------------------------------------------- |
| **AI Decision Engine** | `src/ai/predictor.test.ts`   |   5   | Cloud inference mock, local rule engine, intent detection |
| **Journey Engine**     | `src/lib/journey.test.ts`    |   4   | Readiness calc, label generation, next-step logic         |
| **Storage Library**    | `src/lib/storage.test.ts`    |   5   | Profile CRUD, step toggle, localStorage mocking           |
| **Milestones System**  | `src/lib/milestones.test.ts` |   4   | Threshold triggers, deduplication, reset logic            |

## Testing Approach

### Unit Tests

- **Pure functions** tested in isolation with mocked dependencies
- **localStorage** mocked via `vi.fn()` to simulate browser storage
- **External APIs** (Gemini) mocked to ensure tests are deterministic and fast

### Key Patterns

1. **Gemini Mock**: The predictor test mocks `@/services/gemini` to return `null`, forcing the local rule engine path. This ensures tests remain fast and offline-capable.
2. **localStorage Mock**: Storage and milestone tests use a custom in-memory mock to avoid JSDOM limitations.
3. **Sonner Mock**: Toast notifications are mocked to verify milestone triggers without DOM rendering.

## Adding New Tests

1. Create a `*.test.ts` file next to the module
2. Import from `vitest` (`describe`, `it`, `expect`, `vi`)
3. Mock external dependencies at the top of the file
4. Follow the existing patterns for consistency
