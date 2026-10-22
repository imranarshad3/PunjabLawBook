"use client";

import { createContext, useContext } from "react";
import type { Catalogue } from "@/lib/catalogue";

const CatalogueContext = createContext<Catalogue | null>(null);

export function CatalogueProvider({
  value,
  children,
}: {
  value: Catalogue;
  children: React.ReactNode;
}) {
  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>;
}

/** The live catalogue, provided by the root layout. */
export function useCatalogue(): Catalogue {
  const value = useContext(CatalogueContext);
  if (!value) throw new Error("useCatalogue must be used inside CatalogueProvider");
  return value;
}
