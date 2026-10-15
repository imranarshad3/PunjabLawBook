# MASTER PROMPT — PLBH PREMIUM HOMEPAGE (TOKEN-EFFICIENT)

Act as a senior UI/UX designer, frontend engineer, and Webflow specialist. Build/refine the **Punjab Law Book House** homepage to match the 12 supplied PNG references, using each PNG ONLY for its correspondingly numbered section. Maintain the visual identity: deep emerald, cream/ivory, antique gold, elegant serif headings, highly legible sans-serif body text, polished law-book photography, precise alignment, and subtle movement. Make it excellent at 1440px desktop, tablet, and 375px mobile.

## Read first
- Inspect the existing project's stack, page/component structure, routes, data sources, design tokens and existing assets before coding. If this is Webflow, inspect the existing PLBH draft and use native components/styles where practical; do not overwrite other projects/pages or publish without approval.
- Treat `01_Section_References/01_Header.png` through `12_Footer.png` as the visual source of truth, in numeric order. Do not duplicate/repeat any section. Images are visual mockups; implement real HTML/accessible interactions, never paste a screenshot as a webpage.
- Maintain reusable global Header, BookCard, CategoryCard, SectionHeading, CTA and Footer components (or Webflow equivalents). Do not rebuild the same markup repeatedly.

## Required sections (once each, in this order)
01 Header: announcement bar, brand/logo, relevant navigation, search, account/wishlist/cart icons and mobile menu.
02 Hero: cinematic library scene, authentic-law-books headline, primary/secondary CTAs, readable overlay and responsive composition.
03 Trust Strip: four compact trust/service features.
04 Shop by Need: students, professionals, institutions, competitive exams.
05 Featured Categories: 5 legal disciplines, photographic tiles, accessible carousel or responsive grid.
06 Featured Books: polished product cards with real cover, accurate title/author/price, wishlist and stacked full-width Add to Cart + WhatsApp buttons.
07 Bestsellers: distinct curated list/grid, product information and navigation; do not render a duplicate of Featured Books.
08 Judicial Examination Promo: striking hero-like campaign banner, guide image and clear CTA.
09 Why Choose Us: credibility features only; no invented statistics or guarantees.
10 Testimonials: verified customer reviews only; otherwise show design-ready placeholders clearly labeled in preview, not published as actual reviews.
11 Newsletter: accessible sign-up input, validation, error/success messaging, real consent handling, working integration only if available.
12 Footer: brand, functional navigation, contact/support links, social, policies and payments only if truly supported.

## Visual precision and behavior
- Match card widths, photo aspect ratios, spacing, hierarchy, warm backgrounds, subtle gold borders and restrained shadows from PNGs. Keep product-button stack VERTICAL, full-width and evenly spaced.
- Responsive: no overflow at 320/375/768/1024/1440/1920; mobile navigation usable; cards reorganize to 1–2 columns; typography never clips. Use semantic elements, labels, alt text, focus states, reduced-motion support, and sufficient contrast.
- Use ACTUAL approved product data/URLs and licensed assets from existing site/CMS; never use fabricated titles, author names, reviews, discount badges, ratings, inventory, delivery times, contact details, partner logos or payment methods shown in mockups. Use clear temporary placeholders when needed and flag them.
- Preserve existing secure checkout, cart, auth, CMS data and SEO. Connect only verified destinations; no fake interactions. If WooCommerce, retain Woo flows; if Webflow-only, do not pretend its visual buttons implement checkout.
- Prefer optimized WebP/AVIF where feasible, responsive srcset/lazy loading, and light animations. No unnecessary packages/dependencies.

## Implementation workflow
1. Briefly audit and report current stack, pages and asset availability (max 8 lines).
2. Implement sections 01–04, then 05–08, then 09–12, keeping reusable components and one consistent token set.
3. Run available typecheck/lint/build and responsive, interaction and accessibility checks; fix errors.
4. Report exactly what changed, remaining placeholders/integrations, and commands/steps to preview. Leave page unpublished until my confirmation.

## Token economy
- Keep responses concise (max ~12 lines between milestones); don't re-explain my brief, dump entire files, or print lengthy logs.
- Inspect only relevant files; make focused edits. Reuse components/styles/assets. Show diffs/paths and errors only when useful.
- Ask a question only if blocked by a genuinely missing credential, destructive decision or project access. Otherwise use sensible defaults.
- Do not declare an interaction or pixel-perfect match complete without testing it.

**Start by inspecting the existing implementation and the 12 PNGs, then build the page.**
