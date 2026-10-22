import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { AccountPreview } from "@/components/account-preview";
export const metadata: Metadata = {
  title: "Reset Password | Punjab Law Book House",
};
export default function Page() {
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label="Reset Password"
        eyebrow="FIND YOUR WAY BACK"
        title="Every chapter"
        accent="can begin again."
        description="A dedicated place to recover access to your account. We will email you a reset code."
      />
      <AccountPreview mode="reset" />
    </main>
  );
}
