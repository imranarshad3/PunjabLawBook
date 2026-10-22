import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Signed-in and transactional areas hold nothing a crawler should index.
        disallow: ["/admin", "/account", "/cart", "/checkout", "/wishlist"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
