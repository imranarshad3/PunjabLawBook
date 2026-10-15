import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container shop-empty">
      <h1>This book isn’t on our shelf.</h1>
      <p>Explore our collection to find your next legal reference.</p>
      <Link className="button button-green" href="/products">
        Back to the bookshop
      </Link>
    </main>
  );
}
