import type { Metadata } from "next";
import { Suspense } from "react";
import { PageIntro } from "@/components/page-intro";
import { AccountPreview } from "@/components/account-preview";
export const metadata: Metadata = {
  title: "Create an Account | Punjab Law Book House",
};
export default function Page() {
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label="Create Account"
        eyebrow="BECOME PART OF THE BOOKSHOP"
        title="A place for your books."
        accent="A chapter of your own."
        description="Your account brings together your orders, addresses and personal details."
      />
      <Suspense fallback={null}>
        <AccountPreview mode="register" />
      </Suspense>
    </main>
  );
}
