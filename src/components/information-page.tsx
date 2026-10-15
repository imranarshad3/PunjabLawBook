import Link from "next/link";
import { PageIntro } from "./page-intro";
export function InformationPage({
  title,
  accent,
  intro,
  sections,
}: {
  title: string;
  accent: string;
  intro: string;
  sections: { title: string; body: string }[];
}) {
  return (
    <main id="main" className="inner-page">
      <PageIntro
        label={title}
        eyebrow="CLARITY AT EVERY STEP"
        title={title}
        accent={accent}
        description={intro}
      />
      <section className="container help-layout information-layout">
        <aside>
          <p className="shop-kicker">USEFUL INFORMATION</p>
          <Link href="/help">Help & frequently asked questions</Link>
          <Link href="/delivery">Delivery information</Link>
          <Link href="/returns">Returns & order support</Link>
          <Link href="/privacy">Privacy information</Link>
          <Link href="/terms">Website terms</Link>
          <Link className="button button-green" href="/contact">
            Contact us
          </Link>
        </aside>
        <article className="information-copy">
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          <p className="information-date">
            Website information · Updated 15 October 2026
          </p>
        </article>
      </section>
    </main>
  );
}
