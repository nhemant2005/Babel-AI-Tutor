import { LemmaClient } from "lemma-sdk";

export const client = new LemmaClient({
  apiUrl: import.meta.env.VITE_LEMMA_API_URL,
  authUrl: import.meta.env.VITE_LEMMA_AUTH_URL,
  podId: import.meta.env.VITE_LEMMA_POD_ID,
});

let _ready: Promise<unknown> | null = null;

export function initClient(): Promise<unknown> {
  if (!_ready) _ready = client.initialize();
  return _ready;
}
