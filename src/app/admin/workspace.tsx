"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { products, type Product } from "@/data/products";

type View = "Overview" | "Orders" | "Book catalogue" | "Customers" | "Analytics" | "Settings";
type Order = { id: string; name: string; city: string; book: string; amount: number; status: string; date: string };
const initialOrders: Order[] = [
  { id: "PLB-2048", name: "Ahmed Raza", city: "Lahore", book: "Civil Judge-cum-Judicial Magistrate Guide 2026", amount: 3570, status: "Processing", date: "20 Oct 2026" },
  { id: "PLB-2047", name: "Fatima Khan", city: "Islamabad", book: "Pakistan Penal Code 1860", amount: 3000, status: "Shipped", date: "20 Oct 2026" },
  { id: "PLB-2046", name: "Muhammad Ali", city: "Karachi", book: "AI for Lawyers", amount: 2000, status: "Delivered", date: "19 Oct 2026" },
  { id: "PLB-2045", name: "Ayesha Malik", city: "Rawalpindi", book: "Muslim Family Laws", amount: 250, status: "Processing", date: "19 Oct 2026" },
  { id: "PLB-2044", name: "Hassan Shah", city: "Multan", book: "Additional District & Sessions Judge Guide", amount: 4800, status: "Delivered", date: "18 Oct 2026" },
];
const money = (amount: number) => new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(amount);
const nav: { name: View; icon: string }[] = [
  { name: "Overview", icon: "grid" }, { name: "Orders", icon: "bag" }, { name: "Book catalogue", icon: "book" },
  { name: "Customers", icon: "users" }, { name: "Analytics", icon: "chart" }, { name: "Settings", icon: "settings" },
];

