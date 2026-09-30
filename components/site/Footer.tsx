export default function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-top">
          <div>
            <a className="brand" href="#top">
              <span className="mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--on-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 L14.2 9.4 L22 12 L14.2 14.6 L12 22 L9.8 14.6 L2 12 L9.8 9.4 Z" />
                </svg>
              </span>
              <span><span className="bn">KiwiPilotPrep</span><span className="bs">Pilot Theory Prep</span></span>
            </a>
            <p className="ft-about">Exam-focused preparation for Aspeq PPL, CPL and IR theory exams — built from real
              student exam recalls. By a student pilot, for student pilots.</p>
            <div className="ft-soc">
              <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.2 6.8h.01" /></svg></a>
              <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 8.5h2.5V5h-2.5a3.5 3.5 0 0 0-3.5 3.5V11H9v3.5h2V21h3.5v-6.5H17l.5-3.5h-3V9a.5.5 0 0 1 .5-.5z" /></svg></a>
              <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10.5 9.5l4.5 2.5-4.5 2.5z" /></svg></a>
              <a href="#" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3.6 7l8.4 6 8.4-6" /></svg></a>
            </div>
          </div>

          <div className="ft-col">
            <h3>Courses</h3>
            <a href="#courses">PPL Subjects</a>
            <a href="#courses">CPL Subjects</a>
            <a href="#courses">IR Subjects</a>
            <a href="#courses">Flight Test Groundwork</a>
            <a href="#mocks">Mock Exams</a>
            <a href="/trial">Free 10-Question Mock</a>
          </div>

          <div className="ft-col">
            <h3>Platform</h3>
            <a href="#how">How It Works</a>
            <a href="#guarantee">First-Attempt Guarantee</a>
            <a href="/flight-schools">Flight Schools</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="ft-col">
            <h3>Company</h3>
            <a href="#about">About</a>
            <a href="#story">Our Story</a>
            <a href="#contact">Contact</a>
            <a href="#contact">Support</a>
            <a href="/login">Log In</a>
          </div>
        </div>

        <div className="ft-bot">
          {/* TODO BEFORE LAUNCH — add the registered legal entity name, its
              NZBN / company number, and a public contact email. Required for
              NZ Fair Trading / Consumer Guarantees Act and India's DPDP Act.
              e.g. "Operated by <Entity> Ltd (NZBN 9429000000000)". */}
          <span>© 2026 KiwiPilotPrep · Aotearoa New Zealand · <a href="/contact">Contact us</a></span>
          <div className="lg">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/refunds">Refunds</a>
            <a href="/cookies">Cookies</a>
            <a href="#guarantee">Guarantee Terms</a>
          </div>
        </div>

        {/* PRD 1.2 — mandated disclaimer, verbatim */}
        <div className="ftdisc">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.2h.01" /></svg>
          <p><b>Disclaimer:</b> KiwiPilotPrep is an independent educational tool. Not affiliated with Aspeq or CAANZ.</p>
        </div>

        <p className="ft-note">KiwiPilotPrep does not deliver official examinations — all examinations are sat through
          the official examination provider. Guarantee
          eligibility criteria and refund conditions apply.</p>
      </div>
    </footer>
  );
}
