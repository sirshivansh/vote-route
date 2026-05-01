import { getBestAction } from "./predictor";

self.onmessage = async (e: MessageEvent) => {
  const { id, query, context } = e.data;

  try {
    const decision = await getBestAction(query, context);
    self.postMessage({ id, decision });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Worker Error";
    self.postMessage({ id, error: message });
  }
};
