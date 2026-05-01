import { describe, it, expect, vi } from "vitest";

// Mock the Gemini service to return null so the local engine is always used in tests
vi.mock("@/services/gemini", () => ({
  callGemini: vi.fn().mockResolvedValue(null),
}));

import { getBestAction } from "./predictor";

describe("AI Predictor Engine", () => {
  it("should default to general category on unknown intent", async () => {
    const decision = await getBestAction("random text", { completedCount: 0 });
    expect(decision.category).toBe("general");
    expect(decision.confidence).toBeLessThan(0.6);
  });

  it("should detect context-aware document queries for first-time voters", async () => {
    const decision = await getBestAction("What ID do I need?", {
      completedCount: 0,
      isFirstTime: true,
    });
    expect(decision.category).toBe("logistics");
    expect(decision.action).toContain("Birth Certificate");
  });

  it("should identify polling booth queries", async () => {
    const decision = await getBestAction("Is there a crowd at the booth?", { completedCount: 4 });
    expect(decision.category).toBe("voting");
    expect(decision.confidence).toBeGreaterThan(0.9);
  });

  it("should recommend next step if asked", async () => {
    const nextStep = {
      id: "test-1",
      phase: "Prepare" as const,
      title: "Verify Details",
      shortDesc: "Test desc",
      longDesc: "",
      estimate: "",
      weight: 10,
    };
    const decision = await getBestAction("what next", { nextStep, completedCount: 1 });
    expect(decision.category).toBe("registration");
    expect(decision.action).toContain("Verify Details");
    expect(decision.suggestedSteps).toEqual(["test-1"]);
  });

  it("should handle deadline queries", async () => {
    const decision = await getBestAction("When is the deadline?", { completedCount: 2 });
    expect(decision.category).toBe("logistics");
    expect(decision.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it('should handle "what next" when journey is complete', async () => {
    const decision = await getBestAction("what next", { completedCount: 8 });
    expect(decision.action).toContain("celebration");
    expect(decision.confidence).toBe(1.0);
  });

  it("should handle empty query gracefully", async () => {
    const decision = await getBestAction("", { completedCount: 0 });
    expect(decision.category).toBe("general");
    expect(decision.action).toBeDefined();
    expect(decision.action.length).toBeGreaterThan(0);
  });

  it("should detect registration queries", async () => {
    const decision = await getBestAction("How do I register to vote?", {
      completedCount: 0,
      isFirstTime: true,
    });
    expect(decision.action).toBeDefined();
    expect(decision.confidence).toBeGreaterThan(0.4);
  });

  it("should produce consistent engine field for local fallback", async () => {
    const decision = await getBestAction("tell me about deadlines", { completedCount: 3 });
    expect(decision.engine).toBe("local");
    expect(decision.category).toBe("logistics");
  });
});
