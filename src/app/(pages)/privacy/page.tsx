import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";
export const metadata: Metadata = {
  title: "Privacy Information | Punjab Law Book House",
};
export default function Page() {
  return (
    <InformationPage
      title="Privacy information."
      accent="Your browsing, explained."
      intro="A plain-language description of the information used by this website in its current frontend milestone."
      sections={[
        {
          title: "Your book bag and saved titles",
          body: "This website stores selected book identifiers and quantities, and saved-book identifiers, in your browser’s local storage. They remain on this device. You can remove titles on the book-bag and saved-books pages, or clear your browser’s site data to remove them all.",
        },
        {
          title: "Enquiries you choose to send",
          body: "The Contact and Request a Book forms prepare a message in your browser. The website does not submit that message to a backend. If you choose Continue in WhatsApp, your prepared message is included in a WhatsApp link; review it there before sending. WhatsApp handles information under its own policies.",
        },
        {
          title: "Accounts and payments",
          body: "Account registration, sign-in and online ordering are not active in this milestone. Their form fields are disabled. This website does not currently collect account passwords, payment-card details or delivery addresses.",
        },
        {
          title: "Browsing and hosting",
          body: "Images and fonts are served by this website. No advertising or analytics tracker is configured in the application. The hosting service may process technical request information, such as IP addresses and request logs, to deliver and protect the website.",
        },
        {
          title: "External services",
          body: "WhatsApp, phone and map links are optional actions. Opening an external service brings its own information-handling practices into use. Product browsing, saved books and the book bag work without opening those services.",
        },
        {
          title: "Future services and questions",
          body: "This information will need to be updated before accounts, orders, payments or other data-processing services are activated. Contact our team with questions about the current website.",
        },
      ]}
    />
  );
}
