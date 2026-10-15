import { SiteHeader, SiteFooter } from "@/components/site-shell";
import "../products/products.css";
import "./pages.css";
export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
