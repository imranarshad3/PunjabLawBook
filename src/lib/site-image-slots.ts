// Image overrides use existing content_banners rows under the site's admin RLS.
// title = SITE_IMAGE_PREFIX + original asset; subtitle = JSON display settings.
export const SITE_IMAGE_PREFIX = "site-image:";
export type ImageDisplay = { url: string; fit: "contain" | "cover"; position: string };
export const imageVariable = (src: string) => "--site" + src.replace(/[^a-zA-Z0-9-]/g, "-");
export const siteImageSlots = [
  "/images/bestseller-library.webp",
  "/images/bestsellers-new.webp",
  "/images/category-new-1.webp",
  "/images/category-new-2.webp",
  "/images/category-new-3.webp",
  "/images/category-new-4.webp",
  "/images/category-new-5.webp",
  "/images/exam-courthouse.webp",
  "/images/exam-library-edge.webp",
  "/images/exam-presentation.webp",
  "/images/footer-library.webp",
  "/images/hero-library.webp",
  "/images/knowledge.webp",
  "/images/library-detail.webp",
  "/images/need-exams.webp",
  "/images/need-institutions.webp",
  "/images/need-professionals.webp",
  "/images/need-students.webp",
  "/images/newsletter-library.webp",
  "/images/newsletter-right.webp",
  "/images/popular-banner.webp",
  "/images/reader-left.webp",
  "/images/reader-right.webp",
  "/images/why-new-left.webp"
] as const;
export function readImageDisplay(row: { image_url?: unknown; subtitle?: unknown }): ImageDisplay | null {
  if (typeof row.image_url !== "string" || !row.image_url) return null;
  let settings: { fit?: string; position?: string } = {};
  try { settings = JSON.parse(String(row.subtitle || "{}")); } catch { /* Original display defaults. */ }
  return { url: row.image_url, fit: settings?.fit === "cover" ? "cover" : "contain", position: ["center", "top", "bottom", "left", "right"].includes(settings?.position || "") ? settings.position! : "center" };
}
