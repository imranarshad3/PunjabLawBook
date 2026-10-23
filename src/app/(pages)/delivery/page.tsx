import { CmsPage } from "@/components/cms-page";
import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";
export const metadata: Metadata = {
  title: "Delivery Information",
};
function Page() {
  return (
    <InformationPage
      title="From our shelf."
      accent="To your next chapter."
      intro="We serve readers across Pakistan. Here is what to know when ordering your next books."
      sections={[
        {
          title: "Delivery across Pakistan",
          body: "Add books to your bag and enter your name, phone number, city and address at checkout. The team will confirm your order and delivery arrangements by phone before dispatch.",
        },
        {
          title: "Charges and timing",
          body: "Delivery charges and estimates will depend on the destination and the books ordered. No free-shipping threshold or delivery guarantee is currently offered on this website.",
        },
        {
          title: "Your delivery details",
          body: "Check your phone number, address and city carefully at checkout. Sign in before placing your order to see its details and progress in your account.",
        },
        {
          title: "A question before your next order?",
          body: "Use our Contact page to prepare an enquiry or call the team. Include the book title and city to help us answer your question.",
        },
      ]}
    />
  );
}

export default function PublishedPage() {
  return <CmsPage path="/delivery"><Page /></CmsPage>;
}
