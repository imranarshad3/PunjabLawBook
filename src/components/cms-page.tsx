import type { ReactNode } from "react";
import { getContentPage } from "@/lib/content-pages";
import { PageIntro } from "./page-intro";

/** Published plain text replaces the default page. Drafts retain the template. */
export async function CmsPage({ path, children }: { path: string; children: ReactNode }) {
  const page = await getContentPage(path);
  if (!page?.body?.trim()) return children;
  return <main id="main" className="inner-page">
    <PageIntro label={page.title} eyebrow="PUNJAB LAW BOOK HOUSE" title={page.title} accent="" description={page.description || ""} />
    <section className="container information-copy" style={{ paddingBlock: "3rem", maxWidth: "860px" }}>
      {page.body.split(/\n\s*\n/).filter(Boolean).map((paragraph: string, index: number) => <p key={index} style={{ whiteSpace: "pre-line" }}>{paragraph}</p>)}
    </section>
  </main>;
}
