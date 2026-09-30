import { requireRole } from "@/lib/auth";
import ContactInbox from "@/components/admin/ContactInbox";

export const metadata = { title: "General queries — Admin" };

/**
 * Everything else that comes through the contact form.
 *
 * General enquiries, flight school approaches and reports of a question
 * being wrong. Guarantee claims are deliberately not here: they have their
 * own process and their own page.
 */
export default async function AdminQueriesPage() {
  await requireRole("ADMIN");

  return (
    <>
      <div className="ahead">
        <div>
          <h1>General Queries</h1>
          <p>
            Contact form submissions that are not guarantee claims: general enquiries, flight
            school approaches, and reports that a question is wrong.
          </p>
        </div>
      </div>

      <ContactInbox
        topics={["GENERAL", "ENTERPRISE", "QUESTION_ERROR"]}
        emptyTitle="No messages yet"
        emptyHint="Enquiries sent through the contact page arrive here."
      />
    </>
  );
}
