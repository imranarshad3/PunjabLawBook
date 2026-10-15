"use client";
import { useSyncExternalStore } from "react";
import { products } from "@/data/products";
const validIds = new Set(products.map((book) => book.id));
const KEY = "plbh-book-bag-v1";
export type CartItem = { id: number; quantity: number };
let snapshot = "[]";
function read() {
  try {
    return localStorage.getItem(KEY) || snapshot;
  } catch {
    return snapshot;
  }
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("plbh-cart", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("plbh-cart", listener);
  };
}
export function parseCart(value: string): CartItem[] {
  try {
    if (value.length > 8192) return [];
    const raw: unknown = JSON.parse(value);
    if (!Array.isArray(raw)) return [];
    const seen = new Set<number>();
    return raw
      .slice(0, 100)
      .filter((item): item is CartItem => {
        if (
          !item ||
          typeof item !== "object" ||
          !validIds.has(item.id) ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 99 ||
          seen.has(item.id)
        )
          return false;
        seen.add(item.id);
        return true;
      })
      .map((item) => ({ id: item.id, quantity: item.quantity }));
  } catch {
    return [];
  }
}
export function useCart() {
  return parseCart(useSyncExternalStore(subscribe, read, () => "[]"));
}
export function setCartQuantity(id: number, quantity: number) {
  if (!validIds.has(id) || !Number.isFinite(quantity)) return;
  const items = parseCart(read()).filter((item) => item.id !== id);
  if (quantity >= 1)
    items.push({ id, quantity: Math.min(99, Math.floor(quantity)) });
  snapshot = JSON.stringify(items);
  try {
    localStorage.setItem(KEY, snapshot);
  } catch {}
  window.dispatchEvent(new Event("plbh-cart"));
}
export function addToCart(id: number, quantity = 1) {
  const current =
    parseCart(read()).find((item) => item.id === id)?.quantity ?? 0;
  setCartQuantity(id, current + quantity);
}

const SAVED_KEY = "plbh-saved-books-v1";
let savedSnapshot = "[]";
function readSaved() {
  try {
    return localStorage.getItem(SAVED_KEY) || savedSnapshot;
  } catch {
    return savedSnapshot;
  }
}
function parseSaved(value: string): number[] {
  try {
    if (value.length > 2048) return [];
    const items: unknown = JSON.parse(value);
    return Array.isArray(items)
      ? [
          ...new Set(
            items.filter(
              (id): id is number => typeof id === "number" && validIds.has(id),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}
export function useSavedBooks() {
  return parseSaved(useSyncExternalStore(subscribe, readSaved, () => "[]"));
}
export function toggleSavedBook(id: number) {
  if (!validIds.has(id)) return;
  const ids = parseSaved(readSaved());
  savedSnapshot = JSON.stringify(
    ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
  );
  try {
    localStorage.setItem(SAVED_KEY, savedSnapshot);
  } catch {}
  window.dispatchEvent(new Event("plbh-cart"));
}
