import type { Metadata } from "next";
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
        description="Your account will bring together your orders, addresses and personal details. Account services are planned for our next milestone."
      />
      <AccountPreview mode="register" />
    </main>
  );
}
