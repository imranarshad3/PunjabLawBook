import { Suspense } from "react";
import { notFound } from "next/navigation";
import { navigation } from "../navigation";
import { AdminWorkspace } from "../workspace";
import AdminLoading from "../loading";

export function generateStaticParams() {
  return navigation.filter((entry) => entry[2]).map((entry) => ({ module: entry[2] }));
}

export default async function AdminModule({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const entry = navigation.find((entry) => entry[2] === module);
  if (!entry) notFound();
  return <Suspense fallback={<AdminLoading />}><AdminWorkspace view={entry[0]} /></Suspense>;
}
