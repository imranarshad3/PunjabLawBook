import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { CatalogueProvider } from "@/components/catalogue-context";
import { SiteImagesProvider } from "@/components/site-image";
import { getSiteImages } from "@/lib/site-images";
import { getCatalogue } from "@/lib/catalogue";
import { SiteSettingsProvider } from "@/components/site-settings";
import { getSiteSettings } from "@/lib/site-settings";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.metaTitle || `${settings.name} | Law Books & Exam Guides`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | ${settings.name}` },
    description: settings.metaDescription,
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    openGraph: { title, description: settings.metaDescription, url: "/", siteName: settings.name, type: "website", locale: "en_PK" },
    twitter: { card: "summary_large_image", title, description: settings.metaDescription },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [catalogue, images, settings] = await Promise.all([getCatalogue(), getSiteImages(), getSiteSettings()]);
  return (
    <ClerkProvider
      localization={{
        signIn: { start: { title: "Sign in to your bookshelf" } },
        signUp: { start: { title: "Create your account" } },
      }}
      appearance={{
        variables: {
          colorPrimary: "#17402f",
          borderRadius: "0.625rem",
          fontFamily: "var(--font-body), Arial, sans-serif",
        },
      }}
    >
      <html lang="en" data-scroll-behavior="smooth" className={`${serif.variable} ${sans.variable}`}>
        <body>
          <SiteSettingsProvider settings={settings}><SiteImagesProvider images={images}><CatalogueProvider value={catalogue}>{children}</CatalogueProvider></SiteImagesProvider></SiteSettingsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
