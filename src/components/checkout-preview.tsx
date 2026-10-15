"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "./cart-state";
import { products } from "@/data/products";
import { titleFor } from "./book-card";
import { Icon } from "./ui";
export function CheckoutPreview() {
  const cart = useCart();
  const lines = cart.flatMap((item) => {
    const book = products.find((book) => book.id === item.id);
    return book ? [{ book, quantity: item.quantity }] : [];
  });
  const total = lines.reduce(
    (sum, line) => sum + line.book.price * line.quantity,
    0,
  );
  return (
    <section className="container checkout-section">
      <nav className="checkout-steps" aria-label="Checkout progress">
        <Link href="/cart">
          <span>01</span> Book bag
        </Link>
        <span aria-current="step">
          <b>02</b> Checkout preview
        </span>
        <span>
          <b>03</b> Confirmation
        </span>
      </nav>
      {lines.length === 0 ? (
        <div className="empty-bag">
          <h2>A good book is the first step.</h2>
          <p>Your book bag is empty. Find a title to preview your order.</p>
          <Link className="button button-green" href="/products">
            Explore books <Icon name="arrow" />
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-form-panel">
            <div className="checkout-notice">
              <Icon name="check" />
              <div>
                <strong>A preview of your next chapter.</strong>
                <p>
                  Online ordering will be activated in the next milestone.
                  Delivery and payment fields are inactive, and no order can be
                  placed yet.
                </p>
              </div>
            </div>
            <form className="enquiry-form">
              <h2>Delivery details</h2>
              <p className="form-intro">
                Where your next chapter will find you.
              </p>
              <fieldset disabled>
                <div className="form-row">
                  <label>
                    Full name
                    <input
                      placeholder="Recipient’s full name"
                      autoComplete="name"
                    />
                  </label>
                  <label>
                    Phone number
                    <input
                      type="tel"
                      placeholder="03XX XXXXXXX"
                      autoComplete="tel"
                    />
                  </label>
                </div>
                <label>
                  Email address
                  <input
                    type="email"
                    placeholder="For order updates"
                    autoComplete="email"
                  />
                </label>
                <label>
                  Street address
                  <input
                    placeholder="House, street and area"
                    autoComplete="street-address"
                  />
                </label>
                <div className="form-row">
                  <label>
                    City
                    <input
                      placeholder="Your city"
                      autoComplete="address-level2"
                    />
                  </label>
                  <label>
                    Postal code
                    <input
                      placeholder="Postal code"
                      autoComplete="postal-code"
                    />
                  </label>
                </div>
                <label>
                  Order notes
                  <textarea
                    placeholder="Delivery instructions, if any"
                    rows={3}
                  />
                </label>
              </fieldset>
            </form>
            <div className="payment-preview">
              <Icon name="check" />
              <div>
                <h3>Payment options</h3>
                <p>
                  Available methods will appear here when secure checkout is
                  connected.
                </p>
              </div>
            </div>
          </div>
          <aside className="order-summary">
            <p className="shop-kicker">YOUR READING JOURNEY</p>
            <h2>Order preview</h2>
            <ul className="checkout-book-list">
              {lines.map(({ book, quantity }) => (
                <li key={book.id}>
                  <Image src={book.image} alt="" width={40} height={55} />
                  <span>
                    {titleFor(book)}
                    <small>Quantity: {quantity}</small>
                  </span>
                  <strong>
                    Rs. {(book.price * quantity).toLocaleString("en-PK")}
                  </strong>
                </li>
              ))}
            </ul>
            <div>
              <span>Books subtotal</span>
              <strong>Rs. {total.toLocaleString("en-PK")}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <span>To be confirmed</span>
            </div>
            <div className="summary-total">
              <span>Estimated subtotal</span>
              <strong>Rs. {total.toLocaleString("en-PK")}</strong>
            </div>
            <button className="button button-green" disabled>
              Ordering opens soon <Icon name="arrow" />
            </button>
            <Link className="text-link" href="/cart">
              Edit your book bag
            </Link>
            <small>
              No payment is taken and no order is placed on this preview.
            </small>
          </aside>
        </div>
      )}
    </section>
  );
}
