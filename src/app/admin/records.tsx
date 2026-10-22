"use client";

import { Glyph } from "./icons";
import type { RecordRow } from "./use-admin-data";

const money = (value: unknown) =>
  `Rs. ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(Number(value) || 0)}`;
const date = (value: unknown) =>
  value ? new Date(String(value)).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—";
const text = (value: unknown) => (value === null || value === undefined || value === "" ? "—" : String(value));

const tone: Record<string, string> = {
  pending: "", processing: "shipped", shipped: "shipped", delivered: "delivered",
  cancelled: "cancelled", refunded: "cancelled", active: "delivered", inactive: "",
  blocked: "cancelled", new: "", in_progress: "shipped", answered: "delivered", closed: "",
};

const badge = (value: unknown) => (
  <span className={`plbh-admin-badge ${tone[String(value)] ?? ""}`}>
    <i />
    {String(value).replaceAll("_", " ")}
  </span>
);

type Column = { label: string; cell: (row: RecordRow) => React.ReactNode; className?: string };

const schemas: Record<string, { columns: Column[]; empty: string; hint: string; statusField?: string; statusOptions?: string[] }> = {
  Orders: {
    columns: [
      { label: "Order", cell: (r) => <span className="plbh-admin-order-id">{text(r.order_number)}</span> },
      { label: "Customer", cell: (r) => <strong>{text(r.customer_name)}</strong> },
      { label: "Date", cell: (r) => date(r.placed_at) },
      { label: "Amount", cell: (r) => money(r.total), className: "plbh-admin-amount" },
      { label: "Payment", cell: (r) => text(r.payment_status).replaceAll("_", " ") },
      { label: "Status", cell: (r) => badge(r.status) },
    ],
    statusField: "status",
    statusOptions: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
    empty: "No orders yet",
    hint: "Orders placed through the storefront will appear here as soon as checkout writes to the database.",
  },
  Customers: {
    columns: [
      { label: "Customer", cell: (r) => <strong>{text(r.full_name)}</strong> },
      { label: "Email", cell: (r) => text(r.email) },
      { label: "Phone", cell: (r) => text(r.phone) },
      { label: "City", cell: (r) => text(r.city) },
      { label: "Joined", cell: (r) => date(r.created_at) },
      { label: "Status", cell: (r) => badge(r.status) },
    ],
    statusField: "status",
    statusOptions: ["active", "inactive", "blocked"],
    empty: "No customers yet",
    hint: "Customer records are created when a reader orders or registers on the storefront.",
  },
  "Book Enquiries": {
    columns: [
      { label: "Book", cell: (r) => <strong>{text(r.book_title)}</strong> },
      { label: "From", cell: (r) => text(r.customer_name) },
      { label: "Phone", cell: (r) => text(r.phone) },
      { label: "Received", cell: (r) => date(r.created_at) },
      { label: "Source", cell: (r) => text(r.source).replaceAll("_", " ") },
      { label: "Status", cell: (r) => badge(r.status) },
    ],
    statusField: "status",
    statusOptions: ["new", "in_progress", "answered", "closed"],
    empty: "No enquiries yet",
    hint: "Requests sent from the “Request a book” form land here once the form writes to Supabase.",
  },
  Promotions: {
    columns: [
      { label: "Code", cell: (r) => <span className="plbh-admin-order-id">{text(r.code)}</span> },
      { label: "Campaign", cell: (r) => <strong>{text(r.title)}</strong> },
      {
        label: "Discount",
        cell: (r) =>
          r.discount_type === "percentage"
            ? `${Number(r.discount_value)}%`
            : r.discount_type === "fixed"
              ? money(r.discount_value)
              : "Free shipping",
      },
      { label: "Starts", cell: (r) => date(r.starts_at) },
      { label: "Ends", cell: (r) => date(r.ends_at) },
      { label: "Status", cell: (r) => badge(r.active ? "active" : "inactive") },
    ],
    empty: "No campaigns yet",
    hint: "Create a discount code to run your first campaign.",
  },
};

