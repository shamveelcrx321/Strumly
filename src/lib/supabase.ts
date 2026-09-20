import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_URL"]) ||
  (typeof process !== "undefined" ? process.env["VITE_SUPABASE_URL"] : undefined);
const supabasePublishableKey =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_PUBLISHABLE_KEY"]) ||
  (typeof process !== "undefined" ? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] : undefined);

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * SSR-safe Supabase client.
 *
 * TanStack Start renders pages on the server where `window` / `localStorage`
 * do not exist.  Without an explicit storage adapter the supabase-js default
 * picks up an in-memory store on the server, so any session written during
 * a client-side `signInWithPassword` call is invisible to subsequent SSR
 * renders — making the user appear logged-out immediately after login.
 *
 * Fixes applied:
 *  1. `storage` – use `window.localStorage` when available (client), or a
 *     no-op in-memory stub on the server.  This ensures the session token
 *     written during login survives client-side navigations and page reloads.
 *  2. `detectSessionInUrl: false` – prevents supabase-js from trying to
 *     parse `window.location` (which throws on the server) during the
 *     INITIAL_SESSION check.
 *  3. `autoRefreshToken: true` / `persistSession: true` – kept explicitly so
 *     the session remains alive across the browser session.
 */
const isBrowser = typeof window !== "undefined";

// Minimal localStorage-compatible stub for server-side rendering.
const serverStorage = {
  getItem: (_key: string): string | null => null,
  setItem: (_key: string, _value: string): void => {},
  removeItem: (_key: string): void => {},
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: isBrowser ? window.localStorage : serverStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});