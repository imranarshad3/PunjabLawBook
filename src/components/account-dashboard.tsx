"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useClerk, useSession, useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient, supabaseConfigured } from "@/lib/supabase";
import { useCatalogue } from "./catalogue-context";
import { useSavedBooks, useCart } from "./cart-state";
import { titleFor } from "./book-card";
import { Icon } from "./ui";
import { useAdminAccess } from "./use-admin-access";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number | string;
  placed_at: string;
  shipping_address: string | null;
  shipping_city: string | null;
};

type OrderLine = { id: string; order_id: string; title: string; quantity: number; line_total: number | string };

const money = (value: unknown) =>
  new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(Number(value) || 0);

const when = (value: string) =>
  new Date(value).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });

/**
 * A quiet membership tier: it recognises returning readers without inventing a
 * loyalty programme the shop does not actually run. Thresholds are in rupees.
 */
function tierFor(orders: number, spent: number) {
  if (orders >= 10 || spent >= 50000) return { name: "Bench Member", note: "Our most read-with" };
  if (orders >= 4 || spent >= 15000) return { name: "Advocate", note: "A shelf well built" };
  if (orders >= 1) return { name: "Reader", note: "The collection has begun" };
  return { name: "Guest", note: "Your first chapter awaits" };
}

export function AccountDashboard() {
  const { user } = useUser();
  const { session } = useSession();
  const { signOut } = useClerk();
  const { products } = useCatalogue();
  const saved = useSavedBooks();
  const cart = useCart();
  const admin = useAdminAccess();

  const [orders, setOrders] = useState<Order[]>([]);
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  // Nothing to load when Supabase is not configured.
  const [loading, setLoading] = useState(supabaseConfigured);

  const getToken = useCallback(async () => (session ? session.getToken() : null), [session]);

  useEffect(() => {
    const client = createClerkSupabaseClient(getToken);
    if (!client) return;
    let cancelled = false;
    (async () => {
      const [orderResult, lineResult] = await Promise.all([
        client.from("orders").select("*").order("placed_at", { ascending: false }).limit(50),
        client.from("order_items").select("id, order_id, title, quantity, line_total").limit(300),
      ]);
      if (cancelled) return;
      setOrders((orderResult.data as Order[]) || []);
      setLines((lineResult.data as OrderLine[]) || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const savedBooks = products.filter((book) => saved.includes(book.id));
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const spent = orders
    .filter((order) => !["cancelled", "refunded"].includes(order.status))
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "there";
  const tier = tierFor(orders.length, spent);
  const canInvite = admin.role === "owner" || admin.role === "admin";

  return (
    <div className="container account-dashboard">
      <section className="account-hero">
        <div className="account-hero-copy">
          <p className="shop-kicker">
            <Icon name="sparkle" />
            YOUR PERSONAL LEGAL BOOKSHELF
          </p>
          <h2>
            Welcome back, <em>{firstName}</em>.
          </h2>
          <p className="account-hero-note">
            Every order, every saved title and every detail of your reading
            journey — gathered in one place.
          </p>
          <div className="account-hero-actions">
            <Link className="button button-green" href="/products">
              Continue browsing <Icon name="arrow" />
            </Link>
            <Link className="button button-outline" href="/cart">
              Your book bag{cartCount ? ` (${cartCount})` : ""}
            </Link>
          </div>
        </div>
        <figure className="account-identity">
          <span className="account-identity-ring">
            {user?.imageUrl ? (
              <Image src={user.imageUrl} alt="" width={72} height={72} unoptimized />
            ) : (
              <span className="account-initials">{firstName.slice(0, 2).toUpperCase()}</span>
            )}
          </span>
          <figcaption>
            <strong>{user?.fullName || firstName}</strong>
            <span>{user?.primaryEmailAddress?.emailAddress}</span>
            <small>Member since {user?.createdAt ? when(String(user.createdAt)) : "today"}</small>
          </figcaption>
          <p className="account-tier">
            <Icon name="check" />
            <span>
              <strong>{tier.name}</strong>
              {tier.note}
            </span>
          </p>
        </figure>
      </section>

      {admin.isAdmin && (
        <section className="account-admin-band">
          <span className="account-admin-mark">
            <Icon name="shield" />
          </span>
          <div>
            <p className="account-admin-role">
              Staff access{admin.role ? ` · ${admin.role}` : ""}
            </p>
            <h3>The Admin Studio is open to you.</h3>
            <p>
              Books, orders, inventory, enquiries and the people who run them — the
              whole shop, behind one door.
            </p>
          </div>
          <div className="account-admin-actions">
            <Link className="button button-gold" href="/admin">
              Open Admin Studio <Icon name="arrow" />
            </Link>
            {canInvite && (
              <Link className="button button-ghost" href="/admin/team">
                Invite a teammate
              </Link>
            )}
          </div>
        </section>
      )}

      <section className="account-stats">
        {([
          ["Orders placed", String(orders.length), "truck"],
          ["Total spent", `Rs. ${money(spent)}`, "check"],
          ["Saved books", String(savedBooks.length), "heart"],
          ["In your bag", String(cartCount), "cart"],
        ] as const).map(([label, value, icon]) => (
          <article key={label}>
            <span>
              <Icon name={icon} />
            </span>
            <strong>{value}</strong>
            <p>{label}</p>
          </article>
        ))}
      </section>

      <section className="account-panel-card">
        <header>
          <div>
            <h3>Your orders</h3>
            <p>Track what you have ordered and where it is.</p>
          </div>
          <Link className="text-link" href="/products">
            Order again <Icon name="arrow" />
          </Link>
        </header>
        {loading ? (
          <p className="account-empty-note">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <div className="account-empty-note">
            <p>No orders yet — your first chapter is waiting.</p>
            <Link className="button button-green" href="/products">
              Explore the collection <Icon name="arrow" />
            </Link>
          </div>
        ) : (
          <ul className="account-orders">
            {orders.map((order) => {
              const items = lines.filter((line) => line.order_id === order.id);
              const expanded = open === order.id;
              return (
                <li key={order.id} className={expanded ? "is-open" : ""}>
                  <button
                    onClick={() => setOpen(expanded ? null : order.id)}
                    aria-expanded={expanded}
                  >
                    <span className="account-order-id">{order.order_number}</span>
                    <span className="account-order-date">{when(order.placed_at)}</span>
                    <span className={`account-status account-status-${order.status}`}>
                      {order.status.replaceAll("_", " ")}
                    </span>
                    <strong>Rs. {money(order.total)}</strong>
                    <Icon name="arrow" />
                  </button>
                  {expanded && (
                    <div className="account-order-detail">
                      <ul>
                        {items.map((line) => (
                          <li key={line.id}>
                            <span>{line.title}</span>
                            <small>× {line.quantity}</small>
                            <strong>Rs. {money(line.line_total)}</strong>
                          </li>
                        ))}
                        {!items.length && <li>Item details are not available for this order.</li>}
                      </ul>
                      <p>
                        Delivering to{" "}
                        {[order.shipping_address, order.shipping_city].filter(Boolean).join(", ") ||
                          "an address we will confirm by phone"}{" "}
                        · payment {order.payment_status}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="account-columns">
        <section className="account-panel-card">
          <header>
            <div>
              <h3>Saved for later</h3>
              <p>The titles that caught your eye.</p>
            </div>
            <Link className="text-link" href="/wishlist">
              See all <Icon name="arrow" />
            </Link>
          </header>
          {savedBooks.length ? (
            <ul className="account-saved">
              {savedBooks.slice(0, 4).map((book) => (
                <li key={book.id}>
                  <Link href={`/products/${book.id}`}>
                    <Image src={book.image} alt="" width={46} height={64} />
                    <span>
                      {titleFor(book)}
                      <small>Rs. {money(book.price)}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="account-empty-note">Nothing saved yet. Tap the heart on any book.</p>
          )}
        </section>

        <section className="account-panel-card">
          <header>
            <div>
              <h3>Your details</h3>
              <p>Kept private, used only for your orders.</p>
            </div>
          </header>
          <dl className="account-details">
            <div>
              <dt>Name</dt>
              <dd>{user?.fullName || "Not set"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.primaryEmailAddress?.emailAddress || "Not set"}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{user?.primaryPhoneNumber?.phoneNumber || "Not added"}</dd>
            </div>
          </dl>
          <div className="account-detail-actions">
            <Link className="button button-outline" href="/account/profile">
              Manage account
            </Link>
            <button className="text-link" onClick={() => void signOut({ redirectUrl: "/" })}>
              Sign out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
