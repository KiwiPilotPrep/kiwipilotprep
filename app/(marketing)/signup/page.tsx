import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { safeNextPath } from "@/lib/safe-next";
import { createSession, getCurrentUser, hashPassword } from "@/lib/auth";
import { rateLimit, actionKey } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/verification";
import { checkPassword } from "@/lib/password-policy";
import { rememberFields, echoedFields, clearFields } from "@/lib/form-echo";
import PasswordField from "@/components/auth/PasswordField";

export const metadata = { title: "Create your account — KiwiPilotPrep" };

async function signup(formData: FormData) {
  "use server";

  // Where they were heading before they were asked to make an account. Kept
  // relative so it can never be turned into an open redirect.
  const raw = String(formData.get("next") ?? "");
  const next = safeNextPath(raw);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  // Whatever was typed comes back with the rejection. The password never
  // does: it is the one field that has to be entered again.
  const keep = async () => rememberFields("/signup", { name, email });

  if (name.length < 2) {
    await keep();
    redirect("/signup?error=name");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    await keep();
    redirect("/signup?error=email");
  }
  // Explicit agreement to the terms and privacy policy, recorded server-side
  // rather than assumed. DPDP and good practice both want a clear, affirmative
  // act, so an un-ticked box stops the sign-up.
  if (formData.get("consent") !== "on") {
    await keep();
    redirect("/signup?error=consent");
  }
  // The policy, applied server-side. The form shows the same rules as you
  // type, but that is only a courtesy — this is what decides.
  const strength = checkPassword(password, { name, email });
  if (!strength.ok) {
    await keep();
    redirect(`/signup?error=password&detail=${encodeURIComponent(strength.message)}`);
  }

  // Deliberately loose. A flight school class signing up together arrives from
  // one NAT address, and a cap tight enough to be interesting to an attacker
  // would lock out the second half of the room. Twenty an hour still stops
  // scripted account creation and free-trial farming, which is what this is
  // actually for; per-account abuse is caught elsewhere.
  const bySource = await rateLimit(await actionKey("signup:ip"), {
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (!bySource.ok) {
    await keep();
    redirect("/signup?error=throttled");
  }

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    await keep();
    redirect("/signup?error=taken");
  }

  const user = await db.user.create({
    data: { name, email, passwordHash: await hashPassword(password), role: "STUDENT" },
  });
  await clearFields("/signup");

  // Sign them in straight away. Making the session wait on the inbox would
  // strand anyone whose mail is slow or spam-foldered; the confirmation is
  // enforced at the trial and the checkout instead, where it matters.
  await createSession(user.id);

  // A mail provider being down must not cost us the account that was just
  // created. The person lands on the same page either way and can resend.
  // Honest about delivery: if the provider rejected the message, the next
  // page offers a retry rather than telling someone to check an inbox nothing
  // was sent to (§19).
  const delivery = await sendVerificationEmail(user).catch(() => ({
    delivered: false,
    logged: false,
  }));

  const query = new URLSearchParams();
  if (!delivery.delivered && !delivery.logged) query.set("send", "failed");
  if (next) query.set("next", next);

  redirect(`/verify/sent${query.size ? `?${query}` : ""}`);
}

const MESSAGES: Record<string, string> = {
  name: "Please enter your full name.",
  email: "Please enter a valid email address.",
  password: "That password does not meet the requirements below.",
  consent: "Please agree to the Terms and Privacy Policy to create your account.",
  taken: "An account with that email already exists — try logging in.",
  throttled: "Too many sign-up attempts from this connection. Please try again later.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; detail?: string; next?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { error, detail, next } = await searchParams;
  // Only present straight after a rejection, so a fresh visit starts empty.
  const typed = error ? await echoedFields() : {};
  const safeNext = safeNextPath(next);

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">Free account</div>
          <h1 className="h2">Create your KiwiPilotPrep account.</h1>
          <p className="lede mt-s">
            No card required. Confirm your email and your free practice questions unlock
            straight away.
          </p>
        </div>

        <form className="cform r in mt-l" action={signup}>
          {safeNext && <input type="hidden" name="next" value={safeNext} />}

          {error && (
            <p className="fnote on warn" role="alert">
              {detail ?? MESSAGES[error] ?? "Please check the form and try again."}
            </p>
          )}

          <div className="fld">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={typed.name ?? ""}
              required
            />
          </div>

          <div className="fld">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={typed.email ?? ""}
              required
            />
          </div>

          <PasswordField />

          <label className="consent">
            <input type="checkbox" name="consent" value="on" required />
            <span>
              I agree to the{" "}
              <Link href="/terms" target="_blank">Terms</Link> and{" "}
              <Link href="/privacy" target="_blank">Privacy Policy</Link>, and to KiwiPilotPrep
              processing my details to run my account.
            </span>
          </label>

          <button className="btn btn-p btn-w" type="submit">
            Create Account
          </button>

          <p className="fhint" style={{ marginTop: "16px", textAlign: "center" }}>
            Already registered?{" "}
            <Link href={safeNext ? `/login?next=${encodeURIComponent(safeNext)}` : "/login"}>
              Log in
            </Link>
            .
          </p>
        </form>
      </div>
    </section>
  );
}
