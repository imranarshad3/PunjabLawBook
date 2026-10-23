import type { Metadata } from "next";
import "./account.css";
import { Suspense } from "react";
import Link from "next/link";
import { AccountPreview } from "@/components/account-preview";
import { Icon } from "@/components/ui";
export const metadata: Metadata = {
  title: "Your Account | Punjab Law Book House",
};
export default function Page() {
  return (
    <main id="main" className="inner-page account-page">
      <div className="container account-page-heading">
        <nav aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">My account</span></nav>
        <p className="shop-kicker">THE READER’S DESK</p>
        <h1>Your personal bookshelf.</h1>
        <p>Your collection, orders and account, thoughtfully organised.</p>
      </div>
      <Suspense fallback={null}>
        <AccountPreview />
      </Suspense>
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
          <Icon name="whatsapp" />
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
