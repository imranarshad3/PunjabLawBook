"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient, supabaseConfigured } from "@/lib/supabase";

export type AdminAccess = { checked: boolean; isAdmin: boolean; role: string | null };

const SIGNED_OUT: AdminAccess = { checked: true, isAdmin: false, role: null };
const PENDING: AdminAccess = { checked: false, isAdmin: false, role: null };

/**
 * Whether the signed-in person is staff, read from the same `admin_members`
 * row the admin studio and the RLS policies use. A non-member reads zero rows,
 * so this cannot show a door that the database would then refuse to open.
 *
 * It first asks the server to redeem a pending invitation, so somebody who has
 * just accepted an invite lands on the account page already a member.
 */
export function useAdminAccess(): AdminAccess {
  const { isLoaded, isSignedIn, user } = useUser();
  const { session } = useSession();
  const userId = user?.id;
  const [membership, setMembership] = useState<AdminAccess | null>(null);

  const getToken = useCallback(async () => (session ? session.getToken() : null), [session]);
  const canCheck = isLoaded && isSignedIn && supabaseConfigured;

  useEffect(() => {
    if (!canCheck) return;
    const client = createClerkSupabaseClient(getToken);
    if (!client) return;

    let cancelled = false;
    (async () => {
      await fetch("/api/admin/claim", { method: "POST" }).catch(() => null);
      const { data } = await client.from("admin_members").select("role").eq("clerk_user_id", userId!).maybeSingle();
      if (cancelled) return;
      setMembership({ checked: true, isAdmin: Boolean(data), role: data?.role ?? null });
    })();
    return () => {
      cancelled = true;
    };
  }, [canCheck, getToken, userId]);

  if (!isLoaded) return PENDING;
  if (!canCheck) return SIGNED_OUT;
  return membership ?? PENDING;
}
