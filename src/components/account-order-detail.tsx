"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { Icon } from "./ui";

type Row = Record<string, unknown> & { id: string };
const money = (value: unknown) => new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(Number(value) || 0);
const date = (value: unknown) => value ? new Date(String(value)).toLocaleString("en-PK", { dateStyle: "long", timeStyle: "short" }) : "—";
const progress = ["pending", "processing", "shipped", "delivered"];

export function AccountOrderDetail({ orderId }: { orderId: string }) {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const [order, setOrder] = useState<Row | null>(null);
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const getToken = useCallback(async () => session ? session.getToken() : null, [session]);
  async function cancelOrder() {
    if (cancelling) return;
    setCancelling(true); setCancelError("");
    try {
      const client = createClerkSupabaseClient(getToken);
      if (!client) throw new Error("Order updates are temporarily unavailable.");
      const result = await client.rpc("cancel_my_order", { p_order_id: orderId });
      if (result.error) throw new Error(result.error.message);
      setOrder((current) => current ? { ...current, status: "cancelled" } : current);
    } catch (caught) { setCancelError(caught instanceof Error ? caught.message : "Cancellation could not be completed."); }
    finally { setCancelling(false); }
  }

  useEffect(() => {
    if (!isLoaded) return;
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setError("");
      const client = createClerkSupabaseClient(getToken);
      if (!client) {
        if (!cancelled) { setError("Order records are not available right now."); setLoading(false); }
        return;
      }
      try {
        const customer = await client.from("customers").select("id").eq("clerk_user_id", user.id).maybeSingle();
        if (customer.error) throw customer.error;
        if (!customer.data) {
          if (!cancelled) setOrder(null);
          return;
        }
        const result = await client.from("orders").select("*").eq("id", orderId).eq("customer_id", customer.data.id).maybeSingle();
        if (result.error) throw result.error;
        if (!result.data) {
          if (!cancelled) setOrder(null);
          return;
        }
        const lines = await client.from("order_items").select("id, order_id, title, unit_price, quantity, line_total").eq("order_id", orderId);
        if (lines.error) throw lines.error;
        if (!cancelled) { setOrder(result.data as Row); setItems((lines.data || []) as Row[]); }
      } catch {
        if (!cancelled) setError("We couldn’t load this order. Please try again from your account.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [getToken, isLoaded, orderId, user?.id]);

  return (
    <main id="main" className="inner-page account-page account-order-page">
      <div className="container account-page-heading">
        <nav aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/account">My account</Link><span>/</span><span aria-current="page">Order details</span></nav>
        <p className="shop-kicker">YOUR READING JOURNEY</p>
        <h1>Order details.</h1>
        <p>Review the books, delivery details and latest status for your order.</p>
      </div>
      <section className="container account-order-content">
        {!isLoaded || (loading && Boolean(user?.id)) ? <div className="account-panel-card account-empty-note">Loading order details…</div>
          : !user?.id ? <div className="account-panel-card account-empty-note"><p>Sign in to view your order details.</p><Link className="button button-green" href={`/account?redirect_url=${encodeURIComponent(`/account/orders/${orderId}`)}`}>Sign in <Icon name="arrow" /></Link></div>
            : error ? <div className="account-panel-card account-empty-note" role="alert"><p>{error}</p><Link className="button button-outline" href="/account">Return to your account</Link></div>
              : !order ? <div className="account-panel-card account-empty-note"><p>We couldn’t find this order in your account.</p><Link className="button button-outline" href="/account">Return to your account</Link></div>
                : <>
                  <section className="account-panel-card account-order-summary">
                    <header><div><p className="shop-kicker">ORDER REFERENCE</p><h2>{String(order.order_number)}</h2><p>Placed {date(order.placed_at)}</p></div><span className={`account-status account-status-${String(order.status)}`}>{String(order.status).replaceAll("_", " ")}</span></header>
                    {progress.includes(String(order.status)) ? <div className="account-order-progress">{progress.map((status, index) => { const current = progress.indexOf(String(order.status)); return <div className={index <= current ? "is-complete" : ""} key={status}><i /><span>{status}</span></div>; })}</div> : <p className="account-order-final-status">This order is {String(order.status).replaceAll("_", " ")}.</p>}
                  </section>
                  <div className="account-order-detail-grid">
                    <section className="account-panel-card">
                      <header><div><h2>Books in this order</h2><p>Order-time prices and quantities</p></div></header>
                      <ul className="account-order-lines">{items.map((item) => <li key={item.id}><div><strong>{String(item.title)}</strong><small>Rs. {money(item.unit_price)} × {String(item.quantity)}</small></div><strong>Rs. {money(item.line_total)}</strong></li>)}{!items.length && <li>Item details are not available for this order.</li>}</ul>
                      <dl className="account-order-totals"><div><dt>Subtotal</dt><dd>Rs. {money(order.subtotal)}</dd></div><div><dt>Delivery</dt><dd>Rs. {money(order.shipping_fee)}</dd></div><div><dt>Discount</dt><dd>− Rs. {money(order.discount_total)}</dd></div><div className="is-total"><dt>Total</dt><dd>Rs. {money(order.total)}</dd></div></dl>
                    </section>
                    <aside>
                      <section className="account-panel-card"><header><div><h2>Delivery</h2><p>Where this order is going</p></div></header><dl className="account-order-meta"><div><dt>Name</dt><dd>{String(order.customer_name || user.fullName || "—")}</dd></div><div><dt>Address</dt><dd>{[order.shipping_address, order.shipping_city].filter(Boolean).join(", ") || "To be confirmed by phone"}</dd></div><div><dt>Phone</dt><dd>{String(order.customer_phone || "—")}</dd></div></dl></section>
                      <section className="account-panel-card"><header><div><h2>Payment</h2><p>Payment is handled on delivery</p></div></header><dl className="account-order-meta"><div><dt>Method</dt><dd>{String(order.payment_method || "Cash on delivery").replaceAll("_", " ")}</dd></div><div><dt>Status</dt><dd>{String(order.payment_status || "unpaid")}</dd></div><div><dt>Order note</dt><dd>{String(order.notes || "No note added")}</dd></div></dl></section>
                    </aside>
                  </div>
                  {order.status === "pending" && <div className="account-order-actions"><button className="button button-outline" disabled={cancelling} onClick={() => void cancelOrder()}>{cancelling ? "Cancelling…" : "Cancel pending order"}</button><small>You can cancel while your order is awaiting processing.</small></div>}
                  {cancelError && <p role="alert">{cancelError}</p>}
                  <div className="account-order-actions"><Link className="button button-outline" href="/account"><Icon name="arrow" /> Back to account</Link><Link className="button button-green" href="/contact"><Icon name="whatsapp" /> Need help with this order?</Link></div>
                </>}
      </section>
    </main>
  );
}
