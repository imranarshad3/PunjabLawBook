import { cacheTag, cacheLife } from "next/cache";
import { supabase } from "./supabase";
import catalogueJson from "@/data/catalogue.json";
import { products as staticProducts } from "@/data/products";
import { collections as staticCollections } from "@/data/collections";

export const CATALOGUE_TAG = "catalogue";

export type Product = {
  id: number;
  name: string;
  url: string;
  image: string;
  price: number;
  inStock: boolean;
  purchasable: boolean;
  category: string;
};

export type Catalogue = {
  products: Product[];
  categories: string[];
  collections: Record<string, { title: string; description: string; ids: number[] }>;
  featured: Product[];
  bestsellers: Product[];
  verifiedAt: string;
  source: "supabase" | "repository";
};

type Row = {
  legacy_id: number | null;
  title: string;
  price: string | number;
  cover_url: string | null;
  stock_status: string;
  categories: { name: string } | null;
};

const toProduct = (row: Row): Product => ({
  id: row.legacy_id ?? 0,
  name: row.title,
  url: `/products/${row.legacy_id}`,
  image: row.cover_url || "/images/book-placeholder.webp",
  price: Number(row.price),
  inStock: row.stock_status !== "out_of_stock",
  purchasable: row.stock_status !== "out_of_stock",
  category: row.categories?.name || "Legal Reference",
});

const fallback = (): Catalogue => ({
  products: staticProducts as Product[],
  categories: [...new Set(staticProducts.map((book) => book.category))],
  collections: staticCollections,
  featured: catalogueJson.featured as unknown as Product[],
  bestsellers: catalogueJson.bestsellers as unknown as Product[],
  verifiedAt: catalogueJson.verifiedAt,
  source: "repository",
});

/**
 * The storefront catalogue, read from Supabase with the repository data as a
 * fallback. Cached by Next so pages stay prerenderable.
 */
export async function getCatalogue(): Promise<Catalogue> {
  "use cache";
  // Admin writes call /api/revalidate, which flushes this tag.
  cacheTag(CATALOGUE_TAG);
  cacheLife("hours");
  if (!supabase) return fallback();

  const [books, sections, collectionRows] = await Promise.all([
    supabase
      .from("books")
      .select("legacy_id, title, price, cover_url, stock_status, categories(name)")
      .eq("status", "published")
      .not("legacy_id", "is", null)
      .order("title"),
    supabase.from("featured_sections").select("key, featured_section_books(sort_order, books(legacy_id))"),
    supabase.from("collections").select("slug, title, description, collection_books(sort_order, books(legacy_id))"),
  ]);

  if (books.error || !books.data?.length) return fallback();

  const products = (books.data as unknown as Row[]).map(toProduct);
  const byId = new Map(products.map((product) => [product.id, product]));

  const section = (key: string) =>
    ((sections.data || []) as unknown as {
      key: string;
      featured_section_books: { sort_order: number; books: { legacy_id: number } | null }[];
    }[])
      .find((entry) => entry.key === key)
      ?.featured_section_books.sort((a, b) => a.sort_order - b.sort_order)
      .map((entry) => byId.get(entry.books?.legacy_id ?? -1))
      .filter((product): product is Product => Boolean(product)) || [];

  const collections: Catalogue["collections"] = {};
  for (const row of ((collectionRows.data || []) as unknown as {
    slug: string;
    title: string;
    description: string | null;
    collection_books: { sort_order: number; books: { legacy_id: number } | null }[];
  }[])) {
    collections[row.slug] = {
      title: row.title,
      description: row.description || "",
      ids: row.collection_books
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((entry) => entry.books?.legacy_id)
        .filter((id): id is number => typeof id === "number"),
    };
  }

  const featured = section("featured");
  const bestsellers = section("bestsellers");

  return {
    products,
    categories: [...new Set(products.map((product) => product.category))],
    collections: Object.keys(collections).length ? collections : staticCollections,
    featured: featured.length ? featured : products.slice(0, 6),
    bestsellers: bestsellers.length ? bestsellers : products.slice(6, 12),
    verifiedAt: catalogueJson.verifiedAt,
    source: "supabase",
  };
}
