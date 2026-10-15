import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Icon } from "@/components/ui";
import { EnquiryForm } from "@/components/enquiry-form";
export const metadata: Metadata = {
  title: "Contact & Visit Us | Punjab Law Book House",
};
export default function ContactPage() {
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label="Contact"
        eyebrow="A CONVERSATION AWAY"
        title="Let’s talk"
        accent="books & possibilities."
        description="A question about a title, an order or a library you are building? We’re here to help you find your next step."
      />
      <section className="container contact-section">
        <div className="contact-copy">
          <p className="shop-kicker">HERE TO HELP</p>
          <h2>
            A personal touch.
            <br />A useful answer.
          </h2>
          <p>
            Choose the way that works for you. For a particular title, include
            its name, author or a link so we can help.
          </p>
          <div className="contact-method">
            <Icon name="chat" />
            <div>
              <h3>Message us</h3>
              <p>Book enquiries and order assistance</p>
              <a href="https://wa.me/923080060188">
                Chat on WhatsApp <Icon name="arrow" />
              </a>
            </div>
          </div>
          <div className="contact-method">
            <Icon name="phone" />
            <div>
              <h3>Give us a call</h3>
              <a href="tel:+923080060188">+92 308 0060188</a>
              <a href="tel:+924237242304">+92 42 37242304</a>
            </div>
          </div>
          <div className="contact-method">
            <Icon name="mail" />
            <div>
              <h3>Write to us</h3>
              <a href="/contact">Contact our team</a>
            </div>
          </div>
        </div>
        <EnquiryForm />
      </section>
      <section className="container store-visit">
        <div className="store-location-art">
          <Icon name="building" />
          <p>LAHORE · PAKISTAN</p>
          <h2>
            Find us on
            <br />
            Turner Road.
          </h2>
          <span>Behind the High Court</span>
        </div>
        <div className="store-visit-copy">
          <p className="shop-kicker">COME SAY HELLO</p>
          <h2>Your local legal bookshop.</h2>
          <p>
            Punjab Law Book House
            <br />
            1-Turner Road, Behind High Court
            <br />
            Lahore, Pakistan
          </p>
          <p className="muted">
            Please call ahead to confirm opening hours and the availability of
            the titles you would like to see.
          </p>
          <a
            className="button button-green"
            href="https://www.google.com/maps/search/?api=1&query=Punjab+Law+Book+House+1+Turner+Road+Lahore"
            target="_blank"
            rel="noreferrer"
          >
            Get directions <Icon name="arrow" />
          </a>
        </div>
      </section>
      <div className="container support-bottom">
        <p>Looking for delivery or ordering information?</p>
        <Link className="text-link" href="/help">
          Visit our help desk <Icon name="arrow" />
        </Link>
      </div>
    </main>
  );
}
