import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { CatalogueProvider } from "@/components/catalogue-context";
import { getCatalogue } from "@/lib/catalogue";
import { siteUrl } from "@/lib/site";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./revised-sections.css";
import "./premium-polish.css";
import "./latest-references.css";
import "./product-card.css";
import "./site-header.css";
import "./readability.css";

// Self-hosted at build time; no runtime requests to third-party font servers.
const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  // Resolves relative Open Graph and canonical URLs. Set NEXT_PUBLIC_SITE_URL.
  metadataBase: new URL(siteUrl),
  title: {
    default: "Punjab Law Book House | Law Books & Judicial Exam Guides",
    template: "%s | Punjab Law Book House",
  },
  description:
    "Explore law books, bare acts, legal commentaries and judicial examination guides from Punjab Law Book House, Lahore.",
  alternates: { canonical: "/" },
  // The storefront is public; /admin and the signed-in areas set their own
  // noindex, and robots.ts disallows them.
  robots: { index: true, follow: true },
  openGraph: {
    title: "Punjab Law Book House",
    description:
      "Knowledge builds a fairer Pakistan. Explore legal books and examination guides.",
    url: "/",
    siteName: "Punjab Law Book House",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Punjab Law Book House",
    description:
      "Knowledge builds a fairer Pakistan. Explore legal books and examination guides.",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const catalogue = await getCatalogue();
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#17402f",
          borderRadius: "0.625rem",
          fontFamily: "var(--font-body), Arial, sans-serif",
        },
      }}
    >
      <html lang="en" className={`${serif.variable} ${sans.variable}`}>
        <body>
          <CatalogueProvider value={catalogue}>{children}</CatalogueProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
