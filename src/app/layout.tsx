import type { Metadata } from "next";
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
  title: "Punjab Law Book House | Law Books & Judicial Exam Guides",
  description:
    "Explore law books, bare acts, legal commentaries and judicial examination guides from Punjab Law Book House, Lahore.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Punjab Law Book House",
    description:
      "Knowledge builds a fairer Pakistan. Explore legal books and examination guides.",
    type: "website",
    locale: "en_PK",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
