import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Icon } from "@/components/ui";
import { getCatalogue } from "@/lib/catalogue";
export const metadata: Metadata = {
  title: "Explore Collections | Punjab Law Book House",
};
const copy: Record<string, { image: string; description: string }> = {
  "Exam Guides": {
    image: "need-exams",
    description:
      "Focused resources for judicial service and competitive examination preparation.",
  },
  "Criminal Law": {
    image: "category-3",
    description:
      "Explore penal law and references for criminal law studies and practice.",
  },
  "Family Law": {
    image: "category-2",
    description:
      "Resources for understanding family law and its place in legal practice.",
  },
  "Legal Practice": {
    image: "need-professionals",
    description:
      "Perspectives and resources for the evolving work of the legal professional.",
  },
  "Legal Reference": {
    image: "need-institutions",
    description: "Titles to return to as you build your working legal library.",
  },
  "Law of Evidence": {
    image: "category-1",
    description:
      "Explore the law of evidence and essential statutory references.",
  },
  "Taxation Law": {
    image: "category-4",
    description:
      "Tax legislation and references for your study and professional collection.",
  },
};
export default async function CollectionsPage() {
  const { products, categories } = await getCatalogue();
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label="Collections"
        eyebrow="FIND YOUR FIELD. DEEPEN YOUR KNOWLEDGE."
        title="A world of law."
        accent="A shelf for you."
        description="Explore our collection by subject, from the foundations of legal study to the resources that support your practice."
      />
      <section className="container collection-directory">
        <div className="collection-directory-grid">
          {categories.map((category) => (
            <Link
              href={`/products?category=${encodeURIComponent(category)}`}
              className="collection-directory-card"
              key={category}
            >
              <div className="collection-directory-photo">
                <Image
                  src={`/images/${copy[category].image}.webp`}
                  alt={`${category} collection`}
                  fill
                  sizes="(max-width:480px) 90vw, (max-width:800px) 45vw, 30vw"
                />
              </div>
              <div>
                <p className="shop-kicker">
                  {products.filter((book) => book.category === category).length}{" "}
                  SELECTED TITLES
                </p>
                <h2>{category}</h2>
                <p>{copy[category].description}</p>
                <span>
                  Explore collection <Icon name="arrow" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
