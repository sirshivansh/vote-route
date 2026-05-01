import { describe, it, expect, vi } from "vitest";
import { logger } from "./logger";

describe("Logger Utility", () => {
  it("should format info logs as valid JSON", () => {
    const spy = vi.spyOn(console, "log");
    logger.info("☁️ System", "Test message", { key: "value" });

    expect(spy).toHaveBeenCalled();
    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.severity).toBe("INFO");
    expect(output.message).toContain("Test message");
    expect(output.metadata.key).toBe("value");
    spy.mockRestore();
  });

  it("should format error logs with stack traces", () => {
    const spy = vi.spyOn(console, "error");
    const error = new Error("Test Error");
    logger.error("🔥 Firestore", "Failed operation", error);

    expect(spy).toHaveBeenCalled();
    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.severity).toBe("ERROR");
    expect(output.error).toBe("Test Error");
    expect(output.stack).toBeDefined();
    spy.mockRestore();
  });

  it("should log performance metrics", () => {
    const spy = vi.spyOn(console, "log");
    logger.perf("Operation X", 123.456);

    expect(spy).toHaveBeenCalled();
    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.category).toBe("⚡ Performance");
    expect(output.duration_ms).toBe(123.456);
    spy.mockRestore();
  });
});
