"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { collections } from "@/data/collections";
import catalogue from "@/data/catalogue.json";
import { Glyph } from "./icons";
import { viewPath, type View } from "./navigation";
import { AdminShell, subtitles } from "./shell";
import { ProductDetails } from "./product-details";
import { useAdminData } from "./use-admin-data";
import { RecordsPanel } from "./records";
import { EntityForm, type EntityKey } from "./entity-form";
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
/* Category illustrations from the approved Categories design. Mapped by exact
   name only: this store's subjects are law categories, so most fall back to the
   neutral mark rather than borrowing an unrelated illustration. */
const categoryArt: Record<string, string> = Object.fromEntries(
  ["educational", "fiction", "islamic", "children", "self help", "academic", "science", "history"].map(
    (name) => [name, `/images/admin/category-${name.replace(" ", "-")}.webp`],
  ),
);
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
            <small>{c.name.split(" ")[0].slice(0, 7)}</small>
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
  const [editing, setEditing] = useState<{ entity: EntityKey; row?: RecordRow | null } | null>(null);
  const [orderDetail, setOrderDetail] = useState<RecordRow | null>(null);
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
  const liveOrders = data.orders.filter(
    (order) => !["cancelled", "refunded"].includes(String(order.status)),
  );
  const revenue = liveOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const lowStock = products.filter((book) => book.stockStatus === "low_stock" || book.stockStatus === "out_of_stock").length;
  const monthly = (() => {
    const buckets = new Map<string, number>();
    for (const order of liveOrders) {
      const when = new Date(String(order.placed_at));
      if (Number.isNaN(when.getTime())) continue;
      const key = when.toLocaleDateString("en-PK", { month: "short", year: "2-digit" });
      buckets.set(key, (buckets.get(key) || 0) + Number(order.total || 0));
    }
    return [...buckets.entries()].slice(-12).map(([name, count]) => ({ name, count }));
  })();
  const topTitles = (() => {
    const buckets = new Map<string, number>();
    for (const item of data.orderItems) {
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
    for (const order of data.orders) {
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
        .slice(0, 60)}-${Date.now().toString(36)}`;
    }
    const failure = await data.save(table, values, id);
    if (!failure) setNotice(id ? "Changes saved." : "Record created.");
    return failure;
  }
  async function destroy(table: string, id: string, label: string) {
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
                    : "Your Supabase books table returned no rows, so these pages show the catalogue shipped with the site. Changes you make here will not appear in the shop."}
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
              <span>Public catalogue snapshot</span>
            </div>
            <span className="plbh-admin-period">
              <Glyph name="calendar" size={15} /> Verified{" "}
              {catalogue.verifiedAt}
            </span>
          </div>
          {(overview || view === "Analytics") && (
            <>
              <div className="plbh-admin-metrics">
                {[
                  {
                    label: "Catalogue titles",
                    icon: "book",
                    value: String(products.length),
                    detail: `${categoryCounts.length} subjects · ${lowStock} need restocking`,
                  },
                  {
                    label: "Orders",
                    icon: "bag",
                    value: String(data.orders.length),
                    detail: `${data.orders.filter((order) => order.status === "pending").length} awaiting confirmation`,
                  },
                  {
                    label: "Customers",
                    icon: "users",
                    value: String(data.customers.length),
                    detail: `${data.enquiries.filter((enquiry) => enquiry.status === "new").length} new enquiries`,
                  },
                  {
                    label: "Revenue",
                    icon: "chart",
                    value: `Rs. ${money(revenue)}`,
                    detail: "Excludes cancelled and refunded orders",
                  },
                ].map((metric, index) => (
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
              <div className="plbh-admin-chart-grid">
                <CatalogueChart categories={categoryCounts} total={products.length} />
                <Composition onCategory={browseCategory} categories={categoryCounts} total={products.length} />
              </div>
              <section className="plbh-admin-panel plbh-admin-readiness">
                  <div className="plbh-admin-panel-heading">
                    <div>
                      <h2>A clear view of what’s next</h2>
                      <p>Your management workspace, step by step.</p>
                    </div>
                  </div>
                  <div className="plbh-admin-readiness-items">
                    {[
                      [
                        "✓",
                        "Catalogue connected",
                        "Reading the existing storefront source.",
                      ],
                      [
                        "1",
                        "Connect Supabase & Clerk",
                        "Shared data and verified admin identity.",
                      ],
                      [
                        "2",
                        "Enable protected publishing",
                        "Catalogue, website content and media.",
                      ],
                      [
                        "3",
                        "Bring your operations together",
                        "Enquiries, customer history and reports.",
                      ],
                    ].map(([step, title, text]) => (
                      <div key={step}>
                        <span
                          className={
                            step === "✓" ? "plbh-admin-ready-mark" : "plbh-admin-wait-mark"
                          }
                        >
                          {step}
                        </span>
                        <span>
                          <strong>{title}</strong>
                          <small>{text}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="plbh-admin-text-button"
                    onClick={() => navigate("Team & Access")}
                  >
                    View access requirements <Glyph name="arrow" size={16} />
                  </button>
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
                    Source catalogue · read only until protected publishing is
                    connected.
                  </p>
                </div>
                <button
                  className="plbh-admin-button plbh-admin-button-primary"
                  onClick={() => router.push("/admin/books/new")}
                >
                  <Glyph name="plus" size={15} /> Add book
                </button>
                {visible.length > 0 && (
                  <label className="plbh-admin-select-all">
                    <input
                      type="checkbox"
                      checked={visible.length > 0 && visible.every(b => selectedBooks.has(b.id))}
                      onChange={toggleAllSelection}
                      aria-label="Select all books on this page"
                    />
                    <span>Select all</span>
                  </label>
                )}
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
                        <span className="plbh-admin-visually-hidden">Select</span>
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
                            <Image src={book.image} alt="" width={36} height={50} />
                            <div>
                              <strong>{book.name}</strong>
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
                            <Link
                              className="plbh-admin-icon-button"
                              href={book.url}
                              target="_blank"
                              aria-label={`Preview ${book.name} on the storefront`}
                              title="Preview on storefront"
                            >
                              <Glyph name="external" size={15} />
                            </Link>
                            <button
                              className="plbh-admin-icon-button"
                              onClick={() => setSelectedBook(book)}
                              aria-label={`Inspect ${book.name}`}
                              title="View details"
                            >
                              <Glyph name="eye" size={16} />
                            </button>
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
                      const art = categoryArt[c.name.toLowerCase()];
                      return (
                        <div className="plbh-admin-category-tile" key={c.name}>
                          <button onClick={() => browseCategory(c.name)}>
                            <span className="plbh-admin-category-icon">
                              {art ? (
                                <Image src={art} alt="" width={256} height={256} />
                              ) : (
                                <Glyph name="book" size={46} />
                              )}
                            </span>
                            <strong>{c.name}</strong>
                            <span>{c.count} {c.count === 1 ? "book" : "books"}</span>
                          </button>
                          {record && (
                            <div className="plbh-admin-tile-actions">
                              <button
                                className="plbh-admin-icon-button"
                                aria-label={`Edit ${c.name}`}
                                onClick={() => router.push(`/admin/categories/${record.id}/edit`)}
                              >
                                <Glyph name="pencil" size={15} />
                              </button>
                              <button
                                className="plbh-admin-icon-button"
                                data-tone="danger"
                                aria-label={`Delete ${c.name}`}
                                onClick={() => destroy("categories", record.id, c.name)}
                              >
                                <Glyph name="trash" size={15} />
                              </button>
                            </div>
                          )}
                        </div>
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
                <div className="plbh-admin-content-grid">
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
            <section className="plbh-admin-panel">
              <div className="plbh-admin-panel-heading">
                <div>
                  <h2>{view === "Inventory" ? "Catalogue availability" : "Published book covers"} <span className="plbh-admin-count">{filtered.length}</span></h2>
                  <p>{view === "Inventory"
                    ? "Source availability flags only. Unit counts, low-stock thresholds and adjustment history are not recorded."
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
                    <Glyph name="plus" size={15} /> Upload image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await data.uploadImage(file);
                          const failure = await data.save("media_assets", { url, alt_text: file.name, kind: "gallery" });
                          setNotice(failure || "Image uploaded.");
                        } catch (caught) {
                          setNotice(caught instanceof Error ? caught.message : "Upload failed.");
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              {view === "Inventory" ? (
                <div className="plbh-admin-table-scroll">
                  <table>
                    <caption className="plbh-admin-visually-hidden">Published catalogue availability; physical unit counts are unknown</caption>
                    <thead><tr><th scope="col">Book</th><th scope="col">Availability</th><th scope="col">Unit count</th><th scope="col">Price</th><th scope="col">Record</th></tr></thead>
                    <tbody>{visible.map((book) => <tr key={book.id}>
                      <td><div className="plbh-admin-table-book"><Image src={book.image} alt="" width={32} height={44} /><div><strong>{book.name}</strong><small>PLBH-{book.id} · {book.category}</small></div></div></td>
                      <td><span className={`plbh-admin-badge ${book.inStock ? "delivered" : "cancelled"}`}>{book.inStock ? "In stock" : "Out of stock"}</span></td>
                      <td>{book.stock ?? "Not counted"}</td><td className="plbh-admin-amount">Rs. {money(book.price)}</td>
                      <td><div className="plbh-admin-row-actions">
                        {book.uuid && <><button className="plbh-admin-icon-button plbh-admin-stepper" aria-label={`Remove one from ${book.name}`} title="Remove one" onClick={() => data.adjustStock(book.uuid!, -1, "adjustment")}>−</button>
                        <button className="plbh-admin-icon-button plbh-admin-stepper" aria-label={`Add one to ${book.name}`} title="Restock one" onClick={() => data.adjustStock(book.uuid!, 1, "restock")}>+</button>
                        <button className="plbh-admin-icon-button" aria-label={`Edit ${book.name}`} title="Edit book" onClick={() => router.push(`/admin/books/${book.uuid}/edit`)}><Glyph name="pencil" size={16} /></button>
                        <button className="plbh-admin-icon-button" aria-label={`View ${book.name}`} title="View details" onClick={() => setSelectedBook(book)}><Glyph name="eye" size={16} /></button>
                        <button className="plbh-admin-icon-button" data-tone="danger" aria-label={`Delete ${book.name}`} title="Delete book" onClick={() => destroy("books", book.uuid!, book.name)}><Glyph name="trash" size={16} /></button></>}
                      </div></td>
                    </tr>)}</tbody>
                  </table>
                </div>
              ) : (
                <div className="plbh-admin-media-grid">{data.media.map((asset) => <article key={asset.id}>
                  <span className="plbh-admin-media-preview"><Image src={String(asset.url)} alt={String(asset.alt_text || "")} width={140} height={190} unoptimized /></span>
                  <div><h3>{String(asset.alt_text || (asset.books as { title?: string } | null)?.title || "Untitled asset")}</h3><p>{String(asset.kind)}</p>
                    <a className="plbh-admin-text-button" href={String(asset.url)} target="_blank" rel="noreferrer">Open original <Glyph name="external" size={14} /></a>
                    <button className="plbh-admin-text-button" onClick={() => destroy("media_assets", String(asset.id), "Asset")}>Remove <Glyph name="arrow" size={14} /></button>
                  </div>
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
          {view === "Website Content" && (
            <section className="plbh-admin-panel">
              <div className="plbh-admin-panel-heading">
                <div>
                  <h2>Storefront pages</h2>
                  <p>
                    Existing content is maintained in source files. CMS editing
                    and publishing await the database connection.
                  </p>
                </div>
              </div>
              <div className="plbh-admin-content-grid">
                {contentPages.map(([title, path, description]) => (
                  <article key={path}>
                    <span className="plbh-admin-eyebrow">STOREFRONT PAGE</span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <Link
                      className="plbh-admin-text-button"
                      href={path}
                      target="_blank"
                    >
                      Preview page <Glyph name="external" size={14} />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
          {view === "Analytics" && (
            <div className="plbh-admin-chart-grid plbh-admin-space-top">
              <section className="plbh-admin-panel">
                <div className="plbh-admin-panel-heading">
                  <div>
                    <h2>Revenue by month</h2>
                    <p>Confirmed orders only</p>
                  </div>
                  <span className="plbh-admin-chart-unit">Rs. {money(revenue)}</span>
                </div>
                {monthly.length ? (
                  <div className="plbh-admin-bars">
                    {monthly.map((month) => {
                      const peak = Math.max(...monthly.map((entry) => entry.count));
                      return (
                        <div className="plbh-admin-bar-column" key={month.name} title={`${month.name}: Rs. ${money(month.count)}`}>
                          <span className="plbh-admin-bar-value">{Math.round(month.count / 1000)}k</span>
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
                    <h2>Best sellers</h2>
                    <p>Units sold across all orders</p>
                  </div>
                  <span className="plbh-admin-chart-unit">{data.orderItems.length} LINES</span>
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
                  Source: order_items<span>{statusSplit.map((entry) => `${entry.count} ${entry.name}`).join(" · ") || "No orders"}</span>
                </div>
              </section>
            </div>
          )}
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
                        ? data.banners
                        : view === "Team & Access"
                          ? data.team
                          : data.enquiries
              }
              loading={data.loading}
              title={view}
              description={subtitles[view] || ""}
              onAdd={
                recordEntity[view] && view !== "Customers"
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
                  ? (row) => setOrderDetail(row)
                  : recordEntity[view]
                    ? (row) => setEditing({ entity: recordEntity[view], row })
                    : undefined
              }
              onDelete={
                recordTable[view]
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
                  <h2>Workspace & connections</h2>
                  <p>Current configuration of this project.</p>
                </div>
                <button
                  className="plbh-admin-button plbh-admin-button-primary"
                  onClick={() => setEditing({ entity: "settings", row: data.settings })}
                >
                  <Glyph name="settings" size={15} /> Edit store settings
                </button>
              </div>
              <div className="plbh-admin-settings-grid">
                <div className="plbh-admin-settings-section">
                  <h3>Store information</h3>
                  <dl className="plbh-admin-settings-list">
                    {[
                      ["Store name", String(data.settings?.store_name || "Punjab Law Book House")],
                      ["Store email", String(data.settings?.store_email || "Not set")],
                      ["Phone", String(data.settings?.phone || "Not set")],
                      ["Address", [data.settings?.address, data.settings?.city].filter(Boolean).join(", ") || "Not set"],
                      ["Currency", String(data.settings?.currency || "PKR")],
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
                            Connected · {data.failures.length} {data.failures.length === 1 ? "table" : "tables"} refused
                          </span>
                        ) : data.live ? (
                          <span className="plbh-admin-status-badge plbh-admin-status-live">
                            Connected · reading {products.length} titles under row level security
                          </span>
                        ) : (
                          <span className="plbh-admin-status-badge plbh-admin-status-pending">
                            Connected · no rows returned yet
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Clerk authentication</dt>
                      <dd><span className="plbh-admin-status-badge plbh-admin-status-live">Connected · admin routes require a staff account</span></dd>
                    </div>
                    <div>
                      <dt>Ordering</dt>
                      <dd><span className="plbh-admin-status-badge plbh-admin-status-live">Live · orders written through place_order</span></dd>
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
                      ["Ordering", "Live · orders and stock written by the place_order function"],
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
                <span className="plbh-admin-note-icon">{data.live ? "✓" : "⚙"}</span>
                <div>
                  <strong>{data.live ? "Database and authentication are linked" : "Waiting for the first rows"}</strong>
                  <p>
                    {data.live
                      ? "Clerk signs you in, Supabase sees that session, and row level security decides what you can read and write. Team roles, publishing, uploads, private records and shared settings are all active. The one thing still unconnected is a payment gateway — orders are taken as cash on delivery."
                      : "Clerk is signing you in and the tables are reachable, but no rows have come back yet, so these pages are showing the catalogue shipped with the site."}
                  </p>
                </div>
              </div>
            </section>
          )}
          <footer className="plbh-admin-footer">
            <span>© 2026 Punjab Law Book House</span>
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
      {orderDetail && (
        <dialog
          className="plbh-admin-detail-dialog"
          ref={(node) => node?.showModal()}
          onClose={() => setOrderDetail(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOrderDetail(null);
          }}
        >
          <div className="plbh-admin-entity-form">
            <div className="plbh-admin-panel-heading">
              <div>
                <h2>Order {String(orderDetail.order_number)}</h2>
                <p>
                  {String(orderDetail.customer_name)} · {String(orderDetail.status)} ·{" "}
                  {new Date(String(orderDetail.placed_at)).toLocaleString("en-PK")}
                </p>
              </div>
              <button className="plbh-admin-icon-button" aria-label="Close order" onClick={() => setOrderDetail(null)}>×</button>
            </div>
            <div className="plbh-admin-table-scroll">
              <table>
                <thead><tr><th>Title</th><th>Unit price</th><th>Qty</th><th>Line total</th></tr></thead>
                <tbody>
                  {data.orderItems.filter((item) => item.order_id === orderDetail.id).map((item) => (
                    <tr key={String(item.id)}>
                      <td><strong>{String(item.title)}</strong></td>
                      <td className="plbh-admin-amount">Rs. {money(Number(item.unit_price))}</td>
                      <td>{String(item.quantity)}</td>
                      <td className="plbh-admin-amount">Rs. {money(Number(item.line_total))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="plbh-admin-settings-list" style={{ padding: "0 1.5rem" }}>
              <div><dt>Deliver to</dt><dd>{[orderDetail.shipping_address, orderDetail.shipping_city].filter(Boolean).join(", ") || "Not provided"}</dd></div>
              <div><dt>Contact</dt><dd>{[orderDetail.customer_phone, orderDetail.customer_email].filter(Boolean).join(" · ") || "Not provided"}</dd></div>
              <div><dt>Payment</dt><dd>{String(orderDetail.payment_status)} · {String(orderDetail.payment_method || "cash on delivery")}</dd></div>
              <div><dt>Total</dt><dd>Rs. {money(Number(orderDetail.total))}</dd></div>
            </dl>
          </div>
        </dialog>
      )}
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
