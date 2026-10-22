"use client";

import { useState } from "react";
import Link from "next/link";
import { BookCard, titleFor } from "./book-card";
import { SortDropdown } from "./sort-dropdown";
import { Icon } from "./ui";
import { useCatalogue } from "./catalogue-context";

export function ProductCatalogue({
  initialQuery,
  initialCategory,
  collection,
}: {
  initialQuery: string;
  initialCategory: string;
  collection?: string;
}) {
  const { products, categories, collections } = useCatalogue();
  const collectionInfo = collection ? collections[collection] : undefined;
  const selectedProducts = collectionInfo
    ? products.filter((book) => collectionInfo.ids.includes(book.id))
    : products;
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(
    categories.includes(initialCategory) ? initialCategory : "All books",
  );
  const [price, setPrice] = useState(5000);
  const [sort, setSort] = useState("featured");
  const [stock, setStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = selectedProducts.filter(
    (book) =>
      (category === "All books" || book.category === category) &&
      book.price <= price &&
      (!stock || book.inStock) &&
      `${book.name} ${titleFor(book)} ${book.category}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  if (sort === "price-low") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-high") filtered.sort((a, b) => b.price - a.price);
  if (sort === "title")
    filtered.sort((a, b) => titleFor(a).localeCompare(titleFor(b)));
  const reset = () => {
    setQuery("");
    setCategory("All books");
    setPrice(5000);
    setStock(false);
  };
  return (
    <main id="main" className="products-page">
      <section className="shop-hero">
        <div className="container">
          <nav className="shop-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Bookshop</span>
          </nav>
          <p className="shop-kicker">THE PUNJAB LAW BOOK HOUSE COLLECTION</p>
          <h1>
            {collectionInfo ? (
              <>
                {collectionInfo.title}
                <br />
                <em>A considered collection.</em>
              </>
            ) : (
              <>
                For every chapter
                <br />
                of your <em>legal journey.</em>
              </>
            )}
          </h1>
          <p>
            Essential references. Fresh perspectives. Your next milestone.
            <br />
            Discover books for the law you study and the law you practise.
          </p>
          <div className="shop-hero-note">
            <Icon name="book" /> A considered collection for curious legal minds
          </div>
        </div>
      </section>
      <div className="shop-service-strip">
        <div className="container">
          <span>
            <Icon name="book" /> Specialist legal books
          </span>
          <span>
            <Icon name="truck" /> Delivery across Pakistan
          </span>
          <span>
            <Icon name="chat" /> Personal book assistance
          </span>
        </div>
      </div>
      <section
        className="container shop-collection"
        aria-label="Book collection"
      >
        <div className="shop-heading">
          <div>
            <p className="shop-kicker">BUILD YOUR LEGAL LIBRARY</p>
            <h2>
              {collectionInfo?.title ?? "The Bookshop"}
              <span>.</span>
            </h2>
          </div>
          <p>
            {collectionInfo?.description ??
              "Good counsel begins with a good book."}
          </p>
        </div>
        <div className="shop-layout">
          <button
            className="shop-filter-toggle button button-outline"
            aria-expanded={filtersOpen}
            aria-controls="shop-filters"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Refine your collection{" "}
            <Icon name={filtersOpen ? "minus" : "plus"} />
          </button>
          <aside
            id="shop-filters"
            className={`shop-filters ${filtersOpen ? "is-open" : ""}`}
          >
            <div className="filter-heading">
              <h3>Find your book</h3>
              <button onClick={reset}>Reset all</button>
            </div>
            <p className="filter-intro">A collection shaped around you.</p>
            <fieldset>
              <legend>Subject & collection</legend>
              {["All books", ...categories].map((item) => (
                <label className="subject-option" key={item}>
                  <input
                    type="radio"
                    name="category"
                    checked={category === item}
                    onChange={() => setCategory(item)}
                  />
                  <span>{item}</span>
                  <small>
                    {item === "All books"
                      ? selectedProducts.length
                      : selectedProducts.filter(
                          (book) => book.category === item,
                        ).length}
                  </small>
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Price range</legend>
              <label htmlFor="price-range">
                Up to Rs. {price.toLocaleString("en-PK")}
              </label>
              <input
                id="price-range"
                type="range"
                min="250"
                max="5000"
                step="50"
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
              />
              <div className="range-labels">
                <span>Rs. 250</span>
                <span>Rs. 5,000</span>
              </div>
              <div className="price-presets">
                {[1000, 2500, 5000].map((budget) => (
                  <button
                    key={budget}
                    type="button"
                    aria-pressed={price === budget}
                    onClick={() => setPrice(budget)}
                  >
                    {budget === 5000
                      ? "Any price"
                      : `≤ ${budget.toLocaleString("en-PK")}`}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Availability</legend>
              <label className="subject-option">
                <input
                  type="checkbox"
                  checked={stock}
                  onChange={(event) => setStock(event.target.checked)}
                />
                In-stock books only
              </label>
            </fieldset>
            <div className="book-concierge">
              <Icon name="chat" />
              <h3>
                A particular book
                <br />
                in mind?
              </h3>
              <p>
                Let us help you find the right reference for your bookshelf.
              </p>
              <a href="https://wa.me/923080060188">
                Ask our team <Icon name="arrow" />
              </a>
            </div>
          </aside>
          <div className="shop-results">
            <div className="catalogue-search">
              <Icon name="search" />
              <input
                aria-label="Search this collection"
                placeholder="Search by title, author or subject…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear search">
                  ×
                </button>
              )}
            </div>
            <div className="shop-toolbar">
              <p aria-live="polite">
                Showing <strong>{filtered.length}</strong> of{" "}
                {selectedProducts.length} books
              </p>
              <SortDropdown value={sort} onChange={setSort} />
            </div>
            {category !== "All books" && (
              <button
                className="active-filter"
                onClick={() => setCategory("All books")}
              >
                {category} <span aria-label="Remove category filter">×</span>
              </button>
            )}
            <div className="applied-filters">
              {price < 5000 && (
                <button
                  className="active-filter"
                  onClick={() => setPrice(5000)}
                >
                  Up to Rs. {price.toLocaleString("en-PK")} <span>×</span>
                </button>
              )}
              {query && (
                <button className="active-filter" onClick={() => setQuery("")}>
                  Search: {query} <span>×</span>
                </button>
              )}
              {stock && (
                <button
                  className="active-filter"
                  onClick={() => setStock(false)}
                >
                  In stock <span>×</span>
                </button>
              )}
            </div>
            <div className="shop-product-grid">
              {filtered.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  photograph={`/images/premium-${book.id}.webp`}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="shop-empty">
                <Icon name="book" />
                <h3>A new search, a new chapter.</h3>
                <p>
                  No books match these filters. Try another title or broaden
                  your selection.
                </p>
                <button className="button button-green" onClick={reset}>
                  Clear all filters
                </button>
              </div>
            )}
            <p className="shop-catalogue-note">
              A selection from our catalogue. Online ordering will open in the
              next milestone.
            </p>
          </div>
        </div>
      </section>
      <section className="shop-assistance container">
        <div>
          <p className="shop-kicker">A LIBRARY AS AMBITIOUS AS YOU ARE</p>
          <h2>Building a collection for your institution?</h2>
          <p>
            Talk to us about books for your chambers, university or legal
            library.
          </p>
        </div>
        <a className="button button-gold" href="https://wa.me/923080060188">
          Let’s talk books <Icon name="arrow" />
        </a>
      </section>
    </main>
  );
}
