"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { collections } from "@/data/collections";
import catalogue from "@/data/catalogue.json";
import { categoryIconFor } from "./category-icons";
import { Glyph } from "./icons";
import { viewPath, type View } from "./navigation";
import { AdminShell, subtitles } from "./shell";
import { ProductDetails } from "./product-details";
import { useAdminData } from "./use-admin-data";
import { RecordsPanel } from "./records";
import { EntityForm, type EntityKey } from "./entity-form";
import AdminLoading from "./loading";
import { SiteImagesEditor } from "./site-images-editor";
import { SITE_IMAGE_PREFIX } from "@/lib/site-image-slots";
import { TeamInvites } from "./team-invites";
import type { AdminBook, RecordRow } from "./use-admin-data";

const recordViews = ["Orders", "Customers", "Promotions", "Book Enquiries", "Website Content", "Team & Access"];
const recordEntity: Record<string, EntityKey> = {
  Promotions: "promotion",
  "Website Content": "banner",
  "Team & Access": "member",
  Customers: "customer",
};
const recordTable: Record<string, string> = {
  Promotions: "promotions",
  "Website Content": "content_banners",
  "Team & Access": "admin_members",
  Customers: "customers",
};
const money = (amount: number) =>
  new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(amount);
/** Joins table names for prose: "a, b and c". */
const listed = (names: string[]) =>
  names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
const contentPages = [
  [
    "Homepage",
    "/",
    "Hero, trust highlights, categories, featured titles, bestsellers, exam guides and bookstore story.",
  ],
  [
    "About the bookstore",
    "/about",
    "The Punjab Law Book House introduction and brand story.",
  ],
  [
    "Contact",
    "/contact",
    "Store location, telephone numbers and WhatsApp enquiries.",
  ],
  [
    "Request a book",
    "/request-a-book",
    "Book title, edition, quantity and notes prepared for WhatsApp.",
  ],
  ["Delivery", "/delivery", "Delivery information and ordering guidance."],
  ["Returns & support", "/returns", "Return and customer support information."],
  ["Ordering help", "/help", "Guidance for book selection and ordering."],
  ["Privacy", "/privacy", "The storefront privacy information page."],
  ["Terms", "/terms", "The storefront terms and conditions page."],
];


/* Vertical bar chart of the real catalogue, by subject. */
function CatalogueChart({ categories, total }: { categories: { name: string; count: number }[]; total: number }) {
  const peak = Math.max(1, ...categories.map((c) => c.count));
  return (
    <section className="plbh-admin-panel">
      <div className="plbh-admin-panel-heading">
        <div>
          <h2>Catalogue overview</h2>
          <p>Titles published per subject</p>
        </div>
        <span className="plbh-admin-chart-unit">{total} TITLES</span>
      </div>
      <div className="plbh-admin-bars">
        {categories.slice(0, 12).map((c, index) => (
          <div key={c.name} className="plbh-admin-bar-column" title={`${c.name}: ${c.count}`}>
            <span className="plbh-admin-bar-value">{c.count}</span>
            <i style={{ height: `${Math.max(6, (c.count / peak) * 100)}%`, animationDelay: `${index * 50}ms` }} />
            <small>{c.name}</small>
          </div>
        ))}
      </div>
      <div className="plbh-admin-table-footer">
        Source: storefront catalogue<span>Not sales or revenue data</span>
      </div>
    </section>
  );
}

function Composition({ onCategory, categories, total }: { onCategory: (name: string) => void; categories: { name: string; count: number }[]; total: number }) {
  return (
    <section className="plbh-admin-panel">
      <div className="plbh-admin-panel-heading">
        <div>
          <h2>Top categories</h2>
          <p>Share of the current catalogue</p>
        </div>
        <span className="plbh-admin-chart-unit">{categories.length} SUBJECTS</span>
      </div>
      <div className="plbh-admin-composition">
        {categories.map((category, index) => (
          <button
            key={category.name}
            onClick={() => onCategory(category.name)}
            aria-label={`Browse ${category.name}: ${category.count} titles`}
          >
            <span>{category.name}</span>
            <span className="plbh-admin-bar-track">
              <i
                style={{
                  width: `${(category.count / Math.max(1, total)) * 100}%`,
                  background:
                    index === 0
                      ? "#244735"
                      : index === 1
                        ? "#b4975e"
                        : "#92a08b",
                }}
              />
            </span>
            <strong>{category.count}</strong>
          </button>
        ))}
      </div>
      <div className="plbh-admin-table-footer">
        Source: storefront catalogue<span>Not sales or popularity data</span>
      </div>
    </section>
  );
}

