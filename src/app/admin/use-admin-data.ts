"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { revalidateCatalogue } from "./actions";
import { products as fallbackBooks } from "@/data/products";

export type AdminBook = {
  id: number;
  name: string;
  url: string;
  image: string;
  price: number;
  inStock: boolean;
  purchasable: boolean;
  category: string;
  uuid?: string;
  stock: number | null;
  stockStatus: string;
  status: string;
  categoryId?: string;
};

export type RecordRow = Record<string, unknown> & { id: string };

type BookRow = {
  id: string;
  legacy_id: number | null;
  title: string;
  price: string | number;
  cover_url: string | null;
  stock: number | null;
  stock_status: string;
  status: string;
  categories: { id: string; name: string } | null;
};

const toBook = (row: BookRow): AdminBook => ({
  id: row.legacy_id ?? 0,
  name: row.title,
  url: row.legacy_id ? `/products/${row.legacy_id}` : "#",
  image: row.cover_url || "/images/placeholder.webp",
  price: Number(row.price),
  inStock: row.stock_status !== "out_of_stock",
  purchasable: row.status === "published",
  category: row.categories?.name || "Uncategorised",
  categoryId: row.categories?.id,
  uuid: row.id,
  stock: row.stock,
  stockStatus: row.stock_status,
  status: row.status,
});

const asFallback = (): AdminBook[] =>
  fallbackBooks.map((book) => ({
    ...book,
    stock: null,
    stockStatus: book.inStock ? "untracked" : "out_of_stock",
    status: "published",
  }));

/** Reads the admin tables through Clerk-authenticated RLS. */
export function useAdminData() {
  const { session } = useSession();
  const [books, setBooks] = useState<AdminBook[]>(asFallback);
  const [orders, setOrders] = useState<RecordRow[]>([]);
  const [customers, setCustomers] = useState<RecordRow[]>([]);
  const [enquiries, setEnquiries] = useState<RecordRow[]>([]);
  const [promotions, setPromotions] = useState<RecordRow[]>([]);
  const [banners, setBanners] = useState<RecordRow[]>([]);
  const [pages, setPages] = useState<RecordRow[]>([]);
  const [team, setTeam] = useState<RecordRow[]>([]);
  const [settings, setSettings] = useState<RecordRow | null>(null);
  const [categoryRows, setCategoryRows] = useState<{ id: string; name: string }[]>([]);
  const [orderItems, setOrderItems] = useState<RecordRow[]>([]);
  const [media, setMedia] = useState<RecordRow[]>([]);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);

  const getToken = useCallback(async () => (session ? session.getToken() : null), [session]);

  useEffect(() => {
    const client = createClerkSupabaseClient(getToken);
    if (!client) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [book, order, customer, enquiry, promotion, banner, page, member, setting, categoryList, items, assets] = await Promise.all([
        client
          .from("books")
          .select("id, legacy_id, title, price, cover_url, stock, stock_status, status, categories(id, name)")
          .order("title"),
        client.from("orders").select("*").order("placed_at", { ascending: false }).limit(200),
        client.from("customers").select("*").order("created_at", { ascending: false }).limit(200),
        client.from("enquiries").select("*").order("created_at", { ascending: false }).limit(200),
        client.from("promotions").select("*").order("created_at", { ascending: false }).limit(200),
        client.from("content_banners").select("*").order("sort_order"),
        client.from("content_pages").select("*").order("title"),
        client.from("admin_members").select("*").order("created_at"),
        client.from("store_settings").select("*").limit(1).maybeSingle(),
        client.from("categories").select("id, name").order("name"),
        client.from("order_items").select("*, orders(order_number, placed_at, status)").limit(500),
        client.from("media_assets").select("*, books(title)").order("created_at", { ascending: false }).limit(200),
      ]);
      if (cancelled) return;
      if (book.error) {
        setError(book.error.message);
      } else if (book.data?.length) {
        setBooks((book.data as unknown as BookRow[]).map(toBook));
        setLive(true);
      }
      setOrders((order.data as RecordRow[]) || []);
      setCustomers((customer.data as RecordRow[]) || []);
      setEnquiries((enquiry.data as RecordRow[]) || []);
      setPromotions((promotion.data as RecordRow[]) || []);
      setBanners((banner.data as RecordRow[]) || []);
      setPages((page.data as RecordRow[]) || []);
      setTeam((member.data as RecordRow[]) || []);
      setSettings((setting.data as RecordRow) || null);
      setCategoryRows((categoryList.data as { id: string; name: string }[]) || []);
      setOrderItems((items.data as RecordRow[]) || []);
      setMedia((assets.data as RecordRow[]) || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  /** Refresh this view and flush the storefront's cached catalogue. */
  const refreshAll = useCallback(() => {
    reload();
    void revalidateCatalogue();
  }, [reload]);

  /** Insert or update a row, then refresh. Returns an error message or "". */
  const save = useCallback(
    async (table: string, values: Record<string, unknown>, id?: string) => {
      const client = createClerkSupabaseClient(getToken);
      if (!client) return "Supabase is not configured.";
      const query = id
        ? client.from(table).update(values).eq("id", id)
        : client.from(table).insert(values);
      const { error: failure } = await query;
      if (failure) return failure.message;
      refreshAll();
      return "";
    },
    [getToken, refreshAll],
  );

  const remove = useCallback(
    async (table: string, id: string) => {
      const client = createClerkSupabaseClient(getToken);
      if (!client) return "Supabase is not configured.";
      const { error: failure } = await client.from(table).delete().eq("id", id);
      if (failure) return failure.message;
      refreshAll();
      return "";
    },
    [getToken, refreshAll],
  );

  /** Uploads an image to the public `media` bucket and returns its URL. */
  const uploadImage = useCallback(
    async (file: File) => {
      const client = createClerkSupabaseClient(getToken);
      if (!client) throw new Error("Supabase is not configured.");
      const name = `${Date.now().toString(36)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
      const { error: failure } = await client.storage
        .from("media")
        .upload(name, file, { cacheControl: "31536000", upsert: false });
      if (failure) throw new Error(failure.message);
      return client.storage.from("media").getPublicUrl(name).data.publicUrl;
    },
    [getToken],
  );

  /** Stock changes go through inventory_movements; a trigger updates books.stock. */
  const adjustStock = useCallback(
    async (bookId: string, delta: number, reason: string) => {
      const client = createClerkSupabaseClient(getToken);
      if (!client) return "Supabase is not configured.";
      const { error: failure } = await client
        .from("inventory_movements")
        .insert({ book_id: bookId, delta, reason });
      if (failure) return failure.message;
      refreshAll();
      return "";
    },
    [getToken, refreshAll],
  );

  const categories = useMemo(
    () =>
      [...new Set(books.map((book) => book.category))]
        .map((name) => ({ name, count: books.filter((book) => book.category === name).length }))
        .sort((a, b) => b.count - a.count),
    [books],
  );

  return {
    books, categories, orders, customers, enquiries, promotions,
    banners, pages, team, settings, categoryRows, orderItems, media,
    loading, error, live, reload, save, remove, adjustStock, uploadImage,
  };
}
