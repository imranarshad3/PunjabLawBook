import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

/**
 * Anonymous client: sees only what the public RLS policies allow
 * (published books, categories, collections, active banners, settings).
 */
export const supabase = supabaseConfigured
  ? createClient(url!, key!, { auth: { persistSession: false } })
  : null;

/**
 * Client that forwards a Clerk session token, so Postgres sees
 * `auth.jwt() ->> 'sub'` and the admin RLS policies apply.
 * Clerk must be registered as a third-party auth provider in Supabase.
 */
export function createClerkSupabaseClient(getToken: () => Promise<string | null>) {
  if (!supabaseConfigured) return null;
  return createClient(url!, key!, {
    auth: { persistSession: false },
    accessToken: async () => (await getToken()) ?? null,
  });
}
