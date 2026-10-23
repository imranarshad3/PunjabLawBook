export type StoreSettings = {
  name: string; email: string; phone: string; whatsapp: string; address: string;
  city: string; country: string; logo: string; tagline: string; announcement: string;
  description: string; metaTitle: string; metaDescription: string;
  facebook: string; instagram: string; messengerName: string;
};
export const defaultStoreSettings: StoreSettings = {
  name: "Punjab Law Book House", email: "civilcriminallawbook@gmail.com", phone: "+92 333 4222005",
  whatsapp: "923334222005", address: "1-Turner Road, Behind High Court", city: "Lahore", country: "Pakistan",
  logo: "", tagline: "Knowledge builds a fairer Pakistan", announcement: "Legal booksellers & publishers",
  description: "Legal books, guides and professional resources. Supporting study, practice and a deeper understanding of the law.",
  metaTitle: "", metaDescription: "Explore law books, bare acts, legal commentaries and judicial examination guides from Punjab Law Book House, Lahore.",
  facebook: "", instagram: "", messengerName: "KLR Law Publishers",
};
export function publicWebUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  if (value.startsWith("/") && !value.startsWith("//") && !/[\\\s]/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.href : ""; } catch { return ""; }
}
export function storeLogoUrl(value: unknown): string {
  const url = publicWebUrl(value);
  if (!url || url.startsWith("/")) return url;
  return new URL(url).hostname.endsWith(".supabase.co") ? url : "";
}
export function readStoreSettings(row: Record<string, unknown> | null): StoreSettings {
  if (!row) return defaultStoreSettings;
  const social = row.social && typeof row.social === "object" && !Array.isArray(row.social) ? row.social as Record<string, unknown> : {};
  const text = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value.trim() : fallback;
  const name = text(row.store_name, defaultStoreSettings.name);
  const city = text(row.city, defaultStoreSettings.city);
  let whatsapp = text(row.whatsapp, defaultStoreSettings.whatsapp).replace(/\D/g, "");
  if (whatsapp.startsWith("0")) whatsapp = `92${whatsapp.slice(1)}`;
  return {
    name, email: text(row.store_email, defaultStoreSettings.email),
    phone: text(row.phone, defaultStoreSettings.phone), whatsapp,
    address: text(row.address, defaultStoreSettings.address), city, country: text(row.country, defaultStoreSettings.country),
    logo: storeLogoUrl(row.logo_url), tagline: text(social.tagline, defaultStoreSettings.tagline), announcement: text(social.announcement, defaultStoreSettings.announcement),
    description: text(social.description, defaultStoreSettings.description), metaTitle: text(row.meta_title, ""), metaDescription: text(row.meta_description, `Explore law books, bare acts, legal commentaries and examination guides from ${name}, ${city}.`),
    facebook: publicWebUrl(social.facebook), instagram: publicWebUrl(social.instagram), messengerName: text(social.messenger_name, defaultStoreSettings.messengerName),
  };
}
