import { describe, it, expect, vi, beforeEach } from "vitest";
import { callGemini, type ConversationTurn } from "./gemini";

// Mock global fetch
global.fetch = vi.fn();

describe("Gemini Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle successful API response", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: "Hello from Gemini" }],
              },
            },
          ],
        }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    const result = await callGemini("test prompt", "valid-key");
    expect(result).toBe("Hello from Gemini");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should return null on API error (non-ok response)", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    const result = await callGemini("test prompt", "valid-key");
    expect(result).toBeNull();
  });

  it("should return null on fetch exception", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network failure"));

    const result = await callGemini("test prompt", "valid-key");
    expect(result).toBeNull();
  });

  it("should return null if API key is missing or placeholder", async () => {
    const result = await callGemini("test", "your_gemini_api_key_here");
    expect(result).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should correctly format conversation history", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [{ content: { parts: [{ text: "Response" }] } }],
        }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    const history = [
      { role: "user", text: "Hi" },
      { role: "assistant", text: "Hello" },
    ] as const;

    await callGemini("What next?", "valid-key", history as unknown as ConversationTurn[]);

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);

    expect(body.contents).toHaveLength(3);
    expect(body.contents[0].role).toBe("user");
    expect(body.contents[1].role).toBe("model");
    expect(body.contents[2].role).toBe("user");
  });
});
