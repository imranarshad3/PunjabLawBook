import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { BookCard, titleFor, creditFor } from "@/components/book-card";
import { ProductGallery, ProductPurchase } from "@/components/product-purchase";
import { Icon } from "@/components/ui";

type Props = { params: Promise<{ id: string }> };
export function generateStaticParams() {
  return products.map((book) => ({ id: String(book.id) }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const book = products.find((book) => String(book.id) === id);
  return {
    title: book
      ? `${titleFor(book)} | Punjab Law Book House`
      : "Book not found",
  };
}
export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const book = products.find((book) => String(book.id) === id);
  if (!book) notFound();
  const related = [
    ...products.filter(
      (item) => item.id !== book.id && item.category === book.category,
    ),
    ...products.filter(
      (item) => item.id !== book.id && item.category !== book.category,
    ),
  ].slice(0, 4);
  return (
    <main id="main" className="products-page detail-page">
      <div className="container">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">Bookshop</Link>
          <span>/</span>
          <Link
            href={`/products?category=${encodeURIComponent(book.category)}`}
          >
            {book.category}
          </Link>
          <span>/</span>
          <span aria-current="page">Book details</span>
        </nav>
        <section className="product-overview">
          <ProductGallery book={book} />
          <div className="product-summary">
            <Link
              className="shop-kicker"
              href={`/products?category=${encodeURIComponent(book.category)}`}
            >
              {book.category}
            </Link>
            <h1>{titleFor(book)}</h1>
            <p className="detail-credit">{creditFor(book)}</p>
            <div className="detail-stock">
              <span />
              {book.inStock
                ? "In stock in our catalogue"
                : "Enquire about availability"}
              <span className="stock-separator">/</span>Print edition
            </div>
            <p className="detail-price">
              <small>Rs.</small> {book.price.toLocaleString("en-PK")}
            </p>
            <p className="detail-intro">
              {book.category === "Exam Guides"
                ? "Make your next chapter count. A focused resource for your examination preparation and legal studies."
                : `Make room on your bookshelf for ${titleFor(book)}. Explore this ${book.category.toLowerCase()} title for your studies, reference or professional collection.`}
            </p>
            <ProductPurchase book={book} />
            <div className="detail-benefits">
              <div>
                <Icon name="truck" />
                <span>
                  Nationwide delivery<small>Across Pakistan</small>
                </span>
              </div>
              <div>
                <Icon name="chat" />
                <span>
                  Here to help<small>Personal book assistance</small>
                </span>
              </div>
            </div>
            <p className="detail-reference">
              CATALOGUE NO. PLBH–{book.id} <span>•</span> {book.category}
            </p>
          </div>
        </section>
        <section className="product-information">
          <div>
            <p className="shop-kicker">A CLOSER LOOK</p>
            <h2>On your bookshelf.</h2>
            <p>
              Whether you are preparing for an examination or building your
              professional library, the right reference is a valuable companion.
              Explore this title from Punjab Law Book House’s{" "}
              {book.category.toLowerCase()} collection.
            </p>
            <p>
              Need to confirm the edition, language, contents or binding? Our
              team can help you choose before you order.
            </p>
            <a
              className="text-link"
              href={`https://wa.me/923080060188?text=${encodeURIComponent(`Please confirm the edition and book details for ${book.name}. Catalogue no. ${book.id}`)}`}
            >
              Speak to a book specialist <Icon name="arrow" />
            </a>
          </div>
          <div className="book-specifications">
            <h3>Book details</h3>
            <dl>
              <div>
                <dt>Title</dt>
                <dd>{titleFor(book)}</dd>
              </div>
              <div>
                <dt>Collection</dt>
                <dd>{book.category}</dd>
              </div>
              <div>
                <dt>Reference</dt>
                <dd>PLBH–{book.id}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>Printed book</dd>
              </div>
            </dl>
            <details>
              <summary>Delivery & ordering</summary>
              <p>
                We deliver across Pakistan. Online ordering is not active yet.
                Delivery charges and available payment methods will be confirmed
                when checkout opens.
              </p>
            </details>
            <details>
              <summary>Edition & availability</summary>
              <p>
                Catalogue prices and stock were last checked on 13 October 2026.
                Please confirm the current edition and availability with our
                team.
              </p>
            </details>
          </div>
        </section>
        <section className="related-books">
          <div className="shop-heading">
            <div>
              <p className="shop-kicker">CONTINUE YOUR COLLECTION</p>
              <h2>Alongside this title.</h2>
            </div>
            <Link className="text-link" href="/products">
              Explore all books <Icon name="arrow" />
            </Link>
          </div>
          <div className="related-grid">
            {related.map((item) => (
              <BookCard
                key={item.id}
                book={item}
                photograph={`/images/premium-${item.id}.webp`}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
