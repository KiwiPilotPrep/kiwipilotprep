import ContactForm from "@/components/site/ContactForm";

export const metadata = { title: "Contact — KiwiPilotPrep", alternates: { canonical: "/contact" } };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  const allowed = ["general", "enterprise", "error", "refund"];
  return <ContactForm initialSubject={allowed.includes(subject ?? "") ? subject : ""} />;
}
