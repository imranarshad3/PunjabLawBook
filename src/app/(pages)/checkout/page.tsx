import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { CheckoutPreview } from "@/components/checkout-preview";
export const metadata: Metadata = {
  title: "Checkout Preview | Punjab Law Book House",
};
export default function Page() {
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label="Checkout"
        eyebrow="A STEP CLOSER TO YOUR BOOKSHELF"
        title="Your next chapter,"
        accent="thoughtfully arranged."
        description="Review your selection and see the new checkout experience. Ordering will open when our services are connected."
      />
      <CheckoutPreview />
    </main>
  );
}
