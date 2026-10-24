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
  stock?: number | null;
  author?: string; publisher?: string; description?: string; shortDescription?: string;
  isbn?: string; language?: string; metaTitle?: string; metaDescription?: string;
  uuid?: string;
  gallery?: { url: string; alt: string }[];
  reviews?: { id: string; customer_name: string; rating: number; title: string; body: string; created_at: string }[];
};

export type ProductExtras = {
  uuid?: string;
  gallery: { url: string; alt: string }[];
  reviews: NonNullable<Product["reviews"]>;
};

export async function getProductExtras(legacyId: number): Promise<ProductExtras> {
  "use cache";
  cacheTag(CATALOGUE_TAG);
  cacheLife("hours");
  if (!supabase) return { gallery: [], reviews: [] };
  const { data, error } = await supabase.from("books").select(
    "id, book_images(image_url, alt_text, sort_order), book_reviews(id, customer_name, rating, title, body, created_at)",
  ).eq("legacy_id", legacyId).maybeSingle();
  if (error || !data) return { gallery: [], reviews: [] };
  const row = data as unknown as {
    id: string;
    book_images: { image_url: string; alt_text: string | null; sort_order: number }[];
    book_reviews: NonNullable<Product["reviews"]>;
  };
  return {
    uuid: row.id,
    gallery: [...(row.book_images || [])].sort((a, b) => a.sort_order - b.sort_order).map((image) => ({ url: image.image_url, alt: image.alt_text || "Book detail" })),
    reviews: (row.book_reviews || []).sort((a, b) => b.created_at.localeCompare(a.created_at)),
  };
}

export type Catalogue = {
  products: Product[];
  categories: string[];
  collections: Record<string, { title: string; description: string; ids: number[] }>;
  featured: Product[];
  bestsellers: Product[];
  verifiedAt: string;
  source: "supabase" | "repository";
  sections: Record<string, { title: string; subtitle: string | null; active: boolean }>;
};

type Row = {
  id: string; author: string | null; publisher: string | null; description: string | null;
  short_description: string | null; isbn: string | null; language: string | null;
  meta_title: string | null; meta_description: string | null;
  legacy_id: number | null;
  title: string;
  price: string | number;
  cover_url: string | null;
  stock_status: string;
  stock: number | null;
  categories: { name: string } | null;
};

const toProduct = (row: Row): Product => ({
  uuid: row.id, author: row.author || "", publisher: row.publisher || "", description: row.description || "",
  shortDescription: row.short_description || "", isbn: row.isbn || "", language: row.language || "",
  metaTitle: row.meta_title || "", metaDescription: row.meta_description || "",
  id: row.legacy_id ?? 0,
  name: row.title,
  url: `/products/${row.legacy_id}`,
  image: row.cover_url || "/images/book-placeholder.svg",
  price: Number(row.price),
  stock: row.stock,
  inStock: row.stock_status !== "out_of_stock",
  purchasable: row.stock_status !== "out_of_stock",
  category: row.categories?.name || "Uncategorised",
});

const fallback = (): Catalogue => ({
  products: staticProducts as Product[],
  categories: [...new Set(staticProducts.map((book) => book.category))],
  collections: staticCollections,
  featured: catalogueJson.featured as unknown as Product[],
  bestsellers: catalogueJson.bestsellers as unknown as Product[],
  verifiedAt: catalogueJson.verifiedAt,
  source: "repository",
  sections: {},
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
  if (!supabase) {
    if (process.env.NODE_ENV === "production") throw new Error("Configure Supabase before publishing the storefront.");
    return fallback();
  }

  const [books, sections, collectionRows] = await Promise.all([
    supabase
      .from("books")
      .select("id, legacy_id, title, author, publisher, description, short_description, isbn, language, meta_title, meta_description, price, cover_url, stock, stock_status, categories(name)")
      .eq("status", "published")
      .not("legacy_id", "is", null)
      .order("title"),
    supabase.from("featured_sections").select("key, title, subtitle, active, featured_section_books(sort_order, books(legacy_id))"),
    supabase.from("collections").select("slug, title, description, collection_books(sort_order, books(legacy_id))"),
  ]);

  if (books.error) throw new Error("The live catalogue could not be loaded. Please try again shortly.");

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

  // Keep repository-defined routes available even when the live database is
  // only partially seeded. Header and mobile navigation both link to these
  // stable slugs; an empty live row should not turn a working route into a
  // 404 or an empty collection page.
  const collections: Catalogue["collections"] = Object.fromEntries(Object.entries(staticCollections).map(([key, entry]) => [key, { ...entry, ids: [] }]));
  for (const row of ((collectionRows.data || []) as unknown as {
    slug: string;
    title: string;
    description: string | null;
    collection_books: { sort_order: number; books: { legacy_id: number } | null }[];
  }[])) {
    const ids = row.collection_books
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((entry) => entry.books?.legacy_id)
      .filter((id): id is number => typeof id === "number");
    collections[row.slug] = {
      title: row.title,
      description: row.description || collections[row.slug]?.description || "",
      ids,
    };
  }

  const featured = section("featured");
  const bestsellers = section("bestsellers");

  return {
    products,
    categories: [...new Set(products.map((product) => product.category))],
    collections,
    featured: featured.length ? featured : products.slice(0, 6),
    bestsellers: bestsellers.length ? bestsellers : products.slice(6, 12),
    verifiedAt: catalogueJson.verifiedAt,
    source: "supabase",
    sections: Object.fromEntries((sections.data || []).map((entry) => [entry.key, { title: entry.title, subtitle: entry.subtitle, active: entry.active }])),
  };
}
