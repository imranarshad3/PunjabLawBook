import Image from "next/image";
import Link from "next/link";
import { Icon } from "./ui";
import { CartActions, WishlistButton } from "./store-interactions";

export type Book = {
  id: number;
  name: string;
  url: string;
  image: string;
  price: number;
  inStock: boolean;
  purchasable: boolean;
};
// Readable titles and credits transcribed from the source catalogue and covers.
const editorial: Record<number, { title: string; credit: string }> = {
  6078: {
    title: "Assistant Director Legal–CNF · MCQs Guide",
    credit: "Punjab Law Book House",
  },
  5966: {
    title: "Civil Judge-cum-Judicial Magistrate Guide 2026",
    credit: "Punjab Law Book House",
  },
  5327: { title: "Pakistan Penal Code 1860 · Urdu", credit: "Urdu edition" },
  4661: {
    title: "Additional District & Sessions Judge Guide 2026",
    credit: "Punjab Law Book House",
  },
  2557: { title: "Muslim Family Laws", credit: "Punjab Law Book House" },
  767: {
    title: "Assistant District Public Prosecutor · MCQs",
    credit: "By Mushtaq Ahmad Mohal",
  },
  3712: { title: "AI for Lawyers", credit: "By Dr Bakht Munir" },
  6537: { title: "Annual Law Digest", credit: "Legal reference" },
  253: { title: "The Pakistan Penal Code 1860", credit: "By M. Akram Qureshi" },
  403: {
    title: "The Qanun-e-Shahadat Order 1984",
    credit: "By Syed Naveed Abbas",
  },
  5926: {
    title: "Punjab Sales Tax on Services Act 2012",
    credit: "For practice & examination",
  },
};
export const titleFor = (book: Book) => editorial[book.id]?.title ?? book.name;
export const creditFor = (book: Book) =>
  editorial[book.id]?.credit ?? "Punjab Law Book House catalogue";
const cartHref = (book: Book) => `/products/${book.id}`;
const whatsappHref = (book: Book) =>
  `https://wa.me/923080060188?text=${encodeURIComponent(`Hello, I would like to enquire about ${book.name}. Catalogue no. ${book.id}`)}`;

export function BookCard({
  book,
  rank,
  photograph,
}: {
  book: Book;
  rank?: number;
  photograph?: string;
}) {
  const available = book.inStock && book.purchasable;
  const details = { title: titleFor(book), credit: creditFor(book) };
  return (
    <article className="book-card">
      <div
        className={`book-image ${photograph ? "editorial-product-photo" : ""}`}
      >
        <Link href={`/products/${book.id}`} aria-label={`View ${book.name}`}>
          <Image
            src={photograph ?? book.image}
            alt={book.name}
            fill
            sizes="(max-width: 480px) 90vw, (max-width: 767px) 44vw, (max-width: 1100px) 28vw, 230px"
          />
        </Link>
        {rank && (
          <span className="rank" aria-label={`Popularity position ${rank}`}>
            {rank}
          </span>
        )}
        <span className={`stock-chip ${available ? "" : "is-unavailable"}`}>
          {available ? "In stock" : "Check availability"}
        </span>
        <WishlistButton id={book.id} name={book.name} />
      </div>
      <div className="book-details">
        <h3>
          <Link href={`/products/${book.id}`}>{details.title}</Link>
        </h3>
        <p className="book-credit">{details.credit}</p>
        <p className="price">
          <span>Rs.</span> {book.price.toLocaleString("en-PK")}
        </p>
        <CartActions
          id={book.id}
          title={details.title}
          url={book.url}
          available={available}
          whatsapp={whatsappHref(book)}
        />
      </div>
    </article>
  );
}

// Image-led card for the bestseller carousel: photograph, credit, title and
// price; the buy and WhatsApp actions reveal over the image on hover or focus.
export function ShowcaseCard({
  book,
  photograph,
}: {
  book: Book;
  photograph?: string;
}) {
  const title = titleFor(book);
  const available = book.inStock && book.purchasable;
  return (
    <article className="showcase-card">
      <div className={`showcase-media ${photograph ? "" : "is-cover"}`}>
        <Link
          className="showcase-link"
          href={`/products/${book.id}`}
          aria-label={`View ${title}`}
        >
          <Image
            src={photograph ?? book.image}
            alt={book.name}
            fill
            sizes="(max-width: 600px) 85vw, (max-width: 1100px) 45vw, 300px"
          />
        </Link>
        <div className="showcase-actions">
          <Link
            className="showcase-action is-buy"
            href={cartHref(book)}
            aria-label={`${available ? "View book" : "View availability"}: ${title}`}
            title={available ? "View book" : "View availability"}
          >
            <Icon name="cart-plus" />
          </Link>
          <Link
            className="showcase-action is-whatsapp"
            href={whatsappHref(book)}
            aria-label={`Ask about ${title} on WhatsApp`}
            title="Ask on WhatsApp"
          >
            <Icon name="whatsapp" />
          </Link>
        </div>
      </div>
      <div className="showcase-body">
        <p className="showcase-credit">{creditFor(book)}</p>
        <h3 className="showcase-title">
          <Link href={`/products/${book.id}`}>{title}</Link>
        </h3>
        <p className="showcase-price">
          <span>Rs.</span> {book.price.toLocaleString("en-PK")}
        </p>
      </div>
    </article>
  );
}
