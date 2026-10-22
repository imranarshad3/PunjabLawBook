import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const development = process.env.NODE_ENV !== "production";
    // Next's cached HTML contains inline hydration scripts. Nonce-based CSP
    // requires dynamic rendering; keep this static-compatible policy explicit.
    // Clerk serves its JS, API and CAPTCHA challenge from these hosts.
    const clerk = "https://*.clerk.accounts.dev https://*.clerk.com";
    const captcha = "https://challenges.cloudflare.com";
    // Supabase REST/Realtime for this project.
    const supabase = "https://*.supabase.co wss://*.supabase.co";
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${clerk} ${captcha}${development ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: ${clerk} https://*.supabase.co`,
      "font-src 'self'",
      `connect-src 'self' ${clerk} ${supabase}${development ? " ws: wss:" : ""}`,
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      `frame-src 'self' ${clerk} ${captcha}`,
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()",
          },
          ...(development
            ? []
            : [
                { key: "Strict-Transport-Security", value: "max-age=31536000" },
              ]),
        ],
      },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
