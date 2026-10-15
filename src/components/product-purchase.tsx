"use client";
import { useState } from "react";
import Link from "next/link";
import { addToCart } from "./cart-state";
import Image from "next/image";
import { Icon } from "./ui";
import { WishlistButton } from "./store-interactions";
import type { Product } from "@/data/products";

export function ProductGallery({ book }: { book: Product }) {
  const [cover, setCover] = useState(false);
  return (
    <div className="product-gallery">
      <div className={`product-main-photo ${cover ? "show-cover" : ""}`}>
        <Image
          src={cover ? book.image : `/images/premium-${book.id}.webp`}
          alt={
            cover
              ? `${book.name} — front cover`
              : `${book.name} — styled book photograph`
          }
          fill
          sizes="(max-width: 800px) 90vw, 50vw"
          priority
        />
        <span className="gallery-label">THE LEGAL BOOKSHELF</span>
        <WishlistButton id={book.id} name={book.name} />
      </div>
      <div className="product-thumbnails">
        {[false, true].map((isCover) => (
          <button
            key={String(isCover)}
            aria-label={isCover ? "Show front cover" : "Show styled photograph"}
            aria-pressed={cover === isCover}
            onClick={() => setCover(isCover)}
          >
            <Image
              src={isCover ? book.image : `/images/premium-${book.id}.webp`}
              width={70}
              height={70}
              alt=""
            />
          </button>
        ))}
        <p>
          Explore the book.
          <br />
          <span>Select a view above.</span>
        </p>
      </div>
    </div>
  );
}
export function ProductPurchase({ book }: { book: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const available = book.inStock && book.purchasable;
  return (
    <div className="product-purchase">
      <div className="purchase-row">
        <div
          className="detail-stepper"
          role="group"
          aria-label="Order quantity"
        >
          <button
            aria-label="Decrease quantity"
            disabled={quantity === 1}
            onClick={() => setQuantity((q) => q - 1)}
          >
            −
          </button>
          <output aria-live="polite">{quantity}</output>
          <button
            aria-label="Increase quantity"
            disabled={quantity === 99}
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
        {available ? (
          <button
            className="button button-green"
            onClick={() => {
              addToCart(book.id, quantity);
              setAdded(true);
            }}
          >
            <Icon name="cart" />
            Add to book bag <Icon name="arrow" />
          </button>
        ) : (
          <Link className="button button-green" href="/contact">
            Check availability
          </Link>
        )}
      </div>
      {added && (
        <div className="detail-save-bag" role="status">
          <span>Added to your book bag.</span>
          <Link href="/cart">View book bag →</Link>
        </div>
      )}
      <p className="checkout-note">
        Save your selection. Online ordering opens in a future milestone.
      </p>
      <Link className="detail-whatsapp" href="/contact">
        <Icon name="chat" /> Ask our team about this book <Icon name="arrow" />
      </Link>
    </div>
  );
}
