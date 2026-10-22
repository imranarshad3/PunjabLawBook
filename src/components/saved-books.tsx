"use client";
import Link from "next/link";
import { useSavedBooks } from "./cart-state";
import { useCatalogue } from "./catalogue-context";
import { BookCard } from "./book-card";
import { Icon } from "./ui";
export function SavedBooks() {
  const saved = useSavedBooks();
  const { products } = useCatalogue();
  const books = products.filter((book) => saved.includes(book.id));
  return (
    <section className="container collection-directory">
      {books.length ? (
        <>
          <div className="shop-heading">
            <h2>
              Your saved titles <span>({books.length})</span>
            </h2>
            <Link className="text-link" href="/products">
              Keep exploring <Icon name="arrow" />
            </Link>
          </div>
          <div className="related-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                photograph={`/images/premium-${book.id}.webp`}
              />
            ))}
          </div>
          <p className="shop-catalogue-note">
            Saved on this device. Tap the heart on a book to remove it from this
            collection.
          </p>
        </>
      ) : (
        <div className="empty-bag">
          <span className="empty-bag-icon">
            <Icon name="heart" />
          </span>
          <h2>Keep a little inspiration.</h2>
          <p>
            Tap the heart on any book to save it here.
            <br />A thoughtful reading list, ready when you are.
          </p>
          <Link className="button button-green" href="/products">
            Find your next book <Icon name="arrow" />
          </Link>
        </div>
      )}
    </section>
  );
}
