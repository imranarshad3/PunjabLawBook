import type { Metadata } from "next";
import { CategoryForm } from "../../../category-form";

export const metadata: Metadata = { title: "Edit Category" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CategoryForm categoryId={id} />;
}
