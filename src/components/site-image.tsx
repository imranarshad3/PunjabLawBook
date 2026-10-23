"use client";

import NextImage, { type ImageProps } from "next/image";
import { createContext, useContext, useState } from "react";
import { imageVariable, type ImageDisplay } from "@/lib/site-image-slots";

const Images = createContext<Record<string, ImageDisplay>>({});
export function SiteImagesProvider({ images, children }: { images: Record<string, ImageDisplay>; children: React.ReactNode }) {
  const variables = Object.fromEntries(Object.entries(images).flatMap(([src, image]) => [[imageVariable(src), `url(${JSON.stringify(image.url)})`], [imageVariable(src) + "-size", image.fit], [imageVariable(src) + "-position", image.position]]));
  return <Images.Provider value={images}><div style={{ ...variables, display: "contents" }}>{children}</div></Images.Provider>;
}

export default function SiteImage(props: ImageProps) {
  const images = useContext(Images);
  const display = typeof props.src === "string" ? images[props.src] : undefined;
  const [failedUrl, setFailedUrl] = useState("");
  const override = display && display.url !== failedUrl ? display : undefined;
  return <NextImage {...props} src={override?.url || props.src} unoptimized={override ? true : props.unoptimized}
    style={{ ...props.style, ...(override ? { objectFit: override.fit, objectPosition: override.position } : {}) }}
    onError={(event) => { if (override) setFailedUrl(override.url); props.onError?.(event); }} />;
}
