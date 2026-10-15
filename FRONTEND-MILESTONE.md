# Standalone storefront milestone

## Pages

The site now includes the homepage, searchable products, 11 product detail pages,
subject collections, five curated collections, Our Story, Contact, Request a Book,
Help, Delivery, Returns, Privacy, Terms, saved books, a book bag, checkout preview,
account preview, registration preview, password recovery preview, and a branded 404.
All product and site navigation stays on this application. Optional WhatsApp,
telephone and map actions remain external. No link navigates to the legacy website.

## Implemented interactions

- Navbar autocomplete with cover thumbnails, author/subject matching, keyboard
  selection, result counts and an empty state.
- Keyboard-accessible navigation and sorting dropdowns with Escape, focus-out and
  outside-pointer dismissal; responsive mobile navigation.
- Collection search, category, availability and price filters, budget presets,
  removable filter chips, sorting, and reset/empty states.
- Book detail galleries, local quantities, persistent book bags and saved books.
- Contact and book-request forms prepare a WhatsApp message; users explicitly
  open WhatsApp and send it themselves. Nothing is submitted to a backend.
- Account, recovery and checkout fields are disabled and visibly marked as
  previews. No fake account, payment, order or confirmation is created.
- Font sizes use rem; page copy, controls and supporting text have a readable
  scale. The WhatsApp mark is a dedicated vector icon.

## Security protections and limits

The application sets a Content Security Policy, frame-denial protection,
`nosniff`, a restrictive permissions policy, a referrer policy, and production
HSTS. It removes the framework disclosure header. Fonts and images are local.

The CSP allows inline scripts because this Next.js application uses cached,
prerendered hydration output. It is not a nonce-based strict XSS policy. Development
also permits eval and websocket connections; production does not. No raw HTML
injection is used. Backend activation must revisit the CSP for the chosen services.

Browser storage is untrusted: identifiers are restricted to known catalogue
entries, quantities are bounded integers, duplicates are rejected, parsing size
is limited, malformed JSON is handled, and prices come from the catalogue rather
than storage. Search query parameters are normalized and bounded. This is UX
hardening, not authorization or a server-side price guarantee.

Production dependency audit reported zero known vulnerabilities during this
milestone. This does not establish that the site is free of all vulnerabilities.

## Next milestone

Per the owner's instructions, no new commerce, auth, order, payment or database
service has been installed. Before activating checkout: provision the backend,
validate prices and stock server-side, implement authentication and secure session
handling, CSRF protection where needed, rate limits, order persistence and payment
verification, then finalize business policies and privacy disclosures.

Catalogue photographs include existing styled concept images. Front-cover views
use the supplied cover assets. Pricing/availability remains catalogue information,
not a live inventory integration.

## Verification

Use Node 24 for the installed toolchain. Run `npm run lint`, `npm run typecheck`
and `npm run build`. The default system Node 18 cannot run Next.js 16.

`scripts/check-site.cjs` runs browser route, responsive layout, autocomplete,
dropdown, filter, wishlist, book-bag, disabled checkout, enquiry, storage validation
and security-header checks. Set `PLAYWRIGHT_MODULE` to an available Playwright
installation and `CHECK_URL` to the running site (default: localhost:3000).
It never sends messages or places orders.
