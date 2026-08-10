const updated = 'August 9, 2026'

export default function CookiesPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#05030a', color: 'white', padding: '56px 24px' }}>
      <section style={{ maxWidth: '840px', margin: '0 auto', lineHeight: 1.75 }}>
        <p style={{ letterSpacing: '0.28em', opacity: 0.62, margin: 0 }}>AURASPANSE</p>
        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 4.8rem)', margin: '10px 0 8px' }}>Cookie Policy</h1>
        <p style={{ opacity: 0.7, marginTop: 0 }}>Last updated: {updated}</p>

        <p>
          This Cookie Policy explains how AuraSpanse and Auracle may use cookies and similar technologies
          to operate the app, improve performance, and measure advertising.
        </p>

        <h2>What cookies are</h2>
        <p>
          Cookies are small files stored on your device. Similar tools include pixels, tags, local storage,
          and software development kits that help websites remember settings or measure activity.
        </p>

        <h2>How we may use cookies</h2>
        <p>
          We may use essential cookies for site functionality, analytics cookies to understand usage,
          and advertising cookies to measure campaigns and conversions.
        </p>

        <h2>Analytics and advertising tools</h2>
        <p>
          If enabled, AuraSpanse may use Google Analytics, Meta Pixel, conversion tracking, UTM parameters,
          and similar services. These tools may help us understand visits, checkout activity, ad performance,
          and whether users complete a paid reading.
        </p>

        <h2>Your choices</h2>
        <p>
          You can manage cookies through your browser settings. Where required, we may show a cookie banner
          that lets you accept or reject non-essential cookies. Blocking some cookies may affect site features
          or measurement.
        </p>

        <h2>Updates</h2>
        <p>
          We may update this policy if our cookie, analytics, or advertising tools change.
        </p>

        <h2>Contact</h2>
        <p>
          Questions can be sent to <a style={{ color: '#10c8c0' }} href="mailto:kris24guy@gmail.com">kris24guy@gmail.com</a>.
        </p>
      </section>
    </main>
  )
}
