"use server";

import { updateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { CATALOGUE_TAG } from "@/lib/catalogue";

/** Flushes the cached storefront catalogue immediately after an admin write. */
export async function revalidateCatalogue() {
  const { userId, getToken } = await auth();
  if (!userId) return { ok: false };
  const client = createClerkSupabaseClient(() => getToken());
  const member = await client?.from("admin_members").select("id").eq("clerk_user_id", userId).maybeSingle();
  if (!member?.data) return { ok: false };
  updateTag(CATALOGUE_TAG);
  return { ok: true };
}
