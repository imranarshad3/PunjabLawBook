"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "./ui";

const collections: {
  title: string;
  note: string;
  icon: IconName;
  href: string;
}[] = [
  {
    title: "All Law Books",
    note: "Explore the complete collection",
    icon: "book",
    href: "/products",
  },
  {
    title: "Bare Acts",
    note: "The foundations of your practice",
    icon: "scale",
    href: "/collections/bare-acts",
  },
  {
    title: "LLB Books",
    note: "Resources for your academic journey",
    icon: "cap",
    href: "/collections/students",
  },
  {
    title: "Manuals & Commentaries",
    note: "Go deeper into legal knowledge",
    icon: "file",
    href: "/collections/legal-reference",
  },
];

export function DesktopNavigation() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <nav
      className="desktop-nav premium-nav"
      aria-label="Main navigation"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <div className="nav-dropdown">
        <button
          ref={trigger}
          className={`nav-trigger ${open ? "is-open" : ""}`}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="bookshop-navigation"
        >
          Bookshop{" "}
          <svg aria-hidden="true" viewBox="0 0 12 12">
            <path d="m3 4 3 3 3-3" />
          </svg>
        </button>
        {open && (
          <div className="mega-menu" id="bookshop-navigation">
            <div className="mega-intro">
              <span className="eyebrow">The legal bookshelf</span>
              <h2>
                Knowledge for
                <br />
                every chapter.
              </h2>
              <p>
                Find the resources for your studies, your practice and your
                ambitions.
              </p>
              <Link href="/collections" onClick={() => setOpen(false)}>
                Explore our categories <Icon name="arrow" />
              </Link>
            </div>
            <div className="mega-links">
              {collections.map((item) => (
                <Link
                  href={item.href}
                  key={item.title}
                  onClick={() => setOpen(false)}
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
              <span>Looking for a particular title?</span>
              <Link href="/request-a-book">
                Request a book <Icon name="arrow" />
              </Link>
            </div>
          </div>
        )}
      </div>
      <Link href="/collections/exam-guides">Exam Guides</Link>
      <Link href="/#bestsellers">Bestsellers</Link>
      <Link href="/about">Our Story</Link>
    </nav>
  );
}
