import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { SavedBooks } from "@/components/saved-books";
export const metadata: Metadata = {
  title: "Saved Books",
};
export default function Page() {
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label="Saved Books"
        eyebrow="THE TITLES YOU COME BACK TO"
        title="A little curiosity."
        accent="A growing collection."
        description="Keep the books that caught your eye together. Your saved titles stay on this device, ready for your next visit."
      />
      <SavedBooks />
    </main>
  );
}
