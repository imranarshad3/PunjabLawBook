"use client";
import { useState } from "react";
import Link from "next/link";
import { addToCart } from "./cart-state";
import Image from "next/image";
import { Icon } from "./ui";
import { WishlistButton } from "./store-interactions";
import type { Product } from "@/lib/catalogue";

export function ProductGallery({ book }: { book: Product }) {
  const images = [
    { src: book.image, label: "Front cover", alt: `${book.name} — front cover` },
    ...(book.gallery || []).map((image, index) => ({ src: image.url, label: `Book view ${index + 1}`, alt: image.alt || `${book.name} — view ${index + 1}` })),
  ];
  const [selectedImage, setSelectedImage] = useState(0);
  const active = images[selectedImage] || images[0];
  return (
    <div className="product-gallery">
      <div className="product-main-photo show-cover">
        <Image
          src={active.src}
          alt={active.alt}
          fill
          sizes="(max-width: 800px) 90vw, 50vw"
          priority
          unoptimized={active.src.startsWith("https://")}
        />
        <span className="gallery-label">THE LEGAL BOOKSHELF</span>
        <WishlistButton id={book.id} name={book.name} />
      </div>
      <div className="product-thumbnails">
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            aria-label={`Show ${image.label.toLowerCase()}`}
            aria-pressed={selectedImage === index}
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={image.src}
              width={70}
              height={70}
              alt={image.alt}
              unoptimized={image.src.startsWith("https://")}
            />
          </button>
        ))}
        <p>
          {images.length} book views.
          <br /><span>Select a view above.</span>
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
        Add this title to your bag, then continue to checkout for cash on delivery.
      </p>
      <Link className="detail-whatsapp" href="/contact">
        <Icon name="whatsapp" /> Ask our team about this book <Icon name="arrow" />
      </Link>
    </div>
  );
}
