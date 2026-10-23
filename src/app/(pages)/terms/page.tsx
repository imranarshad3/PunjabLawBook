import { CmsPage } from "@/components/cms-page";
import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";
export const metadata: Metadata = {
  title: "Website Terms | Punjab Law Book House",
};
function Page() {
  return (
    <InformationPage
      title="Website terms."
      accent="A clear starting point."
      intro="Information about browsing the collection, using your account and submitting an order."
      sections={[
        {
          title: "Browsing the collection",
          body: "You can explore books and collections, create a local book bag and save titles on this device. These selections are not orders, reservations or confirmation of availability.",
        },
        {
          title: "Catalogue information",
          body: "The displayed collection is based on supplied catalogue information. Prices, editions and availability may change. Styled book photographs are presentation images; use the front-cover view and contact our team to confirm the title or edition you need.",
        },
        {
          title: "Accounts and checkout",
          body: "You can create an account and submit cash-on-delivery orders at checkout. An order reference records your request. The team will confirm availability and delivery details before dispatch. Online card payments are not enabled.",
        },
        {
          title: "Contacting the team",
          body: "Submitting an enquiry records your request for the team. You can also choose to open WhatsApp, review the prepared message and send it yourself. A book enquiry does not reserve stock or place an order.",
        },
        {
          title: "Delivery and support",
          body: "Delivery charges and dispatch arrangements are confirmed by the team. Contact us with your order reference for changes, cancellations or return questions before dispatching any books back.",
        },
      ]}
    />
  );
}

export default function PublishedPage() {
  return <CmsPage path="/terms"><Page /></CmsPage>;
}
