import type { Metadata } from "next";
import { BookForm } from "../../../book-form";

export const metadata: Metadata = { title: "Edit Book" };

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookForm bookId={id} />;
}
