"use client";
import { useState } from "react";
import { Icon } from "./ui";
export function EnquiryForm({ request = false }: { request?: boolean }) {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <form
      className="enquiry-form"
      onChange={() => setReady(false)}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const text = request
          ? `Book request from ${data.get("name")}\nTitle: ${data.get("title")}\nAuthor / edition: ${data.get("author") || "Not specified"}\nQuantity: ${data.get("quantity")}\nNotes: ${data.get("message") || "None"}`
          : `Enquiry from ${data.get("name")}\nTopic: ${data.get("topic")}\n${data.get("message")}`;
        setMessage(text);
        setReady(true);
      }}
    >
      <p className="shop-kicker">
        {request ? "TELL US WHAT YOU’RE LOOKING FOR" : "START A CONVERSATION"}
      </p>
      <h2>{request ? "Your next book awaits." : "How can we help?"}</h2>
      <p className="form-intro">
        {request
          ? "Share the details you know. We’ll help you check availability."
          : "Prepare your enquiry below, then send it to our team on WhatsApp."}
      </p>
      <label>
        Your name <span>*</span>
        <input
          name="name"
          autoComplete="name"
          required
          maxLength={100}
          placeholder="Full name"
        />
      </label>
      {request ? (
        <>
          <label>
            Book title <span>*</span>
            <input
              name="title"
              required
              maxLength={250}
              placeholder="The title you’re looking for"
            />
          </label>
          <div className="form-row">
            <label>
              Author or edition
              <input name="author" maxLength={180} placeholder="If known" />
            </label>
            <label>
              Quantity
              <input
                name="quantity"
                type="number"
                min={1}
                max={999}
                defaultValue={1}
                required
              />
            </label>
          </div>
        </>
      ) : (
        <label>
          What is your enquiry about?
          <select name="topic">
            <option>Finding a book</option>
            <option>My order</option>
            <option>Delivery</option>
            <option>Institutional or bulk enquiry</option>
            <option>Something else</option>
          </select>
        </label>
      )}
      <label>
        {request ? "Anything else we should know?" : "Your message"}
        {!request && <span> *</span>}
        <textarea
          name="message"
          required={!request}
          maxLength={1500}
          rows={4}
          placeholder={
            request
              ? "ISBN, preferred language, number of copies or any other details…"
              : "Tell us a little about what you need…"
          }
        />
      </label>
      <button className="button button-green" type="submit">
        Prepare {request ? "book request" : "enquiry"} <Icon name="arrow" />
      </button>
      <p className="form-note">
        Your details stay in this browser until you choose to send them in
        WhatsApp. This form does not place an order.
      </p>
      {ready && (
        <div className="enquiry-ready" role="status">
          <strong>Your message is ready.</strong>
          <p>
            Open WhatsApp, review your message and tap send to reach our team.
          </p>
          <a
            className="button button-gold"
            href={`https://wa.me/923080060188?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="whatsapp" /> Continue in WhatsApp
          </a>
        </div>
      )}
    </form>
  );
}
