const updated = 'August 9, 2026'

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#05030a', color: 'white', padding: '56px 24px' }}>
      <section style={{ maxWidth: '840px', margin: '0 auto', lineHeight: 1.75 }}>
        <p style={{ letterSpacing: '0.28em', opacity: 0.62, margin: 0 }}>AURASPANSE</p>
        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 4.8rem)', margin: '10px 0 8px' }}>Privacy Policy</h1>
        <p style={{ opacity: 0.7, marginTop: 0 }}>Last updated: {updated}</p>

        <p>
          AuraSpanse and Auracle respect your privacy. This policy explains what information we collect,
          how we use it, and the choices you have when using the Auracle aura-reading experience.
        </p>

        <h2>Information we collect</h2>
        <p>
          We may collect your birth date, email address, name if you provide it, registration date,
          payment status, checkout metadata, device/browser information, cookies, analytics events,
          and the aura-reading results generated from your submitted information.
        </p>

        <h2>How we use information</h2>
        <p>
          We use this information to generate your AuraSpectrum reading, deliver paid digital readings by email,
          process checkout, prevent abuse, improve the app, measure ad performance, and provide customer support.
        </p>

        <h2>Payments and email delivery</h2>
        <p>
          Payments are processed by Stripe. We do not store full card numbers. Reading emails may be sent through
          Resend or another email delivery provider. These providers process information only as needed to provide
          their services to us.
        </p>

        <h2>Cookies, analytics, and ads</h2>
        <p>
          If enabled, we may use cookies, Google Analytics, Meta Pixel, conversion tracking, and similar tools to
          understand traffic, improve performance, and measure advertising. You can control cookies through your
          browser settings and any cookie banner shown in the app.
        </p>

        <h2>California and privacy rights</h2>
        <p>
          Depending on your location, including California, you may have rights to request access, deletion,
          correction, or a copy of personal information we maintain about you. You may also opt out of certain
          sharing or targeted advertising where applicable.
        </p>

        <h2>Data retention</h2>
        <p>
          We keep information only as long as reasonably needed for the purposes above, including legal,
          accounting, fraud-prevention, and support needs.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy requests, contact us at <a style={{ color: '#10c8c0' }} href="mailto:kris24guy@gmail.com">kris24guy@gmail.com</a>.
        </p>
      </section>
    </main>
  )
}
