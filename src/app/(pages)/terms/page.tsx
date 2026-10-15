import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";
export const metadata: Metadata = {
  title: "Website Terms | Punjab Law Book House",
};
export default function Page() {
  return (
    <InformationPage
      title="Website terms."
      accent="A clear starting point."
      intro="Information about using this website during its current frontend milestone. Ordering terms will be finalized before sales are activated."
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
          title: "Checkout and account previews",
          body: "The checkout and account pages show the planned experience. They do not accept orders, process payments or create accounts. No order confirmation or account access is issued by this website in the current milestone.",
        },
        {
          title: "Contacting the team",
          body: "Preparing an enquiry does not send it. You can choose to open WhatsApp, review the message and send it yourself. A book enquiry is not an online purchase.",
        },
        {
          title: "Before ordering opens",
          body: "Payment methods, delivery charges, order acceptance and cancellation or return information must be finalized before online ordering is enabled. Please refer to the current information here or contact the team if you have a question.",
        },
      ]}
    />
  );
}
