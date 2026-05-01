import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Firebase modules
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({ currentUser: { uid: "test-user-123" } })),
  signInAnonymously: vi.fn().mockResolvedValue({ user: { uid: "anon-123" } }),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: "test-doc-id" }),
  serverTimestamp: vi.fn(() => "mock-ts"),
}));

vi.mock("firebase/analytics", () => ({
  getAnalytics: vi.fn(() => ({})),
  logEvent: vi.fn(),
  isSupported: vi.fn().mockResolvedValue(false),
}));

vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytes: vi.fn().mockResolvedValue({ ref: {} }),
  getDownloadURL: vi.fn().mockResolvedValue("https://example.com/file.jpg"),
}));

vi.mock("firebase/remote-config", () => ({
  getRemoteConfig: vi.fn(() => ({
    settings: {},
    defaultConfig: {},
  })),
  fetchAndActivate: vi.fn().mockResolvedValue(true),
}));

vi.mock("firebase/messaging", () => ({
  getMessaging: vi.fn(() => ({})),
  getToken: vi.fn().mockResolvedValue("mock-token"),
  onMessage: vi.fn(),
}));

vi.mock("firebase/performance", () => ({
  getPerformance: vi.fn(() => ({})),
}));

import { logInteraction, logMilestoneEvent, getSystemStatus } from "./firebase";

describe("Firebase Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should log an interaction without throwing", async () => {
    const decision = {
      action: "Test action",
      explanation: "Test explanation",
      confidence: 0.9,
      category: "general" as const,
      engine: "local" as const,
    };
    await expect(logInteraction("test query", decision)).resolves.not.toThrow();
  });

  it("should log a milestone event without throwing", async () => {
    await expect(logMilestoneEvent("s1")).resolves.not.toThrow();
  });

  it("should return system status with all required fields", () => {
    const status = getSystemStatus();
    expect(status).toHaveProperty("firebase");
    expect(status).toHaveProperty("firestore");
    expect(status).toHaveProperty("storage");
    expect(status).toHaveProperty("auth");
    expect(status).toHaveProperty("remoteConfig");
    expect(status).toHaveProperty("aiCloud");
    expect(status).toHaveProperty("version");
  });

  it("should return version string in system status", () => {
    const status = getSystemStatus();
    expect(typeof status.version).toBe("string");
    expect(status.version).toContain("production");
  });

  it("should handle interaction logging failure gracefully", async () => {
    const { addDoc } = await import("firebase/firestore");
    vi.mocked(addDoc).mockRejectedValueOnce(new Error("Network error"));

    const decision = {
      action: "Test",
      explanation: "Test",
      confidence: 0.5,
      category: "general" as const,
      engine: "local" as const,
    };
    // Should not throw
    await expect(logInteraction("failing query", decision)).resolves.not.toThrow();
  });
});
