import Image from "next/image";
import Link from "next/link";
import { BookCarousel } from "@/components/book-carousel";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { BookCard, ShowcaseCard } from "@/components/book-card";
import { Button, Icon, SectionHeading, type IconName } from "@/components/ui";
import { Newsletter } from "@/components/store-interactions";
import catalogue from "@/data/catalogue.json";

// Premium concept shots built from PLBH_20_Premium_Law_Book_Images by
// scripts/make-premium-shots.py.
const shot = (id: number) => `/images/premium-${id}.webp`;
const search = (term: string) => `/products?q=${encodeURIComponent(term)}`;
const needs: {
  title: string;
  description: string;
  image: string;
  icon: IconName;
  href: string;
  action: string;
}[] = [
  {
    title: "For Students",
    description:
      "Essential law books, study guides and reference materials for your academic journey.",
    image: "students",
    icon: "cap",
    href: `/collections/students`,
    action: "Explore for Students",
  },
  {
    title: "For Professionals",
    description:
      "Commentaries, bare acts and practical resources for lawyers and legal practitioners.",
    image: "professionals",
    icon: "case",
    href: `/products`,
    action: "Explore for Professionals",
  },
  {
    title: "For Institutions",
    description:
      "Build your legal library with resources for universities, chambers and institutions.",
    image: "institutions",
    icon: "building",
    href: `/contact`,
    action: "Enquire for Institutions",
  },
  {
    title: "For Competitive Exams",
    description:
      "Focused guides and practice resources for LAT, judicial service and legal examinations.",
    image: "exams",
    icon: "file",
    href: `/collections/exam-guides`,
    action: "Explore Exam Guides",
  },
];
const categories: {
  title: string;
  description: string;
  query: string;
  icon: IconName;
  photo: string;
  color: string;
}[] = [
  {
    title: "Constitutional Law",
    description:
      "Explore the Constitution, governance and the foundations of public law.",
    query: "constitution",
    icon: "building",
    photo: "institutions",
    color: "emerald",
  },
  {
    title: "Civil Law",
    description:
      "Civil procedure, property, contracts and essential legal commentary.",
    query: "civil procedure",
    icon: "scale",
    photo: "students",
    color: "burgundy",
  },
  {
    title: "Criminal Law",
    description:
      "Criminal statutes, evidence, case law and procedural resources.",
    query: "pakistan penal code",
    icon: "case",
    photo: "professionals",
    color: "navy",
  },
  {
    title: "Taxation Law",
    description:
      "Income tax, sales tax and the legal framework of public revenue.",
    query: "tax",
    icon: "file",
    photo: "exams",
    color: "brown",
  },
  {
    title: "Corporate Law",
    description: "Company law, commercial practice and corporate governance.",
    query: "company law",
    icon: "building",
    photo: "professionals",
    color: "emerald",
  },
];
const features: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "book",
    title: "Legal Publications",
    description: "Books, bare acts and legal commentary.",
  },
  {
    icon: "truck",
    title: "Nationwide Delivery",
    description: "Serving readers across Pakistan.",
  },
  {
    icon: "chat",
    title: "Personal Assistance",
    description: "Speak with the team about your books.",
  },
  {
    icon: "building",
    title: "A Dedicated Collection",
    description: "For study, practice and examination.",
  },
];

