import { describe, it, expect } from "vitest";
import { calcReadiness, readinessLabel, getNextStep, getStepById, JourneyStep } from "./journey";

describe("Journey Engine", () => {
  const mockSteps: JourneyStep[] = [
    {
      id: "1",
      phase: "Prepare",
      title: "Step 1",
      shortDesc: "",
      longDesc: "",
      estimate: "",
      weight: 10,
    },
    {
      id: "2",
      phase: "Register",
      title: "Step 2",
      shortDesc: "",
      longDesc: "",
      estimate: "",
      weight: 40,
    },
    {
      id: "3",
      phase: "Vote",
      title: "Step 3",
      shortDesc: "",
      longDesc: "",
      estimate: "",
      weight: 50,
    },
  ];

  it("should calculate 0% readiness when no steps completed", () => {
    expect(calcReadiness([], mockSteps)).toBe(0);
  });

  it("should calculate correct readiness based on weights", () => {
    expect(calcReadiness(["1"], mockSteps)).toBe(10);
    expect(calcReadiness(["1", "2"], mockSteps)).toBe(50);
    expect(calcReadiness(["1", "2", "3"], mockSteps)).toBe(100);
  });

  it("should generate appropriate labels based on score", () => {
    // using mock translations, just checking the tone
    expect(readinessLabel(0).tone).toBe("muted");
    expect(readinessLabel(50).tone).toBe("primary");
    expect(readinessLabel(100).tone).toBe("leaf");
  });

  it("should correctly identify the next step", () => {
    expect(getNextStep(["1"], mockSteps)?.id).toBe("2");
    expect(getNextStep(["1", "2", "3"], mockSteps)).toBeUndefined();
  });

  it("should return undefined for getStepById with non-existent ID", () => {
    expect(getStepById("nonexistent")).toBeUndefined();
  });

  it("should calculate 100% when all steps are completed", () => {
    expect(calcReadiness(["1", "2", "3"], mockSteps)).toBe(100);
  });

  it("should handle empty steps array without crashing", () => {
    expect(calcReadiness([], [])).toBeNaN(); // 0/0 edge case
  });

  // --- NEW TESTS ---

  it("should return the first step when none are completed", () => {
    expect(getNextStep([], mockSteps)?.id).toBe("1");
  });

  it("should skip completed steps when finding next", () => {
    expect(getNextStep(["1", "3"], mockSteps)?.id).toBe("2");
  });

  it("should return correct readinessLabel at boundary values", () => {
    expect(readinessLabel(1).tone).toBe("primary");
    expect(readinessLabel(39).tone).toBe("primary");
    expect(readinessLabel(40).tone).toBe("primary");
    expect(readinessLabel(79).tone).toBe("primary");
    expect(readinessLabel(80).tone).toBe("leaf");
    expect(readinessLabel(99).tone).toBe("leaf");
  });

  it("should ignore completed IDs that don't match any step", () => {
    // Completing a non-existent step ID should not affect readiness
    expect(calcReadiness(["nonexistent"], mockSteps)).toBe(0);
  });

  it("should calculate correct weighted percentage for single step", () => {
    // Only completing the heaviest step (50%) should give 50%
    expect(calcReadiness(["3"], mockSteps)).toBe(50);
    // Only completing the lightest step (10%) should give 10%
    expect(calcReadiness(["1"], mockSteps)).toBe(10);
  });

  it("should return a label object with label and tone properties", () => {
    const result = readinessLabel(50);
    expect(result).toHaveProperty("label");
    expect(result).toHaveProperty("tone");
    expect(["muted", "primary", "leaf"]).toContain(result.tone);
  });
});
