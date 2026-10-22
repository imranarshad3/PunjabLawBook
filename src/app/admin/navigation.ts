export const navigation = [
  ["Dashboard", "home", ""],
  ["Books", "book", "books"],
  ["Categories", "grid", "categories"],
  ["Orders", "cart", "orders"],
  ["Customers", "users", "customers"],
  ["Inventory", "box", "inventory"],
  ["Promotions", "tag", "promotions"],
  ["Website Content", "file", "content"],
  ["Analytics", "bars", "analytics"],
  ["Media Library", "image", "media"],
  ["Book Enquiries", "mail", "enquiries"],
  ["Team & Access", "users", "team"],
  ["Settings", "settings", "settings"],
] as const;

export type View = (typeof navigation)[number][0];
export function viewPath(view: View) {
  const slug = navigation.find(([name]) => name === view)![2];
  return slug ? `/admin/${slug}` : "/admin";
}