export default function Home() {
  const exam = catalogue.featured.find((book) => book.id === 5966)!;
  return (
    <>
      <Link className="skip-link" href="#main">
        Skip to content
      </Link>
      <SiteHeader />
      <main id="main">
        <section
          className="hero"
          data-section="02-hero"
          aria-labelledby="hero-title"
        >
          <Image
            className="hero-art"
            src="/images/hero-library.webp"
            alt=""
            fill
            sizes="100vw"
            preload
          />
          <div className="hero-shade" />
          <div className="container hero-content">
            <p className="eyebrow">Knowledge builds a fairer Pakistan</p>
            <h1 id="hero-title">
              Pakistan’s
              <br />
              Home for
              <br />
              <span>Authentic Law Books</span>
            </h1>
            <p className="hero-description">
              Law books, exam guides, bare acts and professional resources.
              Discover the knowledge to support your next chapter.
            </p>
            <div className="hero-buttons">
              <Button href="/products" variant="gold">
                Shop All Books
              </Button>
              <Button href="#exams" variant="outline">
                Explore Exam Guides
              </Button>
            </div>
            <div className="hero-note">
              <Icon name="book" />
              <span>For students. For practitioners. For justice.</span>
            </div>
          </div>
        </section>
        <section
          className="trust-section container"
          data-section="03-trust"
          aria-label="Our services"
        >
          <div className="trust-strip">
            {features.map((feature) => (
              <div className="trust-item" key={feature.title}>
                <span className="medallion">
                  <Icon name={feature.icon} />
                </span>
                <div>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section
          className="section needs-section"
          data-section="04-needs"
          aria-labelledby="needs-title"
        >
          <div className="container">
            <SectionHeading
              eyebrow="Your next chapter begins here"
              title={
                <span id="needs-title">
                  Shop by <em>Need</em>
                </span>
              }
            >
              Find the right resources for your academic, professional
              <br className="desktop-break" /> or examination journey.
            </SectionHeading>
            <div className="needs-grid">
              {needs.map((need) => (
                <article className="need-card" key={need.title}>
                  <div className="need-photo">
                    <Image
                      src={`/images/need-${need.image}.webp`}
                      alt=""
                      fill
                      sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 24vw"
                    />
                  </div>
                  <span className="medallion medallion-light">
                    <Icon name={need.icon} />
                  </span>
                  <div className="need-content">
                    <h3>{need.title}</h3>
                    <p>{need.description}</p>
                    <Button href={need.href}>{need.action}</Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          id="categories"
          className="section categories-section categories-redesign"
          data-section="05-categories"
        >
          <div className="container">
            <div className="categories-heading">
              <SectionHeading
                eyebrow="Explore our collection"
                title="Featured Categories"
              >
                Discover legal books and reference materials for students,
                professionals and institutions across Pakistan.
              </SectionHeading>
              <Button href="/products" variant="outline">
                View All Categories
              </Button>
            </div>
            <div className="categories-grid">
              {categories.map((category, index) => (
                <article
                  className={`category-card ${category.color}`}
                  key={category.title}
                >
                  <div className="category-photo">
                    <Image
                      src={`/images/category-new-${index + 1}.webp`}
                      alt=""
                      fill
                      sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 20vw"
                    />
                    <div className="category-photo-tint" />
                    <Icon name={category.icon} />
                  </div>
                  <div className="category-content">
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                    <Button href={search(category.query)}>Explore Books</Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          id="featured"
          className="featured-section"
          data-section="06-featured"
        >
          <div className="knowledge-banner">
            <div className="container">
              <p className="eyebrow">Punjab Law Book House</p>
              <h2>
                Knowledge Empowers
                <br />
                <em>Justice.</em>
              </h2>
              <p>
                Explore our selection of law books, exam guides and professional
                resources for the legal community.
              </p>
            </div>
          </div>
          <div className="container collection-content">
            <div className="collection-heading">
              <h2>Featured Books</h2>
              <Link className="text-link" href="/products">
                View All Books <Icon name="arrow" />
              </Link>
            </div>
            <div className="books-grid featured-grid">
              {catalogue.featured.slice(0, 4).map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  photograph={shot(book.id)}
                />
              ))}
            </div>
            <p className="catalogue-note">
              Prices checked {catalogue.verifiedAt}. Availability and final
              prices are confirmed by the store. Cart opens on our curated
              catalogue.
            </p>
          </div>
        </section>
        <section
          id="bestsellers"
          className="bestsellers-section bestsellers-redesign popular-final"
          data-section="07-bestsellers"
        >
          <div className="container">
            <div className="popular-header-layout">
              <div className="bestsellers-heading">
                <p className="eyebrow">Bestsellers</p>
                <h2>
                  Most Popular
                  <br />
                  Law Books
                </h2>
                <p>
                  Explore popular legal titles for study, professional practice
                  and judicial examination preparation.
                </p>
              </div>
              <div className="popular-editorial-banner">
                <Image
                  src="/images/popular-banner.webp"
                  alt=""
                  fill
                  sizes="(max-width: 800px) 100vw, 60vw"
                />
                <div className="popular-banner-copy">
                  <p>
                    Authentic
                    <br />
                    Legal Publications
                  </p>
                  <span />
                  <p>
                    Knowledge Builds
                    <br />a Better Society
                  </p>
                </div>
              </div>
            </div>
            <nav
              className="bestseller-topics"
              aria-label="Browse bestseller subjects"
            >
              <Link
                className="active"
                href="#bestseller-track"
                aria-current="true"
              >
                All
              </Link>
              <Link href={`/collections/exam-guides`}>Judicial Exams</Link>
              <Link href={`/collections/bare-acts`}>Bare Acts</Link>
              <Link href={`/collections/legal-reference`}>Commentaries</Link>
              <Link href={`/collections/students?orderby=popularity`}>LLB</Link>
              <Link href={`${search("CSS")}&orderby=popularity`}>CSS</Link>
            </nav>
            <BookCarousel>
              {catalogue.bestsellers.map((book) => (
                <ShowcaseCard
                  key={book.id}
                  book={book}
                  photograph={shot(book.id)}
                />
              ))}
            </BookCarousel>
            <p className="catalogue-note">
              Selected using the store’s popularity order. Browse a subject to
              explore its collection in the bookshop.
            </p>
          </div>
        </section>
        <section
          id="exams"
          className="exam-section exam-final"
          data-section="08-exams"
        >
          <div className="container exam-grid">
            <div className="exam-copy">
              <p className="eyebrow">Prepare with the best</p>
              <p className="exam-pretitle">Your Complete Guide for</p>
              <h2>
                Judicial Service
                <br />
                <span>Examination</span>
              </h2>
              <p>
                Prepare for judicial service with From Bar to Bench — the Civil
                Judge-cum-Judicial Magistrate Guide 2026. Subjective
                preparation, MCQs and solved past papers in one resource.
              </p>
              <div className="hero-buttons">
                <Button href={`/products/${exam.id}`} variant="gold">
                  Explore the Book
                </Button>
                <Button
                  href={`https://wa.me/923080060188?text=${encodeURIComponent(`Hello, could you share sample pages of the Civil Judge-cum-Judicial Magistrate Guide 2026? Catalogue no. ${exam.id}`)}`}
                  variant="outline"
                >
                  Request Sample Pages
                </Button>
              </div>
              <div className="exam-assurances">
                <span>
                  <Icon name="book" />
                  Subjective &amp; MCQs
                </span>
                <span>
                  <Icon name="check" />
                  2026 Edition
                </span>
                <span>
                  <Icon name="truck" />
                  Nationwide Delivery
                </span>
              </div>
            </div>
            <Link
              className="exam-cover exam-presentation"
              href={`/products/${exam.id}`}
            >
              <Image
                src="/images/exam-presentation.webp"
                alt="From Bar to Bench judicial examination guide — promotional artwork"
                fill
                sizes="(max-width: 600px) 100vw, 35vw"
              />
            </Link>
            <div className="exam-features">
              {[
                {
                  icon: "building" as const,
                  title: "Civil Judge Guide",
                  text: "A comprehensive resource for judicial examination preparation.",
                },
                {
                  icon: "file" as const,
                  title: "Subjective & Objective",
                  text: "Topic-wise study material, MCQs and solved past papers.",
                },
                {
                  icon: "cap" as const,
                  title: "2026 Edition",
                  text: "LHC syllabus coverage, case law and citations updated for 2026.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <span className="medallion">
                    <Icon name={item.icon} />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          id="about"
          className="why-section why-redesign"
          data-section="09-why"
        >
          <div className="container why-new-layout">
            <div className="why-photo-panel">
              <Image
                src="/images/why-new-left.webp"
                alt=""
                fill
                sizes="(max-width: 800px) 100vw, 44vw"
              />
              <div className="why-photo-badge">
                <span className="medallion medallion-light">
                  <Icon name="check" />
                </span>
                <div>
                  <strong>Dedicated to Legal Knowledge</strong>
                  <span>For students &amp; professionals</span>
                </div>
              </div>
            </div>
            <div className="why-new-content">
              <SectionHeading
                eyebrow="Our advantages"
                title={
                  <>
                    Your Trusted Source
                    <br />
                    for Legal Knowledge
                  </>
                }
              >
                Legal books, practical resources and personal assistance for
                students, professionals and institutions across Pakistan.
              </SectionHeading>
              <div className="why-new-cards">
                {[
                  {
                    icon: "check" as const,
                    title: "Legal Publications",
                    text: "Explore legal texts and editions from the PLBH catalogue.",
                    href: `/products`,
                  },
                  {
                    icon: "truck" as const,
                    title: "Nationwide Delivery",
                    text: "Delivery across Pakistan. Contact the team for shipping details.",
                    href: `/contact`,
                  },
                  {
                    icon: "book" as const,
                    title: "Wide Collection",
                    text: "From bare acts to commentaries, exam guides and subject-wise books.",
                    href: `/products`,
                  },
                  {
                    icon: "chat" as const,
                    title: "Personal Support",
                    text: "Speak with the bookshop for help finding your next legal resource.",
                    href: "https://wa.me/923080060188",
                  },
                ].map((item) => (
                  <Link
                    className="advantage-card"
                    href={item.href}
                    key={item.title}
                  >
                    <span className="medallion medallion-light">
                      <Icon name={item.icon} />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                    <span className="advantage-arrow">
                      <Icon name="arrow" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="why-facts">
              <Link href="/products">
                <span className="medallion medallion-light">
                  <Icon name="book" />
                </span>
                <span>
                  <strong>Legal Titles</strong>
                  <small>Explore the catalogue</small>
                </span>
              </Link>
              <Link href={`/collections/exam-guides`}>
                <span className="medallion medallion-light">
                  <Icon name="cap" />
                </span>
                <span>
                  <strong>Exam Guides</strong>
                  <small>Prepare for your next step</small>
                </span>
              </Link>
              <Link href={`/contact`}>
                <span className="medallion medallion-light">
                  <Icon name="pin" />
                </span>
                <span>
                  <strong>Across Pakistan</strong>
                  <small>Delivery enquiries</small>
                </span>
              </Link>
              <Link href={`/about`}>
                <span className="medallion medallion-light">
                  <Icon name="building" />
                </span>
                <span>
                  <strong>Here in Lahore</strong>
                  <small>Discover our story</small>
                </span>
              </Link>
            </div>
          </div>
        </section>
        <section
          className="testimonials-section section"
          data-section="10-testimonials"
        >
          <div className="container">
            <SectionHeading
              dark
              eyebrow="Voices from the legal community"
              title={
                <>
                  What Our <em>Readers Say</em>
                </>
              }
            >
              A place for the experiences behind every bookshelf.
            </SectionHeading>
            <div className="review-grid">
              {["Law students", "Legal professionals", "Exam candidates"].map(
                (label) => (
                  <article className="review-card" key={label}>
                    <span className="quote-mark" aria-hidden="true">
                      “
                    </span>
                    <p className="review-placeholder">
                      Verified reader stories
                      <br />
                      will appear here.
                    </p>
                    <div className="review-person">
                      <span className="review-avatar">
                        <Icon name="user" />
                      </span>
                      <div>
                        <h3>{label}</h3>
                        <p>Preview · Review pending</p>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
            <p className="review-note">
              Design preview — no customer testimonials have been published.
            </p>
          </div>
        </section>
        <section
          className="newsletter-section section"
          data-section="11-newsletter"
        >
          <div className="container">
            <SectionHeading
              dark
              eyebrow="Stay informed"
              title={
                <>
                  Join Our <em>Legal Community</em>
                </>
              }
            >
              A future home for new arrivals, reading recommendations
              <br className="desktop-break" /> and updates from the bookshop.
            </SectionHeading>
            <Newsletter />
            <div className="newsletter-benefits">
              <span>
                <Icon name="book" />
                New Arrivals
              </span>
              <span>
                <Icon name="mail" />
                Bookshop News
              </span>
              <span>
                <Icon name="scale" />
                Legal Reading
              </span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
