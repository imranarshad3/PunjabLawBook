import { CmsPage } from "@/components/cms-page";
import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";
export const metadata: Metadata = {
  title: "Privacy Information",
};
function Page() {
  return (
    <InformationPage
      title="Privacy information."
      accent="Your browsing, explained."
      intro="A plain-language description of the information used when browsing, contacting us and placing an order."
      sections={[
        {
          title: "Your book bag and saved titles",
          body: "This website stores selected book identifiers and quantities, and saved-book identifiers, in your browser’s local storage. They remain on this device. You can remove titles on the book-bag and saved-books pages, or clear your browser’s site data to remove them all.",
        },
        {
          title: "Enquiries you choose to send",
          body: "Enquiry forms record the details you submit so the team can respond. If you continue in WhatsApp, the prepared message is included in a WhatsApp link for you to review and send. WhatsApp handles information under its own policies.",
        },
        {
          title: "Accounts and payments",
          body: "Clerk provides account registration and sign-in. Orders store your name, contact details, delivery address and selected books in Supabase so the team can fulfil them. Reviews store your displayed name, rating and comment for moderation. Online card payments are not enabled; this website does not collect card details.",
        },
        {
          title: "Browsing and hosting",
          body: "Images are served by the website and Supabase storage, and fonts are served by the website. Hosting and authentication services may process technical request information to deliver and protect these services.",
        },
        {
          title: "External services",
          body: "WhatsApp, phone and map links are optional actions. Opening an external service brings its own information-handling practices into use. Product browsing, saved books and the book bag work without opening those services.",
        },
        {
          title: "Future services and questions",
          body: "Contact the team with questions about your account, orders, enquiries or published reviews, or to request help correcting your details.",
        },
      ]}
    />
  );
}

export default function PublishedPage() {
  return <CmsPage path="/privacy"><Page /></CmsPage>;
}
