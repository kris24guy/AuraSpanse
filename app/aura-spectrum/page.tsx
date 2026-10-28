'use client'

import type { CSSProperties, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { getZodiacSign, zodiacMap } from '../lib/zodiacMap'
import { generateOriginSpectrum, type OriginSpectrumResult } from '../lib/originSpectrumEngine'
import { getBirthstoneResonance } from '../lib/birthstoneResonance'
import { AURA_SPECTRUM_CYCLONE_POINTS as emotionGlossaryPoints } from '../lib/auraSpectrumCycloneData'

const shell: CSSProperties = {
  minHeight: '100vh',
  padding: '36px 18px 64px',
  background:
    'radial-gradient(circle at 15% 8%, rgba(119,168,155,0.18), transparent 26%), radial-gradient(circle at 85% 18%, rgba(139,120,201,0.18), transparent 25%), #07080c',
  color: '#f3f0eb',
  fontFamily: 'Inter, system-ui, sans-serif',
}

const panel: CSSProperties = {
  width: '100%',
  maxWidth: '920px',
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

function readableName(name: string): string {
  return name.replace(/^The-/, '').replace(/-/g, ' ')
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('en-US')
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

  useEffect(() => {
    try {
      const birthDate = window.localStorage.getItem('birthdate')
      if (!birthDate) {
        setError('No birthdate is saved in this browser. Enter a birthdate to initialize Aura-Spectrum.')
        return
      }

      // Supply the display-only can with the exact same point records used by the reveal engine.
      try {
        window.localStorage.setItem('aura-spectrum-cyclone-points', JSON.stringify(
          emotionGlossaryPoints.map(({ name, definition, hex, freq, colorAssignment }) => ({ name, definition, hex, freq, colorAssignment }))
        ))
      } catch {
        // The can iframe falls back to its bundled display data if storage is blocked.
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
      setError('')
    } catch (cause) {
      setResult(null)
      setError(cause instanceof Error ? cause.message : 'Aura-Spectrum could not process this birthdate.')
    }
  }, [retryKey])

  useEffect(() => {
    if (!result) return
    try {
      const saved = window.localStorage.getItem('auraspanse-aura-spectrum-subscription')
      const parsed = saved ? JSON.parse(saved) as { birthDate?: string; email?: string; subscribed?: boolean } : null
      if (parsed?.subscribed && parsed.birthDate === result.birthDate) {
        setIsSubscribed(true)
        setEmail(parsed.email || '')
        setUnlockedBlend({
          hex: blendTwoHex(result.firstHue.hex, result.birthstone.hex),
          name: readableName(result.firstHue.name) + ' × ' + result.birthstone.name,
        })
      } else {
        setIsSubscribed(false)
        setUnlockedBlend(null)
      }
    } catch {
      setIsSubscribed(false)
      setUnlockedBlend(null)
    }
  }, [result])

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!result || !email.trim()) return
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
        body: JSON.stringify({ email: email.trim(), birthDate: result.birthDate, consent }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success || data.subscribed !== true || typeof data.blendHex !== 'string') {
        throw new Error(data.error || 'The subscription could not be confirmed. The combined color remains locked.')
      }

      const blend = {
        hex: data.blendHex as string,
        name: readableName(data.primaryHueName || result.firstHue.name) + ' × ' + (data.birthstoneName || result.birthstone.name),
      }
      setUnlockedBlend(blend)
      setIsSubscribed(true)
      setSubscriptionMessage(
        data.emailSent
          ? 'Subscription confirmed. Your two-primary blend is revealed below, and the reading email was sent.'
          : 'Subscription confirmed. Your two-primary blend is revealed below. The email could not be sent, but the subscription is active.'
      )
      try {
        window.localStorage.setItem('auraspanse-aura-spectrum-subscription', JSON.stringify({
          birthDate: result.birthDate,
          email: email.trim(),
          subscribed: true,
        }))
      } catch {
        // Subscription and reveal are already confirmed by the server.
      }
    } catch (cause) {
      setSubscriptionError(cause instanceof Error ? cause.message : 'The subscription could not be confirmed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={shell}>
      <header style={{ ...panel, textAlign: 'center', paddingTop: '42px', paddingBottom: '42px' }}>
        <p style={eyebrow}>AURASPANSE · THE AURA-SPECTRUM MECHANISM</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(2.4rem, 7vw, 4.3rem)', letterSpacing: '-0.035em', margin: '16px 0 12px' }}>
          Aura-Spectrum
        </h1>
        <p style={{ ...muted, maxWidth: '670px', margin: '0 auto' }}>
          Your birthdate initializes the existing Aura-Spectrum reveal engine. Its first primary is an age-derived emotion color; its second primary is your birth month's literal gemstone swatch. The transparent can is the explorer UI. The two personal primaries remain separate until the email subscription is confirmed.
        </p>
      </header>

      {error && (
        <section style={{ ...panel, borderColor: 'rgba(211,154,184,0.45)' }} aria-live="polite">
          <p style={eyebrow}>INPUT REQUIRED</p>
          <h2 style={{ color: '#d39ab8', fontWeight: 500 }}>{error}</h2>
          <p style={muted}>Return to the birthdate entry, enter a valid date, and initialize Aura-Spectrum.</p>
          <a href="/aura-scope-mechanism.html" style={{ color: '#d9c9ff', textUnderlineOffset: '4px' }}>Return to birthdate entry →</a>
        </section>
      )}

      {result && (
        <>
          <section style={panel}>
            <p style={eyebrow}>THE AGE EQUATION</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(1.7rem, 5vw, 2.5rem)', margin: '12px 0' }}>
              {formatNumber(result.daysAlive)} days alive
            </h2>
            <p style={muted}>
              {formatNumber(result.daysAlive)} ÷ {formatNumber(result.spectrumPointCount)} emotion-color points = <strong style={{ color: '#c9e0d8' }}>{result.ageSpectrumRatio.toFixed(4)}</strong> spectrum cycles.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '22px' }}>
              {[
                { label: 'Birthdate', value: result.birthDate },
                { label: 'Calculation date', value: result.currentDate },
                { label: 'Spectrum points', value: formatNumber(result.spectrumPointCount) },
                { label: 'Completed cycles', value: formatNumber(result.completedSpectrumCycles) },
                { label: 'Remainder', value: formatNumber(result.remainingLifeDays) },
                { label: 'Exponent residue', value: formatNumber(result.exponentResidue) },
              ].map((item) => (
                <div key={item.label} style={{ padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(0,0,0,0.18)' }}>
                  <p style={{ ...eyebrow, letterSpacing: '0.12em' }}>{item.label}</p>
                  <p style={{ margin: '8px 0 0', fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>{item.value}</p>
                </div>
              ))}
            </div>

            <p style={{ ...muted, fontSize: '0.9rem', marginBottom: 0 }}>
              First-hue index = (({result.spectrumPointCount}<sup>{formatNumber(result.daysAlive)}</sup> mod {formatNumber(result.exponentModulus)}) mod {result.spectrumPointCount} + age remainder + zodiac index) mod spectrum size. The large exponent is evaluated with bounded modular arithmetic, not constructed as an unmanageably large integer.
            </p>
          </section>

          <section style={{ ...panel, maxWidth: '1180px', padding: '20px' }}>
            <p style={eyebrow}>THE 374-POINT EMOTION CAN</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, marginTop: '12px' }}>Explore the emotional spectrum</h2>
            <p style={muted}>
              The transparent can is the explorer interface: the same named emotions, definitions, colors, and frequency positions used by this reveal engine. It is not a second calculation engine.
            </p>
            <div style={{ marginTop: '18px', border: '1px solid rgba(255,255,255,0.11)', borderRadius: '10px', overflow: 'hidden', background: '#0a0a12' }}>
              <iframe
                title="AuraSpanse interactive emotion-color can"
                src={'/aura-spectrum-cyclone.html?selected=' + encodeURIComponent(result.firstHue.name)}
                loading="eager"
                style={{ display: 'block', width: '100%', height: 'clamp(900px, 112vh, 1180px)', border: 0, background: '#0a0a12' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '22px' }}>
              <div style={{ border: '1px solid ' + result.firstHue.hex + '88', background: result.firstHue.hex + '18', borderRadius: '12px', padding: '18px' }}>
                <p style={eyebrow}>PRIMARY HUE 1 · AGE-DERIVED</p>
                <div style={{ height: '58px', borderRadius: '8px', margin: '14px 0', background: result.firstHue.hex }} />
                <h3 style={{ color: result.firstHue.hex, margin: '0 0 5px' }}>{readableName(result.firstHue.name)}</h3>
                <p style={muted}>{result.firstHue.hex} · frequency {result.firstHue.freq}/1000</p>
                <p style={{ ...muted, fontSize: '0.9rem', marginBottom: 0 }}>{emotionGlossaryPoints[result.firstHueIndex]?.definition}</p>
              </div>
              <div style={{ border: '1px solid ' + result.currentPlacement.hex + '88', background: result.currentPlacement.hex + '18', borderRadius: '12px', padding: '18px' }}>
                <p style={eyebrow}>CURRENT PLACEMENT · CONTEXT MARKER</p>
                <div style={{ height: '58px', borderRadius: '8px', margin: '14px 0', background: result.currentPlacement.hex }} />
                <h3 style={{ color: result.currentPlacement.hex, margin: '0 0 5px' }}>{readableName(result.currentPlacement.name)}</h3>
                <p style={muted}>{result.currentPlacement.hex} · frequency {result.currentPlacement.freq}/1000</p>
                <p style={{ ...muted, fontSize: '0.9rem', marginBottom: 0 }}>Today's marker in the same spectrum. It is contextual and is not a third ingredient in the two-primary blend.</p>
              </div>
            </div>
          </section>

                    <section style={{ ...panel, borderColor: `${result.birthstone.hex}88` }}>
            <p style={eyebrow}>SECOND HUE · GEOGRAPHIC BIRTHSTONE RESONANCE</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, marginTop: '12px' }}>Literal stone color first. Name second.</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(125px, 0.7fr) minmax(210px, 1.5fr)', gap: '20px', alignItems: 'stretch', marginTop: '18px' }}>
              <div style={{ borderRadius: '18px', background: result.birthstone.hex, minHeight: '170px', boxShadow: `0 0 38px ${result.birthstone.hex}35`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', boxSizing: 'border-box', color: ['#EAF5FF','#F6F0E5','#C9D8D6','#E3A341','#A5C639'].includes(result.birthstone.hex) ? '#15151a' : '#ffffff' }}>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.16em', margin: 0 }}>RAW SWATCH</p>
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>{result.birthstone.hex}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem' }}>Base color input</p>
                </div>
              </div>
              <div>
                <h3 style={{ color: result.birthstone.hex, fontSize: '1.5rem', margin: '0 0 9px', fontWeight: 500 }}>{result.birthstone.name}</h3>
                <p style={muted}>{result.birthstone.sourceNote}</p>
                <p style={muted}><strong>Deposit reference:</strong> {result.birthstone.deposit}</p>
                <p style={muted}><strong>Geographic distance:</strong> {Math.round(result.birthstone.distanceKm).toLocaleString('en-US')} km from {result.birthstone.origin.name}</p>
              </div>
            </div>
            <div style={{ marginTop: '20px', padding: '16px', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px', background: 'rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <strong>Geographic opacity point</strong>
                <strong style={{ fontSize: '1.4rem', color: result.birthstone.hex, fontVariantNumeric: 'tabular-nums' }}>{result.birthstone.opacityPercent.toFixed(1)}%</strong>
              </div>
              <div style={{ height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden', margin: '12px 0' }}>
                <div style={{ height: '100%', width: `${result.birthstone.opacityPercent}%`, background: result.birthstone.hex, boxShadow: `0 0 14px ${result.birthstone.hex}88` }} />
              </div>
              <p style={{ ...muted, fontSize: '0.88rem', marginBottom: 0 }}>
                Existing mechanism rule: clamp(100 − distance in km ÷ 150, 25, 100). That percentage describes the birthstone's geographic-resonance layer. The gemstone name never generates the hue, and the two personal primary swatches remain unblended until subscription is confirmed.
              </p>
            </div>
          </section>

          <section style={panel}>
            <p style={eyebrow}>HISTORICAL ZODIAC FRAME</p>
            <h2 style={{ color: result.firstHue.hex, fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '2.2rem', margin: '12px 0 4px' }}>{result.zodiac.sign}</h2>
            <p style={muted}>{result.zodiac.element} · {result.zodiac.modality} · traditional ruler: {result.zodiac.traditionalRuler}</p>
            <p style={muted}>{result.zodiac.description} The sign's positive, neutral, and shadow channels provide equal-weight symbolic context. They are not additional ingredients in the subscriber-only blend of the two primary hues.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginTop: '20px' }}>
              {result.zodiac.traitChannels.map((trait) => (
                <div key={trait.polarity} style={{ padding: '16px', border: `1px solid ${trait.hex}66`, borderRadius: '16px', background: `${trait.hex}13` }}>
                  <p style={{ ...eyebrow, letterSpacing: '0.14em' }}>{trait.polarity} · ⅓ weight</p>
                  <div style={{ height: '38px', borderRadius: '8px', background: trait.hex, margin: '12px 0' }} />
                  <strong style={{ color: trait.hex }}>{readableName(trait.name)}</strong>
                  <p style={{ ...muted, fontSize: '0.85rem', marginBottom: 0 }}>{trait.hex} · {trait.freq}/1000</p>
                </div>
              ))}
            </div>
            <p style={muted}>Equal-trait mean: {result.zodiac.averageFrequency}/1000 · nearest spectrum label: <strong>{readableName(result.zodiac.averageEmotion.name)}</strong></p>
          </section>

          <section style={{ ...panel, borderColor: isSubscribed ? ((unlockedBlend?.hex || result.firstHue.hex) + '88') : 'rgba(201,224,216,0.36)' }} aria-live="polite">
            {!isSubscribed ? (
              <>
                <p style={eyebrow}>SUBSCRIBE TO REVEAL THE BLEND</p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(1.7rem, 5vw, 2.4rem)', margin: '12px 0' }}>Two primaries. One personal color.</h2>
                <p style={muted}>
                  Primary Hue 1 is <strong style={{ color: result.firstHue.hex }}>{readableName(result.firstHue.name)}</strong> ({result.firstHue.hex}). Primary Hue 2 is <strong style={{ color: result.birthstone.hex }}>{result.birthstone.name}</strong> ({result.birthstone.hex}). Both are shown separately. The combined hue is calculated on the server only after your email subscription is confirmed.
                </p>
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
                    style={{ padding: '14px 18px', border: 0, borderRadius: '4px', background: submitting ? '#5d5c68' : 'linear-gradient(115deg, #c9e0d8, #d9c9ff)', color: '#101018', fontWeight: 700, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.8 : 1, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >
                    {submitting ? 'Confirming subscription…' : 'Subscribe and reveal'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p style={eyebrow}>SUBSCRIPTION CONFIRMED · TWO-PRIMARY REVEAL</p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(1.7rem, 5vw, 2.4rem)', margin: '12px 0' }}>Your primaries, now combined</h2>
                {subscriptionMessage && <p style={{ ...muted, color: '#c9e0d8' }}>{subscriptionMessage}</p>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '12px', marginTop: '20px' }}>
                  <div style={{ padding: '14px', border: '1px solid ' + result.firstHue.hex + '66', borderRadius: '8px' }}>
                    <div style={{ height: '46px', borderRadius: '6px', background: result.firstHue.hex, marginBottom: '10px' }} />
                    <strong>{readableName(result.firstHue.name)}</strong>
                    <p style={{ ...muted, fontSize: '0.78rem' }}>{result.firstHue.hex}</p>
                  </div>
                  <div style={{ padding: '14px', border: '1px solid ' + result.birthstone.hex + '66', borderRadius: '8px' }}>
                    <div style={{ height: '46px', borderRadius: '6px', background: result.birthstone.hex, marginBottom: '10px' }} />
                    <strong>{result.birthstone.name}</strong>
                    <p style={{ ...muted, fontSize: '0.78rem' }}>{result.birthstone.hex} · geographic opacity {result.birthstone.opacityPercent.toFixed(1)}%</p>
                  </div>
                </div>
                <div style={{ height: 'min(240px, 42vw)', minHeight: '150px', borderRadius: '8px', margin: '24px 0 16px', background: unlockedBlend?.hex || blendTwoHex(result.firstHue.hex, result.birthstone.hex), boxShadow: '0 0 45px ' + ((unlockedBlend?.hex || blendTwoHex(result.firstHue.hex, result.birthstone.hex)) + '55'), border: '1px solid rgba(255,255,255,0.22)' }} />
                <h3 style={{ color: unlockedBlend?.hex || result.firstHue.hex, fontFamily: 'Georgia, serif', fontSize: 'clamp(1.35rem, 4vw, 2rem)', fontWeight: 400, margin: '0 0 8px' }}>
                  {unlockedBlend?.name || (readableName(result.firstHue.name) + ' × ' + result.birthstone.name)}
                </h3>
                <p style={muted}>
                  {(unlockedBlend?.hex || blendTwoHex(result.firstHue.hex, result.birthstone.hex))} · equal 50/50 RGB blend of Primary Hue 1 and Primary Hue 2 only.
                </p>
                <p style={{ ...muted, fontSize: '0.8rem' }}>Zodiac traits and today's placement are contextual; neither is added as a third blend ingredient.</p>
              </>
            )}
          </section>
        </>
      )}

      <footer style={{ ...panel, textAlign: 'center', padding: '22px' }}>
        <p style={eyebrow}>AURA-SPECTRUM · TWO-PRIMARY REVEAL</p>
        <p style={{ ...muted, fontSize: '0.82rem' }}>
          A custom symbolic model for entertainment and self-reflection, not a scientifically validated measure of personality, emotion, or destiny.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <a href="/aura-scope-mechanism.html" style={{ color: '#d9c9ff', textUnderlineOffset: '4px' }}>Enter another birthdate</a>
          <button onClick={() => setRetryKey((key) => key + 1)} style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#f3f0eb', padding: '9px 14px', borderRadius: '999px', cursor: 'pointer' }}>Recalculate today</button>
          <a href="/reveal" style={{ color: 'rgba(243,240,235,0.6)', textUnderlineOffset: '4px' }}>Open classic reveal</a>
        </div>
      </footer>
    </main>
  )
}
