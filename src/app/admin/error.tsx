"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="plbh-admin-app plbh-admin-loading">
      <span className="plbh-admin-eyebrow">WORKSPACE UNAVAILABLE</span>
      <h1>We couldn’t open this page.</h1>
      <p>Your catalogue has not been changed. Try loading the workspace again.</p>
      <button className="plbh-admin-button plbh-admin-button-primary" onClick={reset}>Try again</button>
    </main>
  );
}
