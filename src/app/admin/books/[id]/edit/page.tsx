import type { Metadata } from "next";
import { Suspense } from "react";
import { BookForm } from "../../../book-form";
import AdminLoading from "../../../loading";

export const metadata: Metadata = { title: "Edit Book" };

type Props = { params: Promise<{ id: string }> };
async function EditDetails({ params }: Props) {
  const { id } = await params;
  return <BookForm bookId={id} />;
}
export default function EditBookPage(props: Props) {
  return <Suspense fallback={<AdminLoading />}><EditDetails {...props} /></Suspense>;
}
