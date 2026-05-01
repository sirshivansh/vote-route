import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock firebase
vi.mock("./firebase", () => ({
  db: {},
  auth: { currentUser: { uid: "test-uid-123" } },
}));

// Mock firestore functions
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: "mock-doc-id" }),
  serverTimestamp: vi.fn(() => "mock-ts"),
}));

import {
  trackEvent,
  trackAIInteraction,
  trackReadinessChange,
  initAnalyticsSession,
} from "./analytics";

describe("Analytics Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should track a generic event without throwing", async () => {
    await expect(trackEvent("test_event", { key: "value" })).resolves.not.toThrow();
  });

  it("should track AI interaction with correct metadata shape", async () => {
    await expect(
      trackAIInteraction("What documents do I need?", "cloud", 150, 0.95),
    ).resolves.not.toThrow();
  });

  it("should track readiness change with delta calculation", async () => {
    await expect(trackReadinessChange(40, 60, "s3")).resolves.not.toThrow();
  });

  it("should handle tracking failure gracefully", async () => {
    const { addDoc } = await import("firebase/firestore");
    vi.mocked(addDoc).mockRejectedValueOnce(new Error("Network error"));
    // Should not throw even on failure
    await expect(trackEvent("failing_event")).resolves.not.toThrow();
  });

  it("should initialize a session ID in sessionStorage", () => {
    const mockSetItem = vi.fn();
    const mockGetItem = vi.fn().mockReturnValue(null);
    Object.defineProperty(window, "sessionStorage", {
      value: { getItem: mockGetItem, setItem: mockSetItem },
      writable: true,
    });
    initAnalyticsSession();
    expect(mockSetItem).toHaveBeenCalledWith("vr:sid", expect.any(String));
  });
});
