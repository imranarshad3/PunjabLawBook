-- Invite teammates by email.
--
-- An invited person has no Clerk account yet, so there is no `clerk_user_id` to
-- put in `admin_members`. This table holds the intent until they sign up. The
-- single-use `token` travels with the Clerk invitation (as invitation metadata,
-- which Clerk copies to the new user's public metadata) and is the only thing
-- that can turn the intent into membership.

create table if not exists public.admin_invitations (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null,
  full_name           text,
  role                text not null default 'editor'
                      check (role in ('owner', 'admin', 'editor', 'viewer')),
  token               uuid not null unique default gen_random_uuid(),
  clerk_invitation_id text,
  status              text not null default 'pending'
                      check (status in ('pending', 'accepted', 'revoked')),
  invited_by          text,
  created_at          timestamptz not null default now(),
  accepted_at         timestamptz
);

create index if not exists admin_invitations_email_idx on public.admin_invitations (lower(email));

alter table public.admin_invitations enable row level security;

drop policy if exists admin_invitations_admin_all on public.admin_invitations;
create policy admin_invitations_admin_all on public.admin_invitations
  for all using (public.is_admin()) with check (public.is_admin());

-- Redeem an invitation for the caller.
--
-- `security definer` because the caller is, by definition, not staff yet -- the
-- admin policies would refuse both the read and the insert. The grant is safe
-- because membership is bound to `public.clerk_user_id()`, taken from the
-- caller's own JWT and never from an argument: possessing the token lets you
-- make *yourself* staff, exactly like following the invite link, and nobody
-- else. Tokens are random v4 uuids and burn on first use.
create or replace function public.claim_admin_invitation(
  p_token     uuid,
  p_email     text default null,
  p_full_name text default null
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  invitation public.admin_invitations;
  uid        text := public.clerk_user_id();
begin
  if uid is null or uid = '' then
    return false;
  end if;

  select * into invitation
    from public.admin_invitations
   where token = p_token and status = 'pending'
     for update;

  if not found then
    return false;
  end if;

  insert into public.admin_members (clerk_user_id, email, full_name, role)
  values (uid,
          coalesce(nullif(p_email, ''), invitation.email),
          coalesce(nullif(p_full_name, ''), invitation.full_name),
          invitation.role)
  on conflict (clerk_user_id) do update
    set role       = excluded.role,
        email      = coalesce(excluded.email, public.admin_members.email),
        full_name  = coalesce(excluded.full_name, public.admin_members.full_name),
        updated_at = now();

  update public.admin_invitations
     set status = 'accepted', accepted_at = now()
   where id = invitation.id;

  return true;
end $$;

revoke all on function public.claim_admin_invitation(uuid, text, text) from public;
grant execute on function public.claim_admin_invitation(uuid, text, text) to authenticated;
