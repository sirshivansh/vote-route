import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkMilestones, resetMilestones } from "./milestones";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("Milestones System", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("should not trigger milestones when score decreases", () => {
    checkMilestones(50, 40);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it("should trigger milestone when crossing threshold", () => {
    checkMilestones(20, 30);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it("should not trigger same milestone twice", () => {
    checkMilestones(0, 25);
    const callCount = localStorageMock.setItem.mock.calls.length;

    // Simulate calling again with same range
    checkMilestones(20, 30);
    // Should not have been called again since 25 is already shown
    expect(localStorageMock.setItem.mock.calls.length).toBe(callCount);
  });

  it("should reset all milestones", () => {
    resetMilestones();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("vja:milestones-shown");
  });
});
