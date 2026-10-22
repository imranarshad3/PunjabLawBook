import type { Metadata } from "next";
import { BookForm } from "../../book-form";

export const metadata: Metadata = { title: "Add New Book" };

export default function AddBookPage() {
  return <BookForm />;
}
