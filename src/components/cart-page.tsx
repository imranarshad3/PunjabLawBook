"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart, setCartQuantity } from "./cart-state";
import { useCatalogue } from "./catalogue-context";
import { titleFor } from "./book-card";
import { Icon } from "./ui";
export function CartPage() {
  const cart = useCart();
  const { products } = useCatalogue();
  const lines = cart.flatMap((item) => {
    const book = products.find((book) => book.id === item.id);
    return book ? [{ book, quantity: item.quantity }] : [];
  });
  const subtotal = lines.reduce(
    (total, line) => total + line.quantity * line.book.price,
    0,
  );
  return (
    <section className="container cart-section">
      {!lines.length ? (
        <div className="empty-bag">
          <span className="empty-bag-icon">
            <Icon name="book" />
          </span>
          <p className="shop-kicker">ROOM FOR YOUR NEXT CHAPTER</p>
          <h2>Your book bag is waiting.</h2>
          <p>
            Start with a reference you need.
            <br />
            Stay for a title that makes you curious.
          </p>
          <Link className="button button-green" href="/products">
            Explore the bookshop <Icon name="arrow" />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            <div className="cart-list-heading">
              <h2>
                Your selected books{" "}
                <span>
                  ({lines.reduce((sum, line) => sum + line.quantity, 0)})
                </span>
              </h2>
              <Link href="/products">
                Keep browsing <Icon name="arrow" />
              </Link>
            </div>
            <div className="cart-lines">
              {lines.map(({ book, quantity }) => (
                <article className="cart-line" key={book.id}>
                  <Link
                    href={`/products/${book.id}`}
                    className="cart-book-image"
                  >
                    <Image
                      src={book.image}
                      alt={titleFor(book)}
                      fill
                      sizes="100px"
                    />
                  </Link>
                  <div className="cart-book-info">
                    <p className="shop-kicker">{book.category}</p>
                    <h3>
                      <Link href={`/products/${book.id}`}>
                        {titleFor(book)}
                      </Link>
                    </h3>
                    <p className="cart-unit">
                      Rs. {book.price.toLocaleString("en-PK")} each
                    </p>
                    <button
                      className="remove-book"
                      onClick={() => setCartQuantity(book.id, 0)}
                      aria-label={`Remove ${titleFor(book)}`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cart-line-total">
                    <div
                      className="detail-stepper"
                      role="group"
                      aria-label={`Quantity of ${titleFor(book)}`}
                    >
                      <button
                        aria-label={`Decrease ${titleFor(book)} quantity`}
                        disabled={quantity === 1}
                        onClick={() => setCartQuantity(book.id, quantity - 1)}
                      >
                        −
                      </button>
                      <output>{quantity}</output>
                      <button
                        aria-label={`Increase ${titleFor(book)} quantity`}
                        disabled={quantity === 99}
                        onClick={() => setCartQuantity(book.id, quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <strong>
                      Rs. {(book.price * quantity).toLocaleString("en-PK")}
                    </strong>
                    <Link
                      className="store-item-link"
                      href={`/products/${book.id}`}
                    >
                      View book details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-explanation">
              <Icon name="book" />
              <p>
                Your book bag is saved on this device. Review your selection and
                estimated subtotal here, then confirm your delivery details at checkout.
              </p>
            </div>
          </div>
          <aside className="order-summary">
            <p className="shop-kicker">YOUR NEXT CHAPTER</p>
            <h2>Book bag summary</h2>
            <div>
              <span>Books subtotal</span>
              <strong>Rs. {subtotal.toLocaleString("en-PK")}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <span>To be confirmed</span>
            </div>
            <div className="summary-total">
              <span>Estimated subtotal</span>
              <strong>Rs. {subtotal.toLocaleString("en-PK")}</strong>
            </div>
            <p>
              The team confirms delivery charges and final availability before dispatch.
            </p>
            <Link className="button button-green" href="/checkout">
              Review checkout <Icon name="arrow" />
            </Link>
            <Link className="button button-outline" href="/products">
              Continue browsing
            </Link>
            <small>
              Nothing is charged online. You confirm the order at checkout and pay
              on delivery.
            </small>
          </aside>
        </div>
      )}
    </section>
  );
}
