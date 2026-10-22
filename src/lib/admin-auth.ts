import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase";

export type AdminRole = "owner" | "admin" | "editor" | "viewer";

/**
 * Resolves the caller's staff membership the same way the database does: a row
 * in `admin_members` for this Clerk user, read under the admin RLS policy. A
 * non-member reads zero rows, so `null` means "not staff" without any second
 * source of truth to keep in sync.
 */
export async function requireAdmin() {
  const { userId, getToken } = await auth();
  if (!userId) return { userId: null, role: null, client: null } as const;

  const client = createClerkSupabaseClient(() => getToken());
  if (!client) return { userId, role: null, client: null } as const;

  const { data } = await client
    .from("admin_members")
    .select("role")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  return { userId, role: (data?.role as AdminRole) ?? null, client } as const;
}
