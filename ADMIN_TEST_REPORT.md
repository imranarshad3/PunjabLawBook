# Verification update — 22 October 2026

- Fixed `AdminWorkspace` callback initialization: `updateFilters` and `clearSelection` are now declared before the pagination callback dependency array reads them.
- Pagination clamps its target to valid bounds. Arrow shortcuts ignore editable fields, modifiers, mobile navigation and open dialogs.
- Typecheck, lint and production build pass (52 generated pages). Browser verification passes: 12 admin views at five widths (320, 375, 768, 1024, 1440 px), all direct module routes, catalogue search/filters/sorting/pagination, CSV export, category drill-down, previews/assets, stale draft isolation and no browser runtime errors. Arrow keys in the search input preserve the current page. The harness now waits for route/filter updates and counts visible headings because Next.js retains inactive route DOM.
- `.env` contains Clerk and Supabase configuration. No secret values were printed or added to source.
- Direct Supabase API checks reached the configured project; `products`, `books` and `admin_members` each returned PGRST205 (absent from the API schema cache). This does not prove other schemas are empty.
- The configured project is absent from the connected Supabase project's inventory. Schema/permissions inspection and the initial trusted Clerk administrator remain required before protected writes can be completed.

The previous report below describes an earlier verification pass, not proof that the full production admin is complete.

# Admin verification report

Date: 20 October 2026

## Scope and result

The delivered interface is a read-only admin foundation using actual public catalogue records. **The complete production admin system is not finished.** Database writes, authentication, permissions, CMS publishing and CRM remain blocked on the Supabase/Clerk connection being prepared by the owner.

No invented sales, orders, customers or analytics remain in this admin interface. Existing browser-local demo drafts are ignored. No live database records have been changed.

## Verified checks

| Check | Status | Actual result |
|---|---|---|
| TypeScript | PASS | `npm run typecheck` exited 0; production build also typechecked successfully. |
| Repository lint | PASS | `npm run lint` exited 0. |
| Production build | PASS | Node 24, Next.js 16.4; all 40 generated pages completed, including `/admin`. |
| Admin route | PASS | HTTP 200. |
| Real catalogue metrics | PASS | 11 source books, 7 subject categories, 11 available titles, 5 collections. |
| Stale demo draft isolation | PASS | Injected browser-local draft did not override source data or appear in export. |
| Catalogue search | PASS | Searching book ID 5966 returns the matching source title. |
| Pagination | PASS | First page has 8 books, second has 3; boundary controls disabled appropriately. |
| Category filter | PASS | Exam Guides returns the 4 linked books. |
| Availability filter | PASS | Out-of-stock count matches source data; currently zero. |
| Sorting | PASS | Ascending/descending price selects the expected source titles. |
| Empty state and reset | PASS | Unmatched search displays the empty state; reset restores books. |
| Filtered CSV | PASS | Export contains the four filtered books plus header, no invented draft. |
| Category drill-down | PASS | Subject tiles and overview composition bars select the correct catalogue filter. |
| Page previews | PASS | All 9 listed content-page links return HTTP 200. |
| Book previews and images | PASS | All 11 source product URLs and cover assets return HTTP 200. |
| Responsive layouts | PASS | All 10 views checked at 320, 375, 768, 1024 and 1440 px; no document overflow. Tables scroll within their container. |
| Mobile navigation | PASS | Each view opens through the mobile navigation and closes the menu. |
| Browser runtime | PASS | No page errors during the completed functional suite. |
| Visual review | PASS | Inspected 1440 px desktop and 375 px mobile screenshots. |
| Keyboard skip navigation | PASS | First Tab reaches the skip link; Enter focuses main content in production. |
| Automated accessibility | PENDING | Production WCAG A/AA audit in progress. |
| Database persistence | SKIP | Intended Supabase connection not yet available; no mock persistence used. |
| Clerk login/sign-out | SKIP | Clerk application is being connected. |
| RBAC, RLS, unauthorized access | SKIP | No authenticated routes, database schema or policies available to test. |
| CRUD, CMS publishing, uploads, audit history | SKIP | Protected backend operations not implemented or represented as working. |
| Real orders, payments, revenue | SKIP | Existing business flow does not capture orders/payments. |
| Deployment | SKIP | Owner approval required; no deployment or push performed. |

## Commands

The default shell uses Node 18; Next.js requires a newer version. Build and browser tests used the installed Node 24 runtime.

```sh
npm run typecheck
npm run lint
/home/net_imran/.nvm/versions/node/v24.22.0/bin/node node_modules/next/dist/bin/next build
PLAYWRIGHT_MODULE=/absolute/path/to/playwright npm run check:admin
```

The E2E script is `scripts/check-admin.cjs`. Set `CHECK_URL` to select a test server; set `ADMIN_SCREENSHOT_DIR` to save screenshots; set `AXE_PATH` to an installed `axe-core/axe.min.js` for automated accessibility checks.

## Issues observed during verification

- Initial demo-only test used an exact accessible name that excluded an order-count badge; corrected in the temporary test. That demo flow was subsequently removed under the revised requirements.
- Default Node 18 could not start Next.js; using the installed Node 24 resolved it.
- Chromium launch was blocked in one sandbox invocation; the approved external-sandbox run succeeded.
- The first accessibility injection was blocked by the production CSP. The harness now uses the browser debugging context without relaxing application policy.
- Next.js warns about a parent-directory lockfile outside the repository; the production build succeeds.
- Development navigation of existing product pages reports Next.js instant-shell URL-data warnings. Those storefront routes were not changed; production build and product HTTP checks pass.

Read `ADMIN_TASKS.md` for outstanding modules and `ADMIN_SETUP.md` for connection, backup and rollback requirements.
