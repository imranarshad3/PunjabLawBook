import { Suspense } from "react";
import { AdminWorkspace } from "./workspace";
import AdminLoading from "./loading";

export default function AdminPage() {
  return <Suspense fallback={<AdminLoading />}><AdminWorkspace view="Dashboard" /></Suspense>;
}
