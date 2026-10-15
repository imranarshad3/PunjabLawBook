import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";
export const metadata: Metadata = {
  title: "Delivery Information | Punjab Law Book House",
};
export default function Page() {
  return (
    <InformationPage
      title="From our shelf."
      accent="To your next chapter."
      intro="We serve readers across Pakistan. Here is what to know while online ordering is being prepared."
      sections={[
        {
          title: "Delivery across Pakistan",
          body: "Contact the team with your location and the titles you need to discuss delivery options. This frontend does not currently accept delivery bookings or online orders.",
        },
        {
          title: "Charges and timing",
          body: "Delivery charges and estimates will depend on the destination and the books ordered. No free-shipping threshold or delivery guarantee is currently offered on this website.",
        },
        {
          title: "Your delivery details",
          body: "The checkout page includes a preview of the delivery form. Its fields remain inactive until secure ordering is connected; delivery addresses are not collected by this website yet.",
        },
        {
          title: "A question before your next order?",
          body: "Use our Contact page to prepare an enquiry or call the team. Include the book title and city to help us answer your question.",
        },
      ]}
    />
  );
}
