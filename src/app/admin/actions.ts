"use server";

import { updateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { CATALOGUE_TAG } from "@/lib/catalogue";

/** Flushes the cached storefront catalogue immediately after an admin write. */
export async function revalidateCatalogue() {
  const { userId } = await auth();
  if (!userId) return { ok: false };
  updateTag(CATALOGUE_TAG);
  return { ok: true };
}
