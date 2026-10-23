import type { Metadata } from "next";
import { Suspense } from "react";
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
        description="Recover access securely using the recovery options available for your account."
      />
      <Suspense fallback={null}>
        <AccountPreview mode="reset" />
      </Suspense>
    </main>
  );
}
