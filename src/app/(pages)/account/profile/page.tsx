import type { Metadata } from "next";
import { Suspense } from "react";
import { UserProfile } from "@clerk/nextjs";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Manage Your Account" };

export default function Page() {
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label="Account Settings"
        eyebrow="YOUR DETAILS, YOUR CONTROL"
        title="Manage your account"
        accent="in a few taps."
        description="Update your name, email address, password and connected devices."
      />
      <section className="container account-auth">
        <Suspense fallback={null}>
          <UserProfile routing="hash" />
        </Suspense>
      </section>
    </main>
  );
}
