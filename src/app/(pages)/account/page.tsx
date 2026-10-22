import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { AccountPreview } from "@/components/account-preview";
import { Icon } from "@/components/ui";
export const metadata: Metadata = {
  title: "Your Account | Punjab Law Book House",
};
export default function Page() {
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label="My Account"
        eyebrow="YOUR PERSONAL LEGAL BOOKSHELF"
        title="Welcome back"
        accent="to your next chapter."
        description="A dedicated space for your reading journey. Sign in to pick up where you left off."
      />
      <AccountPreview />
      <section className="container account-shortcuts">
        <Link href="/cart">
          <Icon name="cart" />
          <h3>Your book bag</h3>
          <p>Review the books saved on this device.</p>
          <span>
            View your selection <Icon name="arrow" />
          </span>
        </Link>
        <Link href="/wishlist">
          <Icon name="heart" />
          <h3>Your saved books</h3>
          <p>Return to the titles that caught your eye.</p>
          <span>
            Explore saved books <Icon name="arrow" />
          </span>
        </Link>
        <Link href="/contact">
          <Icon name="chat" />
          <h3>A little assistance</h3>
          <p>Speak to us about your next reference.</p>
          <span>
            Contact our team <Icon name="arrow" />
          </span>
        </Link>
      </section>
    </main>
  );
}
