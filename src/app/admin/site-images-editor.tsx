"use client";

import Image from "next/image";
import { useState } from "react";
import { SITE_IMAGE_PREFIX, siteImageSlots, readImageDisplay } from "@/lib/site-image-slots";
import type { RecordRow } from "./use-admin-data";

export function SiteImagesEditor({ rows, upload, save }: {
  rows: RecordRow[];
  upload: (file: File) => Promise<string>;
  save: (table: string, values: Record<string, unknown>, id?: string) => Promise<string>;
}) {
  const [selected, setSelected] = useState<string>("/images/hero-library.webp");
  return <section className="plbh-admin-panel plbh-admin-content-overview">
    <div className="plbh-admin-panel-heading"><div><h2>Website images</h2><p>Replace page artwork and shared backgrounds. Book covers and galleries can be changed in Books.</p></div></div>
    <label>Choose image placement <select value={selected} onChange={(event) => setSelected(event.target.value)}>
      {siteImageSlots.map((src) => <option key={src} value={src}>{src.replace("/images/", "").replace(".webp", "").replaceAll("-", " ")}</option>)}
    </select></label>
    <ImageEditor key={selected} original={selected}
      row={rows.findLast((row) => row.title === SITE_IMAGE_PREFIX + selected)} upload={upload} save={save} />
  </section>;
}
function ImageEditor({ original, row, upload, save }: {
  original: string; row?: RecordRow;
  upload: (file: File) => Promise<string>;
  save: (table: string, values: Record<string, unknown>, id?: string) => Promise<string>;
}) {
  const existing = row?.active !== false ? row && readImageDisplay({ image_url: row.image_url, subtitle: row.subtitle }) : null;
  const [url, setUrl] = useState(existing?.url || original);
  const [fit, setFit] = useState(existing?.fit || "contain");
  const [position, setPosition] = useState(existing?.position || "center");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function persist(reset = false) {
    setBusy(true); setMessage("");
    try {
      const error = await save("content_banners", {
        title: SITE_IMAGE_PREFIX + original, placement: "promo", image_url: reset ? original : url,
        subtitle: JSON.stringify({ fit, position }), active: !reset,
      }, row?.id as string | undefined);
      if (error) throw new Error(error);
      if (reset) { setUrl(original); setFit("contain"); setPosition("center"); }
      setMessage(reset ? "Original image restored." : "Image saved. Refresh the storefront to see your changes.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save image."); }
    finally { setBusy(false); }
  }
  return <div className="plbh-site-image-editor">
    <div className="plbh-site-image-previews">{["Desktop preview", "Mobile preview"].map((label, index) => <div key={label}><span>{label}</span><div className={index ? "is-mobile" : ""}><Image src={url} alt="Selected website image preview" fill unoptimized sizes="500px" style={{ objectFit: fit, objectPosition: position }} /></div></div>)}</div>
    <p>Show full image keeps every edge visible. Fill frame crops the edges without stretching. Previews show typical wide and narrow frames; page layouts keep their own dimensions. These display settings also apply to shared background artwork.</p>
    <div className="plbh-admin-form-grid">
      <label>Upload replacement<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" disabled={busy} onChange={async (event) => {
        const file = event.target.files?.[0]; if (!file) return;
        event.target.value = ""; setBusy(true); setMessage("");
        try {
          if (!["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"].includes(file.type)) throw new Error("Choose a JPG, PNG, WebP, AVIF or GIF image.");
          if (file.size > 10 * 1024 * 1024) throw new Error("Choose an image smaller than 10 MB.");
          const bitmap = await createImageBitmap(file); bitmap.close();
          setUrl(await upload(file)); setMessage("Upload ready. Save image to publish it.");
        } catch (error) { setMessage(error instanceof Error ? error.message : "Image could not be uploaded."); }
        finally { setBusy(false); }
      }} /><small>JPG, PNG, WebP, AVIF or GIF · up to 10 MB</small></label>
      <label>Image display<select value={fit} disabled={busy} onChange={(event) => setFit(event.target.value as "contain" | "cover")}><option value="contain">Show full image</option><option value="cover">Fill frame</option></select></label>
      <label>Focus position<select value={position} disabled={busy} onChange={(event) => setPosition(event.target.value)}>{["center", "top", "bottom", "left", "right"].map((value) => <option key={value}>{value}</option>)}</select></label>
    </div>
    <div className="plbh-admin-dialog-actions"><button type="button" className="plbh-admin-button" disabled={busy || !row} onClick={() => void persist(true)}>Restore original</button><button type="button" className="plbh-admin-button plbh-admin-button-primary" disabled={busy} onClick={() => void persist()}>{busy ? "Working…" : "Save image"}</button></div>
    <p role="status">{message}</p>
  </div>;
}