schemas["Website Content"] = {
  columns: [
    { label: "Banner", cell: (r) => <strong>{text(r.title)}</strong> },
    { label: "Subtitle", cell: (r) => text(r.subtitle) },
    { label: "Placement", cell: (r) => text(r.placement).replaceAll("_", " ") },
    { label: "Order", cell: (r) => text(r.sort_order) },
    { label: "Status", cell: (r) => badge(r.active ? "active" : "inactive") },
  ],
  empty: "No banners yet",
  hint: "Add a homepage banner to control what readers see first.",
};

schemas["Team & Access"] = {
  columns: [
    { label: "Member", cell: (r) => <strong>{text(r.full_name)}</strong> },
    { label: "Email", cell: (r) => text(r.email) },
    { label: "Clerk ID", cell: (r) => <span className="plbh-admin-order-id">{text(r.clerk_user_id)}</span> },
    { label: "Added", cell: (r) => date(r.created_at) },
    { label: "Role", cell: (r) => badge(r.role) },
  ],
  empty: "No team members yet",
  hint: "Add a Clerk user ID to grant someone access to this workspace.",
};

export function RecordsPanel({
  view,
  rows,
  loading,
  title,
  description,
  onAdd,
  addLabel,
  onEdit,
  onDelete,
  onStatus,
}: {
  view: string;
  rows: RecordRow[];
  loading: boolean;
  title: string;
  description: string;
  onAdd?: () => void;
  addLabel?: string;
  onEdit?: (row: RecordRow) => void;
  onDelete?: (row: RecordRow) => void;
  onStatus?: (row: RecordRow, value: string) => void;
}) {
  const schema = schemas[view];
  if (!schema) return null;
  return (
    <section className="plbh-admin-panel">
      <div className="plbh-admin-panel-heading">
        <div>
          <h2>
            {title} <span className="plbh-admin-count">{rows.length}</span>
          </h2>
          <p>{description}</p>
        </div>
        {onAdd && (
          <button className="plbh-admin-button plbh-admin-button-primary" onClick={onAdd}>
            <Glyph name="plus" size={15} /> {addLabel || "Add"}
          </button>
        )}
      </div>
      {rows.length > 0 ? (
        <div className="plbh-admin-table-scroll">
          <table>
            <thead>
              <tr>
                {schema.columns.map((column) => (
                  <th key={column.label} scope="col">
                    {column.label}
                  </th>
                ))}
                {(onEdit || onDelete) && <th scope="col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {schema.columns.map((column) => (
                    <td key={column.label} className={column.className}>
                      {column.label === "Status" && onStatus && schema.statusOptions ? (
                        <select
                          aria-label="Change status"
                          value={String(row[schema.statusField || "status"] ?? "")}
                          onChange={(event) => onStatus(row, event.target.value)}
                        >
                          {schema.statusOptions.map((option) => (
                            <option key={option} value={option}>
                              {option.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      ) : (
                        column.cell(row)
                      )}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td>
                      <div className="plbh-admin-row-actions">
                        {onEdit && (
                          <button
                            className="plbh-admin-icon-button"
                            aria-label="Edit record"
                            title="Edit"
                            onClick={() => onEdit(row)}
                          >
                            <Glyph name="pencil" size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="plbh-admin-icon-button"
                            data-tone="danger"
                            aria-label="Delete record"
                            title="Delete"
                            onClick={() => onDelete(row)}
                          >
                            <Glyph name="trash" size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="plbh-admin-empty">
          <Glyph name="bag" size={38} />
          <h2>{loading ? "Loading records…" : schema.empty}</h2>
          <p>{loading ? "Reading from Supabase." : schema.hint}</p>
        </div>
      )}
      <div className="plbh-admin-table-footer">
        Source: Supabase<span>Live table · {rows.length} rows</span>
      </div>
    </section>
  );
}
