import { LemmaClient } from "lemma-sdk";

// Production (Lemma App): window.__LEMMA_CONFIG__ injected at serve time.
// Local dev: VITE_LEMMA_* env vars from .env.
export const client = new LemmaClient({
  apiUrl: (window as any).__LEMMA_CONFIG__?.apiUrl || import.meta.env.VITE_LEMMA_API_URL,
  authUrl: (window as any).__LEMMA_CONFIG__?.authUrl || import.meta.env.VITE_LEMMA_AUTH_URL,
  podId: (window as any).__LEMMA_CONFIG__?.podId || import.meta.env.VITE_LEMMA_POD_ID,
});

let _ready: Promise<unknown> | null = null;

export function initClient(): Promise<unknown> {
  if (!_ready) _ready = client.initialize();
  return _ready;
}
