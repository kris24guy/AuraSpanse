'use client'

import type { CSSProperties, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { getZodiacSign, zodiacMap } from '../lib/zodiacMap'
import { generateOriginSpectrum, type OriginSpectrumResult } from '../lib/originSpectrumEngine'
import { getBirthstoneResonance } from '../lib/birthstoneResonance'
import { AURA_SPECTRUM_CYCLONE_POINTS as emotionGlossaryPoints } from '../lib/auraSpectrumCycloneData'
import AuraSky from '../components/AuraSky'

const shell: CSSProperties = {
  minHeight: '100vh',
  padding: '36px 18px 64px',
  position: 'relative',
  isolation: 'isolate',
  background: '#07080c',
  color: '#f3f0eb',
  fontFamily: 'Inter, system-ui, sans-serif',
}

const panel: CSSProperties = {
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto 18px',
  padding: 'clamp(20px, 4vw, 34px)',
  boxSizing: 'border-box',
  border: '1px solid rgba(255,255,255,0.11)',
  borderRadius: '24px',
  background: 'linear-gradient(150deg, rgba(255,255,255,0.065), rgba(255,255,255,0.025))',
  boxShadow: '0 28px 90px rgba(0,0,0,0.26)',
}

const eyebrow: CSSProperties = {
  margin: 0,
  fontSize: '0.68rem',
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  color: 'rgba(243,240,235,0.55)',
}

const muted: CSSProperties = {
  color: 'rgba(243,240,235,0.72)',
  lineHeight: 1.75,
}

const primaryButton: CSSProperties = {
  marginTop: '16px',
  padding: '13px 17px',
  border: 0,
  borderRadius: '4px',
  background: 'linear-gradient(115deg, #c9e0d8, #d9c9ff)',
  color: '#101018',
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
}

function readableName(name: string): string {
  return name.replace(/^The-/, '').replace(/-/g, ' ')
}

function blendTwoHex(firstHex: string, secondHex: string): string {
  const channels = (hex: string) => [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset + 1, offset + 3), 16))
  const first = channels(firstHex)
  const second = channels(secondHex)
  return '#' + first.map((channel, index) => Math.round((channel + second[index]) / 2).toString(16).padStart(2, '0')).join('')
}

