"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Glyph } from "./icons";
import { AdminShell } from "./shell";
import { useAdminData, type RecordRow } from "./use-admin-data";

/** Add / edit a book, laid out to Full_Resolution_Pages/01 (Add New Book):
 *  a numbered step rail on the left, the active section on the right. */

const steps = [
  ["Basic Information", "Book details and main information"],
  ["Pricing & Inventory", "Set price, stock and availability"],
  ["Description", "Write about the book"],
  ["Images", "Upload cover and gallery images"],
  ["SEO & Meta", "Search engine optimisation"],
] as const;

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

type Draft = Record<string, string>;

function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="plbh-admin-field">
      <label className="plbh-admin-field-label" htmlFor={id}>
        {label}
        {required && <em aria-hidden="true"> *</em>}
        {required && <span className="plbh-admin-visually-hidden"> (required)</span>}
      </label>
      {children}
      {hint && <small className="plbh-admin-field-hint">{hint}</small>}
    </div>
  );
}

export function BookForm({ bookId }: { bookId?: string }) {
  const router = useRouter();
  const data = useAdminData();
  const editing = Boolean(bookId);
  const existing = bookId ? data.books.find((book) => book.uuid === bookId) : undefined;

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({});
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [cover, setCover] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Seed the draft from the record once it arrives, then leave edits alone.
  if (editing && existing && !loaded) {
    setLoaded(true);
    const row = existing as unknown as Record<string, unknown>;
    setDraft({
      title: existing.name ?? "",
      author: String(row.author ?? ""),
      category_id: existing.categoryId ?? "",
      isbn: String(row.isbn ?? ""),
      price: String(existing.price ?? ""),
      stock: String(existing.stock ?? ""),
      status: existing.status ?? "draft",
    });
    setCover(existing.image ?? "");
  }

  const set = (name: string, value: string) => setDraft((d) => ({ ...d, [name]: value }));
  const value = (name: string) => draft[name] ?? "";

  const addTag = () => {
    const next = tagDraft.trim();
    if (next && !tags.includes(next)) setTags([...tags, next]);
    setTagDraft("");
  };

  const upload = async (file: File, onDone: (url: string) => void) => {
    try {
      onDone(await data.uploadImage(file));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Upload failed.");
    }
  };

  async function save() {
    setError("");
    const title = value("title").trim();
    if (!title) {
      setStep(0);
      setError("Book title is required.");
      return;
    }
    setSaving(true);
    // The design's "Sale Price" is what the customer pays, so it becomes the
    // live price and the original moves to compare_at_price to strike through.
    const list = Number(value("price") || 0);
    const sale = value("sale_price") === "" ? null : Number(value("sale_price"));
    const payload: Record<string, unknown> = {
      title,
      slug: value("slug").trim() || slugify(title),
      author: value("author").trim(),
      isbn: value("isbn").trim(),
      language: value("language").trim() || "English",
      publisher: value("publisher").trim(),
      price: sale ?? list,
      compare_at_price: sale ? list : 0,
      stock: Number(value("stock") || 0),
      low_stock_threshold: Number(value("low_stock_threshold") || 5),
      status: value("status") || "draft",
      description: value("description"),
      short_description: value("short_description").slice(0, 300),
      meta_title: value("meta_title"),
      meta_description: value("meta_description"),
      tags,
    };
    if (value("category_id")) payload.category_id = value("category_id");
    if (value("publication_date")) payload.publication_date = value("publication_date");
    if (cover) payload.cover_url = cover;

    const failure = await data.save("books", payload, bookId);
    if (failure) {
      setSaving(false);
      setError(failure);
      return;
    }
    // Gallery images are rows of their own; only new books need them attached.
    for (const url of gallery) await data.save("media_assets", { url, kind: "gallery" });
    router.push("/admin/books");
  }

  const counter = value("short_description").length;

  return (
    <AdminShell
      view="Books"
      title={editing ? "Edit Book" : "Add New Book"}
      subtitle={
        editing
          ? "Update the details of this title."
          : "Fill in the details to add a new title to your store."
      }
      crumbs={[{ label: "Books", href: "/admin/books" }, { label: editing ? "Edit" : "Add New Book" }]}
      banner="/images/admin/banner-add-book.webp"
      orderBadge={data.orders.filter((order) => order.status === "pending").length}
      enquiryBadge={data.enquiries.filter((enquiry) => enquiry.status === "new").length}
    >
      <div className="plbh-admin-form-layout">
        <aside className="plbh-admin-panel plbh-admin-steps" aria-label="Form sections">
          {steps.map(([name, detail], index) => (
            <button
              key={name}
              type="button"
              className={index === step ? "is-active" : ""}
              aria-current={index === step ? "step" : undefined}
              onClick={() => setStep(index)}
            >
              <span className="plbh-admin-step-number">{index + 1}</span>
              <span>
                <strong>{name}</strong>
                <small>{detail}</small>
              </span>
            </button>
          ))}
        </aside>

        <section className="plbh-admin-panel plbh-admin-form-panel">
          <div className="plbh-admin-panel-heading">
            <div>
              <h2>{steps[step][0]}</h2>
              <p>
                {step === 0
                  ? "Enter the essential details about the book."
                  : steps[step][1] + "."}
              </p>
            </div>
          </div>

          {error && (
            <p className="plbh-admin-form-error" role="alert">
              {error}
            </p>
          )}

          {step === 0 && (
            <>
              <div className="plbh-admin-form-split">
                <div className="plbh-admin-form-fields">
                  <Field id="title" label="Book Title" required>
                    <input id="title" type="text" placeholder="Enter book title" value={value("title")} onChange={(e) => set("title", e.target.value)} />
                  </Field>
                  <Field id="author" label="Author" required>
                    <input id="author" type="text" placeholder="Enter author name" value={value("author")} onChange={(e) => set("author", e.target.value)} />
                  </Field>
                  <Field id="category_id" label="Category" required>
                    <select id="category_id" value={value("category_id")} onChange={(e) => set("category_id", e.target.value)}>
                      <option value="">Select category</option>
                      {data.categoryRows.map((row) => (
                        <option key={row.id} value={row.id}>{row.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field id="isbn" label="ISBN">
                    <input id="isbn" type="text" placeholder="Enter ISBN (e.g. 978-0-123456-47-2)" value={value("isbn")} onChange={(e) => set("isbn", e.target.value)} />
                  </Field>
                  <Field id="tags" label="Tags" hint="Add relevant tags to help customers find this book">
                    <input
                      id="tags"
                      type="text"
                      placeholder="Enter tags and press Enter"
                      value={tagDraft}
                      onChange={(e) => setTagDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    {tags.length > 0 && (
                      <ul className="plbh-admin-tag-list">
                        {tags.map((tag) => (
                          <li key={tag}>
                            {tag}
                            <button type="button" aria-label={`Remove ${tag}`} onClick={() => setTags(tags.filter((t) => t !== tag))}>×</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Field>
                </div>

                <div className="plbh-admin-cover-panel">
                  <span className="plbh-admin-field-label">Book Cover Image <em aria-hidden="true">*</em></span>
                  <div className="plbh-admin-upload">
                    {cover ? (
                      <Image src={cover} alt="" width={150} height={200} unoptimized />
                    ) : (
                      <Glyph name="cloud" size={38} />
                    )}
                    <strong>Upload Book Cover</strong>
                    <small>Click to upload or drag and drop</small>
                    <small>JPG, PNG or WebP (Max 5MB)</small>
                    <label className="plbh-admin-button plbh-admin-button-primary plbh-admin-upload-button">
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        className="plbh-admin-visually-hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void upload(file, setCover);
                        }}
                      />
                    </label>
                  </div>

                  <span className="plbh-admin-field-label">Additional Images (Optional)</span>
                  <div className="plbh-admin-gallery">
                    <label className="plbh-admin-gallery-add">
                      <Glyph name="cloud" size={22} />
                      <small>Add Images</small>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="plbh-admin-visually-hidden"
                        onChange={(e) => {
                          for (const file of Array.from(e.target.files ?? [])) {
                            void upload(file, (url) => setGallery((g) => [...g, url]));
                          }
                        }}
                      />
                    </label>
                    {gallery.map((url) => (
                      <span key={url} className="plbh-admin-gallery-item">
                        <Image src={url} alt="" width={96} height={96} unoptimized />
                        <button type="button" aria-label="Remove image" onClick={() => setGallery(gallery.filter((g) => g !== url))}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="plbh-admin-form-row">
                <Field id="publication_date" label="Publication Date">
                  <input id="publication_date" type="date" value={value("publication_date")} onChange={(e) => set("publication_date", e.target.value)} />
                </Field>
                <Field id="price" label="Price (PKR)" required>
                  <input id="price" type="number" step="0.01" min="0" placeholder="0.00" value={value("price")} onChange={(e) => set("price", e.target.value)} />
                </Field>
                <Field id="sale_price" label="Sale Price (PKR)" hint="Leave empty if no discount">
                  <input id="sale_price" type="number" step="0.01" min="0" placeholder="0.00" value={value("sale_price")} onChange={(e) => set("sale_price", e.target.value)} />
                </Field>
              </div>
              <div className="plbh-admin-form-row plbh-admin-form-row-single">
                <Field id="stock" label="Stock Quantity" required>
                  <input id="stock" type="number" min="0" placeholder="0" value={value("stock")} onChange={(e) => set("stock", e.target.value)} />
                </Field>
              </div>
              <div className="plbh-admin-form-row plbh-admin-form-row-wide">
                <Field id="short_description" label="Short Description" required>
                  <textarea
                    id="short_description"
                    maxLength={300}
                    rows={4}
                    placeholder="Write a short description about the book..."
                    value={value("short_description")}
                    onChange={(e) => set("short_description", e.target.value)}
                  />
                  <span className="plbh-admin-counter">{counter}/300</span>
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <div className="plbh-admin-form-row">
              <Field id="price-2" label="Price (PKR)" required>
                <input id="price-2" type="number" step="0.01" min="0" value={value("price")} onChange={(e) => set("price", e.target.value)} />
              </Field>
              <Field id="sale_price-2" label="Sale Price (PKR)" hint="Leave empty if no discount">
                <input id="sale_price-2" type="number" step="0.01" min="0" value={value("sale_price")} onChange={(e) => set("sale_price", e.target.value)} />
              </Field>
              <Field id="stock-2" label="Stock Quantity" required>
                <input id="stock-2" type="number" min="0" value={value("stock")} onChange={(e) => set("stock", e.target.value)} />
              </Field>
              <Field id="low_stock_threshold" label="Low stock alert at">
                <input id="low_stock_threshold" type="number" min="0" placeholder="5" value={value("low_stock_threshold")} onChange={(e) => set("low_stock_threshold", e.target.value)} />
              </Field>
              <Field id="status" label="Availability">
                <select id="status" value={value("status") || "draft"} onChange={(e) => set("status", e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
              <Field id="publisher" label="Publisher">
                <input id="publisher" type="text" value={value("publisher")} onChange={(e) => set("publisher", e.target.value)} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="plbh-admin-form-row plbh-admin-form-row-wide">
              <Field id="description" label="Full description">
                <textarea id="description" rows={12} placeholder="Describe the book in full..." value={value("description")} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="plbh-admin-form-row plbh-admin-form-row-wide">
              <Field id="cover_url" label="Cover image URL" hint="Uploading on the first step fills this in for you.">
                <input id="cover_url" type="url" placeholder="https://..." value={cover} onChange={(e) => setCover(e.target.value)} />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="plbh-admin-form-row plbh-admin-form-row-wide">
              <Field id="slug" label="URL slug" hint="Left empty, this is generated from the title.">
                <input id="slug" type="text" placeholder={slugify(value("title")) || "book-title"} value={value("slug")} onChange={(e) => set("slug", e.target.value)} />
              </Field>
              <Field id="meta_title" label="Meta title">
                <input id="meta_title" type="text" value={value("meta_title")} onChange={(e) => set("meta_title", e.target.value)} />
              </Field>
              <Field id="meta_description" label="Meta description">
                <textarea id="meta_description" rows={3} value={value("meta_description")} onChange={(e) => set("meta_description", e.target.value)} />
              </Field>
            </div>
          )}

          <div className="plbh-admin-form-actions">
            <button type="button" className="plbh-admin-button" onClick={() => router.push("/admin/books")}>
              Cancel
            </button>
            <button type="button" className="plbh-admin-button plbh-admin-button-primary" onClick={save} disabled={saving}>
              <Glyph name="save" size={17} /> {saving ? "Saving..." : editing ? "Save Changes" : "Save Book"}
            </button>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

export type { RecordRow };
