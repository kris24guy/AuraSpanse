const updated = 'August 9, 2026'

export default function DisclaimerPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#05030a', color: 'white', padding: '56px 24px' }}>
      <section style={{ maxWidth: '840px', margin: '0 auto', lineHeight: 1.75 }}>
        <p style={{ letterSpacing: '0.28em', opacity: 0.62, margin: 0 }}>AURASPANSE</p>
        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 4.8rem)', margin: '10px 0 8px' }}>Entertainment Disclaimer</h1>
        <p style={{ opacity: 0.7, marginTop: 0 }}>Last updated: {updated}</p>

        <p>
          Auracle readings are for entertainment, creative reflection, and personal insight only. They are not medical,
          psychological, legal, financial, spiritual, religious, or professional advice.
        </p>

        <h2>No diagnosis or prediction</h2>
        <p>
          AuraSpectrum colors, zodiac traits, birthstone resonance, frequencies, opacity, and third-hue readings do not
          diagnose, treat, predict, or determine your health, personality, emotions, future, relationships, finances,
          legal situation, or life outcomes.
        </p>

        <h2>About the reading</h2>
        <p>
          The app generates a symbolic reading from creative color-emotion mappings, birth-date inputs,
          zodiac associations, birthstone associations, and time-based calculations. The output should be understood
          as expressive digital art and entertainment.
        </p>

        <h2>Advertising and personal attributes</h2>
        <p>
          Any ads, previews, or examples describe the reading experience, not a guaranteed fact about you.
          AuraSpanse does not claim that you have a specific condition, emotion, trait, problem, or personal attribute.
        </p>

        <h2>Use your own judgment</h2>
        <p>
          Do not rely on Auracle readings for important decisions. If you need medical, mental health, legal,
          financial, or other professional support, contact a qualified professional.
        </p>

        <h2>Contact</h2>
        <p>
          Questions can be sent to <a style={{ color: '#10c8c0' }} href="mailto:kris24guy@gmail.com">kris24guy@gmail.com</a>.
        </p>
      </section>
    </main>
  )
}
