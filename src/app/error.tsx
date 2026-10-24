"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main id="main" className="container" style={{ paddingBlock: "5rem" }}>
    <h1>The bookstore is temporarily unavailable</h1>
    <p>We couldn’t load the latest store information. Please try again shortly.</p>
    <button className="button button-green" onClick={reset}>Try again</button>
  </main>;
}
