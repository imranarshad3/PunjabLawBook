# Punjab Law Book House — Admin implementation

Updated: 22 October 2026.

## Current implementation pass — approved scope

Continue the existing admin; retain all pre-existing worktree changes. Completion means real persisted operations, not merely a menu item. Modules blocked on credentials remain unchecked.

### Phase 1 — audit / P0
- [x] Re-audit routes, dependencies, catalogue, existing UI, authentication and test harness.
- [x] Recheck configuration: `.env` now contains Clerk/Supabase keys; database/auth SDKs, application schema and admin APIs are not implemented.
- [x] Discover database integrations and inspect connected Supabase project inventory (21 October).
- [ ] Identify intended Supabase project, Clerk application and initial trusted administrator. Connected list contains Catalyst and three unrelated/unidentified inactive projects; no target can safely be inferred. Asked owner; do not modify these projects.
- [ ] Inspect target schema, RLS/grants, storage and existing auth before any migration.

### Phase 2 — shared interface / P1
- [x] Give existing views real routes, direct links, reload and browser history support.
- [x] Collapsible desktop navigation, sticky topbar, accessible mobile navigation and keyboard handling.
- [x] Shared loading and error presentation, consistent ivory/emerald tokens.

### Phase 3 — catalogue / P1
- [x] URL-backed catalogue filters with validated/clamped pagination.
- [x] Product detail inspection with source metadata; do not invent ISBNs, authors, publishers or editions.
- [ ] Inventory availability view, search/filter/export; explicitly distinguish availability from unknown stock quantities.
- [ ] Product/category/author/publisher CRUD, stock adjustments and history — requires protected persistence.

### Phase 4 — commerce / P2
- [ ] Orders, fulfillment, cancellations and supported refunds — requires actual order capture and payment integration.
- [ ] Customer profiles/order history, reviews/moderation and coupon eligibility — requires real records and protected persistence.
- [ ] Sales, revenue, product-view events and date-filtered trends — requires actual event/transaction capture.

### Phase 5 — content / P2
- [x] Media asset browsing and full-size previews using existing book cover files.
- [ ] CMS publishing, uploads/replacement/deletion, shared notifications/read state, settings, team RBAC and audit history — requires verified auth and persistence.

### Phase 6 — verification / P1
- [ ] Typecheck, lint, production build and affected browser tests.
- [ ] Direct routes, filters/history, product detail keyboard behavior, inventory/media and mobile navigation.
- [ ] Desktop/mobile visual inspection and automated accessibility where tooling is available.
- [ ] Update `ADMIN_TEST_REPORT.md` with only checks actually run this pass.

### Production release blockers
No production migrations, deployment or external data changes have been made. No authentication exists to preserve; public views currently contain only already-public catalogue data. Private modules and write operations must remain unavailable until server authorization can be verified.

## Audit

- Next.js 16.4 App Router, React 19.3, TypeScript, custom CSS.
- Storefront product source: `src/data/catalogue.json`, enriched by `src/data/products.ts`.
- Collections source: `src/data/collections.ts`.
- Checkout and account interfaces are previews. Checkout takes no payments and creates no orders.
- Contact and book requests prepare WhatsApp messages; they are not stored in a CRM.
- No database client, schema, migration directory, API route, authentication middleware, Clerk configuration, or RBAC exists in this checkout.
- No authenticated CMS, media library, technical-resource manager, team management, or audit trail exists.
- Current homepage content is authored in React and JSON rather than CMS records.
- Initial admin UI contained explicitly labelled demonstration orders and sales. The revised brief supersedes that approach: remove invented records and local-draft write simulations.
- Connected Supabase inventory did not identify a bookstore project. User is connecting Supabase and Clerk; do not reuse unrelated projects.

## P0 — accurate data and secure foundation

- [x] Audit current code and identify business model.
- [x] Confirm the VELTO brief applies to Punjab Law Book House.
- [x] Remove invented sales, customers, orders, analytics, and placeholder covers.
- [x] Replace headline statistics with real catalogue counts and unavailable states.
- [x] Keep existing storefront behavior intact.
- [ ] Inspect the user-connected Supabase project and Clerk application.
- [ ] Verify server-side identity and implement a deny-by-default admin permission boundary.
- [ ] Inspect existing schema, RLS, grants, storage policies, and auth integration before proposing migrations.
- [ ] Prepare backup/rollback instructions before any database change.
- [ ] Implement and test authenticated writes, role enforcement, and last-owner protection.

## P1 — catalogue and categories

- [x] Catalogue search, category/availability filters, sorting, pagination, CSV export, and storefront preview.
- [x] Actual category/collection counts and relationships.
- [ ] Database-backed CRUD, validation, publication states, variants only if supported, and bulk actions.
- [ ] Category editing, ordering, visibility, dependency-safe deletion.
- [ ] Secure image upload, replacement, and removal.
- [ ] Verify storefront reads published records and invalidates stale content.

## P2 — CMS and operations

- [x] Inventory existing editable pages and sections without adding VELTO chemical content.
- [ ] Database-backed CMS drafts, previews, publishing, versions, and rollback.
- [ ] Capture book enquiries and institutional/bulk requests with customer consent.
- [ ] CRM notes, status, priority, history, assignments, and follow-ups.
- [ ] Customer directory backed by authenticated accounts.
- [ ] Orders only after actual order creation is supported; never invent transaction records.
- [ ] Team invitations, role changes, secure sign-out.
- [ ] Settings and audit logs with server-side authorization.
- [ ] Resource uploads and publication if the bookstore supplies documents.

## P3 — analytics and verification

- [x] Catalogue composition from actual data; correct unavailable states for tracking.
- [ ] Real event ingestion and date-filtered reports after storage/auth is connected.
- [ ] Responsive desktop/tablet/mobile and keyboard checks.
- [x] Focused E2E coverage for implemented functionality.
- [x] TypeScript, full lint, production build.
- [ ] Database persistence, RLS, and unauthorized-access tests.
- [ ] Record real outcomes in `ADMIN_TEST_REPORT.md`.

## Current external dependency

The user is connecting Supabase and Clerk. Production persistence and access-control work cannot be verified until the intended project and application are identifiable and accessible. No deployment, push, or destructive database changes are authorized.

## 22 October connection check

The `.env` Supabase project is not present in the connector inventory. Its public API responds, but `products`, `books` and `admin_members` are absent from the API schema cache. Schema inspection and the first trusted Clerk administrator still need to be resolved; existing keys have been preserved. Fixed callback initialization crash and keyboard pagination conflicts.
