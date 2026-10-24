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
  const [editedTags, setTags] = useState<string[] | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [cover, setCover] = useState("");
  const [galleryAdds, setGalleryAdds] = useState<string[]>([]);
  const [removedGallery, setRemovedGallery] = useState<string[]>([]);
  const [activeBookId, setActiveBookId] = useState(bookId || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState(0);
  const set = (name: string, value: string) => setDraft((d) => ({ ...d, [name]: value }));
  const existingFields = existing?.details;
  const tags = editedTags ?? (Array.isArray(existingFields?.tags) ? existingFields.tags as string[] : []);
  const compareAt = Number(existingFields?.compare_at_price || 0);
  const existingDefaults: Record<string, string> = {
    title: existing?.name ?? "",
    author: String(existingFields?.author ?? ""),
    category_id: existing?.categoryId ?? "",
    isbn: String(existingFields?.isbn ?? ""),
    price: String(compareAt > (existing?.price ?? 0) ? compareAt : existing?.price ?? ""),
    sale_price: compareAt > (existing?.price ?? 0) ? String(existing?.price) : "",
    stock: String(existing?.stock ?? ""),
    status: existing?.status ?? "draft",
    publisher: String(existingFields?.publisher ?? ""),
    slug: String(existingFields?.slug ?? ""),
    description: String(existingFields?.description ?? ""),
    short_description: String(existingFields?.short_description ?? ""),
    meta_title: String(existingFields?.meta_title ?? ""),
    meta_description: String(existingFields?.meta_description ?? ""),
    language: String(existingFields?.language ?? "English"),
    publication_date: String(existingFields?.publication_date ?? ""),
    low_stock_threshold: String(existingFields?.low_stock_threshold ?? 5),
  };
  const value = (name: string) => draft[name] ?? existingDefaults[name] ?? "";
  const gallery = [
    ...data.bookImages.filter((image) => image.book_id === existing?.uuid && !removedGallery.includes(String(image.image_url))).map((image) => String(image.image_url)),
    ...galleryAdds,
  ];

  const addTag = () => {
    const next = tagDraft.trim();
    if (next && !tags.includes(next)) setTags([...tags, next]);
    setTagDraft("");
  };

  const upload = async (file: File, onDone: (url: string) => void) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(`${file.name} is larger than 5 MB.`);
      return;
    }
    setUploads((count) => count + 1);
    try {
      onDone(await data.uploadImage(file));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Upload failed.");
    } finally {
      setUploads((count) => count - 1);
    }
  };

  async function save() {
    if (saving || uploads) return;
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
    if (!Number.isFinite(list) || list < 0 || (sale !== null && (!Number.isFinite(sale) || sale < 0 || sale > list))) {
      setSaving(false);
      setError("Enter a valid price. The sale price cannot exceed the regular price.");
      return;
    }
    const payload: Record<string, unknown> = {
      title,
      slug: value("slug").trim() || slugify(title),
      author: value("author").trim(),
      isbn: value("isbn").trim(),
      language: value("language").trim() || "English",
      publisher: value("publisher").trim(),
      price: sale ?? list,
      compare_at_price: sale !== null ? list : null,
      stock: value("stock") === "" ? null : Number(value("stock")),
      low_stock_threshold: Number(value("low_stock_threshold") || 5),
      status: value("status") || "draft",
      description: value("description"),
      short_description: value("short_description").slice(0, 300),
      meta_title: value("meta_title"),
      meta_description: value("meta_description"),
      tags,
    };
    payload.category_id = value("category_id") || null;
    payload.publication_date = value("publication_date") || null;
    if (cover) payload.cover_url = cover;

    const saved = await data.saveWithId("books", payload, activeBookId || undefined);
    if (saved.error) {
      setSaving(false);
      setError(saved.error);
      return;
    }
    setActiveBookId(saved.id);
    const galleryError = await data.saveBookImages(saved.id, gallery.map((url) => ({ url })));
    if (galleryError) {
      setSaving(false);
      setError(`The book was saved, but its gallery could not be saved: ${galleryError}`);
      return;
    }
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
                    {(cover || existing?.image) ? (
                      <Image src={cover || existing?.image || ""} alt="" width={150} height={200} unoptimized />
                    ) : (
                      <Glyph name="cloud" size={38} />
                    )}
                    <strong>Upload book images</strong>
                    <small>First image is the cover; remaining images go into the gallery.</small>
                    <small>JPG, PNG or WebP (Max 5MB)</small>
                    <label className="plbh-admin-button plbh-admin-button-primary plbh-admin-upload-button">
                      {uploads ? "Uploading images…" : "Choose images"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={Boolean(uploads) || saving}
                        className="plbh-admin-visually-hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files ?? []);
                          e.currentTarget.value = "";
                          if (!files.length) return;
                          if (gallery.length + files.length - 1 > 20) { setError("Choose one cover and up to 20 gallery images."); return; }
                          setError("");
                          setUploads((count) => count + 1);
                          try {
                            for (const [index, file] of files.entries()) await upload(file, index === 0 ? setCover : (url) => setGalleryAdds((current) => [...current, url]));
                          } finally { setUploads((count) => count - 1); }
                        }}
                      />
                    </label>
                  </div>
                  {gallery.length > 0 && <small>{gallery.length} gallery images selected. Review them in the Images step.</small>}

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
              <div className="plbh-admin-gallery-editor">
                <div><strong>Book gallery</strong><p>Add extra views such as the back cover, contents and inside pages. Upload several images at once.</p></div>
                <div className="plbh-admin-gallery">
                  <label className="plbh-admin-gallery-add">
                    <Glyph name="cloud" size={22} /><small>Add images</small>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={Boolean(uploads) || saving} className="plbh-admin-visually-hidden" onChange={async (event) => {
                      const files = Array.from(event.target.files ?? []);
                      event.currentTarget.value = "";
                      if (gallery.length + files.length > 20) { setError("Choose up to 20 gallery images."); return; }
                      setError("");
                      setUploads((count) => count + 1);
                      try { for (const file of files) await upload(file, (url) => setGalleryAdds((current) => [...current, url])); }
                      finally { setUploads((count) => count - 1); }
                    }} />
                  </label>
                  {gallery.map((url, index) => <span key={`${url}-${index}`} className="plbh-admin-gallery-item">
                    <Image src={url} alt={`Book gallery image ${index + 1}`} width={96} height={96} unoptimized />
                    <button type="button" aria-label={`Remove gallery image ${index + 1}`} onClick={() => {
                      if (galleryAdds.includes(url)) setGalleryAdds((current) => current.filter((image) => image !== url));
                      else setRemovedGallery((current) => [...current, url]);
                    }}>×</button>
                  </span>)}
                </div>
              </div>
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
            <button type="button" className="plbh-admin-button plbh-admin-button-primary" onClick={save} disabled={saving || uploads > 0 || data.loading}>
              <Glyph name="save" size={17} /> {uploads ? "Uploading images…" : saving ? "Saving..." : editing ? "Save Changes" : "Save Book"}
            </button>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

export type { RecordRow };
