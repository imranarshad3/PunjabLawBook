import { SiteHeader, SiteFooter } from "@/components/site-shell";
import "./products.css";
export default function ProductsLayout({
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
