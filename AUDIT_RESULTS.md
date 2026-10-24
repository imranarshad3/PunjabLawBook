# Punjab Law Book House audit — 24 October 2026

Status: local fixes and executed checks are ready for review. This is **not a production-ready certification**. Production writes, pushes and deployments were not authorized by the audit request and were not performed.

## Executed checks

| Area | Result | Evidence / limit |
| --- | --- | --- |
| Admin routes | PASS | 13 module pages loaded; no horizontal overflow at desktop width. Dashboard received an initial smoke check. |
| Admin controls | PASS | Search by ID, reload-preserved URL search, category filtering, select-all; empty book/category saves rejected before writes. |
| Admin CRUD via browser | BLOCKED | Browser is connected to the real store. No real book/customer/CMS/team mutations or uploads were made. Needs isolated staging. |
| Public HTTP | PASS | 19 routes return 200; security headers; signed-out admin redirect; invite POST/DELETE and claim POST reject unauthenticated calls with 401. |
| Customer browser | PASS | 17 routes loaded; search suggestions and keyboard destination; dropdown opens/closes with Escape; saved-book persistence; cart quantity 1→2 totals Rs. 3,570→7,140; checkout rejects missing required fields. No order submitted. |
| Mobile | PASS | 375px: products, product detail, cart, checkout, account, contact, books, inventory, content, settings, team and analytics had no document overflow. |
| Fresh database migrations | PASS locally | Every migration applied to a new network-isolated PostgreSQL 17 container. Local auth.jwt stub exercises policies, not Clerk cryptographic verification. Container removed after each run. |
| RBAC / database integrity | PASS locally | Viewer cannot edit books/settings/roles; editor can edit books but cannot promote itself. Negative-stock adjustments roll back. |
| Checkout / concurrency | PASS locally | Same request UUID returns one order; simultaneous retries deduct stock once; changed payload rejected; stock shortage rolls back. |
| Shipping / promotions | PASS locally | Flat fee, free-delivery threshold, rounded percentage discount, usage limit, failed-code rollback, cancellation usage release. |
| Orders / cancellation | PASS locally | Guarded status transitions, cancellation stock restored once, terminal orders cannot reopen; customer can cancel only their own pending order. Refund status does not automatically mark physical goods as returned. |
| Gallery / reviews / categories / CMS | PASS locally | Atomic gallery replacement; invalid save preserves existing images; non-admin gallery denial; pending/approved review visibility; non-empty category FK; CMS draft isolation and publication visibility. |
| Build / regression | PASS | Next production build (61 routes), TypeScript, ESLint src/scripts, git diff --check, logic tests, HTTP tests and final database suite executed. |
| Dependencies | PASS | npm audit and npm audit --omit=dev both returned zero vulnerabilities. |
| Full provider / financial E2E | BLOCKED | No OTP/reset, invitation email, production-role changes, real order, online payment or financial refund was executed. Online payment remains intentionally excluded. |

## Confirmed defects fixed locally

- Membership-only RLS let viewers/editors modify team roles. Added role-specific database policies and matching client mutation checks; actual role lookup now filters the signed-in user.
- Checkout retries could duplicate orders/stock deductions. Added a request UUID, transaction lock and payload fingerprint; the browser retains a non-PII retry key through refresh.
- Checkout ignored saved shipping charges and promotion codes. Added authoritative SQL calculations and a checkout code field; confirmation displays the returned total.
- Status changes had no lifecycle/stock restoration contract. Added transition guards, exact-once cancellation returns and customer-owned pending cancellation.
- Inventory adjustments silently clamped invalid negative counts; uncounted titles had misleading +/- controls. Added validation and visible operation errors.
- Analytics loaded only 200 orders/500 lines and monthly buckets could run backwards. Added paginated reads and chronological month ordering; order value is not labelled collected revenue.
- Editorial titles/images and generic detail text overrode live book edits. Live title, cover, author, publisher, description, language, ISBN and SEO fields now flow into the storefront; unassigned subjects stay Uncategorised.
- Configured backend failures could silently show repository demo books. Live catalogue failures now surface an error/retry state; production requires Supabase.
- Enquiry save failures were swallowed. Added submission state and explicit WhatsApp fallback errors; public enquiry policy cannot set handled staff state.
- Historical migration script replayed every old schema file. It now uses Supabase history-aware push and refuses implicit catalogue seeding.
- Legacy browser scripts assumed demo data/obsolete controls. Updated them to authenticated staging smoke checks and public route checks. These standalone Playwright scripts were not executed in this session; actual browser checks used the connected browser tools.

## Pending release gate

New migration: `supabase/migrations/20261024014800_audit_rbac_order_integrity.sql`.

Do not deploy the new checkout client before applying this migration: it introduces the request-ID RPC argument and customer cancellation RPC. Older clients remain compatible with the new optional argument.

1. Obtain approval and a database backup before production migration.
2. Reconcile the store's older manually applied migration history; do not replay historical files or use --include-all blindly.
3. Apply the reviewed new migration, verify live policies/RPCs, then deploy the matching code.
4. Connect an isolated staging Supabase/Clerk environment for full browser create/edit/publish/upload/order/status/cancellation tests.
5. Complete Clerk production-domain setup when a custom domain is available; verify OTP/reset and invitation delivery manually in staging.

Source security review coverage is partial. The Codex Security report covers the original working-tree snapshot and records one high-severity staff role escalation finding; local remediation is tested but production application is pending. No independent audit worker was used.

## Repeatable checks

- `npm test` — logic regression tests.
- `npm run test:db` — disposable Docker PostgreSQL migration/integration/concurrency tests; never loads .env or contacts production.
- `npm run test:http` — read-only route/security/API-auth checks against CHECK_URL (defaults to localhost:3001).
- `npm run check:admin` — optional standalone Playwright staging smoke test; requires PLAYWRIGHT_MODULE and PLAYWRIGHT_STORAGE_STATE. No authentication bypass.
- `npm run lint`, `npm run typecheck`, `npm run build`.

Test cart/saved-book changes were removed. Disposable database containers were removed. Working changes remain local and uncommitted.
