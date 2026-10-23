import { createClerkSupabaseClient, supabase } from "./supabase";

export type OrderCustomer = {
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  notes?: string;
};

/**
 * Places a guest order through the `place_order` SQL function, which writes
 * the customer, order, items and stock movements in one transaction.
 */
export async function placeOrder(
  customer: OrderCustomer,
  items: { legacy_id: number; quantity: number }[],
  getToken?: () => Promise<string | null>,
) {
  if (!supabase) return { error: "Ordering is unavailable right now." };
  const client = getToken ? createClerkSupabaseClient(getToken) : supabase;
  if (!client) return { error: "Ordering is unavailable right now." };
  try {
  const { data, error } = await client.rpc("place_order", {
    p_customer: customer,
    p_items: items,
    p_clerk_user_id: null,
  });
  if (error) return { error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.order_number || !Number.isFinite(Number(row.total))) return { error: "Order confirmation was unavailable. Please contact the store before trying again." };
  return { orderNumber: row.order_number as string, total: Number(row.total) };
  } catch {
    return { error: "The order response could not be received. Contact the store to confirm whether it was placed before trying again." };
  }
}

/**
 * Records a book enquiry. WhatsApp stays the reply channel, so a failure here
 * never blocks the customer -- but it is reported rather than swallowed, because
 * a silently dropped enquiry is indistinguishable from one nobody sent.
 */
export async function recordEnquiry(payload: {
  customer_name: string;
  book_title?: string | null;
  phone?: string | null;
  email?: string | null;
  quantity?: number | null;
  message?: string | null;
  source?: "website" | "whatsapp";
}) {
  if (!supabase) return { error: "Supabase is not configured." };
  const { error } = await supabase.from("enquiries").insert({ source: "website", ...payload });
  if (error) {
    console.error("[enquiry] not recorded:", error.message);
    return { error: error.message };
  }
  return {};
}
