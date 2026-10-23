import { cacheLife, cacheTag } from "next/cache";
import { CATALOGUE_TAG } from "./catalogue";
import { supabase } from "./supabase";

export async function getContentPage(path: string) {
  "use cache";
  cacheTag(CATALOGUE_TAG);
  cacheLife("hours");
  if (!supabase) return null;
  const { data, error } = await supabase.from("content_pages")
    .select("title, description, body, updated_at").eq("path", path).eq("published", true).maybeSingle();
  return error ? null : data;
}

export async function getHomepageBanner() {
  "use cache";
  cacheTag(CATALOGUE_TAG);
  cacheLife("hours");
  if (!supabase) return null;
  const { data, error } = await supabase.from("content_banners")
    .select("title, subtitle, image_url, link_url").eq("placement", "homepage_hero")
    .eq("active", true).order("sort_order").limit(1).maybeSingle();
  return error ? null : data;
}
