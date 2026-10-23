"use client";
import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import { defaultStoreSettings, type StoreSettings } from "@/lib/store-settings";
const SettingsContext = createContext<StoreSettings>(defaultStoreSettings);
export function SiteSettingsProvider({ settings, children }: { settings: StoreSettings; children: ReactNode }) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}
export const useSiteSettings = () => useContext(SettingsContext);
export function StoreWhatsAppLink({ children, message, ...props }: Omit<ComponentProps<"a">, "href"> & { message?: string }) {
  const settings = useSiteSettings();
  return <a {...props} href={`https://wa.me/${settings.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`}>{children}</a>;
}
