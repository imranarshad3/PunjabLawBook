import { CmsPage } from "@/components/cms-page";
import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";
export const metadata: Metadata = {
  title: "Returns & Order Support",
};
function Page() {
  return (
    <InformationPage
      title="A little assistance."
      accent="When you need it."
      intro="A clear place for questions about your books, delivery and order support."
      sections={[
        {
          title: "Questions about an order",
          body: "Sign in to your account to view orders placed while signed in. Contact the team with your order reference if you need an update or correction.",
        },
        {
          title: "Before placing an order",
          body: "Confirm the title, edition, language and binding with the team. The front-cover view and catalogue reference on each product page can help identify the book you need.",
        },
        {
          title: "Returns information",
          body: "Contact the team with your order reference and a description of the issue to discuss return eligibility, shipping responsibilities and next steps before sending any books back.",
        },
        {
          title: "Speak with the team",
          body: "For a question about a book or a purchase made through another channel, contact the team directly with the relevant title and purchase details. Avoid including payment-card information or passwords in your message.",
        },
      ]}
    />
  );
}

export default function PublishedPage() {
  return <CmsPage path="/returns"><Page /></CmsPage>;
}
