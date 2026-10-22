import type { Metadata } from "next";
import "./admin.css";
import "./premium.css";

export const metadata: Metadata = {
  title: "Admin Studio | Punjab Law Book House",
  robots: { index: false, follow: false },
};

/* Access is gated in `src/proxy.ts` before these routes render. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
