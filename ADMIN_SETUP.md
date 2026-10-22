# Admin connection and rollout

## Current state

`/admin` is a read-only workspace backed by the existing public catalogue. It is not a production administration system yet. It contains no private customer records, write endpoints, or simulated database operations. Old browser-local demo drafts are ignored; they are not imported or deleted.

The storefront remains unchanged. No deployment or Git push has been performed.

## Required connection information

Local `.env` now contains Clerk and Supabase configuration (checked 22 October 2026). The configured Supabase project is absent from the connector inventory; direct API checks could not find `products`, `books`, or `admin_members`. Connect the intended project for schema inspection and identify the initial trusted Clerk administrator. Keys alone do not provision the application schema or grant administrator access.

Remaining setup:

1. Identify the Supabase project reference intended for Punjab Law Book House. Do not reuse an unrelated project simply because it is available.
2. Identify the Clerk application and development instance. Configure secrets through the local environment or hosting dashboard, never source control or chat transcripts.
3. Inspect existing tables, migrations, auth configuration, RLS, storage buckets, and third-party Clerk trust before designing new schema.
4. Confirm who should be the initial administrator using their verified Clerk user identifier. Never grant admin privileges merely because someone is the first signed-in user or has user-editable metadata.
5. Confirm actual workflows: book enquiries currently go to WhatsApp; checkout does not create orders. Preserve that distinction when introducing data capture.

The app currently has a strict Content Security Policy that allows only same-origin connections and disallows frames. Once the specific Clerk and Supabase origins are known, narrowly adjust the policy for the verified integration; do not add wildcard origins.

## Before database changes

- Record the target project reference and inspect existing migration history.
- Export the schema and create an appropriate database backup using the selected project's supported tooling. Confirm restoration procedures and retention before applying changes.
- Rehearse additive migrations against an isolated development database or branch.
- Enable RLS for exposed tables; define both grants and row-level policies. Test unauthenticated users, customers, editors, sales users and administrators separately.
- Keep privileged keys server-side. Verify trusted identity on every sensitive operation.
- Do not apply destructive migrations or delete production records without explicit owner approval.

## Proposed persistence boundaries, subject to schema audit

- Products and categories: existing catalogue IDs retained; draft/published/archived status, validated prices and safe category relationships.
- Collections and CMS: references to real books and existing pages, versioned drafts, published versions, preview authorization and rollback history.
- Enquiries: customer contact details, requested titles/quantity, consent, status, notes and assignments.
- Customer profiles: verified identity mapping and account-owned history.
- Team membership: trusted role records, controlled invitations and last-owner safeguards.
- Media/resources: authenticated uploads, file type and size checks, safe storage paths and publication controls.
- Events/audit: append-only administrative history and actual analytics events, with restricted access to personal information.
- Orders/payments: no schema or revenue dashboard until real transaction capture is implemented and verified.

These are design boundaries, not applied migrations.

## Rollback approach

Before rollout, retain the prior application release and catalogue snapshot. Prefer additive schema changes so the old release remains compatible. If publishing fails, restore the last known published content version rather than deleting records. Roll back the application first, then assess any database recovery with the owner. Never run an automatic destructive down-migration against production.

## Local checks

Use Node.js 24 (available at `/home/net_imran/.nvm/versions/node/v24.22.0/bin/node` on this host). The default shell Node.js 18 cannot run this Next.js version.

```sh
npm run typecheck
npm run lint
npm run build
npm run start
# In another terminal, with Playwright available:
PLAYWRIGHT_MODULE=/absolute/path/to/playwright npm run check:admin
```

`CHECK_URL` overrides the test origin. `ADMIN_SCREENSHOT_DIR` optionally writes desktop/mobile screenshots. The admin test uses an isolated browser context and never changes production data.

The detected Vercel CLI is 59.25.4. Upgrade with `npm i -g vercel@latest` before provisioning through the CLI for compatibility with current integration workflows.
