import type { Metadata } from "next";
import { CategoryForm } from "../../category-form";

export const metadata: Metadata = { title: "Add New Category" };

export default function AddCategoryPage() {
  return <CategoryForm />;
}
