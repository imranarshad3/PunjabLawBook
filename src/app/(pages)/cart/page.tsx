import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { CartPage } from "@/components/cart-page";
export const metadata: Metadata = {
  title: "Your Book Bag | Punjab Law Book House",
};
export default function Page() {
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label="Your Book Bag"
        eyebrow="A COLLECTION TAKING SHAPE"
        title="Good choices."
        accent="Great company."
        description="Review the books for your next chapter. Your studies, your practice, your bookshelf."
      />
      <CartPage />
    </main>
  );
}
