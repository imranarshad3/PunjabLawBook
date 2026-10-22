import type { MetadataRoute } from "next";
import { getCatalogue } from "@/lib/catalogue";
import { siteUrl } from "@/lib/site";

/** Public pages only: the admin, account, cart, checkout and wishlist are excluded. */
const pages = [
  ["", 1.0, "daily"],
  ["/products", 0.9, "daily"],
  ["/collections", 0.8, "weekly"],
  ["/about", 0.5, "monthly"],
  ["/contact", 0.5, "monthly"],
  ["/request-a-book", 0.6, "monthly"],
  ["/delivery", 0.4, "yearly"],
  ["/returns", 0.4, "yearly"],
  ["/help", 0.4, "yearly"],
  ["/privacy", 0.3, "yearly"],
  ["/terms", 0.3, "yearly"],
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalogue = await getCatalogue();
  const lastModified = new Date();

  return [
    ...pages.map(([path, priority, changeFrequency]) => ({
      url: `${siteUrl}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })),
    ...Object.keys(catalogue.collections).map((slug) => ({
      url: `${siteUrl}/collections/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...catalogue.products.map((product) => ({
      url: `${siteUrl}/products/${product.id}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
