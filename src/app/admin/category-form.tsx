"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Glyph } from "./icons";
import { AdminShell } from "./shell";
import { useAdminData } from "./use-admin-data";

/** Add / edit a category. Follows the card, field and footer treatment of the
 *  approved Add New Book page; the Categories design has no form screen of its
 *  own, so the same language is carried over rather than invented. */

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/** Illustrations shipped with the Categories design, selectable as the icon. */
const artwork = [
  ["educational", "Educational"],
  ["fiction", "Fiction"],
  ["islamic", "Islamic"],
  ["children", "Children"],
  ["self-help", "Self Help"],
  ["academic", "Academic"],
  ["science", "Science"],
  ["history", "History"],
] as const;

export function CategoryForm({ categoryId }: { categoryId?: string }) {
  const router = useRouter();
  const data = useAdminData();
  const editing = Boolean(categoryId);
  const existing = categoryId
    ? (data.categoryRows.find((row) => row.id === categoryId) as Record<string, unknown> | undefined)
    : undefined;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (editing && existing && !loaded) {
    setLoaded(true);
    setName(String(existing.name ?? ""));
    setSlug(String(existing.slug ?? ""));
    setDescription(String(existing.description ?? ""));
    setSortOrder(existing.sort_order === undefined ? "" : String(existing.sort_order));
    setIcon(String(existing.icon ?? ""));
  }

  async function save() {
    setError("");
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSaving(true);
    const failure = await data.save(
      "categories",
      {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim(),
        sort_order: Number(sortOrder || 0),
        icon,
      },
      categoryId,
    );
    if (failure) {
      setSaving(false);
      setError(failure);
      return;
    }
    router.push("/admin/categories");
  }

  return (
    <AdminShell
      view="Categories"
      title={editing ? "Edit Category" : "Add New Category"}
      subtitle={
        editing
          ? "Update how this subject appears across the store."
          : "Create a subject to group your books under."
      }
      crumbs={[
        { label: "Categories", href: "/admin/categories" },
        { label: editing ? "Edit" : "Add New Category" },
      ]}
      banner="/images/admin/banner-categories.webp"
      orderBadge={data.orders.filter((order) => order.status === "pending").length}
      enquiryBadge={data.enquiries.filter((enquiry) => enquiry.status === "new").length}
    >
      <div className="plbh-admin-form-layout plbh-admin-form-layout-narrow">
        <section className="plbh-admin-panel plbh-admin-form-panel">
          <div className="plbh-admin-panel-heading">
            <div>
              <h2>Category details</h2>
              <p>Name this subject and choose how it is presented.</p>
            </div>
          </div>

          {error && (
            <p className="plbh-admin-form-error" role="alert">
              {error}
            </p>
          )}

          <div className="plbh-admin-form-row plbh-admin-form-row-wide">
            <div className="plbh-admin-field">
              <label className="plbh-admin-field-label" htmlFor="name">
                Category Name<em aria-hidden="true"> *</em>
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Criminal Law"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="plbh-admin-field">
              <label className="plbh-admin-field-label" htmlFor="slug">
                URL slug
              </label>
              <input
                id="slug"
                type="text"
                placeholder={slugify(name) || "criminal-law"}
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
              <small className="plbh-admin-field-hint">Left empty, this is generated from the name.</small>
            </div>
            <div className="plbh-admin-field">
              <label className="plbh-admin-field-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="What belongs in this category?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="plbh-admin-field">
              <label className="plbh-admin-field-label" htmlFor="sort_order">
                Sort order
              </label>
              <input
                id="sort_order"
                type="number"
                min="0"
                placeholder="0"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              />
              <small className="plbh-admin-field-hint">Lower numbers appear first on the storefront.</small>
            </div>
          </div>

          <fieldset className="plbh-admin-icon-picker">
            <legend className="plbh-admin-field-label">Card illustration</legend>
            <p className="plbh-admin-field-hint">
              These eight came with the approved Categories design. Pick the closest, or leave it unset
              for the plain gold mark.
            </p>
            <div>
              <label className={icon === "" ? "is-active" : ""}>
                <input type="radio" name="icon" value="" checked={icon === ""} onChange={() => setIcon("")} className="plbh-admin-visually-hidden" />
                <span className="plbh-admin-icon-none"><Glyph name="book" size={28} /></span>
                <small>None</small>
              </label>
              {artwork.map(([key, label]) => (
                <label key={key} className={icon === key ? "is-active" : ""}>
                  <input type="radio" name="icon" value={key} checked={icon === key} onChange={() => setIcon(key)} className="plbh-admin-visually-hidden" />
                  <Image src={`/images/admin/category-${key}.webp`} alt="" width={96} height={96} />
                  <small>{label}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="plbh-admin-form-actions">
            <button type="button" className="plbh-admin-button" onClick={() => router.push("/admin/categories")}>
              Cancel
            </button>
            <button type="button" className="plbh-admin-button plbh-admin-button-primary" onClick={save} disabled={saving}>
              <Glyph name="save" size={17} /> {saving ? "Saving..." : editing ? "Save Changes" : "Save Category"}
            </button>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
