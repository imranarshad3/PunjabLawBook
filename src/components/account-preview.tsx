"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClerkFailed, ClerkLoaded, ClerkLoading, SignIn, SignUp, useUser } from "@clerk/nextjs";
import { accountReturnTo } from "@/lib/account-navigation";
import { siteUrl } from "@/lib/site";
import { Icon } from "./ui";
import { AccountDashboard } from "./account-dashboard";

const appearance = {
  variables: {
    colorPrimary: "#17402f",
    colorText: "#183c30",
    colorTextSecondary: "#52665c",
    colorBackground: "#fffcf5",
    fontFamily: "var(--font-body), Arial, sans-serif",
    fontSize: "16px",
    borderRadius: "0.625rem",
  },
  elements: {
    rootBox: "account-auth-widget",
    cardBox: "account-auth-card-box",
    card: "account-auth-card",
  },
};

export function AccountPreview({ mode = "signin" }: { mode?: "signin" | "register" | "reset" }) {
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useUser();
  const returnTo = accountReturnTo(searchParams.get("redirect_url"), siteUrl);
  const navigation = new URLSearchParams({ redirect_url: returnTo });
  const ticket = searchParams.get("__clerk_ticket");
  if (ticket) navigation.set("__clerk_ticket", ticket);
  const signInUrl = `/account?${navigation}`;
  const signUpUrl = `/account/register?${navigation}`;

  if (isLoaded && isSignedIn) return <AccountDashboard />;

  return (
    <section className="container account-layout">
      <div className="account-welcome">
        <Icon name="book" />
        <p className="shop-kicker">YOUR PERSONAL LEGAL BOOKSHELF</p>
        <h2>A bookshelf that<br />grows with you.</h2>
        <p>From your first law book to the references you reach for every day. A space for your collection, your orders and your next chapter.</p>
        <Link className="text-link" href="/products">Discover your next book <Icon name="arrow" /></Link>
      </div>
      <div className="account-panel">
        <nav className="account-tabs" aria-label="Account access">
          <Link href={signInUrl} aria-current={mode !== "register" ? "page" : undefined}>Sign in</Link>
          <Link href={signUpUrl} aria-current={mode === "register" ? "page" : undefined}>Create account</Link>
        </nav>
        {mode === "reset" && <p>Enter your email, then choose “Forgot password?” to recover your account.</p>}
        <ClerkLoading><p role="status">Loading secure account access…</p></ClerkLoading>
        <ClerkFailed><p role="alert">Account access could not load. Refresh the page or contact our team for help.</p><Link href="/contact">Contact support</Link></ClerkFailed>
        <ClerkLoaded>
          {mode === "register" ? (
            <SignUp routing="hash" signInUrl={signInUrl} forceRedirectUrl={returnTo} signInForceRedirectUrl={returnTo} appearance={appearance} />
          ) : (
            <SignIn routing="hash" signUpUrl={signUpUrl} forceRedirectUrl={returnTo} signUpForceRedirectUrl={returnTo} appearance={appearance} />
          )}
        </ClerkLoaded>
        <p className="account-note"><Icon name="check" /><span>Your details are handled securely by Clerk. We never store your password.</span></p>
      </div>
    </section>
  );
}
