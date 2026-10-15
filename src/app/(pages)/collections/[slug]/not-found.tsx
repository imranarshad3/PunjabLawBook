import Link from "next/link";
import { Icon } from "@/components/ui";

export default function CollectionNotFound() {
  return (
    <main id="main" className="site-not-found">
      <p className="eyebrow">A SMALL DETOUR · 404</p>
      <Icon name="book" />
      <h1>Let’s find your collection.</h1>
      <p>This collection isn’t on our shelf. Explore the subjects we have for you.</p>
      <Link className="button button-green" href="/collections">
        Explore collections <Icon name="arrow" />
      </Link>
    </main>
  );
}
