import { LemmaClient } from "lemma-sdk";

// Lemma hosting injects window.__LEMMA_CONFIG__ with apiUrl + podId.
// For local dev, set VITE_LEMMA_API_URL / VITE_LEMMA_POD_ID in .env.
export const client = new LemmaClient({
  apiUrl: import.meta.env.VITE_LEMMA_API_URL,
  authUrl: import.meta.env.VITE_LEMMA_AUTH_URL,
  podId: import.meta.env.VITE_LEMMA_POD_ID,
});
