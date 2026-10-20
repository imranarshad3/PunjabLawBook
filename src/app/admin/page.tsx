import type { Metadata } from "next";
import { AdminWorkspace } from "./workspace";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin Studio | Punjab Law Book House",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminWorkspace />;
}
