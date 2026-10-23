"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "@clerk/nextjs";
import { createClerkSupabaseClient, supabaseConfigured } from "@/lib/supabase";
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
  author: string;
  isbn: string;
  publisher: string;
  status: string;
  categoryId?: string;
  details?: Record<string, unknown>;
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
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  categories: { id: string; name: string } | null;
};

const toBook = (row: BookRow): AdminBook => ({
  id: row.legacy_id ?? 0,
  name: row.title,
  url: row.legacy_id ? `/products/${row.legacy_id}` : "#",
  image: row.cover_url || "/images/book-placeholder.svg",
  price: Number(row.price),
  inStock: row.stock_status !== "out_of_stock",
  purchasable: row.status === "published",
  category: row.categories?.name || "Uncategorised",
  categoryId: row.categories?.id,
  uuid: row.id,
  stock: row.stock,
  stockStatus: row.stock_status,
  author: row.author || "",
  isbn: row.isbn || "",
  publisher: row.publisher || "",
  status: row.status,
  details: row as unknown as Record<string, unknown>,
});

const asFallback = (): AdminBook[] =>
  fallbackBooks.map((book) => ({
    ...book,
    stock: null,
    stockStatus: book.inStock ? "untracked" : "out_of_stock",
    status: "published",
    author: "",
    isbn: "",
    publisher: "",
  }));

