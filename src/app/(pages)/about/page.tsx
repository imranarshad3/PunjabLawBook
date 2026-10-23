import { CmsPage } from "@/components/cms-page";
import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Icon, type IconName } from "@/components/ui";
export const metadata: Metadata = {
  title: "Our Story",
};
const values: { icon: IconName; title: string; copy: string }[] = [
  {
    icon: "book",
    title: "Knowledge that matters",
    copy: "From the first principles of law to the references you return to in practice.",
  },
  {
    icon: "chat",
    title: "A personal connection",
    copy: "A conversation with someone who can help you find the book you are looking for.",
  },
  {
    icon: "building",
    title: "A place for every reader",
    copy: "Resources for students, advocates, educators, chambers and institutional libraries.",
  },
];
function AboutPage() {
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label="Our Story"
        eyebrow="PUNJAB LAW BOOK HOUSE · LAHORE"
        title="Rooted in law."
        accent="Dedicated to knowledge."
        description="A legal bookshelf for the student finding their way, the advocate building a practice, and everyone who believes in the power of knowledge."
      />
      <section className="container story-section">
        <div className="story-photo">
          <Image
            src="/images/library-detail.webp"
            alt="An atmospheric legal library"
            fill
            sizes="(max-width:800px) 90vw, 45vw"
          />
          <div className="photo-caption">
            <Icon name="pin" />
            <span>
              Turner Road, Lahore
              <br />
              <small>At the heart of the legal community</small>
            </span>
          </div>
        </div>
        <div className="story-copy">
          <p className="shop-kicker">MORE THAN A BOOKSHELF</p>
          <h2>
            Good books.
            <br />
            Lasting understanding.
          </h2>
          <p>
            Punjab Law Book House is a legal bookseller and publisher based on
            Turner Road, behind the High Court in Lahore. Our collection brings
            together law books, bare acts, commentaries and examination guides.
          </p>
          <p>
            We serve readers at different stages of their legal journey:
            students exploring the foundations, candidates preparing for
            examinations, and practitioners looking for a dependable reference.
          </p>
          <blockquote>“Knowledge builds a fairer Pakistan.”</blockquote>
          <Link className="text-link" href="/products">
            Find your next reference <Icon name="arrow" />
          </Link>
        </div>
      </section>
      <section className="values-section">
        <div className="container">
          <div className="centered-heading">
            <p className="shop-kicker">WHAT GUIDES US</p>
            <h2>For the people behind the profession.</h2>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <article key={value.title}>
                <span className="value-number">0{index + 1}</span>
                <Icon name={value.icon} />
                <h3>{value.title}</h3>
                <p>{value.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="container visit-section">
        <div>
          <p className="shop-kicker">YOUR NEXT CHAPTER STARTS HERE</p>
          <h2>
            Visit us in Lahore.
            <br />
            Read with us, wherever you are.
          </h2>
          <p>
            Browse our collection online or speak with our team about the titles
            you need. We arrange delivery across Pakistan.
          </p>
          <div className="inner-actions">
            <Link className="button button-green" href="/contact">
              Plan your visit <Icon name="arrow" />
            </Link>
            <Link className="text-link" href="/request-a-book">
              Looking for a title?
            </Link>
          </div>
        </div>
        <div className="visit-image">
          <Image
            src="/images/need-professionals.webp"
            alt="Law books and resources for professional practice"
            fill
            sizes="(max-width:800px) 90vw, 40vw"
          />
        </div>
      </section>
    </main>
  );
}

export default function PublishedPage() {
  return <CmsPage path="/about"><AboutPage /></CmsPage>;
}
