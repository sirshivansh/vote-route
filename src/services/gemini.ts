import { logger } from "@/utils/logger";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * System instruction for the Gemini model — establishes the persona and rules.
 * Using the dedicated systemInstruction field provides better guardrails than prompt injection.
 */
const SYSTEM_INSTRUCTION = `You are VoteRoute, a friendly, authoritative Indian voting journey assistant.

## Rules
- Be encouraging, accurate, and concise (1-3 sentences max).
- Always cite Election Commission of India (ECI) procedures when relevant.
- If you are unsure about a specific date or local rule, say so honestly and recommend visiting voters.eci.gov.in.
- Use plain language. Avoid legal jargon.
- If the user is a first-time voter, proactively mention age proof requirements (Birth Certificate or school records).
- Never discuss political parties, candidates, or suggest who to vote for.
- Always end with an actionable next step.`;

/**
 * Conversation message format for multi-turn context.
 */
export interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
}

/**
 * Calls the Google Gemini API for cloud-based AI inference.
 * Supports multi-turn conversation context and dedicated system instructions.
 * @param prompt - The current user query.
 * @param overrideKey - Optional API key override (used by Web Worker).
 * @param history - Optional conversation history for multi-turn context.
 */
export async function callGemini(
  prompt: string,
  overrideKey?: string,
  history?: ConversationTurn[],
): Promise<string | null> {
  const activeKey = (overrideKey || GEMINI_API_KEY)?.trim();

  if (!activeKey || activeKey === "your_gemini_api_key_here") {
    logger.error(
      "☁️ System",
      "Gemini API Key is missing or default. Falling back to Local Engine.",
    );
    return null;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeKey}`;

  // Build multi-turn contents array
  const contents = [];

  // Add conversation history if available (last 4 turns for context window efficiency)
  if (history && history.length > 0) {
    for (const turn of history.slice(-4)) {
      contents.push({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: turn.text }],
      });
    }
  }

  // Add the current query
  contents.push({
    role: "user",
    parts: [{ text: prompt }],
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
          topP: 0.8,
          topK: 40,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (result) {
      logger.info("☁️ System", "Cloud inference successful via Gemini 2.0 Flash");
      return result;
    }

    return null;
  } catch (error) {
    logger.error("☁️ System", "Gemini API call failed", error);
    return null;
  }
}