export default function AuraSpectrumPage() {
  const [result, setResult] = useState<OriginSpectrumResult | null>(null)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [subscriptionError, setSubscriptionError] = useState('')
  const [subscriptionMessage, setSubscriptionMessage] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [unlockedBlend, setUnlockedBlend] = useState<{ hex: string; name: string } | null>(null)
  const [hue2Revealed, setHue2Revealed] = useState(false)
  const [isAligning, setIsAligning] = useState(false)
  const [alignmentStep, setAlignmentStep] = useState(0)
  const [zodiacRevealCount, setZodiacRevealCount] = useState(0)

  const alignmentMessages = result ? [
    'Measuring lived time across the 374-emotion spectrum…',
    `Detecting your historical ${result.zodiac.sign} frame · ${result.zodiac.element}…`,
    "Aligning your date with today's time-weighted spectrum placement…",
    'Your four-color Zodiac Hue 1 reveal is ready.',
  ] : []
  const hue1Sources = result ? [
    ...result.zodiac.traitChannels.map((trait) => ({
      key: trait.polarity,
      title: `ZODIAC · ${trait.polarity.toUpperCase()}`,
      name: trait.name,
      hex: trait.hex,
      description: emotionGlossaryPoints.find((point) => point.name === trait.name)?.definition ?? `Symbolic ${trait.polarity} channel.`,
    })),
    {
      key: 'time-weighted',
      title: 'TIME WEIGHT · COLOR 4 OF 4',
      name: result.currentPlacement.name,
      hex: result.currentPlacement.hex,
      description: "Your lived-time cycle and today's placement determine this fourth Hue 1 color.",
    },
  ] : []
  const hue1Definition = result
    ? emotionGlossaryPoints.find((point) => point.name === result.zodiacHue1.name)?.definition
    : undefined

  useEffect(() => {
    try {
      const birthDate = window.localStorage.getItem('birthdate')
      if (!birthDate) {
        setError('No birthdate is saved in this browser. Enter a birthdate to initialize Aura-Spectrum.')
        return
      }

      const generated = generateOriginSpectrum(birthDate, {
        now: new Date(),
        spectrum: emotionGlossaryPoints,
        zodiacMap,
        resolveZodiacSign: (date) => getZodiacSign(date),
        getBirthstoneResonance,
        includeComposite: false,
      })
      setResult(generated)
      setAlignmentStep(0)
      setIsAligning(true)
      setHue2Revealed(false)
      setZodiacRevealCount(0)
      setError('')
    } catch (cause) {
      setResult(null)
      setIsAligning(false)
      setHue2Revealed(false)
      setZodiacRevealCount(0)
      setError(cause instanceof Error ? cause.message : 'Aura-Spectrum could not process this birthdate.')
    }
  }, [retryKey])

  useEffect(() => {
    if (!result || !isAligning) return
    let phase = 0
    const intervalMs = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 850
    const timer = window.setInterval(() => {
      if (phase < 3) {
        phase += 1
        setAlignmentStep(phase)
      } else {
        window.clearInterval(timer)
        setIsAligning(false)
      }
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [result, isAligning])

  useEffect(() => {
    if (!result) return
    let cancelled = false
    setIsSubscribed(false)
    setUnlockedBlend(null)
    setSubscriptionMessage('')
    setSubscriptionError('')

    fetch('/api/subscribe-aura-spectrum?birthDate=' + encodeURIComponent(result.birthDate), {
      method: 'GET',
      cache: 'no-store',
    })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => {
        if (
          cancelled ||
          !data?.success ||
          data.subscribed !== true ||
          typeof data.blendHex !== 'string'
        ) return

        setUnlockedBlend({
          hex: data.blendHex,
          name: readableName(data.primaryHueName || result.zodiacHue1.name) + ' × ' + (data.birthstoneName || result.birthstone.name),
        })
        setIsSubscribed(true)
        setZodiacRevealCount(4)
        setHue2Revealed(true)
        setSubscriptionMessage('Your previous subscription has been verified. The four-color Hue 1 and final blend are restored.')
      })
      .catch(() => {
        // No signed subscription ticket: leave the final blend locked.
      })

    return () => {
      cancelled = true
    }
  }, [result])

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!result || zodiacRevealCount !== 4 || !hue2Revealed || !email.trim()) return
    if (!consent) {
      setSubscriptionError('Confirm that you want to receive AuraSpanse email updates to continue.')
      return
    }

    setSubmitting(true)
    setSubscriptionError('')
    setSubscriptionMessage('')
    try {
      const response = await fetch('/api/subscribe-aura-spectrum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), birthDate: result.birthDate, generatedAt: result.currentDate, consent }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success || data.subscribed !== true || typeof data.blendHex !== 'string') {
        throw new Error(data.error || 'The subscription could not be confirmed. The combined color remains locked.')
      }

      const blend = {
        hex: data.blendHex as string,
        name: readableName(data.primaryHueName || result.zodiacHue1.name) + ' × ' + (data.birthstoneName || result.birthstone.name),
      }
      setUnlockedBlend(blend)
      setIsSubscribed(true)
      setZodiacRevealCount(4)
      setHue2Revealed(true)
      setSubscriptionMessage(
        data.emailSent
          ? 'Subscription confirmed. Your personalized five-color reading, four-color Hue 1, and this snapshot were emailed.'
          : 'Subscription confirmed. Your Hue 1 + Hue 2 blend is revealed below. The reading email could not be sent, but the subscription is active.'
      )
    } catch (cause) {
      setSubscriptionError(cause instanceof Error ? cause.message : 'The subscription could not be confirmed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={shell}>
      <AuraSky />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <header style={{ ...panel, textAlign: 'center', paddingTop: '38px', paddingBottom: '38px' }}>
          <p style={eyebrow}>AURASPANSE · THE AURA-SPECTRUM MECHANISM</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(2.4rem, 7vw, 4.3rem)', letterSpacing: '-0.035em', margin: '16px 0 12px' }}>
            Aura-Spectrum
          </h1>
          <p style={{ ...muted, maxWidth: '650px', margin: '0 auto' }}>
            One birthdate. A quiet time-weighted transition. Four colors revealed in sequence to form Zodiac Hue 1; your birthstone is the separate Hue 2.
          </p>
        </header>

        {error && (
          <section style={{ ...panel, borderColor: 'rgba(211,154,184,0.45)' }} aria-live="polite">
            <p style={eyebrow}>INPUT REQUIRED</p>
            <h2 style={{ color: '#d39ab8', fontWeight: 500 }}>{error}</h2>
            <a href="/aura-scope-mechanism.html" style={{ color: '#d9c9ff', textUnderlineOffset: '4px' }}>Return to birthdate entry →</a>
          </section>
        )}

        {result && isAligning && (
          <section style={{ ...panel, maxWidth: '760px', marginTop: '26px' }} role="status" aria-live="polite">
            <p style={eyebrow}>TIME-WEIGHTED ALIGNMENT · {alignmentStep + 1} / {alignmentMessages.length}</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(1.6rem, 4.5vw, 2.25rem)', minHeight: '2.4em', margin: '18px 0' }}>
              {alignmentMessages[alignmentStep]}
            </h2>
            <div role="progressbar" aria-label="Aura-Spectrum alignment" aria-valuemin={0} aria-valuemax={alignmentMessages.length} aria-valuenow={alignmentStep + 1} style={{ height: '5px', borderRadius: '99px', overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
              <div style={{ width: `${((alignmentStep + 1) / alignmentMessages.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #c9e0d8, #d9c9ff)', transition: 'width 700ms ease' }} />
            </div>
            <p style={{ ...muted, fontSize: '0.84rem', marginBottom: 0 }}>The time-weighting calculation stays behind the scenes; its color enters the Hue 1 sequence as source four.</p>
          </section>
        )}

        {result && !isAligning && (
          <>
            <section id="zodiac-hue-one" style={panel} aria-live="polite">
              <p style={eyebrow}>HISTORICAL ZODIAC FRAME · HUE 1</p>
              <h2 style={{ color: result.zodiacHue1.hex, fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 2.8rem)', margin: '12px 0 4px' }}>{result.zodiac.sign}</h2>
              <p style={muted}>{result.zodiac.element} · {result.zodiac.modality} · traditional ruler: {result.zodiac.traditionalRuler}</p>
              <p style={muted}>{result.zodiac.description} Reveal the positive, neutral, and shadow colors, then the time-weighted fourth color. Each contributes 25% to Zodiac Hue 1.</p>

              <div style={{ marginTop: '20px', padding: '18px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', background: 'rgba(0,0,0,0.16)' }}>
                <p style={{ ...eyebrow, letterSpacing: '0.14em' }}>HUE 1 COLORS · {zodiacRevealCount} OF 4 REVEALED</p>
                <div style={{ display: 'grid', gap: '12px', marginTop: '14px' }}>
                  {hue1Sources.slice(0, zodiacRevealCount).map((source, index) => (
                    <div key={source.key} style={{ display: 'grid', gridTemplateColumns: 'minmax(74px, 0.35fr) minmax(0, 1fr)', gap: '14px', alignItems: 'center', padding: '14px', border: `1px solid ${source.hex}66`, borderRadius: '14px', background: `${source.hex}13` }}>
                      <div style={{ minHeight: '66px', borderRadius: '9px', background: source.hex, boxShadow: `0 0 22px ${source.hex}35` }} role="img" aria-label={`${source.title} color ${source.hex}`} />
                      <div>
                        <p style={{ ...eyebrow, letterSpacing: '0.12em' }}>COLOR {index + 1} · {source.title} · 25%</p>
                        <strong style={{ color: source.hex, fontSize: '1.12rem' }}>{readableName(source.name)}</strong>
                        <p style={{ ...muted, fontSize: '0.82rem', margin: '4px 0 0' }}>{source.hex.toUpperCase()}</p>
                        <p style={{ ...muted, fontSize: '0.88rem', margin: '6px 0 0' }}>{source.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {zodiacRevealCount < 4 ? (
                  <button
                    type="button"
                    onClick={() => setZodiacRevealCount((count) => Math.min(count + 1, 4))}
                    style={primaryButton}
                  >
                    Reveal {zodiacRevealCount < 3 ? `${result.zodiac.traitChannels[zodiacRevealCount].polarity} color` : 'time-weighted fourth color'}
                  </button>
                ) : (
                  <div style={{ marginTop: '22px', padding: '18px', border: `1px solid ${result.zodiacHue1.hex}88`, borderRadius: '16px', background: `${result.zodiacHue1.hex}13` }}>
                    <p style={eyebrow}>NEW PRIMARY HUE 1 · FOUR-COLOR BLEND</p>
                    <div style={{ height: '96px', borderRadius: '10px', background: result.zodiacHue1.hex, boxShadow: `0 0 28px ${result.zodiacHue1.hex}35`, margin: '14px 0' }} role="img" aria-label={`Zodiac Hue 1 ${result.zodiacHue1.hex}`} />
                    <h3 style={{ color: result.zodiacHue1.hex, fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.7rem', margin: '0 0 6px' }}>{readableName(result.zodiacHue1.name)}</h3>
                    <p style={{ ...muted, fontSize: '0.88rem' }}>{result.zodiacHue1.hex.toUpperCase()} · equal 25% blend of the three zodiac colors and the time-weighted fourth color.</p>
                    {hue1Definition && <p style={{ ...muted, marginBottom: 0 }}>{hue1Definition}</p>}
                    {!hue2Revealed && (
                      <button type="button" onClick={() => setHue2Revealed(true)} style={primaryButton}>
                        Reveal birthstone Hue 2
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>

            {hue2Revealed && (
              <>
                <section id="birthstone-hue-two" style={{ ...panel, borderColor: `${result.birthstone.hex}88` }}>
                  <p style={eyebrow}>PRIMARY HUE 2 · BIRTHSTONE</p>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, margin: '12px 0' }}>Your literal stone color</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(125px, 0.7fr) minmax(210px, 1.5fr)', gap: '20px', alignItems: 'stretch', marginTop: '18px' }}>
                    <div style={{ borderRadius: '18px', background: result.birthstone.hex, minHeight: '150px', boxShadow: `0 0 38px ${result.birthstone.hex}35`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', boxSizing: 'border-box', color: ['#EAF5FF','#F6F0E5','#C9D8D6','#E3A341','#A5C639'].includes(result.birthstone.hex) ? '#15151a' : '#ffffff' }}>
                      <p style={{ fontSize: '0.65rem', letterSpacing: '0.16em', margin: 0 }}>NATURAL STONE SWATCH</p>
                      <strong style={{ fontSize: '1.1rem' }}>{result.birthstone.hex.toUpperCase()}</strong>
                    </div>
                    <div>
                      <h3 style={{ color: result.birthstone.hex, fontSize: '1.5rem', margin: '0 0 9px', fontWeight: 500 }}>{result.birthstone.name}</h3>
                      <p style={muted}>{result.birthstone.sourceNote}</p>
                      <p style={muted}><strong>Deposit:</strong> {result.birthstone.deposit} · {Math.round(result.birthstone.distanceKm).toLocaleString('en-US')} km from {result.birthstone.origin.name}</p>
                      <p style={{ ...muted, fontSize: '0.86rem' }}>Geographic resonance: {result.birthstone.opacityPercent.toFixed(1)}%. This describes the deposit reference; Hue 2 remains the literal stone swatch.</p>
                    </div>
                  </div>
                </section>

                <section style={{ ...panel, borderColor: isSubscribed ? `${unlockedBlend?.hex || result.zodiacHue1.hex}88` : 'rgba(201,224,216,0.36)' }} aria-live="polite">
                  {!isSubscribed ? (
                    <>
                      <p style={eyebrow}>THE PERSONAL TWO-PRIMARY BLEND</p>
                      <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(1.7rem, 5vw, 2.4rem)', margin: '12px 0' }}>Zodiac Hue 1 × Birthstone Hue 2</h2>
                      <p style={muted}>
                        Hue 1 is <strong style={{ color: result.zodiacHue1.hex }}>{readableName(result.zodiacHue1.name)}</strong>. Hue 2 is the literal <strong style={{ color: result.birthstone.hex }}>{result.birthstone.name}</strong> swatch. The final equal blend is calculated on the server after your email subscription is confirmed.
                      </p>
                      <p style={{ ...muted, fontSize: '0.9rem' }}>Your email also includes one personal definition synthesized from five emotion colors in this reading and their exact source swatches.</p>
                      <form onSubmit={handleSubscribe} style={{ display: 'grid', gap: '14px', marginTop: '22px' }}>
                        <label htmlFor="aura-spectrum-email" style={{ display: 'grid', gap: '7px', fontSize: '0.9rem', color: 'rgba(243,240,235,0.9)' }}>
                          Email address
                          <input
                            id="aura-spectrum-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: '#12121d', color: '#f3f0eb', font: 'inherit' }}
                          />
                        </label>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', lineHeight: 1.55, color: 'rgba(243,240,235,0.7)' }}>
                          <input
                            type="checkbox"
                            required
                            checked={consent}
                            onChange={(event) => setConsent(event.target.checked)}
                            style={{ marginTop: '4px', accentColor: '#c9e0d8', flex: '0 0 auto' }}
                          />
                          <span>I agree to subscribe to AuraSpanse email updates and receive this reading. I understand future updates will be sent to this address and I can unsubscribe.</span>
                        </label>
                        {subscriptionError && <p role="alert" style={{ margin: 0, color: '#f0a8b8', lineHeight: 1.6 }}>{subscriptionError}</p>}
                        <button
                          type="submit"
                          disabled={submitting}
                          style={{ ...primaryButton, marginTop: 0, background: submitting ? '#5d5c68' : primaryButton.background, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.8 : 1 }}
                        >
                          {submitting ? 'Confirming subscription…' : 'Subscribe and reveal final blend'}
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <p style={eyebrow}>SUBSCRIPTION CONFIRMED · FINAL BLEND</p>
                      <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(1.7rem, 5vw, 2.4rem)', margin: '12px 0' }}>Your two primaries, combined</h2>
                      {subscriptionMessage && <p style={{ ...muted, color: '#c9e0d8' }}>{subscriptionMessage}</p>}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '12px', marginTop: '20px' }}>
                        <div style={{ padding: '14px', border: `1px solid ${result.zodiacHue1.hex}66`, borderRadius: '8px' }}>
                          <div style={{ height: '46px', borderRadius: '6px', background: result.zodiacHue1.hex, marginBottom: '10px' }} />
                          <strong>{readableName(result.zodiacHue1.name)}</strong>
                          <p style={{ ...muted, fontSize: '0.78rem' }}>Hue 1 · four-color zodiac/time blend</p>
                        </div>
                        <div style={{ padding: '14px', border: `1px solid ${result.birthstone.hex}66`, borderRadius: '8px' }}>
                          <div style={{ height: '46px', borderRadius: '6px', background: result.birthstone.hex, marginBottom: '10px' }} />
                          <strong>{result.birthstone.name}</strong>
                          <p style={{ ...muted, fontSize: '0.78rem' }}>Hue 2 · literal stone color</p>
                        </div>
                      </div>
                      <div style={{ height: 'min(220px, 42vw)', minHeight: '145px', borderRadius: '8px', margin: '24px 0 16px', background: unlockedBlend?.hex || blendTwoHex(result.zodiacHue1.hex, result.birthstone.hex), boxShadow: '0 0 45px ' + ((unlockedBlend?.hex || blendTwoHex(result.zodiacHue1.hex, result.birthstone.hex)) + '55'), border: '1px solid rgba(255,255,255,0.22)' }} />
                      <h3 style={{ color: unlockedBlend?.hex || result.zodiacHue1.hex, fontFamily: 'Georgia, serif', fontSize: 'clamp(1.35rem, 4vw, 2rem)', fontWeight: 400, margin: '0 0 8px' }}>
                        {unlockedBlend?.name || (readableName(result.zodiacHue1.name) + ' × ' + result.birthstone.name)}
                      </h3>
                      <p style={{ ...muted, marginBottom: 0 }}>The final color is the equal-weight RGB blend of Hue 1 and Hue 2. Hue 1 is already the blend of its four revealed source colors.</p>
                    </>
                  )}
                </section>
              </>
            )}
          </>
        )}

        <footer style={{ ...panel, textAlign: 'center', padding: '22px' }}>
          <p style={eyebrow}>AURA-SPECTRUM · FOUR-COLOR HUE 1 · TWO-PRIMARY REVEAL</p>
          <p style={{ ...muted, fontSize: '0.82rem' }}>
            A custom symbolic model for entertainment and self-reflection, not a scientifically validated measure of personality, emotion, or destiny.
          </p>
          <a href="/aura-scope-mechanism.html" style={{ color: '#d9c9ff', textUnderlineOffset: '4px' }}>Enter another birthdate</a>
        </footer>
      </div>
    </main>
  )
}
