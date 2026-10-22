"use client";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCatalogue } from "./catalogue-context";
import { titleFor, creditFor } from "./book-card";
import { Icon } from "./ui";

// Escape each literal word before building the matcher. Render React nodes,
// never HTML, so punctuation and markup-like queries remain harmless text.
function HighlightMatch({ text, query }: { text: string; query: string }) {
  const words = [...new Set(query.trim().split(/\s+/).filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );
  if (!words.length) return text;
  const escaped = words.map((word) =>
    word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "gi"));
  return parts.map((part, index) =>
    index % 2 === 1 ? <mark key={index}>{part}</mark> : part,
  );
}

export function NavbarSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const id = useId();
  const router = useRouter();
  const term = query.trim().toLowerCase();
  const { products } = useCatalogue();
  const matches = products.filter((book) =>
    `${book.name} ${titleFor(book)} ${creditFor(book)} ${book.category}`
      .toLowerCase()
      .includes(term),
  );
  const suggestions = (term ? matches : products).slice(0, 5);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!form.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);
  const close = () => {
    setOpen(false);
    setActive(-1);
  };
  return (
    <form
      ref={form}
      className="search-form premium-search"
      action="/products"
      role="search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onSubmit={(event) => {
        event.preventDefault();
        const chosen = open && active >= 0 ? suggestions[active] : undefined;
        router.push(
          chosen
            ? `/products/${chosen.id}`
            : `/products${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`,
        );
        close();
        input.current?.blur();
      }}
    >
      <label className="sr-only" htmlFor={`${id}-input`}>
        Search books, authors and subjects
      </label>
      <input
        ref={input}
        id={`${id}-input`}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-results`}
        aria-activedescendant={
          open && active >= 0 ? `${id}-option-${active}` : undefined
        }
        name="q"
        placeholder="Find your next book…"
        value={query}
        maxLength={100}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActive((index) => Math.min(index + 1, suggestions.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, -1));
          } else if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
        }}
      />
      <button type="submit" aria-label="Search books">
        <Icon name="search" />
      </button>
      {open && (
        <div className="search-suggestions">
          <div className="suggestions-heading">
            <span>
              {term ? "MATCHING YOUR SEARCH" : "A FEW GOOD PLACES TO START"}
            </span>
            {term && (
              <button
                type="button"
                className="search-clear"
                onClick={() => {
                  setQuery("");
                  setActive(-1);
                  input.current?.focus();
                }}
              >
                Clear
              </button>
            )}
          </div>
          <div
            role="listbox"
            id={`${id}-results`}
            aria-label="Book suggestions"
          >
            {suggestions.map((book, index) => (
              <Link
                role="option"
                aria-selected={active === index}
                id={`${id}-option-${index}`}
                className="search-suggestion"
                href={`/products/${book.id}`}
                key={book.id}
                onClick={close}
                onMouseEnter={() => setActive(index)}
              >
                <span className="suggestion-cover">
                  <Image src={book.image} alt="" width={36} height={49} />
                </span>
                <span className="suggestion-copy">
                  <strong>
                    <HighlightMatch text={titleFor(book)} query={query} />
                  </strong>
                  <small>
                    <HighlightMatch text={book.category} query={query} />{" "}
                    <span>·</span> Rs. {book.price.toLocaleString("en-PK")}
                  </small>
                  {term && creditFor(book).toLowerCase().includes(term) && (
                    <small className="suggestion-matched-credit">
                      <HighlightMatch text={creditFor(book)} query={query} />
                    </small>
                  )}
                  {term &&
                    ![titleFor(book), book.category, creditFor(book)].some(
                      (text) => text.toLowerCase().includes(term),
                    ) && (
                      <small className="suggestion-matched-credit">
                        <HighlightMatch text={book.name} query={query} />
                      </small>
                    )}
                </span>
                <Icon name="arrow" />
              </Link>
            ))}
          </div>
          {!suggestions.length && (
            <div className="search-no-results">
              <Icon name="book" />
              <strong>No books found for “{query}”</strong>
              <p>Try a title, author or subject.</p>
              <Link href="/request-a-book" onClick={close}>
                Ask us to find a book <Icon name="arrow" />
              </Link>
            </div>
          )}
          <div className="suggestions-footer">
            <Link
              href={`/products${term ? `?q=${encodeURIComponent(query.trim())}` : ""}`}
              onClick={close}
            >
              {term
                ? `View all ${matches.length} results`
                : "Explore the bookshop"}
              <Icon name="arrow" />
            </Link>
            <span>↑↓ to explore · Enter to open</span>
          </div>
          <span className="sr-only" aria-live="polite">
            {term
              ? `${matches.length} matching books`
              : `${suggestions.length} suggested books`}
          </span>
        </div>
      )}
    </form>
  );
}