function Glyph({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    book: <><path d="M12 5v16M12 5C8 2 4 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-4-1-7-1-10 1Z" /><path d="m5 8 4 1m6 0 4-1" /></>,
    bag: <><path d="M4 7h16l1 14H3L4 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
    users: <><circle cx="9" cy="7" r="3" /><path d="M2 21v-3a7 7 0 0 1 14 0v3M16 4a3 3 0 0 1 0 6m3 4c2 1 3 3 3 6" /></>,
    chart: <><path d="M4 3v18h18M8 16v-5m5 5V6m5 10V9" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m9 3 6 0 1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3Z" /></>,
    search: <><circle cx="10" cy="10" r="6.5" /><path d="m15 15 6 6" /></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    external: <><path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6" /></>,
    bell: <><path d="M5 17h14l-2-4V8a5 5 0 0 0-10 0v5l-2 4Zm5 3h4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    down: <><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 11h18" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M16 10h5v5h-5zM3 9h18" /></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.book}</svg>;
}

function RevenueChart({ period }: { period: string }) {
  const weekly = period === "Last 7 days";
  return <div className="ad-chart" role="img" aria-label={`Illustrative revenue chart for ${period}: revenue trends upward; sample data only.`}>
    <div className="ad-y-axis">{["80k", "60k", "40k", "20k", "0"].map(x => <span key={x}>{x}</span>)}</div>
    <div className="ad-plot"><svg viewBox="0 0 700 200" preserveAspectRatio="none">
      <defs><linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#296a52" stopOpacity=".18" /><stop offset="100%" stopColor="#296a52" stopOpacity="0" /></linearGradient></defs>
      {[10, 55, 100, 145, 190].map(y => <line key={y} x1="0" x2="700" y1={y} y2={y} stroke="#eceee9" strokeDasharray="4 5" />)}
      <path d="M0 164C45 165 50 111 90 132S140 160 175 120 220 141 260 100 310 115 350 88 405 115 440 80 490 101 525 60 580 75 610 48 650 65 700 30" fill="none" stroke="#c9c6ba" strokeWidth="2" strokeDasharray="5 6" />
      <path d={weekly ? "M0 160Q60 110 115 135T230 100T350 110T465 65T580 72T700 15V200H0Z" : "M0 160C30 165 40 125 70 140S110 170 140 122 175 140 210 99 245 145 280 110 310 125 350 65 390 100 420 61 465 110 490 65 525 85 560 40 605 75 630 32 670 50 700 12V200H0Z"} fill="url(#revenue-fill)" />
      <path d={weekly ? "M0 160Q60 110 115 135T230 100T350 110T465 65T580 72T700 15" : "M0 160C30 165 40 125 70 140S110 170 140 122 175 140 210 99 245 145 280 110 310 125 350 65 390 100 420 61 465 110 490 65 525 85 560 40 605 75 630 32 670 50 700 12"} fill="none" stroke="#27674f" strokeWidth="3" />
    </svg><div className="ad-x-axis">{(weekly ? ["14 Oct", "15 Oct", "16 Oct", "17 Oct", "18 Oct", "19 Oct", "20 Oct"] : ["21 Sep", "26 Sep", "01 Oct", "06 Oct", "11 Oct", "16 Oct", "20 Oct"]).map(x => <span key={x}>{x}</span>)}</div></div>
  </div>;
}

export function AdminWorkspace() {
  const [view, setView] = useState<View>("Overview");
  const [books, setBooks] = useState<Product[]>(products);
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [period, setPeriod] = useState("Last 30 days");
  const [mobile, setMobile] = useState(false);
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState(false);
  const [storeName, setStoreName] = useState("Punjab Law Book House");
  const bookDialog = useRef<HTMLDialogElement>(null);
  const orderDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    // Browser drafts are restored only after hydration to preserve the server render.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("plbh-admin-books-v1") || "null");
      if (Array.isArray(saved) && saved.every(b => b && typeof b.id === "number" && typeof b.name === "string" && typeof b.price === "number" && typeof b.image === "string" && typeof b.category === "string" && typeof b.inStock === "boolean")) setBooks(saved);
      const name = localStorage.getItem("plbh-admin-name");
      if (name) setStoreName(name);
    } catch { /* Retain source catalogue when browser storage is unavailable. */ }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  function navigate(next: View) { setView(next); setSearch(""); setStatus("All statuses"); setMobile(false); }
  function editBook(book: Product | null) { setEditing(book); bookDialog.current?.showModal(); }
  function exportData() {
    const rows = view === "Book catalogue"
      ? [["ID", "Title", "Category", "Price PKR", "In stock"], ...books.map(b => [b.id, b.name, b.category, b.price, b.inStock])]
      : [["Sample order", "Customer", "City", "Amount PKR", "Status"], ...orders.map(o => [o.id, o.name, o.city, o.amount, o.status])];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/^[=+@\t\r-]/, "'$&").replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = view === "Book catalogue" ? "plbh-catalogue-drafts.csv" : "plbh-sample-orders.csv"; link.click(); URL.revokeObjectURL(url);
    setNotice("Your CSV export is ready.");
  }
  const filteredOrders = orders.filter(o => `${o.id} ${o.name} ${o.book} ${o.city}`.toLowerCase().includes(search.toLowerCase()) && (status === "All statuses" || o.status === status));
  const filteredBooks = books.filter(b => `${b.name} ${b.category}`.toLowerCase().includes(search.toLowerCase()));
  const metrics = period === "Last 7 days" ? ["186,420", "64", "41", "2,913"] : ["842,650", "286", "194", "2,946"];
  const overview = view === "Overview";
  return <div className="ad-app">
    <aside className={`ad-sidebar ${mobile ? "is-open" : ""}`}>
      <Link href="/admin" className="ad-brand"><span className="ad-brand-mark"><Glyph name="book" size={25} /></span><span>Punjab Law<span>BOOK HOUSE</span></span><small>EST. 1950</small></Link>
      <div className="ad-workspace-label">STORE WORKSPACE <span>PRO</span></div>
      <nav aria-label="Admin navigation">{nav.map((item, i) => <div key={item.name}>{i === 5 && <div className="ad-nav-divider">PREFERENCES</div>}<button className={view === item.name ? "active" : ""} onClick={() => navigate(item.name)} aria-current={view === item.name ? "page" : undefined}><Glyph name={item.icon} /><span>{item.name}</span>{item.name === "Orders" && <small>{orders.filter(o => o.status === "Processing").length}</small>}</button></div>)}</nav>
      <div className="ad-sidebar-bottom"><div className="ad-store-card"><span className="ad-live-dot" /> Your bookstore, online.<p>A legacy of knowledge.<br />A new chapter of possibilities.</p><Link href="/" target="_blank">Visit storefront <Glyph name="external" size={15} /></Link></div>
      <div className="ad-user"><span className="ad-avatar">PL</span><div>Store administrator<small>Local workspace</small></div><Glyph name="settings" size={17} /></div></div>
    </aside>
    {mobile && <button className="ad-backdrop" aria-label="Close navigation" onClick={() => setMobile(false)} />}
    <div className="ad-main">
      <header className="ad-topbar"><div className="ad-breadcrumb"><button className="ad-mobile-button ad-icon-button" aria-label="Open navigation" onClick={() => setMobile(true)}><Glyph name="menu" /></button><span>Workspace</span><span>/</span><strong>{view}</strong></div><div className="ad-top-actions"><span className="ad-preview-label"><i /> Demo workspace</span><Link href="/" target="_blank">View store <Glyph name="external" size={14} /></Link><div className="ad-notification-wrap"><button className="ad-icon-button ad-bell" aria-label="Notifications" aria-expanded={notifications} onClick={() => setNotifications(!notifications)}><Glyph name="bell" /><i /></button>{notifications && <div className="ad-notifications"><strong>Workspace updates</strong><p>Your catalogue is ready to explore.</p><p>Sales and orders shown here are sample data. Catalogue changes are saved in this browser.</p></div>}</div><span className="ad-avatar ad-avatar-small">PL</span></div></header>
      <main className="ad-content" id="admin-main">
        <div className="ad-page-heading"><div><div className="ad-eyebrow">PUNJAB LAW BOOK HOUSE · ADMIN STUDIO</div><h1>{overview ? "A new day. A bigger chapter." : view}</h1><p>{overview ? "Welcome back. Here’s how your bookstore is doing." : ({ Orders: "Every order, from your shelves to their doorstep.", "Book catalogue": "Curate the collection. Keep knowledge within reach.", Customers: "The readers at the heart of your bookstore.", Analytics: "A clearer picture of your bookstore’s performance.", Settings: "Make this workspace your own." } as Record<string, string>)[view]}</p></div><div className="ad-heading-actions"><button className="ad-button" onClick={exportData}><Glyph name="down" size={16} /> Export</button><button className="ad-button ad-button-primary" onClick={() => editBook(null)}><Glyph name="plus" size={17} /> Add book</button></div></div>
        <div className="ad-context-row"><div className="ad-tabs"><button className="selected" onClick={() => navigate(view)}>{overview ? "Store overview" : view}</button><span>Sample sales · Local catalogue drafts</span></div><label className="ad-period"><Glyph name="calendar" size={16} /><select aria-label="Reporting period" value={period} onChange={e => setPeriod(e.target.value)}><option>Last 30 days</option><option>Last 7 days</option></select></label></div>
        {(overview || view === "Analytics") && <>
          <div className="ad-metrics">{[{ label: "Total revenue", icon: "wallet", prefix: "Rs.", growth: "12.8%", detail: "vs. previous period" }, { label: "Total orders", icon: "bag", growth: "8.2%", detail: "vs. previous period" }, { label: "Customers", icon: "users", growth: "16.4%", detail: "vs. previous period" }, { label: "Average order value", icon: "chart", prefix: "Rs.", growth: "4.3%", detail: "vs. previous period" }].map((m, i) => <section className="ad-metric" key={m.label}><div><span>{m.label}</span><span className={`ad-metric-icon tone-${i}`}><Glyph name={m.icon} size={18} /></span></div><strong>{m.prefix && <small>{m.prefix} </small>}{metrics[i]}</strong><p><span>↗ {m.growth}</span> {m.detail}</p><svg viewBox="0 0 100 30" aria-hidden="true"><path d={i % 2 ? "M0 27 12 21 22 24 33 13 45 19 57 10 68 13 80 5 91 8 100 2" : "M0 26 13 26 23 19 35 22 46 12 56 18 70 8 80 10 90 4 100 4"} /></svg></section>)}</div>
          <div className="ad-chart-grid"><section className="ad-panel ad-revenue"><div className="ad-panel-heading"><div><h2>Revenue overview</h2><p>Your store’s sales performance over time</p></div><span className="ad-chart-unit">PKR</span></div><div className="ad-revenue-summary"><strong>Rs. {metrics[0]}</strong><span className="ad-growth">↗ 12.8%</span><div className="ad-legend"><span><i />This period</span><span><i />Previous period</span></div></div><RevenueChart period={period} /></section>
          <section className="ad-panel ad-category-panel"><div className="ad-panel-heading"><div><h2>Sales by category</h2><p>What your readers are exploring</p></div></div><div className="ad-donut"><div><small>Total orders</small><strong>{metrics[1]}</strong></div></div><div className="ad-category-legend">{[["Exam guides", "42%", "#225c48"], ["Law & practice", "28%", "#b7975c"], ["Bare acts", "18%", "#8fa18c"], ["Other books", "12%", "#e0ded3"]].map(([label, value, color]) => <div key={label}><i style={{ background: color }} /><span>{label}</span><strong>{value}</strong></div>)}</div></section></div>
        </>}
        {(overview || view === "Orders") && <section className="ad-panel ad-orders"><div className="ad-panel-heading"><div><h2>{overview ? "Recent orders" : "All orders"} <span className="ad-count">{orders.length}</span></h2><p>A little closer to your readers, one order at a time.</p></div>{overview && <button className="ad-text-button" onClick={() => navigate("Orders")}>View all orders <Glyph name="arrow" size={16} /></button>}</div><div className="ad-table-toolbar"><label className="ad-search"><Glyph name="search" size={17} /><input aria-label="Search orders" placeholder="Search orders, customers or books..." value={search} onChange={e => setSearch(e.target.value)} /></label><select aria-label="Filter order status" value={status} onChange={e => setStatus(e.target.value)}>{["All statuses", "Processing", "Shipped", "Delivered", "Cancelled"].map(s => <option key={s}>{s}</option>)}</select></div><div className="ad-table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th aria-label="Actions" /></tr></thead><tbody>{filteredOrders.map(o => <tr key={o.id}><td><button className="ad-order-id" onClick={() => { setSelectedOrder(o); orderDialog.current?.showModal(); }}>#{o.id}</button><small>1 book</small></td><td><div className="ad-customer-cell"><span className={`ad-initials color-${o.name.length % 3}`}>{o.name.split(" ").map(n => n[0]).join("")}</span><div>{o.name}<small>{o.city}, Pakistan</small></div></div></td><td>{o.date}</td><td className="ad-amount">Rs. {money(o.amount)}</td><td><span className={`ad-badge ${o.status.toLowerCase()}`}><i />{o.status}</span></td><td><button className="ad-icon-button" aria-label={`View order ${o.id}`} onClick={() => { setSelectedOrder(o); orderDialog.current?.showModal(); }}><Glyph name="arrow" size={16} /></button></td></tr>)}</tbody></table>{!filteredOrders.length && <div className="ad-empty">No orders match your search.</div>}</div><div className="ad-table-footer">Showing {filteredOrders.length} of {orders.length} sample orders<span>Updated for the demo workspace</span></div></section>}
        {overview && <div className="ad-bottom-grid"><section className="ad-panel"><div className="ad-panel-heading"><div><h2>From your catalogue</h2><p>Knowledge worth putting on the shelf.</p></div><button className="ad-text-button" onClick={() => navigate("Book catalogue")}>Manage books <Glyph name="arrow" size={16} /></button></div><div className="ad-book-highlights">{books.slice(0, 3).map(b => <button key={b.id} onClick={() => editBook(b)}><Image src={b.image} alt="" width={46} height={62} /><span><strong>{b.name}</strong><small>{b.category}</small><b>Rs. {money(b.price)}</b></span></button>)}</div></section><section className="ad-editorial"><span>BUILT ON A LEGACY</span><h2>Knowledge opens doors.<br />You keep them open.</h2><p>Manage your collection with the same care<br />that built your bookstore.</p><button onClick={() => navigate("Book catalogue")}>Explore your catalogue <Glyph name="arrow" size={17} /></button><Glyph name="book" size={130} /></section></div>}
        {view === "Book catalogue" && <section className="ad-panel"><div className="ad-panel-heading"><div><h2>Your collection <span className="ad-count">{books.length}</span></h2><p>Edits are browser-local drafts and do not change the live storefront.</p></div></div><div className="ad-table-toolbar"><label className="ad-search"><Glyph name="search" size={17} /><input aria-label="Search catalogue" placeholder="Search by book title or category..." value={search} onChange={e => setSearch(e.target.value)} /></label></div><div className="ad-catalogue">{filteredBooks.map(b => <article className="ad-book-card" key={b.id}><div className="ad-book-cover"><Image src={b.image} alt={b.name} width={105} height={145} /></div><span className="ad-eyebrow">{b.category}</span><h3>{b.name}</h3><div><strong>Rs. {money(b.price)}</strong><span className={`ad-badge ${b.inStock ? "delivered" : "cancelled"}`}>{b.inStock ? "In stock" : "Out of stock"}</span></div><button className="ad-button" onClick={() => editBook(b)}>Edit book <Glyph name="arrow" size={15} /></button></article>)}</div>{!filteredBooks.length && <div className="ad-empty">No books found. Try a different title or category.</div>}</section>}
        {view === "Customers" && <section className="ad-panel"><div className="ad-panel-heading"><div><h2>Your readers</h2><p>Sample customers associated with the demonstration orders.</p></div></div><div className="ad-table-toolbar"><label className="ad-search"><Glyph name="search" size={17} /><input aria-label="Search customers" placeholder="Search name or city..." value={search} onChange={e => setSearch(e.target.value)} /></label></div><div className="ad-customer-grid">{orders.filter(o => `${o.name} ${o.city}`.toLowerCase().includes(search.toLowerCase())).map(o => <article key={o.id}><span className="ad-initials">{o.name.split(" ").map(n => n[0]).join("")}</span><h3>{o.name}</h3><p>{o.city}, Pakistan</p><div><span>1 sample order</span><strong>Rs. {money(o.amount)}</strong></div><button className="ad-text-button" onClick={() => { setSelectedOrder(o); orderDialog.current?.showModal(); }}>View order <Glyph name="arrow" size={16} /></button></article>)}</div>{!filteredOrders.length && <div className="ad-empty">No customers match your search.</div>}</section>}
        {view === "Settings" && <section className="ad-panel ad-settings"><h2>Workspace preferences</h2><p>Preferences are saved in this browser.</p><form onSubmit={e => { e.preventDefault(); try { localStorage.setItem("plbh-admin-name", storeName); setNotice("Workspace preferences saved."); } catch { setNotice("Browser storage is unavailable. Preferences could not be saved."); } }}><label>Store display name<input value={storeName} onChange={e => setStoreName(e.target.value)} required maxLength={80} /></label><label>Currency<input value="Pakistani Rupee (PKR)" readOnly /></label><label>Workspace mode<input value="Demo · browser-local catalogue drafts" readOnly /></label><button className="ad-button ad-button-primary" type="submit">Save preferences</button></form><div className="ad-settings-note"><strong>Ready for the next chapter</strong><p>This admin interface uses your existing catalogue. Production authentication, shared inventory, payments and live order management require a connected backend.</p></div></section>}
        <footer className="ad-footer"><span>© 2026 {storeName}</span><span>Thoughtfully built for the business of knowledge. <span className="ad-footer-mark">✧</span></span></footer>
      </main>
    </div>
    <dialog ref={bookDialog} className="ad-dialog"><form key={editing?.id ?? "new"} onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); const price = Number(data.get("price")); const name = String(data.get("title")).trim(); if (!name || !Number.isFinite(price) || price < 0) return; const book: Product = { ...(editing || { id: Date.now(), image: "/images/book-5966.webp", url: "", purchasable: true }), name, price, category: String(data.get("category")), inStock: data.get("stock") === "on" }; const next = editing ? books.map(b => b.id === editing.id ? book : b) : [...books, book]; try { localStorage.setItem("plbh-admin-books-v1", JSON.stringify(next)); setBooks(next); bookDialog.current?.close(); setNotice("Book saved as a local catalogue draft."); } catch { setNotice("Could not save. Browser storage is unavailable or full."); } }}><div className="ad-dialog-heading"><div><div className="ad-eyebrow">YOUR COLLECTION</div><h2>{editing ? "Edit book" : "A new addition"}</h2></div><button type="button" aria-label="Close book editor" onClick={() => bookDialog.current?.close()}>×</button></div><p>Saved in this browser. Your live catalogue stays unchanged.</p><label>Book title<input name="title" required maxLength={220} defaultValue={editing?.name} placeholder="Enter the book title" autoFocus /></label><label>Category<select name="category" defaultValue={editing?.category || "Exam Guides"}>{[...new Set(products.map(b => b.category))].map(c => <option key={c}>{c}</option>)}</select></label><label>Price (PKR)<input name="price" type="number" required min="0" max="10000000" step="0.01" defaultValue={editing?.price} placeholder="0.00" /></label><label className="ad-checkbox"><input name="stock" type="checkbox" defaultChecked={editing?.inStock ?? true} /> Available in stock</label>{!editing && <p className="ad-dialog-note">New drafts use a catalogue cover placeholder.</p>}<div className="ad-dialog-actions"><button type="button" className="ad-button" onClick={() => bookDialog.current?.close()}>Cancel</button><button type="submit" className="ad-button ad-button-primary">Save draft</button></div></form></dialog>
    <dialog ref={orderDialog} className="ad-dialog"><div className="ad-dialog-heading"><div><div className="ad-eyebrow">SAMPLE ORDER</div><h2>#{selectedOrder?.id}</h2></div><button aria-label="Close order details" onClick={() => orderDialog.current?.close()}>×</button></div>{selectedOrder && <><div className="ad-order-details"><h3>{selectedOrder.name}</h3><p>{selectedOrder.city}, Pakistan · {selectedOrder.date}</p><div><span>{selectedOrder.book}</span><strong>Rs. {money(selectedOrder.amount)}</strong></div></div><label>Order status<select value={selectedOrder.status} onChange={e => { const updated = { ...selectedOrder, status: e.target.value }; setSelectedOrder(updated); setOrders(current => current.map(o => o.id === updated.id ? updated : o)); }}>{["Processing", "Shipped", "Delivered", "Cancelled"].map(s => <option key={s}>{s}</option>)}</select></label><p className="ad-dialog-note">Status changes apply to this demo session only.</p><button className="ad-button ad-button-primary" onClick={() => orderDialog.current?.close()}>Done</button></>}</dialog>
    {notice && <div className="ad-toast" role="status"><span>✓</span>{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}
  </div>;
}
