import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCatalogue } from "@/components/product-catalogue";
export const metadata: Metadata = {
  title: "The Bookshop",
  description:
    "Browse legal references, bare acts and examination guides for your next chapter.",
};
type Props = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    maxPrice?: string | string[];
    sort?: string | string[];
    stock?: string | string[];
  }>;
};
async function CatalogueWithQuery({ searchParams }: Props) {
  const query = await searchParams;
  const value = (item: string | string[] | undefined) =>
    typeof item === "string" ? item : "";
  const q = value(query.q).slice(0, 100);
  const category =
    value(query.category).slice(0, 80) || "All books";
  const rawPrice = value(query.maxPrice);
  const requestedPrice = rawPrice ? Number(rawPrice) : Number.NaN;
  const maxPrice = Number.isFinite(requestedPrice)
    ? Math.min(5000, Math.max(250, requestedPrice))
    : 5000;
  const sort = ["featured", "price-low", "price-high", "title"].includes(
    value(query.sort),
  )
    ? value(query.sort)
    : "featured";
  return (
    <ProductCatalogue
      key={`${q}-${category}-${maxPrice}-${sort}-${value(query.stock)}`}
      initialQuery={q}
      initialCategory={category}
      initialPrice={maxPrice}
      initialSort={sort}
      initialStock={value(query.stock) === "1"}
    />
  );
}
export default function ProductsPage(props: Props) {
  return (
    <Suspense
      fallback={
        <main id="main" className="container shop-empty">
          <h1>The Bookshop</h1>
          <p>Finding your next chapter…</p>
        </main>
      }
    >
      <CatalogueWithQuery {...props} />
    </Suspense>
  );
}
