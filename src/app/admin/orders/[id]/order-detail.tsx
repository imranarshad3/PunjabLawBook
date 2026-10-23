"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "../../shell";
import { Glyph } from "../../icons";
import { useAdminData } from "../../use-admin-data";

const money = (value: unknown) => new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(Number(value) || 0);
const date = (value: unknown) => value ? new Date(String(value)).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : "—";
const statuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const data = useAdminData(orderId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const order = data.orders.find((entry) => entry.id === orderId);
  const items = data.orderItems.filter((item) => item.order_id === orderId);

  async function changeStatus(status: string) {
    if (!order) return;
    setSaving(true);
    setError("");
    const failure = await data.save("orders", { status }, order.id);
    setSaving(false);
    if (failure) setError(failure);
  }

  if (data.loading) return <AdminShell view="Orders" title="Loading order…" subtitle="Fetching order details."><p className="plbh-admin-empty">Loading order details…</p></AdminShell>;
  if (!order) return <AdminShell view="Orders" title="Order not found" subtitle="This order may have been removed or you may not have access."><Link className="plbh-admin-button" href="/admin/orders">Back to orders</Link></AdminShell>;

  return (
    <AdminShell view="Orders" title={`Order ${String(order.order_number)}`} subtitle={`Placed ${date(order.placed_at)} · ${String(order.customer_name || "Customer")}`} crumbs={[{ label: "Orders", href: "/admin/orders" }, { label: String(order.order_number) }]}>
      <div className="plbh-admin-order-detail-page">
        <section className="plbh-admin-panel">
          <div className="plbh-admin-panel-heading">
            <div><h2>Order status</h2><p>Update fulfilment as this order moves through the shop.</p></div>
            <select aria-label="Update order status" value={String(order.status)} disabled={saving} onChange={(event) => void changeStatus(event.target.value)}>
              {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
            </select>
          </div>
          {error && <p className="plbh-admin-form-error" role="alert">{error}</p>}
          <div className="plbh-admin-order-progress" aria-label={`Order status: ${String(order.status)}`}>
            {["pending", "processing", "shipped", "delivered"].map((status, index) => {
              const current = ["pending", "processing", "shipped", "delivered"].indexOf(String(order.status));
              return <div className={index <= current ? "is-complete" : ""} key={status}><i /><span>{status}</span></div>;
            })}
          </div>
        </section>
        <div className="plbh-admin-order-detail-grid">
          <section className="plbh-admin-panel">
            <div className="plbh-admin-panel-heading"><div><h2>Items ordered <span className="plbh-admin-count">{items.length}</span></h2><p>Prices and quantities captured when the order was placed.</p></div></div>
            <div className="plbh-admin-table-scroll"><table><thead><tr><th>Book</th><th>Unit price</th><th>Quantity</th><th>Line total</th></tr></thead><tbody>
              {items.map((item) => <tr key={item.id}><td><strong>{String(item.title)}</strong></td><td>Rs. {money(item.unit_price)}</td><td>{String(item.quantity)}</td><td><strong>Rs. {money(item.line_total)}</strong></td></tr>)}
              {!items.length && <tr><td colSpan={4}>No item details were found for this order.</td></tr>}
            </tbody></table></div>
            <dl className="plbh-admin-order-totals"><div><dt>Subtotal</dt><dd>Rs. {money(order.subtotal)}</dd></div><div><dt>Delivery</dt><dd>Rs. {money(order.shipping_fee)}</dd></div><div><dt>Discount</dt><dd>− Rs. {money(order.discount_total)}</dd></div><div className="is-total"><dt>Order total</dt><dd>Rs. {money(order.total)}</dd></div></dl>
          </section>
          <aside className="plbh-admin-order-side">
            <section className="plbh-admin-panel"><div className="plbh-admin-panel-heading"><div><h2>Customer</h2><p>Contact and delivery information</p></div></div><dl className="plbh-admin-order-meta"><div><dt>Name</dt><dd>{String(order.customer_name || "—")}</dd></div><div><dt>Email</dt><dd>{String(order.customer_email || "—")}</dd></div><div><dt>Phone</dt><dd>{String(order.customer_phone || "—")}</dd></div><div><dt>Delivery address</dt><dd>{[order.shipping_address, order.shipping_city].filter(Boolean).join(", ") || "Not provided"}</dd></div><div><dt>Customer notes</dt><dd>{String(order.notes || "No notes")}</dd></div></dl></section>
            <section className="plbh-admin-panel"><div className="plbh-admin-panel-heading"><div><h2>Payment</h2><p>Payment method and current state</p></div></div><dl className="plbh-admin-order-meta"><div><dt>Method</dt><dd>{String(order.payment_method || "Cash on delivery")}</dd></div><div><dt>Status</dt><dd>{String(order.payment_status || "unpaid")}</dd></div><div><dt>Reference</dt><dd>{String(order.order_number)}</dd></div></dl></section>
          </aside>
        </div>
        <Link className="plbh-admin-text-button" href="/admin/orders"><Glyph name="left" size={15} /> Back to orders</Link>
      </div>
    </AdminShell>
  );
}
