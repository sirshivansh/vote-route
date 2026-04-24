import { getBestAction } from "./predictor";

self.onmessage = async (e: MessageEvent) => {
  const { id, query, context } = e.data;
  
  try {
    const decision = await getBestAction(query, context);
    self.postMessage({ id, decision });
  } catch (error: any) {
    self.postMessage({ id, error: error.message || "Worker Error" });
  }
};
