const updated = 'August 9, 2026'

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#05030a', color: 'white', padding: '56px 24px' }}>
      <section style={{ maxWidth: '840px', margin: '0 auto', lineHeight: 1.75 }}>
        <p style={{ letterSpacing: '0.28em', opacity: 0.62, margin: 0 }}>AURASPANSE</p>
        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 4.8rem)', margin: '10px 0 8px' }}>Terms of Service</h1>
        <p style={{ opacity: 0.7, marginTop: 0 }}>Last updated: {updated}</p>

        <p>
          These Terms govern your use of AuraSpanse, Auracle, and related aura-reading features, pages,
          checkout flows, and emails. By using the app, you agree to these Terms.
        </p>

        <h2>Entertainment digital product</h2>
        <p>
          Auracle generates creative digital aura readings using birth date, zodiac, birthstone resonance,
          color-emotion mappings, and time-based calculations. Readings are provided for entertainment,
          reflection, and personal insight only.
        </p>

        <h2>Eligibility</h2>
        <p>
          You must be at least 13 years old to use the service. If you are under the age of majority where you live,
          use the service only with permission from a parent or guardian.
        </p>

        <h2>Payments</h2>
        <p>
          Paid AuraSpectrum readings may be offered as a one-time digital product, including a $1 reading.
          Payment is processed through Stripe. Prices may change at any time before purchase.
        </p>

        <h2>Refund policy</h2>
        <p>
          Because paid readings are digital products delivered instantly or shortly after purchase, all sales are
          final unless required otherwise by law or unless we choose to make an exception.
        </p>

        <h2>Acceptable use</h2>
        <p>
          Do not misuse the app, interfere with checkout or email systems, attempt unauthorized access,
          submit fraudulent payments, scrape the service, or use the app in a way that violates law or platform rules.
        </p>

        <h2>Intellectual property</h2>
        <p>
          AuraSpanse, Auracle, the AuraSpectrum concept, color-emotion database, visual design, reading language,
          and related creative materials are owned by AuraSpanse or its creator unless otherwise stated.
        </p>

        <h2>No warranties</h2>
        <p>
          The service is provided as is and as available. We do not promise that readings will be uninterrupted,
          error-free, or suitable for any particular purpose.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these Terms can be sent to <a style={{ color: '#10c8c0' }} href="mailto:kris24guy@gmail.com">kris24guy@gmail.com</a>.
        </p>
      </section>
    </main>
  )
}
