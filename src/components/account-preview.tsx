"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useClerk, useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { Icon } from "./ui";
import { AccountDashboard } from "./account-dashboard";

type MaybeClerkError = {
  message?: string;
  longMessage?: string;
  errors?: { longMessage?: string; message?: string }[];
} | null;

const readError = (error: MaybeClerkError) =>
  error?.longMessage ||
  error?.errors?.[0]?.longMessage ||
  error?.errors?.[0]?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

export function AccountPreview({
  mode = "signin",
}: {
  mode?: "signin" | "register" | "reset";
}) {
  const signin = mode === "signin",
    reset = mode === "reset";
  const router = useRouter();
  // Clerk appends `__clerk_ticket` to the redirect URL of an invitation email.
  // It carries the (already verified) email address, so neither flow asks for
  // one: a new recipient only chooses a password, and a recipient who already
  // has an account is signed straight in.
  const searchParams = useSearchParams();
  const ticket = searchParams.get("__clerk_ticket");
  const requestedReturn = searchParams.get("redirect_url") || "/account";
  const returnTo = requestedReturn.startsWith("/") && !requestedReturn.startsWith("//") ? requestedReturn : "/account";
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const ready = Boolean(signIn && signUp);

  if (signin && userLoaded && isSignedIn) return <AccountDashboard />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!signIn || !signUp || busy) return;
    setBusy(true);
    setError("");
    try {
      // ------------------------------------------------ email code step
      if (awaitingCode && mode === "register") {
        const verified = await signUp.verifications.verifyEmailCode({ code });
        if (verified.error) return setError(readError(verified.error as MaybeClerkError));
        await signUp.finalize();
        router.push(returnTo);
      } else if (awaitingCode && reset) {
        const verified = await signIn.resetPasswordEmailCode.verifyCode({ code });
        if (verified.error) return setError(readError(verified.error as MaybeClerkError));
        const changed = await signIn.resetPasswordEmailCode.submitPassword({ password });
        if (changed.error) return setError(readError(changed.error as MaybeClerkError));
        await signIn.finalize();
        router.push(returnTo);
      }
      // ---------------------------------------------------- first steps
      else if (signin && ticket) {
        const accepted = await signIn.ticket({ ticket });
        if (accepted.error) return setError(readError(accepted.error as MaybeClerkError));
        await signIn.finalize();
        router.push(returnTo);
      } else if (signin) {
        if (!email.trim()) return setError("Enter the email address you signed up with.");
        const attempt = await signIn.password({ identifier: email, password });
        if (attempt.error) return setError(readError(attempt.error as MaybeClerkError));
        await signIn.finalize();
        router.push(returnTo);
      } else if (reset) {
        if (!email.trim()) return setError("Enter the email address you signed up with.");
        const created = await signIn.create({ identifier: email });
        if (created.error) return setError(readError(created.error as MaybeClerkError));
        const sent = await signIn.resetPasswordEmailCode.sendCode();
        if (sent.error) return setError(readError(sent.error as MaybeClerkError));
        setAwaitingCode(true);
        setStatus(`We sent a reset code to ${email}. Enter it with your new password.`);
      } else {
        const [firstName, ...rest] = name.trim().split(" ").filter(Boolean);
        const names = {
          ...(firstName ? { firstName } : {}),
          ...(rest.length ? { lastName: rest.join(" ") } : {}),
        };
        if (ticket) {
          const accepted = await signUp.create({ strategy: "ticket", ticket, password, ...names });
          if (accepted.error) return setError(readError(accepted.error as MaybeClerkError));
          await signUp.finalize();
          router.push(returnTo);
          return;
        }
        const created = await signUp.create({ emailAddress: email, password, ...names });
        if (created.error) return setError(readError(created.error as MaybeClerkError));
        const sent = await signUp.verifications.sendEmailCode();
        if (sent.error) return setError(readError(sent.error as MaybeClerkError));
        setAwaitingCode(true);
        setStatus(`We sent a confirmation code to ${email}.`);
      }
    } catch (caught) {
      setError(readError(caught as MaybeClerkError));
    } finally {
      setBusy(false);
    }
  }

  const heading = ticket && !reset
    ? "You have been invited."
    : awaitingCode
    ? "Check your email."
    : reset
      ? "A fresh start."
      : signin
        ? "Welcome back."
        : "Your next chapter starts here.";

  const intro = ticket && signin
    ? "You already have an account with us. Accept the invitation to add your new access."
    : ticket && mode === "register"
      ? "Choose a password to accept your invitation. Your email address is already confirmed."
    : awaitingCode
    ? status
    : reset
      ? "Enter your email and we will send you a reset code."
      : signin
        ? "Your books, your orders, your own corner of the bookshop."
        : "A place to keep your reading journey together.";

  const action = ticket && !reset
    ? "Accept the invitation"
    : awaitingCode
    ? reset
      ? "Set a new password"
      : "Confirm your email"
    : reset
      ? "Send reset code"
      : signin
        ? "Sign in to your account"
        : "Create your account";

  return (
    <section className="container account-layout">
      <div className="account-welcome">
        <Icon name="book" />
        <p className="shop-kicker">YOUR PERSONAL LEGAL BOOKSHELF</p>
        <h2>
          A bookshelf that
          <br />
          grows with you.
        </h2>
        <p>
          From your first law book to the references you reach for every day. A
          space for your collection, your orders and your next chapter.
        </p>
        <Link className="text-link" href="/products">
          Discover your next book <Icon name="arrow" />
        </Link>
      </div>
      <div className="account-panel">
        <div className="account-tabs">
          <Link href="/account" aria-current={signin ? "page" : undefined}>
            Sign in
          </Link>
          <Link
            href="/account/register"
            aria-current={mode === "register" ? "page" : undefined}
          >
            Create account
          </Link>
        </div>
        <span className="account-avatar">
          <Icon name="user" />
        </span>
        {userLoaded && isSignedIn ? (
          <>
            <h2>You are signed in.</h2>
            <p>
              {user?.fullName || user?.primaryEmailAddress?.emailAddress} — your
              orders and details live here.
            </p>
            <form className="account-form" onSubmit={(event) => event.preventDefault()}>
              <fieldset>
                <button
                  className="button button-green"
                  type="button"
                  onClick={() => signOut(() => router.push("/"))}
                >
                  Sign out
                  <Icon name="arrow" />
                </button>
              </fieldset>
            </form>
            <Link className="account-recovery" href="/products">
              Continue browsing books
            </Link>
          </>
        ) : (
          <>
            <h2>{heading}</h2>
            <p>{intro}</p>
            <form className="account-form" onSubmit={submit}>
              <fieldset disabled={!ready || busy}>
                {mode === "register" && !awaitingCode && (
                  <label>
                    Full name
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Your full name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>
                )}
                {!awaitingCode && !ticket && (
                  <label>
                    Email address
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>
                )}
                {awaitingCode && (
                  <label>
                    Verification code
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6-digit code"
                      required
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                    />
                  </label>
                )}
                {(!reset || awaitingCode) && !(signin && ticket) && (
                  <label>
                    {awaitingCode && reset ? "New password" : "Password"}
                    <input
                      type="password"
                      autoComplete={signin ? "current-password" : "new-password"}
                      placeholder={
                        awaitingCode && reset ? "Choose a new password" : "Enter your password"
                      }
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </label>
                )}
                <div id="clerk-captcha" />
                <button className="button button-green" type="submit">
                  {busy ? "Just a moment…" : action}
                  <Icon name="arrow" />
                </button>
              </fieldset>
            </form>
            {signin && (
              <Link className="account-recovery" href="/account/forgot-password">
                Forgot your password?
              </Link>
            )}
            {reset && (
              <Link className="account-recovery" href="/account">
                Back to sign in
              </Link>
            )}
            <p className="account-note" role={error ? "alert" : undefined}>
              <Icon name="check" />
              <span>
                {error ||
                  status ||
                  "Your details are handled by Clerk. We never store your password."}
              </span>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
