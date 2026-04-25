import { logger } from "@/utils/logger";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Calls the Google Gemini API for cloud-based AI inference.
 * Implements a clean singleton-like fetch pattern.
 */
export async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    logger.error('☁️ System', 'Gemini API Key is missing or default. Falling back to Local Engine.');
    return null;
  }

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (result) {
      logger.info('☁️ System', 'Cloud inference successful via Gemini API');
      return result;
    }
    
    return null;
  } catch (error) {
    logger.error('☁️ System', 'Gemini API call failed', error);
    return null;
  }
}
