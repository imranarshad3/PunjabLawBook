import { Suspense } from "react";
import { notFound } from "next/navigation";
import { navigation } from "../navigation";
import { AdminWorkspace } from "../workspace";
import AdminLoading from "../loading";

export function generateStaticParams() {
  return navigation.filter((entry) => entry[2]).map((entry) => ({ module: entry[2] }));
}

async function ModuleContent({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const entry = navigation.find((entry) => entry[2] === module);
  if (!entry) notFound();
  return <AdminWorkspace view={entry[0]} />;
}

export default function AdminModule({ params }: { params: Promise<{ module: string }> }) {
  return <Suspense fallback={<AdminLoading />}><ModuleContent params={params} /></Suspense>;
}
