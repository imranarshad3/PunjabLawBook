import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase";
import AdminLoading from "./loading";
import "./admin.css";
import "./premium.css";
import "./studio.css";

export const metadata: Metadata = {
  title: "Admin Studio | Punjab Law Book House",
  robots: { index: false, follow: false },
};

/*
 * `src/proxy.ts` establishes that somebody is signed in. Being signed in is not
 * the same as being staff: anybody can register on the storefront. Authorization
 * is decided here, against the same source of truth the database uses -- a row in
 * `admin_members` for this Clerk user (see `public.is_admin()` in migration 0001).
 * RLS already refuses the data to non-staff; this stops the console shell from
 * rendering for them at all.
 *
 * The check reads the session, so it sits inside Suspense: under
 * `cacheComponents` the rest of the admin tree stays prerenderable and only this
 * gate is resolved per request.
 */
async function AdminGate({ children }: { children: React.ReactNode }) {
  const { userId, getToken } = await auth();
  const client = userId ? createClerkSupabaseClient(() => getToken()) : null;
  // The admin_members policy is `using (is_admin())`, so a non-member reads zero
  // rows. An error means the read was refused, which is also not a pass.
  const member = client
    ? await client.from("admin_members").select("id").limit(1).maybeSingle()
    : null;

  if (!member?.data) {
    return (
      <div className="plbh-admin-denied">
        <h1>You don’t have access to this area</h1>
        <p>
          The admin studio is for Punjab Law Book House staff. If you need access, ask an
          existing administrator to add your account.
        </p>
        <div>
          <Link href="/">Back to the bookstore</Link>
          <Link href="/account">My account</Link>
        </div>
      </div>
    );
  }

  return children;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
