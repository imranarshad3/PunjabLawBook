"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { Icon } from "./ui";

type Review = { id: string; customer_name: string; rating: number; title: string; body: string; created_at: string };
const date = (value: string) => new Date(value).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

export function ProductReviews({ bookId, bookName, initialReviews }: { bookId?: string; bookName: string; initialReviews: Review[] }) {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const getToken = useCallback(async () => session ? session.getToken() : null, [session]);
  const [rating, setRating] = useState("5");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const average = initialReviews.length
    ? initialReviews.reduce((sum, review) => sum + review.rating, 0) / initialReviews.length
    : 0;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookId || !user?.id || busy) return;
    setError("");
    setBusy(true);
    try {
      const client = createClerkSupabaseClient(getToken);
      if (!client) throw new Error("Reviews are temporarily unavailable.");
      const customer = await client.from("customers").select("id, full_name").eq("clerk_user_id", user.id).maybeSingle();
      if (customer.error) throw new Error(customer.error.message);
      if (!customer.data) throw new Error("Place an order while signed in before reviewing a book.");
      const result = await client.from("book_reviews").insert({
        book_id: bookId,
        customer_id: customer.data.id,
        customer_name: customer.data.full_name || user.fullName || "Reader",
        rating: Number(rating),
        title: title.trim(),
        body: body.trim(),
        status: "pending",
      });
      if (result.error) throw new Error(result.error.code === "23505" ? "You have already reviewed this book." : result.error.message);
      setSubmitted(true);
      setTitle("");
      setBody("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your review could not be submitted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container product-reviews" aria-labelledby="reviews-title">
      <div className="product-reviews-heading">
        <div><p className="shop-kicker">READER NOTES</p><h2 id="reviews-title">Reviews &amp; comments</h2><p>Share a helpful note about this title with other readers.</p></div>
        <div className="product-review-rating" aria-label={initialReviews.length ? `${average.toFixed(1)} out of 5 from ${initialReviews.length} reviews` : "No reviews yet"}>
          <strong>{initialReviews.length ? average.toFixed(1) : "—"}</strong><span>★★★★★</span><small>{initialReviews.length} {initialReviews.length === 1 ? "review" : "reviews"}</small>
        </div>
      </div>
      <div className="product-review-layout">
        <div className="product-review-list">
          {initialReviews.map((review) => <article key={review.id}>
            <div className="product-review-byline"><strong>{review.customer_name}</strong><time dateTime={review.created_at}>{date(review.created_at)}</time></div>
            <div className="product-review-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
            <h3>{review.title}</h3><p>{review.body}</p>
          </article>)}
          {!initialReviews.length && <div className="product-review-empty"><Icon name="book" /><h3>Be the first to share a reader note.</h3><p>Approved reviews will appear here.</p></div>}
        </div>
        <div className="product-review-form-card">
          <h3>Write a review</h3>
          {submitted ? <p className="product-review-success" role="status">Thank you. Your review is awaiting approval before it appears publicly.</p>
            : !isLoaded ? <p>Loading account…</p>
              : !user ? <p><Link href="/account">Sign in</Link> to submit a review. Reviews are checked before they appear.</p>
                : !bookId ? <p>Reviews will be available for this title once it is linked to the live catalogue.</p>
                  : <form onSubmit={submit}>
                    <label>Rating<select value={rating} onChange={(event) => setRating(event.target.value)}>{[5, 4, 3, 2, 1].map((value) => <option value={value} key={value}>{value} stars</option>)}</select></label>
                    <label>Headline<input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`A note about ${bookName}`} /></label>
                    <label>Your review<textarea required minLength={10} maxLength={5000} rows={5} value={body} onChange={(event) => setBody(event.target.value)} placeholder="What should another reader know about this book?" /></label>
                    {error && <p className="product-review-error" role="alert">{error}</p>}
                    <button className="button button-green" disabled={busy}>{busy ? "Sending…" : "Submit review"} <Icon name="arrow" /></button>
                    <small>One review per reader for each book. Reviews are moderated before publication.</small>
                  </form>}
        </div>
      </div>
    </section>
  );
}
