const colorFamilies = [
  { title: 'Pure Light', color: '#fefefe', meaning: 'transcendence, clarity, grace, awakening' },
  { title: 'Lavender / Violet', color: '#b89cff', meaning: 'wonder, magic, dreaming, intuition' },
  { title: 'Blue-Violet / Indigo', color: '#6030e8', meaning: 'wisdom, sovereignty, mystery, inner knowing' },
  { title: 'Blue / Sky Blue', color: '#70b0ff', meaning: 'trust, loyalty, peace, hope, calm' },
  { title: 'Cyan / Teal', color: '#10c8c0', meaning: 'communication, empathy, resonance, healing' },
  { title: 'Green / Yellow-Green', color: '#80e830', meaning: 'growth, harmony, groundedness, anticipation' },
  { title: 'Yellow / Gold', color: '#ffe000', meaning: 'joy, intelligence, optimism, warmth' },
  { title: 'Orange / Red', color: '#f01800', meaning: 'creativity, courage, passion, drive' },
  { title: 'Rose / Magenta', color: '#e00080', meaning: 'love, devotion, transformation, union' },
  { title: 'Shadow / Void', color: '#200080', meaning: 'grief, dread, surrender, silence, the unknown' },
]

const birthstones = [
  ['January', 'Garnet', '#7B1E1E', 'deep red protection and drive'],
  ['February', 'Amethyst', '#9B5DE5', 'violet intuition and dream energy'],
  ['March', 'Aquamarine', '#7EDDD3', 'cyan calm and communication'],
  ['April', 'Diamond', '#E8E8E8', 'clear light and near-transparent clarity'],
  ['May', 'Emerald', '#2D6A4F', 'green renewal and grounded growth'],
  ['June', 'Pearl', '#F1E9D2', 'soft reflection and lunar calm'],
  ['July', 'Ruby', '#9B111E', 'solid red vitality and passion'],
  ['August', 'Peridot', '#A4BE7B', 'fresh green abundance and balance'],
  ['September', 'Sapphire', '#0F52BA', 'blue loyalty and deep truth'],
  ['October', 'Opal', '#F7C5CC', 'iridescent acceptance and emotional shimmer'],
  ['November', 'Citrine', '#E4A11B', 'gold optimism and warmth'],
  ['December', 'Turquoise', '#40E0D0', 'teal empathy and protection'],
]

export default function AuraGuidePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#05030a', color: 'white', padding: '56px 24px' }}>
      <section style={{ maxWidth: '980px', margin: '0 auto', lineHeight: 1.7 }}>
        <p style={{ letterSpacing: '0.28em', opacity: 0.62, margin: 0 }}>AURASPANSE</p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5.4rem)', lineHeight: 0.95, margin: '12px 0' }}>Color Aura Guide</h1>
        <p style={{ maxWidth: '760px', opacity: 0.78, fontSize: '1.05rem' }}>
          AuraSpanse is a symbolic emotional-color universe. Explore named feelings across a visual spectrum, inspect their definitions, and see how a birthdate-derived starting color interacts with zodiac symbolism and the natural color of a birthstone. The stone color tints the vortex according to the proximity of its representative geological deposit to the model's fixed geographic reference.
        </p>

        <div style={{ margin: '34px 0', height: '18px', borderRadius: '999px', background: 'linear-gradient(90deg, #fefefe, #b89cff, #6030e8, #70b0ff, #10c8c0, #80e830, #ffe000, #f01800, #e00080, #000000)', boxShadow: '0 0 48px rgba(156,116,255,0.28)' }} />

        <h2>How the Two-Color Reveal Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginTop: '18px' }}>
          <article style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '22px', padding: '20px' }}>
            <h3 style={{ marginTop: 0 }}>1. Zodiac Triad</h3>
            <p style={{ opacity: 0.76 }}>Your birthdate selects a starting emotion-color point. Positive, neutral, and shadow zodiac traits provide context for reflection; they are not extra ingredients in the two-color subscription blend.</p>
          </article>
          <article style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '22px', padding: '20px' }}>
            <h3 style={{ marginTop: 0 }}>2. Birthstone Resonance</h3>
            <p style={{ opacity: 0.76 }}>Your birthstone contributes its natural color. A representative geological deposit closer to the model's fixed geographic reference creates a stronger tint; a farther deposit creates a lighter tint.</p>
          </article>
          <article style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '22px', padding: '20px' }}>
            <h3 style={{ marginTop: 0 }}>3. Third Hue</h3>
            <p style={{ opacity: 0.76 }}>The starting emotion color and natural birthstone color stay separate until the email subscription is confirmed. Today's placement remains context for the reading, not an added blend color.</p>
          </article>
        </div>

        <h2 style={{ marginTop: '42px' }}>Explore the Color Families</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', marginTop: '18px' }}>
          {colorFamilies.map((band) => (
            <article key={band.title} style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: band.color, boxShadow: `0 0 34px ${band.color}`, border: '1px solid rgba(255,255,255,0.22)' }} />
              <p style={{ color: '#10c8c0', margin: '14px 0 4px', fontSize: '0.78rem', letterSpacing: '0.12em' }}>EMOTION COLOR FAMILY</p>
              <h3 style={{ margin: '0 0 8px' }}>{band.title}</h3>
              <p style={{ opacity: 0.74, margin: 0 }}>{band.meaning}</p>
            </article>
          ))}
        </div>

        <h2 style={{ marginTop: '42px' }}>Birthstone Resonance</h2>
        <p style={{ opacity: 0.76, maxWidth: '760px' }}>
          Every stone has a consistent display color in AuraSpanse. Its modeled deposit proximity changes how strongly that color tints the cyclone, while height darkens the appearance toward the upper rim. This is a symbolic visual convention, not a claim of physical influence.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginTop: '18px' }}>
          {birthstones.map(([month, stone, color, meaning]) => (
            <article key={month} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: color, boxShadow: `0 0 24px ${color}` }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>{month}: {stone}</p>
                <p style={{ margin: 0, opacity: 0.64, fontSize: '0.82rem' }}>{meaning}</p>
              </div>
            </article>
          ))}
        </div>

        <h2 style={{ marginTop: '42px' }}>Important Note</h2>
        <p style={{ opacity: 0.76 }}>
          Auracle readings are symbolic digital art for entertainment, reflection, and personal insight only. They are not medical, psychological, legal, financial, spiritual, or professional advice.
        </p>
      </section>
    </main>
  )
}
