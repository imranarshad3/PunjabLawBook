# Punjab Law Book House

Next.js storefront and Clerk-protected administration for the book catalogue, galleries, moderated reviews, categories, orders, content and store settings. Orders use cash on delivery; an online payment gateway is not integrated.

## Run locally

Use Node 24 (`.nvmrc`); Next requires at least Node 20.9.

```sh
nvm use
npm ci
cp .env.example .env
# Fill in the credentials in .env before starting.
npm run dev
```

## Validate and run a production build

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

`npm start` serves the compiled production application on port 3000.
`npm audit --omit=dev` checks the production dependencies separately from lint tooling.

## Production configuration

Set the environment variables in `.env.example` on the deployment host before building. Use the public HTTPS domain for `NEXT_PUBLIC_SITE_URL`, Clerk production credentials, and the production Clerk hostname for `NEXT_PUBLIC_CLERK_DOMAIN` so the Content Security Policy allows it. Keep `CLERK_SECRET_KEY` and `SUPABASE_DB_URL` server-side.

The Supabase project must accept Clerk session tokens as a third-party auth provider. Staff need a matching `admin_members.clerk_user_id` record; customer order access is scoped to the verified Clerk identity. The `media` storage bucket uses public reads and admin-only uploads.

Apply only migrations not already present in the target database. The gallery/review and atomic gallery replacement migrations have been applied to PunjabBooks. `db:apply` is a bootstrap helper, not an incremental production migration ledger; do not replay it blindly against an existing store.

## Content publishing

Website Content manages shared image placements, homepage hero banners, Featured Books/Bestsellers headings and visibility, and the About, Contact, Request a Book, Delivery, Returns, Help, Privacy and Terms pages. Published plain-text page content replaces the default page; leaving it empty or keeping it as a draft retains the default template. Refresh an already-open storefront tab after publishing. Admin saves invalidate the shared catalogue/content cache.

## Database verification

`scripts/check-store-integrity.sql` checks gallery atomicity, review moderation isolation, public review visibility, category deletion protection and checkout stock/totals. Run it as the database owner in the Supabase SQL editor. It wraps the checks in a transaction and rolls back fixture rows. Generated sequence values can still advance.

Before launch, verify the configured domain, Clerk production sign-in, an actual delivery contact and the host’s production environment. No deployment is performed by the build command.
