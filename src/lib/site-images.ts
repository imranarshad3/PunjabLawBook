import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "./supabase";
import { CATALOGUE_TAG } from "./catalogue";
import { SITE_IMAGE_PREFIX, readImageDisplay, type ImageDisplay } from "./site-image-slots";

export async function getSiteImages(): Promise<Record<string, ImageDisplay>> {
  "use cache";
  cacheTag(CATALOGUE_TAG);
  cacheLife("hours");
  if (!supabase) return {};
  const { data, error } = await supabase.from("content_banners")
    .select("title, image_url, subtitle").like("title", `${SITE_IMAGE_PREFIX}%`)
    .eq("active", true).order("updated_at");
  if (error) return {};
  const images: Record<string, ImageDisplay> = {};
  for (const row of data || []) {
    const display = readImageDisplay(row);
    if (display) images[row.title.slice(SITE_IMAGE_PREFIX.length)] = display;
  }
  return images;
}