export function AdminWorkspace({ view }: { view: View }) {
  const router = useRouter();
  const params = useSearchParams();
  const data = useAdminData();
  const { userId } = useAuth();
  // The caller's own row in admin_members decides which team controls they see.
  const myRole =
    (data.team.find((member) => member.clerk_user_id === userId)?.role as string | undefined) ??
    null;
  const products = data.books;
  const categoryCounts = data.categories;
  const search = params.get("q") || "";
  const category = categoryCounts.some((c) => c.name === params.get("category"))
    ? params.get("category")! : "All categories";
  const availability = ["In stock", "Out of stock"].includes(params.get("availability") || "")
    ? params.get("availability")! : "All availability";
  const sort = ["Price low to high", "Price high to low"].includes(params.get("sort") || "")
    ? params.get("sort")! : "Title A–Z";
  const [selectedBook, setSelectedBook] = useState<AdminBook | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
  const [notice, setNotice] = useState("");
  const [adjustingBook, setAdjustingBook] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);
  const [editing, setEditing] = useState<{ entity: EntityKey; row?: RecordRow | null } | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const shortcutsDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (showShortcuts) {
      const dialog = shortcutsDialog.current;
      dialog?.showModal();
      return () => dialog?.close();
    }
  }, [showShortcuts]);

  const updateFilters = useCallback((changes: Record<string, string | null>, push = false) => {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (!value) next.delete(key); else next.set(key, value);
    }
    const query = next.toString();
    const url = `${viewPath(view)}${query ? `?${query}` : ""}`;
    if (push) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }, [view]);
  const clearSelection = useCallback(() => {
    setSelectedBooks(new Set());
  }, [setSelectedBooks]);

  const perPage = 8;
  const filtered = products
    .filter(
      (b) =>
        `${b.name} ${b.category} ${b.id}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()) &&
        (category === "All categories" || b.category === category) &&
        (availability === "All availability" ||
          (availability === "In stock" ? b.inStock : !b.inStock)),
    )
    .sort((a, b) =>
      sort === "Price low to high"
        ? a.price - b.price
        : sort === "Price high to low"
          ? b.price - a.price
          : a.name.localeCompare(b.name),
    );
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const requestedPage = Number(params.get("page") || 1);
  const page = Number.isSafeInteger(requestedPage) ? Math.min(pageCount, Math.max(1, requestedPage)) : 1;
  const setPage = useCallback((value: number | ((current: number) => number)) => {
    const requested = typeof value === "function" ? value(page) : value;
    const next = Math.min(pageCount, Math.max(1, requested));
    updateFilters({ page: next === 1 ? null : String(next) }, next !== page);
    clearSelection();
  }, [page, pageCount, updateFilters, clearSelection]);
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    function onGlobalKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault();
        setShowShortcuts(true);
      }
      if (event.key === "Escape") {
        setShowShortcuts(false);
        if (selectedBook) setSelectedBook(null);
      }
      const target = event.target;
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
          (target instanceof HTMLElement && (target.closest("input, textarea, select, [contenteditable], [role=dialog]") || target.closest("dialog"))) ||
          selectedBook || showShortcuts) return;
      if (event.key === "ArrowLeft" && view === "Books" && page > 1) {
        setPage(p => p - 1);
      }
      if (event.key === "ArrowRight" && view === "Books" && page < pageCount) {
        setPage(p => p + 1);
      }
    }
    window.addEventListener("keydown", onGlobalKey);
    return () => window.removeEventListener("keydown", onGlobalKey);
  }, [view, selectedBook, showShortcuts, page, pageCount, setPage]);
  const setSearch = (value: string) => { updateFilters({ q: value, page: null }); clearSelection(); };
  const setCategory = (value: string) => { updateFilters({ category: value === "All categories" ? null : value, page: null }); clearSelection(); };
  const setAvailability = (value: string) => { updateFilters({ availability: value === "All availability" ? null : value, page: null }); clearSelection(); };
  const setSort = (value: string) => { updateFilters({ sort: value === "Title A–Z" ? null : value, page: null }); clearSelection(); };
  const overview = view === "Dashboard";
  const range = params.get("range") || "all";
  const rangeOrders = data.orders.filter((order) => {
    if (range === "all") return true;
    const start = new Date();
    if (range === "year") start.setMonth(0, 1);
    else start.setDate(start.getDate() - ({ "7d": 7, "30d": 30, "90d": 90 }[range] ?? 30));
    start.setHours(0, 0, 0, 0);
    return new Date(String(order.placed_at)) >= start;
  });
  const liveOrders = rangeOrders.filter((order) => !["cancelled", "refunded"].includes(String(order.status)));
  const liveOrderIds = new Set(liveOrders.map((order) => order.id));
  const revenue = liveOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const lowStock = products.filter((book) => book.stockStatus === "low_stock" || book.stockStatus === "out_of_stock").length;
  const monthly = (() => {
    const buckets = new Map<string, number>();
    for (const order of liveOrders) {
      const when = new Date(String(order.placed_at));
      if (Number.isNaN(when.getTime())) continue;
      const key = `${when.getFullYear()}-${String(when.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, (buckets.get(key) || 0) + Number(order.total || 0));
    }
    return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([key, count]) => ({ name: new Date(`${key}-01T12:00:00`).toLocaleDateString("en-PK", { month: "short", year: "2-digit" }), count }));
  })();
  const topTitles = (() => {
    const buckets = new Map<string, number>();
    for (const item of data.orderItems) {
      if (!liveOrderIds.has(String(item.order_id))) continue;
      const title = String(item.title);
      buckets.set(title, (buckets.get(title) || 0) + Number(item.quantity || 0));
    }
    return [...buckets.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  })();
  const statusSplit = (() => {
    const buckets = new Map<string, number>();
    for (const order of rangeOrders) {
      const key = String(order.status);
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    return [...buckets.entries()].map(([name, count]) => ({ name, count }));
  })();

  async function persist(table: string, values: Record<string, unknown>, id?: string) {
    // books.slug is required; derive it from the title for new records.
    if (table === "books" && !id && !values.slug) {
      values.slug = `${String(values.title || "book")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)}`;
    }
    const failure = await data.save(table, values, id);
    if (!failure) setNotice(id ? "Changes saved." : "Record created.");
    return failure;
  }
  async function destroy(table: string, id: string, label: string) {
    if (table === "categories") {
      const usage = await data.categoryBookCount(id);
      if (usage.error) { setNotice(`Could not check category books: ${usage.error}`); return; }
      if (usage.count > 0) {
        setNotice(`Cannot delete ${label}: ${usage.count} ${usage.count === 1 ? "book is" : "books are"} assigned to it. Reassign those books first.`);
        return;
      }
    }
    const failure = await data.remove(table, id);
    setNotice(failure || `${label} deleted.`);
  }
  const pendingOrders = data.orders.filter((order) => order.status === "pending").length;
  const newEnquiries = data.enquiries.filter((enquiry) => enquiry.status === "new").length;
  function navigate(next: View) {
    setNotice("");
    clearSelection();
    router.push(viewPath(next));
  }
  function browseCategory(name: string) {
    router.push(`${viewPath("Books")}?${new URLSearchParams({ category: name })}`);
    clearSelection();
  }
  function exportCatalogue() {
    const rows = [
      ["ID", "Title", "Category", "Price PKR", "In stock"],
      ...filtered.map((b) => [b.id, b.name, b.category, b.price, b.inStock]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${String(cell)
                .replace(/^[=+@\t\r-]/, "'$&")
                .replaceAll('"', '""')}"`,
          )
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "plbh-catalogue.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Export prepared: ${filtered.length} catalogue records.`);
  }
  const toggleBookSelection = useCallback((id: number) => {
    setSelectedBooks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [setSelectedBooks]);
  const toggleAllSelection = useCallback(() => {
    const allSelected = visible.length > 0 && visible.every(b => selectedBooks.has(b.id));
    if (allSelected) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(visible.map(b => b.id)));
    }
  }, [visible, selectedBooks, setSelectedBooks]);
  async function adjustInventory(book: AdminBook, delta: number) {
    if (!book.uuid || adjustingBook) return;
    setAdjustingBook(book.uuid);
    try { const failure = await data.adjustStock(book.uuid, delta, delta > 0 ? "restock" : "adjustment"); setNotice(failure || "Stock updated."); }
    catch { setNotice("Stock could not be updated. Please try again."); }
    finally { setAdjustingBook(""); }
  }
  if (data.loading) return <AdminLoading />;
  return (
    <AdminShell
      view={view}
      title={overview ? "Welcome Back, Admin!" : view}
      subtitle={overview ? "Manage your bookstore with ease." : subtitles[view] || "A considered workspace for the business of knowledge."}
      orderBadge={pendingOrders}
      enquiryBadge={newEnquiries}
      actions={
        <>
          {(overview || view === "Books" || view === "Analytics" || view === "Inventory" || view === "Media Library") && (
            <button className="plbh-admin-button" onClick={exportCatalogue}>
              <Glyph name="down" size={16} /> Export catalogue
            </button>
          )}
          <Link className="plbh-admin-button plbh-admin-button-primary" href="/products" target="_blank">
            View collection <Glyph name="external" size={15} />
          </Link>
        </>
      }
    >
          {/* Only shown when something needs attention. A working connection is
              the normal state and does not need announcing on every page. */}
          {(data.failures.length > 0 || !data.live) && !data.loading && (
            <div className={`plbh-admin-connection-banner${data.failures.length ? " is-warning" : ""}`}>
              <span className="plbh-admin-banner-symbol">
                <Glyph name="settings" size={16} />
              </span>
              <div>
                <strong>
                  {data.failures.length
                    ? `${data.failures.length} ${data.failures.length === 1 ? "table" : "tables"} could not be read`
                    : "Showing the built-in catalogue"}
                </strong>
                <span>
                  {data.failures.length
                    ? `Supabase refused the read for ${listed(data.failures)}. Those pages are empty because the request was denied, not because the tables are. Check the row level security policies for your admin role.`
                    : "The database is not configured. This catalogue is read-only until the store connection is restored."}
                </span>
              </div>
              <button
                className="plbh-admin-text-button"
                onClick={() => navigate("Settings")}
              >
                Connection details <Glyph name="arrow" size={16} />
              </button>
            </div>
          )}
          <div className="plbh-admin-context-row">
            <div className="plbh-admin-tabs">
              <span className="plbh-admin-current-tab">
                {overview ? "Store overview" : view}
              </span>
              <span>{data.live ? "Live store workspace" : "Catalogue preview"}</span>
            </div>
            <span className="plbh-admin-period">
              <Glyph name="calendar" size={15} /> Verified{" "}
              {catalogue.verifiedAt}
            </span>
          </div>
          {(overview || view === "Analytics") && (
            <div className="plbh-admin-metrics">
                {(overview
                  ? [
                  {
                    label: "Catalogue titles",
                    icon: "book",
                    value: String(products.length),
                    detail: `${categoryCounts.length} subjects in your store`,
                  },
                  {
                    label: "Orders",
                    icon: "bag",
                    value: String(rangeOrders.length),
                    detail: `${pendingOrders} need confirmation`,
                  },
                  {
                    label: "Stock watch",
                    icon: "box",
                    value: String(lowStock),
                    detail: "Titles low or out of stock",
                  },
                  {
                    label: "Reader enquiries",
                    icon: "mail",
                    value: String(newEnquiries),
                    detail: "Messages ready for follow-up",
                  },
                ]
                  : [
                      {
                        label: "Net order value",
                        icon: "wallet",
                        value: `Rs. ${money(revenue)}`,
                        detail: "Excludes cancelled and refunded orders",
                      },
                      {
                        label: "Orders in range",
                        icon: "bag",
                        value: String(rangeOrders.length),
                        detail: `${liveOrders.length} active orders counted`,
                      },
                      {
                        label: "Average order",
                        icon: "chart",
                        value: `Rs. ${money(liveOrders.length ? revenue / liveOrders.length : 0)}`,
                        detail: "Average value per active order",
                      },
                      {
                        label: "Units ordered",
                        icon: "book",
                        value: String(data.orderItems
                          .filter((item) => liveOrderIds.has(String(item.order_id)))
                          .reduce((sum, item) => sum + Number(item.quantity || 0), 0)),
                        detail: "Across the selected order range",
                      },
                    ]).map((metric, index) => (
                  <section className="plbh-admin-metric" key={metric.label}>
                    <span className={`plbh-admin-metric-icon tone-${index}`}>
                      <Glyph name={metric.icon} size={18} />
                    </span>
                    <strong>{metric.value}</strong>
                    <span className="plbh-admin-metric-label">{metric.label}</span>
                    <p>{metric.detail}</p>
                  </section>
                ))}
            </div>
          )}
          {overview && (
            <>
              <div className="plbh-admin-chart-grid">
                <CatalogueChart categories={categoryCounts} total={products.length} />
                <Composition onCategory={browseCategory} categories={categoryCounts} total={products.length} />
              </div>
              <section className="plbh-admin-panel plbh-admin-readiness">
                <div className="plbh-admin-panel-heading"><div><h2>Today&apos;s priorities</h2><p>A focused view of the work that can move your store forward.</p></div><span className="plbh-admin-chart-unit">WORKSPACE PULSE</span></div>
                <div className="plbh-admin-quicklinks">
                  {([
                    ["Orders", "cart", "Review orders", `${pendingOrders} awaiting confirmation`],
                    ["Inventory", "box", "Review stock", `${lowStock} titles need attention`],
                    ["Book Enquiries", "mail", "Reply to readers", `${newEnquiries} new enquiries`],
                    ["Books", "book", "Curate catalogue", `${products.length} titles available`],
                  ] as const).map(([target, icon, label, note]) => (
                    <Link key={target} href={viewPath(target)}><span className="plbh-admin-priority-icon"><Glyph name={icon} size={18} /></span><span><strong>{label}</strong><small>{note}</small></span><Glyph name="arrow" size={16} /></Link>
                  ))}
                </div>
              </section>
            </>
          )}
          {overview && (
            <>
              <section className="plbh-admin-panel">
                <div className="plbh-admin-panel-heading">
                  <div>
                    <h2>
                      From your catalogue{" "}
                      <span className="plbh-admin-count">{products.length}</span>
                    </h2>
                    <p>Real titles. Ready for the next reader.</p>
                  </div>
                  <button
                    className="plbh-admin-text-button"
                    onClick={() => navigate("Books")}
                  >
                    Browse catalogue <Glyph name="arrow" size={16} />
                  </button>
                </div>
                <div className="plbh-admin-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Availability</th>
                        <th>Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((book) => (
                        <tr key={book.id}>
                          <td>
                            <div className="plbh-admin-table-book">
                              <Image
                                src={book.image}
                                alt=""
                                width={32}
                                height={44}
                              />
                              <div>
                                <strong>{book.name}</strong>
                                <small>PLBH-{book.id}</small>
                              </div>
                            </div>
                          </td>
                          <td>{book.category}</td>
                          <td className="plbh-admin-amount">Rs. {money(book.price)}</td>
                          <td>
                            <span
                              className={`plbh-admin-badge ${book.inStock ? "delivered" : "cancelled"}`}
                            >
                              <i />
                              {book.inStock ? "In stock" : "Out of stock"}
                            </span>
                          </td>
                          <td>
                            <Link
                              className="plbh-admin-icon-button"
                              aria-label={`Preview ${book.name}`}
                              href={book.url}
                              target="_blank"
                            >
                              <Glyph name="external" size={16} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <div className="plbh-admin-bottom-grid">
                <section className="plbh-admin-panel">
                  <div className="plbh-admin-panel-heading">
                    <div>
                      <h2>Curated for every legal journey</h2>
                      <p>Your existing storefront collections.</p>
                    </div>
                  </div>
                  <div className="plbh-admin-collection-shortcuts">
                    {Object.entries(collections)
                      .slice(0, 3)
                      .map(([slug, collection]) => (
                        <Link
                          key={slug}
                          href={`/collections/${slug}`}
                          target="_blank"
                        >
                          <span>
                            <strong>{collection.title}</strong>
                            <small>
                              {
                                collection.ids.filter((id) =>
                                  products.some((b) => b.id === id),
                                ).length
                              }{" "}
                              catalogue titles
                            </small>
                          </span>
                          <Glyph name="arrow" size={17} />
                        </Link>
                      ))}
                  </div>
                </section>
                <section className="plbh-admin-editorial">
                  <span>THE NEXT CHAPTER</span>
                  <h2>
                    Knowledge opens doors.
                    <br />
                    You keep them open.
                  </h2>
                  <p>
                    Care for your collection.
                    <br />
                    Make room for the next generation of readers.
                  </p>
                  <button onClick={() => navigate("Books")}>
                    Explore your catalogue <Glyph name="arrow" size={17} />
                  </button>
                  <Glyph name="book" size={130} />
                </section>
              </div>
            </>
          )}
          {view === "Books" && (
            <section className="plbh-admin-panel">
              <div className="plbh-admin-panel-heading">
                <div>
                  <h2>
                    All books{" "}
                    <span className="plbh-admin-count">{filtered.length}</span>
                  </h2>
                  <p>
                    {data.live ? "Manage titles, pricing and availability in your live catalogue." : "Catalogue preview · connect the store to edit books."}
                  </p>
                </div>
                <button
                  className="plbh-admin-button plbh-admin-button-primary"
                  onClick={() => router.push("/admin/books/new")}
                >
                  <Glyph name="plus" size={15} /> Add book
                </button>
              </div>
              <div className="plbh-admin-filter-tabs" role="group" aria-label="Availability filter">
                {[
                  ["All availability", "All books", products.length],
                  ["In stock", "In stock", products.filter((b) => b.inStock).length],
                  ["Out of stock", "Out of stock", products.filter((b) => !b.inStock).length],
                ].map(([value, label, count]) => (
                  <button
                    key={value as string}
                    type="button"
                    className={availability === value ? "is-active" : ""}
                    aria-pressed={availability === value}
                    onClick={() => {
                      setAvailability(value as string);
                      setPage(1);
                    }}
                  >
                    {label} <span>{count}</span>
                  </button>
                ))}
              </div>
              <div className="plbh-admin-table-toolbar plbh-admin-catalogue-filters">
                <label className="plbh-admin-search">
                  <Glyph name="search" size={17} />
                  <input
                    ref={searchInput}
                    aria-label="Search catalogue"
                    placeholder="Search title, category or book ID… (Ctrl+K)"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </label>
                {selectedBooks.size > 0 && (
                  <div className="plbh-admin-bulk-actions">
                    <span>{selectedBooks.size} selected</span>
                    <button className="plbh-admin-button" onClick={clearSelection}>Clear</button>
                    <button className="plbh-admin-button" onClick={() => {
                      const selected = filtered.filter(b => selectedBooks.has(b.id));
                      const rows = [["ID", "Title", "Category", "Price PKR", "In stock"], ...selected.map((b) => [b.id, b.name, b.category, b.price, b.inStock])];
                      const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/^[=+@\t\r-]/, "'$&").replaceAll('"', '""')}"`).join(",")).join("\r\n");
                      const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "plbh-selected.csv";
                      link.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                      setNotice(`Export prepared: ${selected.length} selected records.`);
                    }}>Export selected</button>
                  </div>
                )}
                <select
                  aria-label="Category filter"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  <option>All categories</option>
                  {categoryCounts.map((c) => (
                    <option key={c.name}>{c.name}</option>
                  ))}
                </select>
                <select
                  aria-label="Availability filter"
                  value={availability}
                  onChange={(e) => {
                    setAvailability(e.target.value);
                    setPage(1);
                  }}
                >
                  {["All availability", "In stock", "Out of stock"].map(
                    (value) => (
                      <option key={value}>{value}</option>
                    ),
                  )}
                </select>
                <select
                  aria-label="Sort catalogue"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  {["Title A–Z", "Price low to high", "Price high to low"].map(
                    (value) => (
                      <option key={value}>{value}</option>
                    ),
                  )}
                </select>
              </div>
              <div className="plbh-admin-table-scroll">
                <table className="plbh-admin-book-table">
                  <caption className="plbh-admin-visually-hidden">
                    Catalogue titles with category, price and availability
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className="plbh-admin-check-cell">
                        <label className="plbh-admin-select-all plbh-admin-select-all-header">
                          <input
                            type="checkbox"
                            checked={visible.length > 0 && visible.every(book => selectedBooks.has(book.id))}
                            onChange={toggleAllSelection}
                            disabled={visible.length === 0}
                            aria-label="Select all books on this page"
                            title="Select all books on this page"
                          />
                        </label>
                      </th>
                      <th scope="col">Book</th>
                      <th scope="col">Category</th>
                      <th scope="col">Price</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((book) => (
                      <tr key={book.id} className={selectedBooks.has(book.id) ? "plbh-admin-selected" : ""}>
                        <td className="plbh-admin-check-cell">
                          <input
                            type="checkbox"
                            checked={selectedBooks.has(book.id)}
                            onChange={() => toggleBookSelection(book.id)}
                            aria-label={`Select ${book.name}`}
                          />
                        </td>
                        <td>
                          <div className="plbh-admin-table-book">
                            <Image src={book.image} alt="" width={44} height={60} />
                            <div>
                              <strong>{book.uuid ? <Link href={`/admin/books/${book.uuid}/edit`}>{book.name}</Link> : book.name}</strong>
                              <small>PLBH-{book.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>{book.category}</td>
                        <td className="plbh-admin-amount">Rs. {money(book.price)}</td>
                        <td>
                          <span className={`plbh-admin-badge ${book.inStock ? "delivered" : "cancelled"}`}>
                            <i />
                            {book.inStock ? "In stock" : "Out of stock"}
                          </span>
                        </td>
                        <td>
                          <div className="plbh-admin-row-actions">
                            {book.uuid && (
                              <>
                                <button
                                  className="plbh-admin-icon-button"
                                  onClick={() => router.push(`/admin/books/${book.uuid}/edit`)}
                                  aria-label={`Edit ${book.name}`}
                                  title="Edit book"
                                >
                                  <Glyph name="pencil" size={16} />
                                </button>
                                <button
                                  className="plbh-admin-icon-button"
                                  data-tone="danger"
                                  onClick={() => destroy("books", book.uuid!, book.name)}
                                  aria-label={`Delete ${book.name}`}
                                  title="Delete book"
                                >
                                  <Glyph name="trash" size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!filtered.length && (
                <div className="plbh-admin-empty">
                  <Glyph name="search" size={40} />
                  <h2>No matching books found</h2>
                  <p>Try adjusting your search terms or filters to find what you&apos;re looking for.</p>
                  <button
                    className="plbh-admin-button plbh-admin-button-primary"
                    onClick={() => {
                      setSearch("");
                      setCategory("All categories");
                      setAvailability("All availability");
                      setPage(1);
                    }}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
              <div className="plbh-admin-pagination">
                <span>
                  {filtered.length
                    ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} of ${filtered.length} books`
                    : "0 books"}
                </span>
                <div>
                  <button
                    className="plbh-admin-button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {pageCount}
                  </span>
                  <button
                    className="plbh-admin-button"
                    disabled={page >= pageCount}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          )}
          {view === "Categories" && (
            <>
              <section className="plbh-admin-panel">
                <div className="plbh-admin-toolbar-row">
                  <label className="plbh-admin-search">
                    <Glyph name="search" size={18} />
                    <input
                      aria-label="Search categories"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(event) => setCategorySearch(event.target.value)}
                    />
                  </label>
                  <button
                    className="plbh-admin-button plbh-admin-button-primary"
                    onClick={() => router.push("/admin/categories/new")}
                  >
                    <Glyph name="plus" size={17} /> Add Category
                  </button>
                </div>
                <div className="plbh-admin-category-grid">
                  {categoryCounts
                    .filter((c) => c.name.toLowerCase().includes(categorySearch.trim().toLowerCase()))
                    .map((c) => {
                      const record = data.categoryRows.find((row) => row.name === c.name);
                      const icon = categoryIconFor(c.name, record?.icon);
                      return (
                        <article className="plbh-admin-category-tile" data-icon={icon} key={record?.id || c.name}>
                          <div className="plbh-admin-category-card-top">
                            <span className="plbh-admin-category-icon"><Glyph name={icon} size={34} /></span>
                            <span className="plbh-admin-category-count">{c.count} {c.count === 1 ? "book" : "books"}</span>
                          </div>
                          <div className="plbh-admin-category-copy">
                            <span className="plbh-admin-category-eyebrow">BOOK SUBJECT</span>
                            <h3>{c.name}</h3>
                            <p>{String(record?.description || "Organise and discover the titles in this subject.")}</p>
                          </div>
                          <footer className="plbh-admin-category-card-footer">
                            <button className="plbh-admin-category-browse" onClick={() => browseCategory(c.name)}>Browse books <Glyph name="arrow" size={16} /></button>
                            {record && <div className="plbh-admin-tile-actions">
                              <button className="plbh-admin-icon-button" aria-label={`Edit ${c.name}`} title={`Edit ${c.name}`} onClick={() => router.push(`/admin/categories/${record.id}/edit`)}><Glyph name="pencil" size={17} /></button>
                              <button className="plbh-admin-icon-button" data-tone="danger" aria-label={`Delete ${c.name}`} disabled={c.count > 0} title={c.count > 0 ? "Move the books to another subject before deleting this category." : `Delete ${c.name}`} onClick={() => destroy("categories", record.id, c.name)}><Glyph name="trash" size={17} /></button>
                            </div>}
                          </footer>
                        </article>
                      );
                    })}
                </div>
              </section>
              <section className="plbh-admin-panel plbh-admin-space-top">
                <div className="plbh-admin-panel-heading">
                  <div>
                    <h2>Storefront collections</h2>
                    <p>
                      Curated groupings, separate from book subject categories.
                    </p>
                  </div>
                </div>
                <div className="plbh-admin-content-grid plbh-admin-collections-list">
                  {Object.entries(collections).map(([slug, c]) => (
                    <article key={slug}>
                      <h3>{c.title}</h3>
                      <p>{c.description}</p>
                      <span className="plbh-admin-badge delivered">
                        {
                          c.ids.filter((id) =>
                            products.some((b) => b.id === id),
                          ).length
                        }{" "}
                        linked titles
                      </span>
                      <Link
                        className="plbh-admin-text-button"
                        href={`/collections/${slug}`}
                        target="_blank"
                      >
                        View collection <Glyph name="external" size={14} />
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
          {(view === "Inventory" || view === "Media Library") && (
            <section className={`plbh-admin-panel ${view === "Inventory" ? "plbh-inventory-panel" : ""}`}>
              {view === "Inventory" && <div className="plbh-inventory-summary">
                {[
                  ["Catalogue titles", products.length, "book"],
                  ["Tracked units", products.reduce((total, book) => total + (book.stock ?? 0), 0), "box"],
                  ["Out of stock", products.filter((book) => !book.inStock).length, "alert"],
                  ["Stock untracked", products.filter((book) => book.stock === null).length, "file"],
                ].map(([label, count, icon]) => <div key={String(label)}><span><Glyph name={String(icon)} size={20} /></span><div><small>{label}</small><strong>{Number(count).toLocaleString()}</strong></div></div>)}
              </div>}
              <div className="plbh-admin-panel-heading">
                <div>
                  <h2>{view === "Inventory" ? "Stock overview" : "Published book covers"} <span className="plbh-admin-count">{filtered.length}</span></h2>
                  <p>{view === "Inventory"
                    ? "Monitor availability and adjust tracked stock. Use Edit book to start tracking an uncounted title."
                    : "Existing cover assets used by the storefront. Uploads and replacement require protected storage."}</p>
                </div>
              </div>
              <div className="plbh-admin-table-toolbar plbh-admin-catalogue-filters">
                <label className="plbh-admin-search"><Glyph name="search" size={17} /><input ref={searchInput} aria-label={`Search ${view === "Inventory" ? "inventory" : "media"}`} placeholder="Search title, category or book ID… (Ctrl+K)" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
                <select aria-label="Availability filter" value={availability} onChange={(event) => setAvailability(event.target.value)}>
                  {["All availability", "In stock", "Out of stock"].map((value) => <option key={value}>{value}</option>)}
                </select>
                <select aria-label="Sort catalogue" value={sort} onChange={(event) => setSort(event.target.value)}>
                  {["Title A–Z", "Price low to high", "Price high to low"].map((value) => <option key={value}>{value}</option>)}
                </select>
                {view === "Media Library" && (
                  <label className="plbh-admin-button plbh-admin-upload-button">
                    <Glyph name="plus" size={15} /> {mediaUploading ? "Uploading images…" : "Upload images"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={mediaUploading}
                      onChange={async (event) => {
                        const files = Array.from(event.target.files ?? []);
                        event.currentTarget.value = "";
                        if (!files.length) return;
                        if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) { setNotice("Choose JPG, PNG or WebP images up to 5 MB each."); return; }
                        setMediaUploading(true);
                        let saved = 0;
                        try {
                          for (const file of files) {
                          const url = await data.uploadImage(file);
                          const failure = await data.save("media_assets", { url, alt_text: file.name, kind: "gallery" });
                          if (failure) throw new Error(failure);
                          saved += 1;
                          }
                          setNotice(`${saved} images uploaded.`);
                        } catch (caught) {
                          setNotice(`${saved} of ${files.length} uploaded. ${caught instanceof Error ? caught.message : "Upload failed."}`);
                        } finally { setMediaUploading(false); }
                      }}
                    />
                  </label>
                )}
              </div>
              {view === "Inventory" ? (
                <div className="plbh-admin-table-scroll">
                  <table>
                    <caption className="plbh-admin-visually-hidden">Book availability, tracked stock and inventory adjustments</caption>
                    <thead><tr><th scope="col">Book</th><th scope="col">Availability</th><th scope="col">Unit count</th><th scope="col">Price</th><th scope="col">Record</th></tr></thead>
                    <tbody>{visible.map((book) => <tr key={book.id}>
                      <td><div className="plbh-admin-table-book"><Image src={book.image} alt="" width={32} height={44} /><div><strong>{book.name}</strong><small>PLBH-{book.id} · {book.category}</small></div></div></td>
                      <td><span className={`plbh-admin-badge ${book.inStock ? "delivered" : "cancelled"}`}>{book.inStock ? "In stock" : "Out of stock"}</span></td>
                      <td>{book.stock ?? "Not counted"}</td><td className="plbh-admin-amount">Rs. {money(book.price)}</td>
                      <td><div className="plbh-admin-row-actions">
                        {book.uuid && <><button className="plbh-admin-icon-button plbh-admin-stepper" disabled={Boolean(adjustingBook) || book.stock === null || book.stock === 0 || myRole === "viewer"} aria-label={`Remove one from ${book.name}`} title={book.stock === null ? "Set a stock count in Edit book first" : "Remove one"} onClick={() => void adjustInventory(book, -1)}>−</button>
                        <button className="plbh-admin-icon-button plbh-admin-stepper" disabled={Boolean(adjustingBook) || book.stock === null || myRole === "viewer"} aria-label={`Add one to ${book.name}`} title={book.stock === null ? "Set a stock count in Edit book first" : "Restock one"} onClick={() => void adjustInventory(book, 1)}>+</button>
                        <button className="plbh-admin-icon-button" aria-label={`Edit ${book.name}`} title="Edit book" onClick={() => router.push(`/admin/books/${book.uuid}/edit`)}><Glyph name="pencil" size={16} /></button>
                        </>}
                      </div></td>
                    </tr>)}</tbody>
                  </table>
                </div>
              ) : (
                <div className="plbh-admin-media-grid">{data.media.map((asset) => <article key={asset.id}>
                  <span className="plbh-admin-media-preview">
                    <Image src={String(asset.url)} alt={String(asset.alt_text || "")} width={140} height={190} unoptimized />
                    <a className="plbh-admin-media-action" href={String(asset.url)} target="_blank" rel="noreferrer" aria-label="Open original image" title="Open image"><Glyph name="external" size={16} /></a>
                    <button className="plbh-admin-media-action is-danger" type="button" onClick={() => destroy("media_assets", String(asset.id), "Asset")} aria-label="Remove image" title="Remove image"><Glyph name="trash" size={16} /></button>
                  </span>
                  <div><h3>{String(asset.alt_text || (asset.books as { title?: string } | null)?.title || "Untitled asset")}</h3><p>{String(asset.kind)}</p></div>
                </article>)}
                {!data.media.length && <div className="plbh-admin-empty"><Glyph name="book" size={36} /><h2>No assets yet</h2><p>Upload a cover or banner to start your library.</p></div>}</div>
              )}
              {!filtered.length && <div className="plbh-admin-empty"><Glyph name="search" size={40} /><h2>No matching {view === "Inventory" ? "inventory records" : "assets"} found</h2><p>Try adjusting your search terms or filters to find what you&apos;re looking for.</p><button className="plbh-admin-button plbh-admin-button-primary" onClick={() => updateFilters({ q: null, availability: null, category: null, page: null })}>Clear all filters</button></div>}
              <div className="plbh-admin-pagination">
                <span>{filtered.length ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} of ${filtered.length} records` : "0 records"}</span>
                <div><button className="plbh-admin-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pageCount}</span><button className="plbh-admin-button" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next</button></div>
              </div>
            </section>
          )}
          {view === "Book Reviews" && (
            <section className="plbh-admin-panel">
              <div className="plbh-admin-panel-heading">
                <div><h2>Reader reviews <span className="plbh-admin-count">{data.reviews.length}</span></h2><p>Review each reader note before it appears on a book page.</p></div>
                <span className="plbh-admin-badge pending">{data.reviews.filter((review) => review.status === "pending").length} awaiting review</span>
              </div>
              <div className="plbh-admin-table-scroll">
                <table className="plbh-admin-review-table"><thead><tr><th>Review</th><th>Book</th><th>Rating</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{data.reviews.map((review) => {
                    const nestedBook = review.books as { title?: string } | null;
                    return <tr key={review.id}>
                      <td><strong>{String(review.title)}</strong><small>{String(review.customer_name)}</small><p>{String(review.body)}</p></td>
                      <td>{String(nestedBook?.title || "Book")}</td>
                      <td className="plbh-admin-review-stars" aria-label={`${String(review.rating)} out of 5 stars`}>{"★".repeat(Number(review.rating))}{"☆".repeat(5 - Number(review.rating))}</td>
                      <td>{review.created_at ? new Date(String(review.created_at)).toLocaleDateString("en-PK") : "—"}</td>
                      <td><span className={`plbh-admin-badge ${review.status === "published" ? "delivered" : review.status === "rejected" ? "cancelled" : "pending"}`}>{String(review.status)}</span></td>
                      <td><div className="plbh-admin-review-actions">
                        {review.status !== "published" && <button className="plbh-admin-button plbh-admin-button-primary" onClick={() => void persist("book_reviews", { status: "published" }, review.id)}>Approve</button>}
                        {review.status !== "rejected" && <button className="plbh-admin-button" onClick={() => void persist("book_reviews", { status: "rejected" }, review.id)}>Reject</button>}
                        <button className="plbh-admin-icon-button" data-tone="danger" aria-label={`Delete review by ${String(review.customer_name)}`} onClick={() => destroy("book_reviews", review.id, "Review")}><Glyph name="trash" size={15} /></button>
                      </div></td>
                    </tr>;
                  })}
                  {!data.reviews.length && <tr><td colSpan={6}><div className="plbh-admin-empty"><Glyph name="star" size={34} /><h2>No reviews yet</h2><p>New reader reviews will appear here for moderation.</p></div></td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {view === "Website Content" && (
            <>
              {!data.loading && <SiteImagesEditor rows={data.banners} upload={data.uploadImage} save={data.save} />}
              <section className="plbh-admin-panel plbh-admin-content-overview">
                <div className="plbh-admin-panel-heading">
                  <div>
                    <h2>Storefront pages</h2>
                    <p>Edit page titles, summaries and published content, then preview the live route.</p>
                  </div>
                  <span className="plbh-admin-badge delivered">{data.pages.filter((page) => page.published !== false).length} published</span>
                </div>
                <div className="plbh-admin-content-grid plbh-admin-storefront-pages">
                  {contentPages.map(([title, path, description]) => {
                    const page = data.pages.find((entry) => entry.path === path);
                    const pageRow = page || {
                      id: "", slug: path.replace(/^\//, "").replaceAll("/", "-") || "home",
                      path, title, description, body: "", published: true,
                    };
                    return (
                      <article key={path}>
                        <span className="plbh-admin-page-mark"><Glyph name="file" size={19} /></span>
                        <div className="plbh-admin-page-copy">
                          <h3>{String(page?.title || title)}</h3>
                          <p>{String(page?.description || description)}</p>
                          <span className={`plbh-admin-content-status ${page?.published === false ? "is-draft" : "is-live"}`}>
                            <i /> {page?.published === false ? "Draft" : "Published"}
                          </span>
                        </div>
                        <div className="plbh-admin-content-actions">
                          {path !== "/" && <button className="plbh-admin-text-button" onClick={() => setEditing({ entity: "page", row: pageRow as RecordRow })}>
                            <Glyph name="pencil" size={14} /> Edit content
                          </button>}
                          <Link className="plbh-admin-text-button" href={path} target="_blank">
                            Preview <Glyph name="external" size={14} />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
              <section className="plbh-admin-panel plbh-admin-space-top">
                <div className="plbh-admin-panel-heading">
                  <div><h2>Homepage featured sections <span className="plbh-admin-count">{data.featuredSections.length}</span></h2><p>Control the heading, supporting copy and visibility of Featured Books and Bestsellers.</p></div>
                  <button className="plbh-admin-button plbh-admin-button-primary" onClick={() => setEditing({ entity: "feature-section" })}><Glyph name="plus" size={16} /> Add section</button>
                </div>
                <div className="plbh-admin-featured-sections">
                  {data.featuredSections.map((section) => (
                    <article key={section.id}>
                      <span className="plbh-admin-page-mark"><Glyph name="book" size={19} /></span>
                      <div><h3>{String(section.title)}</h3><p>{String(section.subtitle || "No supporting text")}</p><small>Key: {String(section.key)} · Order {String(section.sort_order ?? 0)}</small></div>
                      <span className={`plbh-admin-content-status ${section.active === false ? "is-draft" : "is-live"}`}><i /> {section.active === false ? "Hidden" : "Visible"}</span>
                      <div className="plbh-admin-content-actions">
                        <button className="plbh-admin-icon-button" aria-label={`Edit ${String(section.title)}`} onClick={() => setEditing({ entity: "feature-section", row: section })}><Glyph name="pencil" size={15} /></button>
                        <button className="plbh-admin-icon-button" data-tone="danger" aria-label={`Delete ${String(section.title)}`} onClick={() => destroy("featured_sections", section.id, String(section.title))}><Glyph name="trash" size={15} /></button>
                      </div>
                    </article>
                  ))}
                  {!data.featuredSections.length && <div className="plbh-admin-empty"><Glyph name="book" size={34} /><h2>No featured sections configured</h2><p>Add a homepage section to curate its heading and visibility.</p></div>}
                </div>
              </section>
            </>
          )}
          {view === "Analytics" && (
            <>
            <section className="plbh-admin-analytics-intro">
              <span className="plbh-admin-analytics-mark"><Glyph name="chart" size={20} /></span>
              <div><span className="plbh-admin-analytics-eyebrow">PERFORMANCE REPORT</span><h2>Know what readers are choosing.</h2><p>Explore order value, sales momentum and the titles moving through your store.</p></div>
              <div className="plbh-admin-analytics-summary"><span>Selected period</span><strong>{range === "all" ? "All time" : range === "year" ? "This year" : `Last ${range.replace("d", " days")}`}</strong><small>{rangeOrders.length} orders included</small></div>
            </section>
            <div className="plbh-admin-chart-grid plbh-admin-space-top">
              <section className="plbh-admin-panel">
                <div className="plbh-admin-panel-heading">
                  <div>
                    <h2>Order value over time</h2>
                    <p>Order value by month for the selected period</p>
                  </div>
                  <span className="plbh-admin-chart-unit"><Glyph name="wallet" size={14} /> Rs. {money(revenue)}</span>
                </div>
                {monthly.length ? (
                  <div className="plbh-admin-bars plbh-admin-revenue-bars">
                    {monthly.map((month) => {
                      const peak = Math.max(...monthly.map((entry) => entry.count));
                      return (
                        <div className="plbh-admin-bar-column" key={month.name} title={`${month.name}: Rs. ${money(month.count)}`}>
                          <span className="plbh-admin-bar-value">{month.count >= 1000 ? `${(month.count / 1000).toFixed(month.count >= 10000 ? 0 : 1)}k` : money(month.count)}</span>
                          <i style={{ height: `${Math.max(6, (month.count / peak) * 100)}%` }} />
                          <small>{month.name}</small>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="plbh-admin-empty"><Glyph name="chart" size={34} /><h2>No revenue yet</h2><p>Figures appear as soon as the first order is confirmed.</p></div>
                )}
              </section>
              <section className="plbh-admin-panel">
                <div className="plbh-admin-panel-heading">
                  <div>
                    <h2>Reader favourites</h2>
                    <p>Best-selling titles in the selected period</p>
                  </div>
                  <span className="plbh-admin-chart-unit"><Glyph name="book" size={14} /> TOP TITLES</span>
                </div>
                <div className="plbh-admin-composition">
                  {topTitles.length ? (
                    topTitles.map((entry, index) => (
                      <button key={entry.name} onClick={() => setSearch(entry.name)}>
                        <span>{entry.name}</span>
                        <span className="plbh-admin-bar-track">
                          <i style={{ width: `${(entry.count / topTitles[0].count) * 100}%`, background: index === 0 ? "#244735" : index === 1 ? "#b4975e" : "#92a08b" }} />
                        </span>
                        <strong>{entry.count}</strong>
                      </button>
                    ))
                  ) : (
                    <div className="plbh-admin-empty"><Glyph name="bag" size={34} /><h2>No sales recorded</h2><p>Order lines will rank your titles here.</p></div>
                  )}
                </div>
                <div className="plbh-admin-table-footer">
                  Source: order items<span>{data.orderItems.length} order lines</span>
                </div>
              </section>
            </div>
            <section className="plbh-admin-panel plbh-admin-order-health">
              <div className="plbh-admin-panel-heading"><div><h2>Order status</h2><p>Where orders currently stand in the selected period.</p></div><span className="plbh-admin-chart-unit">{rangeOrders.length} TOTAL</span></div>
              {statusSplit.length ? <div className="plbh-admin-status-grid">{statusSplit.map((entry) => <div className="plbh-admin-status-item" key={entry.name}><span className={`plbh-admin-status-dot status-${entry.name.toLowerCase().replace(/[^a-z]+/g, "-")}`} /><span className="plbh-admin-status-label">{entry.name.replaceAll("_", " ")}</span><span className="plbh-admin-status-track"><i style={{ width: `${(entry.count / Math.max(1, rangeOrders.length)) * 100}%` }} /></span><strong>{entry.count}</strong></div>)}</div> : <div className="plbh-admin-empty"><Glyph name="bag" size={34} /><h2>No order activity</h2><p>Order statuses will appear here when customers place orders.</p></div>}
            </section>
            </>
          )}
          {view === "Team & Access" && <TeamInvites role={myRole} />}
          {recordViews.includes(view) && (
            <RecordsPanel
              view={view}
              rows={
                view === "Orders"
                  ? data.orders
                  : view === "Customers"
                    ? data.customers
                    : view === "Promotions"
                      ? data.promotions
                      : view === "Website Content"
                        ? data.banners.filter((row) => !String(row.title).startsWith(SITE_IMAGE_PREFIX))
                        : view === "Team & Access"
                          ? data.team
                          : data.enquiries
              }
              loading={data.loading}
              title={view === "Team & Access" ? "Active studio members" : view}
              description={view === "Team & Access" ? "People with direct access to manage this workspace." : subtitles[view] || ""}
              onAdd={
                recordEntity[view] && view !== "Customers" && myRole !== "viewer" && (view !== "Team & Access" || myRole === "owner")
                  ? () => setEditing({ entity: recordEntity[view] })
                  : undefined
              }
              addLabel={
                view === "Website Content"
                  ? "Add banner"
                  : view === "Team & Access"
                    ? "Add member"
                    : "Add campaign"
              }
              onEdit={
                view === "Orders"
                  ? (row) => router.push(`/admin/orders/${row.id}`)
                  : recordEntity[view] && myRole !== "viewer" && (view !== "Team & Access" || myRole === "owner")
                    ? (row) => setEditing({ entity: recordEntity[view], row })
                    : undefined
              }
              onDelete={
                recordTable[view] && view !== "Orders" && myRole !== "viewer" && (view !== "Team & Access" || myRole === "owner")
                  ? (row) => destroy(recordTable[view], row.id, "Record")
                  : undefined
              }
              onStatus={
                view === "Orders"
                  ? (row, value) => persist("orders", { status: value }, row.id)
                  : view === "Book Enquiries"
                    ? (row, value) => persist("enquiries", { status: value }, row.id)
                    : view === "Customers"
                      ? (row, value) => persist("customers", { status: value }, row.id)
                      : undefined
              }
            />
          )}
          {view === "Settings" && (
            <section className="plbh-admin-panel plbh-admin-settings">
              <div className="plbh-admin-panel-heading">
                <div>
                  <h2>Website identity & store settings</h2>
                  <p>Manage your website name, logo, contact information and search listing.</p>
                </div>
                <button
                  className="plbh-admin-button plbh-admin-button-primary"
                  disabled={data.loading || (!data.live && data.failures.length === 0)}
                  aria-busy={data.loading}
                  title={!data.loading && !data.live && data.failures.length === 0 ? "Connect Supabase to edit and save store settings." : undefined}
                  onClick={() => setEditing({ entity: "settings", row: data.settings })}
                >
                  <Glyph name="settings" size={15} />
                  {data.loading
                    ? "Loading settings…"
                    : data.live || data.failures.length > 0
                      ? "Edit store settings"
                      : "Database unavailable"}
                </button>
              </div>
              <div className="plbh-admin-settings-grid">
                <div className="plbh-admin-settings-section">
                  <h3>Website logo</h3>
                  {data.settings?.logo_url ? <Image src={String(data.settings.logo_url)} alt="Current store logo" width={180} height={100} unoptimized style={{ objectFit: "contain" }} /> : <p>Your store name is displayed using the default brand design.</p>}
                  <p>Use your own logo across the storefront and admin workspace.</p>
                  <button type="button" className="plbh-admin-button" disabled={data.loading || !data.live} onClick={() => setEditing({ entity: "settings", row: data.settings })}>
                    <Glyph name="image" size={16} /> Change logo
                  </button>
                </div>
                <div className="plbh-admin-settings-section">
                  <h3>Store information</h3>
                  <dl className="plbh-admin-settings-list">
                    {[
                      ["Store name", String(data.settings?.store_name || "Punjab Law Book House")],
                      ["Tagline", String((data.settings?.social as Record<string, unknown>)?.tagline || "Knowledge builds a fairer Pakistan")],
                      ["SEO title", String(data.settings?.meta_title || "Uses website name")],
                      ["Store email", String(data.settings?.store_email || "Not set")],
                      ["Phone", String(data.settings?.phone || "Not set")],
                      ["WhatsApp", String(data.settings?.whatsapp || "Not set")],
                      ["Address", [data.settings?.address, data.settings?.city].filter(Boolean).join(", ") || "Not set"],
                      ["Currency", String(data.settings?.currency || "PKR")],
                      ["Flat shipping", `${String(data.settings?.currency || "PKR")} ${money(Number(data.settings?.shipping_flat_fee || 0))}`],
                      ["Free shipping from", data.settings?.free_shipping_over == null ? "Not set" : `${String(data.settings?.currency || "PKR")} ${money(Number(data.settings.free_shipping_over))}`],
                      ["Catalogue source", data.live ? `Supabase · ${products.length} titles` : `Repository JSON · ${products.length} titles`],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="plbh-admin-settings-section">
                  <h3>Integrations</h3>
                  <dl className="plbh-admin-settings-list">
                    <div>
                      <dt>Supabase</dt>
                      <dd>
                        {data.failures.length ? (
                          <span className="plbh-admin-status-badge plbh-admin-badge cancelled">
                            Attention needed · {data.failures.join(", ")}
                          </span>
                        ) : data.live ? (
                          <span className="plbh-admin-status-badge plbh-admin-status-live">
                            Connected · {products.length} titles readable
                          </span>
                        ) : (
                          <span className="plbh-admin-status-badge plbh-admin-status-pending">
                            Not configured · using the bundled catalogue
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Clerk authentication</dt>
                      <dd><span className="plbh-admin-status-badge plbh-admin-status-live">Connected · admin routes require a staff account</span></dd>
                    </div>
                    <div>
                      <dt>Payment gateway</dt>
                      <dd><span className="plbh-admin-status-badge plbh-admin-status-pending">Not configured · cash on delivery</span></dd>
                    </div>
                  </dl>
                </div>
                <div className="plbh-admin-settings-section">
                  <h3>Access & security</h3>
                  <dl className="plbh-admin-settings-list">
                    {[
                      ["Admin access", "Signed-in Clerk account with a row in admin_members"],
                      ["Team members", data.team.length ? `${data.team.length} ${data.team.length === 1 ? "member" : "members"} with admin access` : "No team members recorded"],
                      ["Row level security", "Enabled on every table; writes run as your Clerk user"],
                      ["Session management", "Handled by Clerk"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="plbh-admin-settings-section">
                  <h3>Operations</h3>
                  <dl className="plbh-admin-settings-list">
                    {[
                      ["Order processing", "Orders and stock are written by the place_order function"],
                      ["Payments", "Cash on delivery · no gateway connected"],
                      ["Enquiries", "Recorded to the enquiries table; WhatsApp remains the reply channel"],
                      ["Inventory tracking", "Live · movements recorded, stock updated by trigger"],
                      ["Media uploads", `Live · ${data.media.length} ${data.media.length === 1 ? "asset" : "assets"} in the media bucket`],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              <div className="plbh-admin-settings-note">
                <span className={`plbh-admin-note-icon ${data.failures.length ? "is-warning" : data.live ? "is-connected" : "is-demo"}`}>
                  <Glyph name={data.failures.length ? "alert" : data.live ? "check" : "settings"} size={17} />
                </span>
                <div>
                  <strong>
                    {data.failures.length
                      ? "Some database connections need attention"
                      : data.live
                        ? "Database and authentication are connected"
                        : "Showing the bundled catalogue"}
                  </strong>
                  <p>
                    {data.failures.length
                      ? `The following data could not be loaded: ${data.failures.join(", ")}. Check your database policies and connection, then reload this page.`
                      : data.live
                        ? "Clerk authenticates staff and Supabase applies row level security to admin data. Orders use cash on delivery; no online payment gateway is connected."
                        : "Supabase is not connected in this environment, so catalogue details come from the files shipped with the site. Configure the database to edit and persist store settings."}
                  </p>
                </div>
              </div>
            </section>
          )}
          <footer className="plbh-admin-footer">
            <span>© 2026 {String(data.settings?.store_name || "Punjab Law Book House")}</span>
            <span>
              Thoughtfully built for the business of knowledge.{" "}
              <span className="plbh-admin-footer-mark">✧</span>
            </span>
          </footer>
      {notice && (
        <div className="plbh-admin-toast" role="status">
          <span>✓</span>
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => {
              const toast = document.querySelector('.plbh-admin-toast');
              toast?.classList.add('fade-out');
              setTimeout(() => setNotice(""), 300);
            }}
          >
            ×
          </button>
        </div>
      )}
      {selectedBook && <ProductDetails book={selectedBook} onClose={() => setSelectedBook(null)} />}
      {editing && (
        <EntityForm
          entity={editing.entity}
          row={editing.row}
          categories={data.categoryRows}
          onClose={() => setEditing(null)}
          onSubmit={persist}
          onUpload={data.uploadImage}
        />
      )}
      {showShortcuts && (
        <dialog ref={shortcutsDialog} className="plbh-admin-shortcuts-dialog" onClick={(event) => {
          if (event.target === event.currentTarget) setShowShortcuts(false);
        }}>
          <div className="plbh-admin-shortcuts-inner">
            <div className="plbh-admin-panel-heading">
              <h2>Keyboard shortcuts</h2>
              <button className="plbh-admin-icon-button" aria-label="Close shortcuts" onClick={() => setShowShortcuts(false)}>×</button>
            </div>
            <div className="plbh-admin-shortcuts-list">
              {[
                ["Search catalogue", "Ctrl + K"],
                ["Show shortcuts", "Ctrl + /"],
                ["Close dialogs", "Escape"],
                ["Previous page", "← Left arrow"],
                ["Next page", "→ Right arrow"],
                ["Collapse sidebar", "Ctrl + B"],
              ].map(([action, shortcut]) => (
                <div key={action}>
                  <span>{action}</span>
                  <kbd>{shortcut}</kbd>
                </div>
              ))}
            </div>
          </div>
        </dialog>
      )}
    </AdminShell>
  );
}
