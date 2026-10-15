import Link from "next/link";
import { Icon } from "./ui";
export function AccountPreview({
  mode = "signin",
}: {
  mode?: "signin" | "register" | "reset";
}) {
  const signin = mode === "signin",
    reset = mode === "reset";
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
        <h2>
          {reset
            ? "A fresh start."
            : signin
              ? "Welcome back."
              : "Your next chapter starts here."}
        </h2>
        <p>
          {reset
            ? "Password recovery will be available once accounts are activated."
            : signin
              ? "Your books, your orders, your own corner of the bookshop."
              : "A place to keep your reading journey together."}
        </p>
        <form className="account-form">
          <fieldset disabled>
            {mode === "register" && (
              <label>
                Full name
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
            {!reset && (
              <label>
                Password
                <input
                  type="password"
                  autoComplete={signin ? "current-password" : "new-password"}
                  placeholder="Enter your password"
                />
              </label>
            )}
            <button className="button button-green" type="button">
              {reset
                ? "Send reset link"
                : signin
                  ? "Sign in to your account"
                  : "Create your account"}
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
        <p className="account-note">
          <Icon name="check" />
          <span>
            Account access is coming in the next milestone. These fields are
            inactive; no credentials are collected.
          </span>
        </p>
      </div>
    </section>
  );
}
