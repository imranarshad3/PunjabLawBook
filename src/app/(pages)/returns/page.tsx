import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";
export const metadata: Metadata = {
  title: "Returns & Order Support | Punjab Law Book House",
};
export default function Page() {
  return (
    <InformationPage
      title="A little assistance."
      accent="When you need it."
      intro="A clear place for order questions, with the full online returns process to follow when ordering opens."
      sections={[
        {
          title: "Online orders are not active yet",
          body: "This website currently supports browsing and local book selections. It has not accepted any online orders, and its checkout preview cannot submit a purchase.",
        },
        {
          title: "Before placing an order",
          body: "Confirm the title, edition, language and binding with the team. The front-cover view and catalogue reference on each product page can help identify the book you need.",
        },
        {
          title: "Returns information",
          body: "Return eligibility, time limits, shipping responsibilities and refund methods will be published before online ordering is activated. No return or refund promise is made by the current preview.",
        },
        {
          title: "Speak with the team",
          body: "For a question about a book or a purchase made through another channel, contact the team directly with the relevant title and purchase details. Avoid including payment-card information or passwords in your message.",
        },
      ]}
    />
  );
}
