"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { Glyph } from "./icons";

type Invitation = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: "pending" | "accepted" | "revoked";
  created_at: string;
  accepted_at: string | null;
};

const ROLES = [
  ["editor", "Editor — add and edit books, orders and content"],
  ["viewer", "Viewer — read-only access to the studio"],
  ["admin", "Admin — everything, including inviting teammates"],
  ["owner", "Owner — full control (owners only)"],
] as const;

const when = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
    : "—";

/**
 * Invite a teammate by email. The POST route does the authorising; this only
 * hides the controls an editor or viewer could not use anyway.
 */
export function TeamInvites({ role }: { role: string | null }) {
  const { session } = useSession();
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [invitedRole, setInvitedRole] = useState("editor");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");

  const canInvite = role === "owner" || role === "admin";

  const getToken = useCallback(async () => (session ? session.getToken() : null), [session]);

  const load = useCallback(async () => {
    const client = createClerkSupabaseClient(getToken);
    if (!client) return;
    const { data } = await client
      .from("admin_invitations")
      .select("id, email, full_name, role, status, created_at, accepted_at")
      .order("created_at", { ascending: false })
      .limit(50);
    setInvites((data as Invitation[]) || []);
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  async function invite(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setSent("");
    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, role: invitedRole }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "The invitation could not be sent.");
        return;
      }
      setSent(`Invitation emailed to ${email}.`);
      setEmail("");
      setFullName("");
      await load();
    } catch {
      setError("The invitation could not be sent. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    const response = await fetch(`/api/admin/invite?id=${id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error || "That invitation could not be revoked.");
      return;
    }
    await load();
  }

  const pending = invites.filter((invite) => invite.status === "pending");

  return (
    <section className="plbh-invite">
      <header className="plbh-invite-head">
        <div>
          <h2>Invite a teammate</h2>
          <p>
            We email an invitation link. When they accept and create their account, the
            studio access you chose is applied automatically.
          </p>
        </div>
        <span className="plbh-invite-count">
          {pending.length} pending
        </span>
      </header>

      {canInvite ? (
        <form className="plbh-invite-form" onSubmit={invite}>
          <label>
            Email address
            <input
              type="email"
              required
              placeholder="colleague@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Full name <small>optional</small>
            <input
              type="text"
              placeholder="Their name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </label>
          <label>
            Studio access
            <select value={invitedRole} onChange={(event) => setInvitedRole(event.target.value)}>
              {ROLES.filter(([value]) => value !== "owner" || role === "owner").map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>
          <button type="submit" disabled={busy}>
            <Glyph name="mail" size={16} />
            {busy ? "Sending…" : "Send invitation"}
          </button>
        </form>
      ) : (
        <p className="plbh-invite-note">
          Only an owner or admin can invite teammates. Ask one of them to add the person
          you have in mind.
        </p>
      )}

      {(error || sent) && (
        <p className={`plbh-invite-message ${error ? "is-error" : "is-sent"}`} role="status">
          {error || sent}
        </p>
      )}

      {invites.length > 0 && (
        <ul className="plbh-invite-list">
          {invites.map((invitation) => (
            <li key={invitation.id} data-status={invitation.status}>
              <span className="plbh-invite-who">
                <strong>{invitation.full_name || invitation.email}</strong>
                {invitation.full_name && <small>{invitation.email}</small>}
              </span>
              <span className="plbh-invite-role">{invitation.role}</span>
              <span className="plbh-invite-status">{invitation.status}</span>
              <span className="plbh-invite-date">
                {invitation.status === "accepted"
                  ? `Joined ${when(invitation.accepted_at)}`
                  : `Invited ${when(invitation.created_at)}`}
              </span>
              {canInvite && invitation.status === "pending" ? (
                <button type="button" onClick={() => void revoke(invitation.id)}>
                  Revoke
                </button>
              ) : (
                <span />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
