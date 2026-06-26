import { LemmaClient } from "lemma-sdk";

// Production (Lemma App hosting): window.__LEMMA_CONFIG__ is injected at serve time.
// Local dev: VITE_LEMMA_* env vars are set in .env.
export const client = new LemmaClient({
  apiUrl: import.meta.env.VITE_LEMMA_API_URL || (window as any).__LEMMA_CONFIG__?.apiUrl,
  authUrl: import.meta.env.VITE_LEMMA_AUTH_URL || (window as any).__LEMMA_CONFIG__?.authUrl,
  podId: import.meta.env.VITE_LEMMA_POD_ID || (window as any).__LEMMA_CONFIG__?.podId,
});

let _ready: Promise<unknown> | null = null;

export function initClient(): Promise<unknown> {
  if (!_ready) _ready = client.initialize();
  return _ready;
}
