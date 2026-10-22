"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Product } from "@/data/products";
import { collections } from "@/data/collections";
import { Glyph } from "./icons";

export function ProductDetails({ book, onClose }: { book: Product; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { node?.close(); document.body.style.overflow = previous; };
  }, []);

  const bookCollections = Object.values(collections).filter((c) => c.ids.includes(book.id));

  return (
    <dialog ref={dialog} className="plbh-admin-detail-dialog" aria-labelledby="book-detail-title" onClose={onClose} onClick={(event) => {
      if (event.target === event.currentTarget) dialog.current?.close();
    }}>
      <div className="plbh-admin-detail-inner">
        <div className="plbh-admin-panel-heading">
          <div>
            <span className="plbh-admin-eyebrow">CATALOGUE RECORD · PLBH-{book.id}</span>
            <h2>Book details</h2>
          </div>
          <button autoFocus className="plbh-admin-icon-button" aria-label="Close book details" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <div className="plbh-admin-detail-body">
          <div className="plbh-admin-detail-cover">
            <div className="plbh-admin-cover-wrapper">
              <Image src={book.image} alt={book.name} width={240} height={330} />
            </div>
            <div className="plbh-admin-cover-actions">
              <a href={book.image} target="_blank" rel="noreferrer" className="plbh-admin-text-button">Open original <Glyph name="external" size={14} /></a>
              <Link href={book.url} target="_blank" className="plbh-admin-button plbh-admin-button-primary">View on store <Glyph name="external" size={15} /></Link>
            </div>
          </div>
          <div className="plbh-admin-detail-info">
            <h3 id="book-detail-title">{book.name}</h3>
            <p className="plbh-admin-detail-subtitle">{book.category}</p>

            <div className="plbh-admin-detail-pricing">
              <div className="plbh-admin-price-tag">
                <span className="plbh-admin-price">Rs. {new Intl.NumberFormat("en-PK").format(book.price)}</span>
                <span className={`plbh-admin-badge ${book.inStock ? "delivered" : "cancelled"}`}>
                  {book.inStock ? "In stock" : "Out of stock"}
                </span>
              </div>
            </div>

            <div className="plbh-admin-detail-section">
              <h4>Catalogue information</h4>
              <dl className="plbh-admin-settings-list">
                {[
                  ["Book ID", `PLBH-${book.id}`],
                  ["Category", book.category],
                  ["Availability", book.inStock ? "In stock" : "Out of stock"],
                  ["Stock quantity", "Not recorded in source data"],
                  ["ISBN / edition", "Not recorded in source data"],
                  ["Author / publisher", "Not recorded as structured fields"],
                ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
            </div>

            {bookCollections.length > 0 && (
              <div className="plbh-admin-detail-section">
                <h4>Featured in collections</h4>
                <div className="plbh-admin-collection-tags">
                  {bookCollections.map((c) => (
                    <Link key={c.title} href={`/collections/${Object.keys(collections).find(k => collections[k as keyof typeof collections] === c)}`} target="_blank" className="plbh-admin-collection-tag">
                      {c.title} <Glyph name="external" size={12} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="plbh-admin-detail-note">
              <span className="plbh-admin-note-icon">ℹ</span>
              <div>
                <strong>Read-only record</strong>
                <p>This is the published catalogue snapshot. Editing requires the authenticated database connection.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
