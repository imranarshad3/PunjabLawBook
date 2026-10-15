import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collections } from "@/data/collections";
import { ProductCatalogue } from "@/components/product-catalogue";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return Object.keys(collections).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${collections[slug]?.title ?? "Collection not found"} | Punjab Law Book House`,
  };
}
export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  if (!Object.hasOwn(collections, slug)) notFound();
  return (
    <ProductCatalogue
      initialQuery=""
      initialCategory="All books"
      collection={slug}
    />
  );
}
