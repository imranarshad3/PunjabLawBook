import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalogue } from "@/lib/catalogue";
import { ProductCatalogue } from "@/components/product-catalogue";
type Props = { params: Promise<{ slug: string }> };
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
export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const { collections } = await getCatalogue();
  if (!Object.hasOwn(collections, slug)) notFound();
  return (
    <ProductCatalogue
      initialQuery=""
      initialCategory="All books"
      collection={slug}
    />
  );
}
