import { supabase } from "./supabase";

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
  clerkUserId?: string | null,
) {
  if (!supabase) return { error: "Ordering is unavailable right now." };
  const { data, error } = await supabase.rpc("place_order", {
    p_customer: customer,
    p_items: items,
    p_clerk_user_id: clerkUserId ?? null,
  });
  if (error) return { error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  return { orderNumber: row?.order_number as string, total: Number(row?.total) };
}

/** Records a book enquiry. Failures stay silent: WhatsApp remains the fallback. */
export async function recordEnquiry(payload: {
  customer_name: string;
  book_title?: string | null;
  phone?: string | null;
  email?: string | null;
  quantity?: number | null;
  message?: string | null;
  source?: "website" | "whatsapp";
}) {
  if (!supabase) return;
  await supabase.from("enquiries").insert({ source: "website", ...payload });
}
