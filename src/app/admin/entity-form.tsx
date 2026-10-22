"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { RecordRow } from "./use-admin-data";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "checkbox" | "date" | "email";
  options?: string[];
  required?: boolean;
  step?: string;
};

export type EntityKey =
  | "book" | "category" | "promotion" | "banner" | "page" | "member" | "customer" | "settings";

export const entities: Record<EntityKey, { table: string; label: string; fields: Field[] }> = {
  book: {
    table: "books",
    label: "book",
    fields: [
      { name: "title", label: "Book title", required: true },
      { name: "author", label: "Author" },
      { name: "category_id", label: "Category", type: "select" },
      { name: "price", label: "Price (PKR)", type: "number", step: "0.01", required: true },
      { name: "stock", label: "Stock on hand", type: "number" },
      { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] },
      { name: "isbn", label: "ISBN" },
      { name: "language", label: "Language" },
      { name: "publication_date", label: "Publication date", type: "date" },
      { name: "cover_url", label: "Cover image URL" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  category: {
    table: "categories",
    label: "category",
    fields: [
      { name: "name", label: "Category name", required: true },
      { name: "slug", label: "Slug", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  promotion: {
    table: "promotions",
    label: "campaign",
    fields: [
      { name: "code", label: "Code", required: true },
      { name: "title", label: "Campaign name", required: true },
      { name: "discount_type", label: "Discount type", type: "select", options: ["percentage", "fixed", "free_shipping"] },
      { name: "discount_value", label: "Discount value", type: "number", step: "0.01" },
      { name: "min_order_total", label: "Minimum order total", type: "number", step: "0.01" },
      { name: "starts_at", label: "Starts", type: "date" },
      { name: "ends_at", label: "Ends", type: "date" },
      { name: "active", label: "Active", type: "checkbox" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  banner: {
    table: "content_banners",
    label: "banner",
    fields: [
      { name: "title", label: "Banner title", required: true },
      { name: "subtitle", label: "Subtitle" },
      { name: "image_url", label: "Image URL" },
      { name: "link_url", label: "Link" },
      { name: "placement", label: "Placement", type: "select", options: ["homepage_hero", "homepage_strip", "category", "promo"] },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "active", label: "Active", type: "checkbox" },
    ],
  },
  page: {
    table: "content_pages",
    label: "page",
    fields: [
      { name: "title", label: "Page title", required: true },
      { name: "slug", label: "Slug", required: true },
      { name: "path", label: "Path", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  member: {
    table: "admin_members",
    label: "team member",
    fields: [
      { name: "clerk_user_id", label: "Clerk user ID", required: true },
      { name: "full_name", label: "Full name" },
      { name: "email", label: "Email", type: "email" },
      { name: "role", label: "Role", type: "select", options: ["owner", "admin", "editor", "viewer"] },
    ],
  },
  customer: {
    table: "customers",
    label: "customer",
    fields: [
      { name: "full_name", label: "Full name", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone" },
      { name: "city", label: "City" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: ["active", "inactive", "blocked"] },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  settings: {
    table: "store_settings",
    label: "store settings",
    fields: [
      { name: "store_name", label: "Store name", required: true },
      { name: "store_email", label: "Store email", type: "email" },
      { name: "phone", label: "Phone" },
      { name: "whatsapp", label: "WhatsApp" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "city", label: "City" },
      { name: "country", label: "Country" },
      { name: "currency", label: "Currency" },
      { name: "logo_url", label: "Logo URL" },
      { name: "shipping_flat_fee", label: "Flat shipping fee", type: "number", step: "0.01" },
      { name: "free_shipping_over", label: "Free shipping over", type: "number", step: "0.01" },
      { name: "meta_title", label: "SEO title" },
      { name: "meta_description", label: "SEO description", type: "textarea" },
    ],
  },
};

const imageFields = new Set(["cover_url", "image_url", "logo_url"]);

const asInput = (value: unknown, type?: string) => {
  if (value === null || value === undefined) return "";
  if (type === "date") return String(value).slice(0, 10);
  return String(value);
};

export function EntityForm({
  entity,
  row,
  categories,
  onClose,
  onSubmit,
  onUpload,
}: {
  entity: EntityKey;
  row?: RecordRow | null;
  categories?: { id: string; name: string }[];
  onClose: () => void;
  onSubmit: (table: string, values: Record<string, unknown>, id?: string) => Promise<string>;
  onUpload?: (file: File) => Promise<string>;
}) {
  const config = entities[entity];
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState("");

  async function handleUpload(field: string, file: File) {
    if (!onUpload) return;
    setUploading(field);
    setError("");
    try {
      const url = await onUpload(file);
      setUploads((current) => ({ ...current, [field]: url }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setUploading("");
    }
  }

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const values: Record<string, unknown> = {};
    for (const field of config.fields) {
      if (field.type === "checkbox") {
        values[field.name] = data.get(field.name) === "on";
        continue;
      }
      const raw = String(data.get(field.name) ?? "").trim();
      values[field.name] = raw === "" ? null : field.type === "number" ? Number(raw) : raw;
    }
    const failure = await onSubmit(config.table, values, row?.id as string | undefined);
    setBusy(false);
    if (failure) setError(failure);
    else onClose();
  }

  return (
    <dialog
      ref={dialog}
      className="plbh-admin-detail-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form className="plbh-admin-entity-form" onSubmit={handleSubmit}>
        <div className="plbh-admin-panel-heading">
          <div>
            <h2>
              {row ? "Edit" : "New"} {config.label}
            </h2>
            <p>Saved straight to Supabase under row level security.</p>
          </div>
          <button type="button" className="plbh-admin-icon-button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="plbh-admin-form-grid">
          {config.fields.map((field) => {
            const value = row?.[field.name];
            const options =
              field.name === "category_id"
                ? (categories || []).map((category) => ({ value: category.id, label: category.name }))
                : (field.options || []).map((option) => ({ value: option, label: option.replaceAll("_", " ") }));
            return (
              <label key={field.name} className={field.type === "textarea" ? "plbh-admin-form-wide" : ""}>
                <span>
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
                {field.type === "textarea" ? (
                  <textarea name={field.name} rows={3} defaultValue={asInput(value)} />
                ) : field.type === "select" ? (
                  <select name={field.name} defaultValue={asInput(value)} required={field.required}>
                    <option value="">Not set</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <input type="checkbox" name={field.name} defaultChecked={value !== false} />
                ) : (
                  <>
                    <input
                      key={uploads[field.name] || "initial"}
                      type={field.type || "text"}
                      name={field.name}
                      step={field.step}
                      required={field.required}
                      defaultValue={uploads[field.name] ?? asInput(value, field.type)}
                    />
                    {imageFields.has(field.name) && onUpload && (
                      <span className="plbh-admin-upload">
                        <input
                          type="file"
                          accept="image/*"
                          aria-label={`Upload ${field.label}`}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void handleUpload(field.name, file);
                          }}
                        />
                        {uploading === field.name && <small>Uploading…</small>}
                        {Boolean(uploads[field.name] || value) && (
                          <Image
                            src={uploads[field.name] || String(value)}
                            alt=""
                            width={44}
                            height={60}
                            unoptimized
                          />
                        )}
                      </span>
                    )}
                  </>
                )}
              </label>
            );
          })}
        </div>
        {error && <p className="plbh-admin-form-error">{error}</p>}
        <div className="plbh-admin-dialog-actions">
          <button type="button" className="plbh-admin-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="plbh-admin-button plbh-admin-button-primary" disabled={busy}>
            {busy ? "Saving…" : row ? "Save changes" : `Create ${config.label}`}
          </button>
        </div>
      </form>
    </dialog>
  );
}
