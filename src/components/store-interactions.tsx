"use client";

import { useEffect, useRef, useState } from "react";
import {
  useCart,
  setCartQuantity,
  useSavedBooks,
  toggleSavedBook,
} from "./cart-state";
import Link from "next/link";
import { Icon } from "./ui";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div
      className="mobile-menu"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        className="icon-button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(!open)}
      >
        <Icon name={open ? "minus" : "menu"} />
      </button>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          <p className="mobile-nav-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
          <Link className="mobile-main-link" href="/products">
            Explore the bookshop <Icon name="arrow" />
          </Link>
          <details open>
            <summary>Browse collections</summary>
            <Link href="/collections/exam-guides">Exam Guides</Link>
            <Link href="/collections/bare-acts">Bare Acts</Link>
            <Link href="/collections/students">For Students</Link>
            <Link href="/collections/bestsellers">Bestsellers</Link>
            <Link href="/collections">All subjects</Link>
          </details>
          <Link href="/about">Our Story</Link>
          <details>
            <summary>Visit & Help</summary>
            <Link href="/contact">Contact us</Link>
            <Link href="/request-a-book">Request a Book</Link>
            <Link href="/help">Help & Delivery</Link>
          </details>
          <div className="mobile-account-links">
            <Link href="/account">
              <Icon name="user" />
              My Account
            </Link>
            <Link href="/wishlist">
              <Icon name="heart" />
              Saved Books
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}

export function WishlistButton({ id, name }: { id: number; name: string }) {
  const saved = useSavedBooks().includes(id);
  return (
    <button
      type="button"
      className={`wishlist-button ${saved ? "is-saved" : ""}`}
      aria-pressed={saved}
      aria-label={`${saved ? "Unsave" : "Save"} ${name} on this device`}
      onClick={() => toggleSavedBook(id)}
      data-product-id={id}
    >
      <Icon name="heart" />
    </button>
  );
}

export function Newsletter() {
  return (
    <div className="newsletter-form">
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <div className="email-field">
        <Icon name="mail" />
        <input
          id="newsletter-email"
          type="email"
          placeholder="Your email address"
          disabled
          aria-describedby="newsletter-status"
        />
        <button className="button button-gold" type="button" disabled>
          Subscribe <Icon name="arrow" />
        </button>
      </div>
      <p id="newsletter-status" className="newsletter-status">
        Newsletter signup is not available yet. No email addresses are
        collected.
      </p>
    </div>
  );
}

// Local book-bag quantities persist on this device until checkout is completed.
export function CartActions({
  id,
  title,
  url,
  available,
  whatsapp,
}: {
  id: number;
  title: string;
  url: string;
  available: boolean;
  whatsapp: string;
}) {
  const cart = useCart();
  const quantity = cart.find((item) => item.id === id)?.quantity ?? 0;
  const setQuantity = (value: number) => setCartQuantity(id, value);
  return (
    <div className="cart-actions">
      <div className="book-actions">
        {!available ? (
          <Link className="button cart-add" href={url}>
            <Icon name="cart" />
            View availability
          </Link>
        ) : quantity === 0 ? (
          <button
            type="button"
            className="button cart-add"
            onClick={() => setQuantity(1)}
          >
            <Icon name="cart-plus" />
            Add to Cart
          </button>
        ) : (
          <div
            className="cart-stepper"
            role="group"
            aria-label={`Quantity of ${title}`}
          >
            <button
              type="button"
              onClick={() => setQuantity(quantity - 1)}
              aria-label={
                quantity === 1 ? `Remove ${title}` : "Decrease quantity"
              }
            >
              <Icon name="minus" />
            </button>
            <output aria-live="polite">{quantity}</output>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(quantity + 1, 99))}
              aria-label="Increase quantity"
              disabled={quantity >= 99}
            >
              <Icon name="plus" />
            </button>
          </div>
        )}
        <Link
          className="whatsapp-button"
          href={whatsapp}
          aria-label={`Ask about ${title} on WhatsApp`}
          title="Ask on WhatsApp"
        >
          <Icon name="whatsapp" />
        </Link>
      </div>
      {quantity > 0 && (
        <Link className="cart-continue" href="/cart">
          View book bag ({quantity})
          <Icon name="arrow" />
        </Link>
      )}
    </div>
  );
}
