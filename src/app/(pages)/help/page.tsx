import { CmsPage } from "@/components/cms-page";
import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Icon } from "@/components/ui";
export const metadata: Metadata = {
  title: "Ordering & Delivery Help | Punjab Law Book House",
};
const answers = [
  {
    group: "CHOOSING YOUR BOOKS",
    items: [
      [
        "How do I find a particular book?",
        "Search the bookshop by title, author or subject. If you cannot find it, use Request a Book to prepare an enquiry for our team.",
      ],
      [
        "Can I confirm an edition or language?",
        "Yes. Contact us with the book title or catalogue number before ordering. We can help you check the edition, language, binding and contents.",
      ],
      [
        "Do you help with institutional collections?",
        "Contact our team with your reading list and quantities to discuss a collection for a university, chambers or library.",
      ],
    ],
  },
  {
    group: "ORDERING & DELIVERY",
    items: [
      [
        "Where do you deliver?",
        "We arrange delivery across Pakistan. Contact the team with your location for delivery information before ordering.",
      ],
      [
        "What will delivery cost, and when will my order arrive?",
        "Delivery charges and timing depend on your order and destination. Confirm these with our team. No delivery date is guaranteed on this website.",
      ],
      [
        "How do I pay for my books?",
        "Checkout currently accepts cash-on-delivery orders. The team confirms delivery arrangements by phone. Online card payments are not enabled.",
      ],
      [
        "Are prices and availability current?",
        "Prices and availability come from the live catalogue. The team can help confirm an edition or language before you order.",
      ],
    ],
  },
  {
    group: "YOUR ACCOUNT & ORDERS",
    items: [
      [
        "Where can I see my previous orders?",
        "Sign in to My Account to view orders placed while you were signed in. Open an order to see its books, totals, delivery details and status.",
      ],
      [
        "Can I change an order or ask about a return?",
        "Contact our team with your order number as soon as possible. Changes and return requests must be confirmed by the team before you send any books back.",
      ],
    ],
  },
];
function HelpPage() {
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label="Help Desk"
        eyebrow="A LITTLE CLARITY FOR YOUR NEXT CHAPTER"
        title="Good questions."
        accent="Helpful answers."
        description="Find your way around the collection, ordering and delivery. For anything more specific, our team is a conversation away."
      />
      <section className="container help-layout">
        <aside>
          <p className="shop-kicker">HOW CAN WE HELP?</p>
          {answers.map((group, index) => (
            <a href={`#help-${index}`} key={group.group}>
              {group.group.toLowerCase()} <Icon name="arrow" />
            </a>
          ))}
          <Link className="button button-green" href="/contact">
            Speak to our team
          </Link>
        </aside>
        <div>
          {answers.map((group, index) => (
            <section
              id={`help-${index}`}
              className="faq-group"
              key={group.group}
            >
              <h2>{group.group.toLowerCase()}</h2>
              {group.items.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </section>
          ))}
          <div className="help-legal">
            <p>Website information:</p>
            <Link href="/terms">Terms & conditions</Link>
            <Link href="/privacy">Privacy information</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PublishedPage() {
  return <CmsPage path="/help"><HelpPage /></CmsPage>;
}
