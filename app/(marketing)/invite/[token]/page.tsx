import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hashToken, acceptInvitation } from "@/lib/org/seats";
import { OrgError } from "@/lib/org/access";

export const metadata = { title: "Invitation — KiwiPilotPrep" };

/**
 * Accepting a flight school invitation (§18).
 *
 * The link carries a raw token; only its hash is stored, so a database leak
 * does not yield working invitations. The invitation is bound to one email
 * address, checked at acceptance.
 */
export default async function InvitePage({
  params, searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const user = await getCurrentUser();

  const invitation = await db.organizationInvitation.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { organization: { select: { name: true } } },
  });

  async function accept() {
    "use server";
    const signedIn = await getCurrentUser();
    if (!signedIn) redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);

    try {
      const result = await acceptInvitation({
        token,
        userId: signedIn.id,
        email: signedIn.email,
      });

      // Accepting proves control of the inbox: the token only ever existed in
      // a message sent to this address, and the invitation only accepts a
      // matching one. Asking a flight school's student to confirm the same
      // address a second time would be friction for nothing.
      if (!signedIn.emailVerifiedAt) {
        await db.user.update({
          where: { id: signedIn.id },
          data: { emailVerifiedAt: new Date(), verifyTokenHash: null, verifyTokenExpiresAt: null },
        });
      }

      redirect(`/org/${result.organizationId}`);
    } catch (e) {
      if (e instanceof OrgError) {
        redirect(`/invite/${token}?error=${encodeURIComponent(e.message)}`);
      }
      throw e;
    }
  }

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">Invitation</div>
          <h1 className="h2">
            {invitation ? `Join ${invitation.organization.name}` : "Invitation not found"}
          </h1>
        </div>

        {error && <p className="fnote on warn" role="alert">{error}</p>}

        {!invitation ? (
          <div className="empty panel mt-l">
            <b>This invitation link is not valid</b>
            It may have been revoked or already used. Ask your flight school to send a new one.
          </div>
        ) : invitation.status !== "PENDING" ? (
          <div className="empty panel mt-l">
            <b>This invitation is {invitation.status.toLowerCase()}</b>
            Ask your flight school to send a new invitation.
          </div>
        ) : invitation.expiresAt <= new Date() ? (
          <div className="empty panel mt-l">
            <b>This invitation has expired</b>
            It was valid until {invitation.expiresAt.toLocaleDateString("en-NZ")}.
          </div>
        ) : (
          <div className="panel mt-l">
            <div className="panel-hd"><h2>Accept your invitation</h2></div>
            <div className="panel-bd">
              <table className="atable" style={{ marginBottom: "18px" }}>
                <tbody>
                  <tr><td className="nm">Flight school</td><td>{invitation.organization.name}</td></tr>
                  <tr><td className="nm">Invited address</td><td>{invitation.email}</td></tr>
                  <tr><td className="nm">Valid until</td><td>{invitation.expiresAt.toLocaleDateString("en-NZ")}</td></tr>
                </tbody>
              </table>

              {!user ? (
                <>
                  <p className="small" style={{ marginBottom: "14px" }}>
                    Sign in as <b>{invitation.email}</b> to accept, or create an account with that
                    address first.
                  </p>
                  <div className="acts">
                    <Link className="btn btn-p" href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}>Log in</Link>
                    <Link className="btn btn-g" href={`/signup?next=${encodeURIComponent(`/invite/${token}`)}`}>Create an account</Link>
                  </div>
                </>
              ) : user.email.toLowerCase() !== invitation.email.toLowerCase() ? (
                <div className="cnote warning">
                  <b>Signed in as a different address</b>
                  <p>
                    This invitation was sent to {invitation.email}, but you are signed in as{" "}
                    {user.email}. Sign in with the invited address to accept it.
                  </p>
                </div>
              ) : (
                <form action={accept}>
                  <button className="btn btn-p btn-w" type="submit">
                    Join {invitation.organization.name}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
