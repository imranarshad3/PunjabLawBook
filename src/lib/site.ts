/**
 * Absolute origin of the deployed site, used for canonical URLs, Open Graph
 * images, robots.txt and the sitemap. Set NEXT_PUBLIC_SITE_URL for every
 * deployment; the localhost fallback only keeps local builds working.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
