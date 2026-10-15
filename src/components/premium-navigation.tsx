"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./ui";
const collections: {
  title: string;
  note: string;
  icon: IconName;
  href: string;
}[] = [
  {
    title: "All law books",
    note: "Discover your next reference",
    icon: "book",
    href: "/products",
  },
  {
    title: "Bare acts",
    note: "The foundations of legal practice",
    icon: "scale",
    href: "/collections/bare-acts",
  },
  {
    title: "For students",
    note: "Build your academic bookshelf",
    icon: "cap",
    href: "/collections/students",
  },
  {
    title: "Legal reference",
    note: "A collection to return to",
    icon: "file",
    href: "/collections/legal-reference",
  },
  {
    title: "Bestsellers",
    note: "Highlights from our bookshelf",
    icon: "check",
    href: "/collections/bestsellers",
  },
  {
    title: "Browse by subject",
    note: "Find your field of interest",
    icon: "building",
    href: "/collections",
  },
];
const support = [
  {
    title: "Contact us",
    note: "A personal conversation",
    icon: "chat" as const,
    href: "/contact",
  },
  {
    title: "Request a book",
    note: "Let us help you find it",
    icon: "book" as const,
    href: "/request-a-book",
  },
  {
    title: "Ordering & delivery",
    note: "Answers to your questions",
    icon: "truck" as const,
    href: "/help",
  },
  {
    title: "Your account",
    note: "Your personal bookshelf",
    icon: "user" as const,
    href: "/account",
  },
];
export function DesktopNavigation() {
  const [open, setOpen] = useState<"books" | "help" | null>(null);
  const root = useRef<HTMLElement>(null);
  const booksTrigger = useRef<HTMLButtonElement>(null);
  const helpTrigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  function focusLink(event: React.KeyboardEvent, position: "first" | "last") {
    const links =
      root.current?.querySelectorAll<HTMLAnchorElement>(".mega-menu a");
    if (links?.length) {
      event.preventDefault();
      links[position === "first" ? 0 : links.length - 1].focus();
    }
  }
  return (
    <nav
      ref={root}
      className="desktop-nav premium-nav"
      aria-label="Main navigation"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          (open === "books" ? booksTrigger : helpTrigger).current?.focus();
          setOpen(null);
        }
        if (event.key === "Home" && open) focusLink(event, "first");
        if (event.key === "End" && open) focusLink(event, "last");
      }}
    >
      <div className="nav-dropdown">
        <button
          ref={booksTrigger}
          className={`nav-trigger ${open === "books" ? "is-open" : ""}`}
          aria-expanded={open === "books"}
          aria-controls="bookshop-navigation"
          onClick={() => setOpen(open === "books" ? null : "books")}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen("books");
              requestAnimationFrame(() =>
                root.current
                  ?.querySelector<HTMLAnchorElement>("#bookshop-navigation a")
                  ?.focus(),
              );
            }
          }}
        >
          Bookshop{" "}
          <svg aria-hidden="true" viewBox="0 0 12 12">
            <path d="m3 4 3 3 3-3" />
          </svg>
        </button>
        {open === "books" && (
          <div className="mega-menu refreshed-mega" id="bookshop-navigation">
            <div className="mega-intro">
              <span className="eyebrow">The legal bookshelf</span>
              <h2>
                Knowledge for
                <br />
                <em>every chapter.</em>
              </h2>
              <p>
                From your first lecture to your next case. Find a book that
                moves you forward.
              </p>
              <Link href="/products" onClick={() => setOpen(null)}>
                Enter the bookshop <Icon name="arrow" />
              </Link>
              <span className="mega-seal">
                <Icon name="scale" /> PUNJAB LAW BOOK HOUSE
              </span>
            </div>
            <div className="mega-links">
              {collections.map((item) => (
                <Link
                  href={item.href}
                  key={item.title}
                  onClick={() => setOpen(null)}
                >
                  <span className="mega-icon">
                    <Icon name={item.icon} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.note}</small>
                  </span>
                  <Icon name="arrow" />
                </Link>
              ))}
            </div>
            <div className="mega-footer">
              <span>A specific title in mind? Let’s find it together.</span>
              <Link href="/request-a-book" onClick={() => setOpen(null)}>
                Request a book <Icon name="arrow" />
              </Link>
            </div>
          </div>
        )}
      </div>
      <Link
        href="/collections/exam-guides"
        aria-current={
          pathname === "/collections/exam-guides" ? "page" : undefined
        }
      >
        Exam Guides
      </Link>
      <Link
        href="/about"
        aria-current={pathname === "/about" ? "page" : undefined}
      >
        Our Story
      </Link>
      <div className="nav-dropdown">
        <button
          ref={helpTrigger}
          className={`nav-trigger ${open === "help" ? "is-open" : ""}`}
          aria-expanded={open === "help"}
          aria-controls="help-navigation"
          onClick={() => setOpen(open === "help" ? null : "help")}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen("help");
              requestAnimationFrame(() =>
                root.current
                  ?.querySelector<HTMLAnchorElement>("#help-navigation a")
                  ?.focus(),
              );
            }
          }}
        >
          Visit & Help{" "}
          <svg aria-hidden="true" viewBox="0 0 12 12">
            <path d="m3 4 3 3 3-3" />
          </svg>
        </button>
        {open === "help" && (
          <div className="mega-menu support-mega" id="help-navigation">
            <div className="mega-links">
              {support.map((item) => (
                <Link
                  href={item.href}
                  key={item.title}
                  onClick={() => setOpen(null)}
                >
                  <span className="mega-icon">
                    <Icon name={item.icon} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.note}</small>
                  </span>
                  <Icon name="arrow" />
                </Link>
              ))}
            </div>
            <div className="mega-footer">
              <Icon name="pin" />
              <span>1-Turner Road, behind High Court, Lahore</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
