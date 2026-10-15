import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCatalogue } from "@/components/product-catalogue";
export const metadata: Metadata = {
  title: "The Bookshop | Punjab Law Book House",
  description:
    "Browse legal references, bare acts and examination guides for your next chapter.",
};
type Props = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
  }>;
};
async function CatalogueWithQuery({ searchParams }: Props) {
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.slice(0, 100) : "";
  const category =
    typeof query.category === "string"
      ? query.category.slice(0, 80)
      : "All books";
  return (
    <ProductCatalogue
      key={`${q}-${category}`}
      initialQuery={q}
      initialCategory={category}
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
