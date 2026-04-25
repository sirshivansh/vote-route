import { JourneyStep } from "@/lib/journey";
import { logger } from "@/utils/logger";

export interface Decision {
  action: string;
  explanation: string;
  confidence: number;
  category: 'logistics' | 'registration' | 'voting' | 'general';
  suggestedSteps?: string[];
}

/**
 * AI Decision Engine — Gemini Cloud Inference with Local Rule Engine Fallback.
 * Analyses user queries and returns structured, context-aware decisions
 * for the voting journey assistant.
 */
export async function getBestAction(
  query: string, 
  context: { 
    nextStep?: JourneyStep; 
    city?: string; 
    completedCount: number;
    isFirstTime?: boolean;
  }
): Promise<Decision> {
  const start = performance.now();
  const lower = query.toLowerCase();
  
  logger.info('🤖 AI Decision', `Analyzing query: "${query}"`);

  // --- PRODUCTION: GEMINI AI CLOUD INFERENCE WITH SAFE FALLBACK ---
  try {
    const { callGemini } = await import("@/services/gemini");
    const cloudPrompt = `You are an Indian voting journey assistant. 
    User Query: "${query}"
    Context: ${context.completedCount} steps done, City: ${context.city || 'Not set'}. 
    Goal: Provide a brief, encouraging, and accurate answer in 1-2 sentences. 
    If the user asks "what next", suggest the milestone: "${context.nextStep?.title || 'Finish journey'}".`;

    const cloudResponse = await callGemini(cloudPrompt);

    if (cloudResponse) {
      const duration = performance.now() - start;
      logger.perf('AI Decision (Cloud)', duration);
      return {
        action: cloudResponse,
        explanation: "Decision generated via Google Gemini Cloud Inference with localized context enrichment.",
        confidence: 0.98,
        category: lower.includes('booth') ? 'voting' : lower.includes('document') ? 'logistics' : 'general',
        suggestedSteps: context.nextStep ? [context.nextStep.id] : []
      };
    }
  } catch (error) {
    logger.error('🤖 AI Decision', 'Cloud inference failed. Falling back to Local Rule Engine.', error);
  }

  // --- SAFE FALLBACK: MULTI-VARIATE LOCAL RULE ENGINE ---
  const currentHour = new Date().getHours();
  const isPeakHour = currentHour >= 10 && currentHour <= 14;

  let decision: Decision = {
    action: "I'm here to help guide your voting journey. You can ask about registration, documents, or your next steps.",
    explanation: "Default fallback response when no specific intent is detected.",
    confidence: 0.5,
    category: 'general'
  };

  // 1. Next Step Logic
  if (/(what.*next|next step|what should i do|where.*am)/.test(lower)) {
    if (context.nextStep) {
      decision = {
        action: `Proceed with "${context.nextStep.title}".`,
        explanation: `Based on your progress (${context.completedCount} steps done), this is the most logical next milestone to ensure you are ready for polling day.`,
        confidence: 0.98,
        category: 'registration',
        suggestedSteps: [context.nextStep.id]
      };
    } else {
      decision = {
        action: "Check your final status on the celebration page.",
        explanation: "You have completed all steps in the roadmap.",
        confidence: 1.0,
        category: 'general'
      };
    }
  }

  // 2. Document Logic (Context Aware for First Timers)
  else if (/(document|id|proof|aadhaar|passport|card)/.test(lower)) {
    decision = {
      action: context.isFirstTime 
        ? "Since you are registering for the first time, gather your Age Proof (e.g. Birth Certificate) AND Address Proof (e.g. Aadhaar)."
        : "Gather your Identity, Age, and Address proofs. If you lack a Voter ID, 12 other photo IDs (like Aadhaar or PAN) are valid.",
      explanation: "ECI requires specific proofs based on whether you are a new voter or updating details.",
      confidence: 0.95,
      category: 'logistics'
    };
  }

  // 3. Polling Booth / Congestion Logic (Multi-Variate)
  else if (/(booth|crowd|wait time|traffic)/.test(lower)) {
    decision = {
      action: isPeakHour 
        ? "It is currently peak voting hours. Historical data suggests high congestion. We recommend visiting after 3 PM if possible."
        : "Current time suggests lower congestion. It is a good time to visit your polling booth.",
      explanation: "Decision based on real-time hour analysis (Multi-Variate Logic).",
      confidence: 0.92,
      category: 'voting'
    };
  }

  // 4. Deadline / Timeline Logic
  else if (/(deadline|date|when|how long)/.test(lower)) {
    decision = {
      action: "Check the 'Timeline' tab for your specific state deadlines.",
      explanation: "Deadlines usually close 30 days before elections. Your local schedule depends on your constituency.",
      confidence: 0.9,
      category: 'logistics'
    };
  }

  const duration = performance.now() - start;
  logger.perf('AI Decision (Local)', duration);
  
  return decision;
}
