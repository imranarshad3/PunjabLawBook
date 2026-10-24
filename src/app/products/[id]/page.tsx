import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalogue, getProductExtras } from "@/lib/catalogue";
import { BookCard, titleFor, creditFor } from "@/components/book-card";
import { ProductGallery, ProductPurchase } from "@/components/product-purchase";
import { Icon } from "@/components/ui";
import { ProductReviews } from "@/components/product-reviews";
import { StoreWhatsAppLink } from "@/components/site-settings";

type Props = { params: Promise<{ id: string }> };
export async function generateStaticParams() {
  const { products } = await getCatalogue();
  return products.map((book) => ({ id: String(book.id) }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { products } = await getCatalogue();
  const book = products.find((book) => String(book.id) === id);
  return {
    title: book
      ? book.metaTitle || titleFor(book)
      : "Book not found",
    description: book?.metaDescription || book?.shortDescription || undefined,
  };
}
async function ProductDetails({ params }: Props) {
  const { id } = await params;
  const { products } = await getCatalogue();
  const book = products.find((book) => String(book.id) === id);
  if (!book) notFound();
  const extras = await getProductExtras(book.id);
  const detailedBook = { ...book, ...extras };
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
          <ProductGallery book={detailedBook} />
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
              {book.shortDescription || (book.category === "Exam Guides"
                ? "Make your next chapter count. A focused resource for your examination preparation and legal studies."
                : `Make room on your bookshelf for ${titleFor(book)}. Explore this ${book.category.toLowerCase()} title for your studies, reference or professional collection.`)}
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
                <Icon name="whatsapp" />
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
            {book.description ? <p style={{ whiteSpace: "pre-line" }}>{book.description}</p> : <p>
              Whether you are preparing for an examination or building your
              professional library, the right reference is a valuable companion.
              Explore this title from Punjab Law Book House’s{" "}
              {book.category.toLowerCase()} collection.
            </p>}
            <p>
              Need to confirm the edition, language, contents or binding? Our
              team can help you choose before you order.
            </p>
            <StoreWhatsAppLink
              className="text-link"
              message={`Please confirm the edition and book details for ${book.name}. Catalogue no. ${book.id}`}
            >
              Speak to a book specialist <Icon name="arrow" />
            </StoreWhatsAppLink>
          </div>
          <div className="book-specifications">
            <h3>Book details</h3>
            <dl>
              {[["Author", book.author], ["Publisher", book.publisher], ["Language", book.language], ["ISBN", book.isbn]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
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
                Place your order through checkout with cash on delivery. The team
                will confirm availability, delivery charges and dispatch details
                by phone before sending your books.
              </p>
            </details>
            <details>
              <summary>Edition & availability</summary>
              <p>
                Prices and availability come from the live catalogue. Contact our
                team if you need to confirm the edition, language or binding.
              </p>
            </details>
          </div>
        </section>
        <ProductReviews bookId={extras.uuid} bookName={titleFor(book)} initialReviews={extras.reviews} />
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

export default function ProductPage({ params }: Props) {
  return <Suspense fallback={<main id="main" className="products-page"><div className="container" role="status">Loading book details…</div></main>}><ProductDetails params={params} /></Suspense>;
}
