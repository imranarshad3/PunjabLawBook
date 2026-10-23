import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCatalogue } from "@/lib/catalogue";
import { ProductCatalogue } from "@/components/product-catalogue";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    maxPrice?: string | string[];
    sort?: string | string[];
    stock?: string | string[];
  }>;
};
export async function generateStaticParams() {
  const { collections } = await getCatalogue();
  return Object.keys(collections).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { collections } = await getCatalogue();
  return {
    title: `${collections[slug]?.title ?? "Collection not found"} | Punjab Law Book House`,
  };
}
async function CollectionContent({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const { collections } = await getCatalogue();
  if (!Object.hasOwn(collections, slug)) notFound();
  const value = (item: string | string[] | undefined) =>
    typeof item === "string" ? item : "";
  const q = value(query.q).slice(0, 100);
  const category = value(query.category).slice(0, 80) || "All books";
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
      key={`${slug}-${q}-${category}-${maxPrice}-${sort}-${value(query.stock)}`}
      initialQuery={q}
      initialCategory={category}
      initialPrice={maxPrice}
      initialSort={sort}
      initialStock={value(query.stock) === "1"}
      collection={slug}
    />
  );
}
export default function CollectionPage(props: Props) {
  return (
    <Suspense
      fallback={
        <main id="main" className="container shop-empty">
          <h1>Opening your collection…</h1>
          <p>Loading the books you selected.</p>
        </main>
      }
    >
      <CollectionContent {...props} />
    </Suspense>
  );
}
