import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { Icon } from "@/components/ui";
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="site-not-found">
        <p className="eyebrow">A SMALL DETOUR · 404</p>
        <Icon name="book" />
        <h1>
          This chapter
          <br />
          is still unwritten.
        </h1>
        <p>
          The page you’re looking for isn’t on our shelf.
          <br />
          Let’s find your way back to a good book.
        </p>
        <Link className="button button-green" href="/products">
          Explore the bookshop <Icon name="arrow" />
        </Link>
        <Link className="text-link" href="/">
          Return home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
