"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { useSiteSettings } from "./site-settings";
import { useSession } from "@clerk/nextjs";
import { useCart, setCartQuantity } from "./cart-state";
import { placeOrder } from "@/lib/storefront";
import { useCatalogue } from "./catalogue-context";
import { titleFor } from "./book-card";
import { Icon } from "./ui";
export function CheckoutPreview() {
  const cart = useCart();
  const { session, isLoaded: sessionLoaded } = useSession();
  const { products } = useCatalogue();
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const request = useRef({ payload: "", id: "" });
  const settings = useSiteSettings();
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<{ orderNumber: string; total: number } | null>(null);
  const lines = cart.flatMap((item) => {
    const book = products.find((book) => book.id === item.id);
    return book ? [{ book, quantity: item.quantity }] : [];
  });
  const total = lines.reduce(
    (sum, line) => sum + line.book.price * line.quantity,
    0,
  );
  const shipping = settings.freeShippingOver !== null && total >= settings.freeShippingOver ? 0 : settings.shippingFee;
  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || busy || !sessionLoaded || lines.length === 0) return;
    if (lines.some(({ book, quantity }) => !book.inStock || !book.purchasable || (book.stock != null && quantity > book.stock))) {
      setError("Some books are unavailable or exceed the available stock. Update your book bag before ordering.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const customer = {
        full_name: String(form.get("full_name") || "").trim(),
        email: String(form.get("email") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
        address: [String(form.get("address") || "").trim(), String(form.get("postal_code") || "").trim()].filter(Boolean).join(", "),
        city: String(form.get("city") || "").trim(),
        notes: String(form.get("notes") || "").trim(),
        promotion_code: String(form.get("promotion_code") || "").trim(),
      };
    const orderItems = lines.map((line) => ({ legacy_id: line.book.id, quantity: line.quantity }));
    const payload = JSON.stringify([customer, orderItems, session?.id]);
    if (request.current.payload !== payload) {
      // Retain the retry key across a refresh without storing delivery details.
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
      const fingerprint = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      let id = crypto.randomUUID();
      try {
        const previous = JSON.parse(sessionStorage.getItem("plbh-checkout-request") || "null");
        if (previous?.fingerprint === fingerprint && typeof previous.id === "string") id = previous.id;
        sessionStorage.setItem("plbh-checkout-request", JSON.stringify({ fingerprint, id }));
      } catch { /* In-memory retries still work when browser storage is unavailable. */ }
      request.current = { payload, id };
    }
    const result = await placeOrder(
      customer,
      orderItems,
      session ? () => session.getToken() : undefined,
      request.current.id,
    );
    submitting.current = false;
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    for (const line of lines) setCartQuantity(line.book.id, 0);
    try { sessionStorage.removeItem("plbh-checkout-request"); } catch {}
    setPlaced({ orderNumber: result.orderNumber!, total: result.total! });
  }

  if (placed) {
    return (
      <section className="container checkout-section">
        <div className="empty-bag">
          <h2>Thank you — your order is placed.</h2>
          <p>
            Your order number is <strong>{placed.orderNumber}</strong>. We will call you to
            confirm delivery. Payment is collected on delivery.
          </p>
          <p>Confirmed order total: <strong>Rs. {placed.total.toLocaleString("en-PK")}</strong></p>
          <Link className="button button-green" href="/products">
            Continue browsing <Icon name="arrow" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container checkout-section">
      <nav className="checkout-steps" aria-label="Checkout progress">
        <Link href="/cart">
          <span>01</span> Book bag
        </Link>
        <span aria-current="step">
          <b>02</b> Checkout
        </span>
        <span>
          <b>03</b> Confirmation
        </span>
      </nav>
      {lines.length === 0 ? (
        <div className="empty-bag">
          <h2>A good book is the first step.</h2>
          <p>Your book bag is empty. Find a title to start an order.</p>
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
                <strong>Cash on delivery.</strong>
                <p>
                  Tell us where the books should go. We confirm every order by
                  phone before dispatch, and payment is collected on delivery.
                </p>
              </div>
            </div>
            <form className="enquiry-form" id="checkout-form" onSubmit={submitOrder}>
              <h2>Delivery details</h2>
              <p className="form-intro">
                Where your next chapter will find you.
              </p>
              <fieldset disabled={busy}>
                <div className="form-row">
                  <label>
                    Full name
                    <input
                      name="full_name"
                      required
                      placeholder="Recipient’s full name"
                      autoComplete="name"
                    />
                  </label>
                  <label>
                    Phone number
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="03XX XXXXXXX"
                      autoComplete="tel"
                    />
                  </label>
                </div>
                <label>
                  Email address
                  <input
                    type="email"
                    name="email"
                    placeholder="For order updates"
                    autoComplete="email"
                  />
                </label>
                <label>
                  Street address
                  <input
                    name="address"
                    required
                    placeholder="House, street and area"
                    autoComplete="street-address"
                  />
                </label>
                <div className="form-row">
                  <label>
                    City
                    <input
                      name="city"
                      required
                      placeholder="Your city"
                      autoComplete="address-level2"
                    />
                  </label>
                  <label>
                    Postal code
                    <input
                      name="postal_code"
                      placeholder="Postal code"
                      autoComplete="postal-code"
                    />
                  </label>
                </div>
                <label>
                  Order notes
                  <textarea
                    name="notes"
                    placeholder="Delivery instructions, if any"
                    rows={3}
                  />
                </label>
              </fieldset>
            </form>
            <div className="payment-preview">
              <Icon name="check" />
              <div>
                <h3>Cash on delivery</h3>
                <p>
                  Pay when your books arrive. The team will confirm delivery
                  arrangements by phone before dispatch.
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
              <span>{shipping ? `Rs. ${shipping.toLocaleString("en-PK")}` : "Free"}</span>
            </div>
            <div className="summary-total">
              <span>Order total</span>
              <strong>Rs. {(total + shipping).toLocaleString("en-PK")}</strong>
            </div>
            <label>Promotion code (optional)<input form="checkout-form" name="promotion_code" maxLength={80} placeholder="Enter your code" disabled={busy} /></label>
            <small>Eligible discounts are checked when you place the order and shown in your confirmation.</small>
            <button className="button button-green" type="submit" form="checkout-form" disabled={busy || !sessionLoaded}>
              {busy ? "Placing your order…" : "Place your order"} <Icon name="arrow" />
            </button>
            {error && <small role="alert">{error}</small>}
            <Link className="text-link" href="/cart">
              Edit your book bag
            </Link>
            <small>
              No card details are taken. Payment is collected on delivery.
            </small>
          </aside>
        </div>
      )}
    </section>
  );
}
