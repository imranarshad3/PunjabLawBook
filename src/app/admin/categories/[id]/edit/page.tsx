import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryForm } from "../../../category-form";
import AdminLoading from "../../../loading";

export const metadata: Metadata = { title: "Edit Category" };

type Props = { params: Promise<{ id: string }> };
async function EditDetails({ params }: Props) {
  const { id } = await params;
  return <CategoryForm categoryId={id} />;
}
export default function EditCategoryPage(props: Props) {
  return <Suspense fallback={<AdminLoading />}><EditDetails {...props} /></Suspense>;
}