/** Reads the admin tables through Clerk-authenticated RLS. */
export function useAdminData(orderId?: string) {
  const { session, isLoaded } = useSession();
  const [books, setBooks] = useState<AdminBook[]>(() => supabaseConfigured ? [] : asFallback());
  const [orders, setOrders] = useState<RecordRow[]>([]);
  const [customers, setCustomers] = useState<RecordRow[]>([]);
  const [enquiries, setEnquiries] = useState<RecordRow[]>([]);
  const [promotions, setPromotions] = useState<RecordRow[]>([]);
  const [banners, setBanners] = useState<RecordRow[]>([]);
  const [pages, setPages] = useState<RecordRow[]>([]);
  const [featuredSections, setFeaturedSections] = useState<RecordRow[]>([]);
  const [bookImages, setBookImages] = useState<RecordRow[]>([]);
  const [reviews, setReviews] = useState<RecordRow[]>([]);
  const [team, setTeam] = useState<RecordRow[]>([]);
  const [settings, setSettings] = useState<RecordRow | null>(null);
  const [categoryRows, setCategoryRows] = useState<(RecordRow & { name: string; icon?: string | null })[]>([]);
  const [orderItems, setOrderItems] = useState<RecordRow[]>([]);
  const [media, setMedia] = useState<RecordRow[]>([]);
  const [tick, setTick] = useState(0);
  // Nothing to load when Supabase is not configured.
  const [loading, setLoading] = useState(supabaseConfigured);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);
  /** Tables whose query was refused or failed, so the UI never reports an
      empty table when it actually could not read one. */
  const [failures, setFailures] = useState<string[]>([]);

  const getToken = useCallback(async () => (session ? session.getToken() : null), [session]);

  useEffect(() => {
    const client = createClerkSupabaseClient(getToken);
    if (!client || !isLoaded || !session) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [book, order, customer, enquiry, promotion, banner, page, sections, member, setting, categoryList, items, assets, images, reviewRows] = await Promise.all([
        client
          .from("books")
          .select("*, categories(id, name)")
          .order("title"),
        orderId ? client.from("orders").select("*").eq("id", orderId)
          : client.from("orders").select("*").order("placed_at", { ascending: false }).limit(200),
        client.from("customers").select("*").order("created_at", { ascending: false }).limit(200),
        client.from("enquiries").select("*").order("created_at", { ascending: false }).limit(200),
        client.from("promotions").select("*").order("created_at", { ascending: false }).limit(200),
        client.from("content_banners").select("*").order("sort_order"),
        client.from("content_pages").select("*").order("title"),
        client.from("featured_sections").select("*").order("sort_order"),
        client.from("admin_members").select("*").order("created_at"),
        client.from("store_settings").select("*").limit(1).maybeSingle(),
        client.from("categories").select("*").order("name"),
        orderId ? client.from("order_items").select("*, orders(order_number, placed_at, status)").eq("order_id", orderId)
          : client.from("order_items").select("*, orders(order_number, placed_at, status)").limit(500),
        client.from("media_assets").select("*, books(title)").order("created_at", { ascending: false }).limit(200),
        client.from("book_images").select("*").order("sort_order"),
        client.from("book_reviews").select("*, books(title)").order("created_at", { ascending: false }).limit(500),
      ]);
      if (cancelled) return;
      const refused: string[] = [];
      const messages: string[] = [];
      /** Unwraps one result, recording the table when the query was refused. */
      const rows = <T,>(label: string, result: { data: unknown; error: { message: string } | null }) => {
        if (result.error) {
          refused.push(label);
          messages.push(`${label}: ${result.error.message}`);
        }
        return (result.data as T[]) || [];
      };

      if (book.error) {
        refused.push("books");
        messages.push(`books: ${book.error.message}`);
      } else {
        setBooks(((book.data || []) as unknown as BookRow[]).map(toBook));
        setLive(true);
      }
      setOrders(rows<RecordRow>("orders", order));
      setCustomers(rows<RecordRow>("customers", customer));
      setEnquiries(rows<RecordRow>("enquiries", enquiry));
      setPromotions(rows<RecordRow>("promotions", promotion));
      setBanners(rows<RecordRow>("content banners", banner));
      setPages(rows<RecordRow>("content pages", page));
      setFeaturedSections(rows<RecordRow>("featured sections", sections));
      setBookImages(rows<RecordRow>("book images", images));
      setReviews(rows<RecordRow>("book reviews", reviewRows));
      setTeam(rows<RecordRow>("team", member));
      setCategoryRows(rows<RecordRow & { name: string; icon?: string | null }>("categories", categoryList));
      setOrderItems(rows<RecordRow>("order items", items));
      setMedia(rows<RecordRow>("media", assets));
      if (setting.error) {
        refused.push("store settings");
        messages.push(`store settings: ${setting.error.message}`);
        setSettings(null);
      } else {
        setSettings((setting.data as RecordRow) || null);
      }
      setFailures(refused);
      setError(messages.join(" · "));
      setLoading(false);
    })().catch(() => {
      if (cancelled) return;
      setError("The store could not be reached. Check your connection and try again.");
      setFailures(["store connection"]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [getToken, tick, isLoaded, session, orderId]);

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
      // store_settings is a singleton keyed by the boolean value `true`.
      // Upsert it so the edit form also works when the row has not been
      // created yet, without risking a duplicate-row insert on repeat saves.
      if (table === "store_settings") {
        const { error: failure } = await client
          .from(table)
          .upsert({ ...values, id: true }, { onConflict: "id" })
          .select("id")
          .single();
        if (failure) return failure.message;
        refreshAll();
        return "";
      }
      const query = id
        ? client.from(table).update(values).eq("id", id).select("id").single()
        : client.from(table).insert(values).select("id").single();
      const { error: failure } = await query;
      if (failure) return failure.message;
      refreshAll();
      return "";
    },
    [getToken, refreshAll],
  );

  const saveWithId = useCallback(async (table: string, values: Record<string, unknown>, id?: string) => {
    const client = createClerkSupabaseClient(getToken);
    if (!client) return { id: "", error: "Supabase is not configured." };
    const query = id
      ? client.from(table).update(values).eq("id", id).select("id").single()
      : client.from(table).insert(values).select("id").single();
    const { data: saved, error: failure } = await query;
    if (failure) return { id: "", error: failure.message };
    refreshAll();
    return { id: String(saved.id), error: "" };
  }, [getToken, refreshAll]);

  const saveBookImages = useCallback(async (bookId: string, images: { url: string; altText?: string }[]) => {
    const client = createClerkSupabaseClient(getToken);
    if (!client) return "Supabase is not configured.";
    const { error: failure } = await client.rpc("replace_book_images", { p_book_id: bookId, p_images: images });
    if (failure) return failure.message;
    refreshAll();
    return "";
  }, [getToken, refreshAll]);

  const categoryBookCount = useCallback(
    async (categoryId: string) => {
      const client = createClerkSupabaseClient(getToken);
      if (!client) return { count: 0, error: "Supabase is not configured." };
      const { data, error } = await client.from("books").select("id").eq("category_id", categoryId);
      return { count: data?.length || 0, error: error?.message || "" };
    },
    [getToken],
  );

  const remove = useCallback(
    async (table: string, id: string) => {
      const client = createClerkSupabaseClient(getToken);
      if (!client) return "Supabase is not configured.";
      const { error: failure } = await client.from(table).delete().eq("id", id).select("id").single();
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
    banners, pages, featuredSections, bookImages, reviews, team, settings, categoryRows, orderItems, media,
    loading, error, live, failures, reload, save, saveWithId, saveBookImages, remove, categoryBookCount, adjustStock, uploadImage,
  };
}
