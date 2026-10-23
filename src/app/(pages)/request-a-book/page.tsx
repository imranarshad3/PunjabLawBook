import { CmsPage } from "@/components/cms-page";
import type { Metadata } from "next";
import Image from "@/components/site-image";
import { PageIntro } from "@/components/page-intro";
import { EnquiryForm } from "@/components/enquiry-form";
export const metadata: Metadata = {
  title: "Request a Book",
};
function RequestBookPage() {
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label="Request a Book"
        eyebrow="FOR THE TITLE YOU HAVEN’T FOUND YET"
        title="Some books are"
        accent="worth looking for."
        description="A specific reference, a recommended reading list or a title missing from your shelf. Tell us what you need, and let’s take it from there."
      />
      <section className="container request-section">
        <div className="request-story">
          <div className="request-image">
            <Image
              src="/images/need-institutions.webp"
              alt="Shelves of legal books for an institutional library"
              fill
              sizes="(max-width:800px) 90vw, 40vw"
            />
          </div>
          <p className="shop-kicker">A LITTLE HELP GOES A LONG WAY</p>
          <h2>
            From a single title
            <br />
            to a whole reading list.
          </h2>
          <ol className="request-steps">
            <li>
              <span>01</span>
              <div>
                <h3>Share the details</h3>
                <p>
                  A title, author, ISBN or edition helps us identify the right
                  book.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Let’s check the shelf</h3>
                <p>
                  Our team will help confirm availability, price and options.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Decide what’s right for you</h3>
                <p>
                  Review the details with us before choosing to place an order.
                </p>
              </div>
            </li>
          </ol>
        </div>
        <EnquiryForm request />
      </section>
    </main>
  );
}

export default function PublishedPage() {
  return <CmsPage path="/request-a-book"><RequestBookPage /></CmsPage>;
}
