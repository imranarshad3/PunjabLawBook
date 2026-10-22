import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin, type AdminRole } from "@/lib/admin-auth";
import { siteUrl } from "@/lib/site";

const ROLES: AdminRole[] = ["owner", "admin", "editor", "viewer"];
// Only these two may hand out access; editors and viewers manage content, not people.
const CAN_INVITE: AdminRole[] = ["owner", "admin"];

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  const { userId, role, client } = await requireAdmin();
  if (!userId) return fail(401, "Sign in first.");
  if (!role || !client) return fail(403, "This area is for Punjab Law Book House staff.");
  if (!CAN_INVITE.includes(role)) return fail(403, "Only an owner or admin can invite teammates.");

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    fullName?: string;
    role?: string;
  } | null;

  const email = body?.email?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, "Enter a valid email address.");

  const invitedRole = (ROLES.includes(body?.role as AdminRole) ? body!.role : "editor") as AdminRole;
  // Nobody may mint an account more powerful than their own.
  if (invitedRole === "owner" && role !== "owner")
    return fail(403, "Only an owner can invite another owner.");

  const fullName = body?.fullName?.trim() || null;

  // The pending row is written first: it mints the token the Clerk invitation
  // carries, and a row with no invitation is recoverable where the reverse is not.
  const { data: invitation, error: insertError } = await client
    .from("admin_invitations")
    .insert({ email, full_name: fullName, role: invitedRole, invited_by: userId })
    .select("id, token, email, full_name, role, status, created_at")
    .single();

  if (insertError || !invitation)
    return fail(500, insertError?.message || "Could not record the invitation.");

  try {
    const clerk = await clerkClient();
    const created = await clerk.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${siteUrl}/account/register`,
      // Clerk copies this onto the user's public metadata once they sign up,
      // which is how the claim route learns the token without trusting the browser.
      publicMetadata: { plbhInviteToken: invitation.token, plbhRole: invitedRole },
      ignoreExisting: true,
      notify: true,
    });
    await client
      .from("admin_invitations")
      .update({ clerk_invitation_id: created.id })
      .eq("id", invitation.id);
  } catch (caught) {
    await client.from("admin_invitations").delete().eq("id", invitation.id);
    const message =
      caught instanceof Error ? caught.message : "Clerk refused to send the invitation.";
    return fail(502, message);
  }

  return NextResponse.json({ invitation });
}

export async function DELETE(request: Request) {
  const { userId, role, client } = await requireAdmin();
  if (!userId) return fail(401, "Sign in first.");
  if (!role || !client) return fail(403, "This area is for Punjab Law Book House staff.");
  if (!CAN_INVITE.includes(role)) return fail(403, "Only an owner or admin can revoke invitations.");

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return fail(400, "Which invitation?");

  const { data: invitation } = await client
    .from("admin_invitations")
    .select("id, clerk_invitation_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!invitation) return fail(404, "That invitation no longer exists.");

  if (invitation.clerk_invitation_id && invitation.status === "pending") {
    try {
      const clerk = await clerkClient();
      await clerk.invitations.revokeInvitation(invitation.clerk_invitation_id);
    } catch {
      // Already revoked or accepted upstream; the local row still needs closing.
    }
  }

  const { error } = await client
    .from("admin_invitations")
    .update({ status: "revoked" })
    .eq("id", id);

  if (error) return fail(500, error.message);
  return NextResponse.json({ ok: true });
}
