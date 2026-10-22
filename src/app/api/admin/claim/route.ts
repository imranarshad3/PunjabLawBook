import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase";

/**
 * Turns an accepted invitation into staff membership.
 *
 * The token is read from the user's Clerk public metadata -- written by Clerk
 * from the invitation we created, never by the browser -- so the client cannot
 * nominate itself. `claim_admin_invitation` then binds the membership to the
 * `sub` in the caller's own JWT. Safe to call on every visit: it is a no-op
 * once the invitation is spent.
 */
export async function POST() {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ promoted: false }, { status: 401 });

  const user = await currentUser();
  const token = user?.publicMetadata?.plbhInviteToken;
  if (typeof token !== "string" || !token) return NextResponse.json({ promoted: false });

  const client = createClerkSupabaseClient(() => getToken());
  if (!client) return NextResponse.json({ promoted: false });

  const { data, error } = await client.rpc("claim_admin_invitation", {
    p_token: token,
    p_email: user?.primaryEmailAddress?.emailAddress ?? null,
    p_full_name: user?.fullName ?? null,
  });

  if (error) return NextResponse.json({ promoted: false, error: error.message }, { status: 500 });
  return NextResponse.json({ promoted: Boolean(data) });
}
