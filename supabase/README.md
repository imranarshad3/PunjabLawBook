# Database

Postgres on Supabase (project `dotsvffispkvicptyoiu`).

| File | Purpose |
| --- | --- |
| `migrations/0001_initial_schema.sql` | All tables, indexes, triggers, helper functions |
| `migrations/0002_row_level_security.sql` | RLS enabled on every table + policies |
| `seed.sql` | Generated from the repository catalogue by `scripts/generate-seed.cjs` |

## Applying

```bash
npm run db:apply        # migrations only
npm run db:seed         # migrations + regenerate and load the catalogue seed
```

Both read `SUPABASE_DB_URL` from `.env` (gitignored) and every statement is
idempotent, so re-running is safe.

## Tables

`books` · `categories` · `collections` + `collection_books` · `media_assets` ·
`inventory_movements` · `orders` + `order_items` · `customers` · `promotions` ·
`enquiries` · `content_banners` · `content_pages` · `featured_sections` +
`featured_section_books` · `store_settings` · `admin_members`

## Access model

- **Publishable key (storefront):** may read published books, categories,
  collections, active banners, published pages and store settings, and may
  insert a row into `enquiries`. Nothing else is readable.
- **Clerk-authenticated admin:** full access, granted by a row in
  `admin_members` matching `auth.jwt() ->> 'sub'` (the Clerk user id).

For admin writes to pass RLS, register Clerk as a third-party auth provider in
Supabase (Authentication → Sign In / Providers → Clerk) and pass the Clerk
token to `createClient` via its `accessToken` option.

## Notes

- `books.stock` is nullable: `null` means stock is not counted yet,
  `0` means known to be unavailable. `books.stock_status` is generated from it
  (`untracked` / `out_of_stock` / `low_stock` / `in_stock`).
- Inserting into `inventory_movements` automatically adjusts `books.stock`.
- `orders.order_number` auto-generates as `PB03200`, `PB03201`, …

## Checkout integrity

`20261023025723_checkout_integrity.sql` binds customer ownership to the verified
Clerk JWT, rejects caller-supplied identities that do not match that token, and
keeps guest email addresses separate from registered customer accounts. Book
rows are locked in catalogue-ID order, quantities and delivery details are
validated, and insufficient stock rolls back the whole order.

The checkout client forwards the Clerk token and reads the live catalogue.
Account history explicitly filters to the current customer's orders, including
when the signed-in reader also has administrator access.

Verified against the configured database with a rolled-back transaction:
forged identity rejection, insufficient-stock rejection, authenticated order
ownership, database-calculated totals and exact inventory deduction. No test
orders were retained.
