import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "./supabase";
import { CATALOGUE_TAG } from "./catalogue";
import { readStoreSettings, type StoreSettings } from "./store-settings";

export async function getSiteSettings(): Promise<StoreSettings> {
  "use cache";
  cacheTag(CATALOGUE_TAG);
  cacheLife("hours");
  if (!supabase) return readStoreSettings(null);
  const { data, error } = await supabase.from("store_settings").select("store_name,store_email,phone,whatsapp,address,city,country,logo_url,meta_title,meta_description,social,shipping_flat_fee,free_shipping_over").eq("id", true).maybeSingle();
  return readStoreSettings(error ? null : data);
}
