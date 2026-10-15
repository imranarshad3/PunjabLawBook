import Link from "next/link";
export function PageIntro({
  label,
  eyebrow,
  title,
  accent,
  description,
}: {
  label: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
}) {
  return (
    <section className="inner-hero">
      <div className="container">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span aria-current="page">{label}</span>
        </nav>
        <div className="inner-hero-copy">
          <p className="shop-kicker">{eyebrow}</p>
          <h1>
            {title}
            <br />
            <em>{accent}</em>
          </h1>
          <p>{description}</p>
        </div>
        <span className="inner-hero-monogram" aria-hidden="true">
          PLBH
        </span>
      </div>
    </section>
  );
}
