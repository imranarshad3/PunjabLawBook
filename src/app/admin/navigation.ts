export const navigation = [
  ["Dashboard", "grid", ""],
  ["Books", "book", "books"],
  ["Categories", "grid", "categories"],
  ["Orders", "bag", "orders"],
  ["Customers", "users", "customers"],
  ["Inventory", "bag", "inventory"],
  ["Promotions", "wallet", "promotions"],
  ["Website Content", "book", "content"],
  ["Analytics", "chart", "analytics"],
  ["Media Library", "book", "media"],
  ["Book Enquiries", "bag", "enquiries"],
  ["Team & Access", "users", "team"],
  ["Settings", "settings", "settings"],
] as const;

export type View = (typeof navigation)[number][0];
export function viewPath(view: View) {
  const slug = navigation.find(([name]) => name === view)![2];
  return slug ? `/admin/${slug}` : "/admin";
}
