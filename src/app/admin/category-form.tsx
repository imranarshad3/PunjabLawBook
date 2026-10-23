"use client";

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

const categoryIcons = [
  ["book", "Books"],
  ["scale", "Scales of justice"],
  ["gavel", "Gavel"],
  ["landmark", "Courts"],
  ["shield", "Legal protection"],
  ["briefcase", "Practice"],
  ["graduation", "Study"],
  ["scroll", "Legal text"],
] as const;

export function CategoryForm({ categoryId }: { categoryId?: string }) {
  const router = useRouter();
  const data = useAdminData();
  const editing = Boolean(categoryId);
  const existing = categoryId
    ? (data.categoryRows.find((row) => row.id === categoryId) as Record<string, unknown> | undefined)
    : undefined;

  if (editing && data.loading) {
    return <AdminShell view="Categories" title="Loading category…" subtitle="Fetching category details."><p className="plbh-admin-empty">Loading category details…</p></AdminShell>;
  }
  if (editing && !data.loading && !existing) {
    return <AdminShell view="Categories" title="Category not found" subtitle="This category may have been removed or you may not have access."><div className="plbh-admin-form-actions"><button className="plbh-admin-button" onClick={() => router.push("/admin/categories")}>Back to categories</button></div></AdminShell>;
  }

  return <CategoryEditor
    key={categoryId ?? "new"}
    categoryId={categoryId}
    initialCategory={existing}
    saveRecord={data.save}
    orderBadge={data.orders.filter((order) => order.status === "pending").length}
    enquiryBadge={data.enquiries.filter((enquiry) => enquiry.status === "new").length}
  />;
}

function CategoryEditor({ categoryId, initialCategory, saveRecord, orderBadge, enquiryBadge }: {
  categoryId?: string;
  initialCategory?: Record<string, unknown>;
  saveRecord: (table: string, values: Record<string, unknown>, id?: string) => Promise<string>;
  orderBadge: number;
  enquiryBadge: number;
}) {
  const router = useRouter();
  const editing = Boolean(categoryId);
  const [name, setName] = useState(() => String(initialCategory?.name ?? ""));
  const [slug, setSlug] = useState(() => String(initialCategory?.slug ?? ""));
  const [description, setDescription] = useState(() => String(initialCategory?.description ?? ""));
  const [sortOrder, setSortOrder] = useState(() => initialCategory?.sort_order === undefined ? "" : String(initialCategory.sort_order));
  const [icon, setIcon] = useState(() => String(initialCategory?.icon ?? ""));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setError("");
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSaving(true);
    const failure = await saveRecord(
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
      orderBadge={orderBadge}
      enquiryBadge={enquiryBadge}
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
            <legend className="plbh-admin-field-label">Category icon</legend>
            <p className="plbh-admin-field-hint">Choose the symbol shown on this category tile.</p>
            <div>
              {categoryIcons.map(([key, label]) => (
                <label key={key} className={icon === key ? "is-active" : ""}>
                  <input type="radio" name="icon" value={key} checked={icon === key} onChange={() => setIcon(key)} className="plbh-admin-visually-hidden" />
                  <span className="plbh-admin-icon-none"><Glyph name={key} size={28} /></span>
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
