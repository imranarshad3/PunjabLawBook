"use client";
import Link from "next/link";
import { Icon } from "./ui";
import { useCart } from "./cart-state";
export function HeaderCart() {
  const count = useCart().reduce((sum, item) => sum + item.quantity, 0);
  return (
    <Link
      className="icon-button header-cart-link"
      href="/cart"
      aria-label={`Open book bag${count ? `, ${count} ${count === 1 ? "book" : "books"}` : ""}`}
    >
      <Icon name="cart" />
      {count > 0 && (
        <span className="header-cart-count">{count > 99 ? "99+" : count}</span>
      )}
    </Link>
  );
}
