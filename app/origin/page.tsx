'use client'

import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { emotionColors } from '../lib/emotionColors'
import { getZodiacSign, zodiacMap } from '../lib/zodiacMap'
import { generateOriginSpectrum, type OriginSpectrumResult } from '../lib/originSpectrumEngine'

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

export default function OriginPage() {
  const [result, setResult] = useState<OriginSpectrumResult | null>(null)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    try {
      const birthDate = window.localStorage.getItem('birthdate')
      if (!birthDate) {
        setError('No birthdate is saved in this browser. Enter a birthdate to initialize the Origin Engine.')
        return
      }

      const generated = generateOriginSpectrum(birthDate, {
        now: new Date(),
        spectrum: emotionColors,
        zodiacMap,
        resolveZodiacSign: (date) => getZodiacSign(date),
      })
      setResult(generated)
      setError('')
    } catch (cause) {
      setResult(null)
      setError(cause instanceof Error ? cause.message : 'The Origin Engine could not process this birthdate.')
    }
  }, [retryKey])

  const gradient = useMemo(() => {
    const stops = emotionColors.map((emotion, index) => {
      const position = (index / Math.max(1, emotionColors.length - 1)) * 100
      return `${emotion.hex} ${position.toFixed(3)}%`
    })
    return `linear-gradient(90deg, ${stops.join(', ')})`
  }, [])

  return (
    <main style={shell}>
      <header style={{ ...panel, textAlign: 'center', paddingTop: '42px', paddingBottom: '42px' }}>
        <p style={eyebrow}>AURASPANSE · INDEPENDENT CALCULATION</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(2.4rem, 7vw, 4.3rem)', letterSpacing: '-0.035em', margin: '16px 0 12px' }}>
          Origin Engine
        </h1>
        <p style={{ ...muted, maxWidth: '670px', margin: '0 auto' }}>
          One birthdate. Every emotion-color point. A balanced zodiac triad and an age-weighted path through a closed spectrum.
        </p>
      </header>

      {error && (
        <section style={{ ...panel, borderColor: 'rgba(211,154,184,0.45)' }} aria-live="polite">
          <p style={eyebrow}>INPUT REQUIRED</p>
          <h2 style={{ color: '#d39ab8', fontWeight: 500 }}>{error}</h2>
          <p style={muted}>Return to the birthdate entry, enter a valid date, and initialize the new engine.</p>
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

          <section style={panel}>
            <p style={eyebrow}>THE CLOSED SPECTRUM</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, marginTop: '12px' }}>First hue → current placement → composite</h2>
            <div style={{ position: 'relative', height: '22px', margin: '30px 3px 12px', borderRadius: '99px', background: gradient, boxShadow: '0 0 28px rgba(255,255,255,0.08)' }} aria-label="Complete AuraSpanse emotion-color spectrum">
              <div title={`First hue: ${result.firstHue.name}`} style={{ position: 'absolute', left: `${(result.firstHueIndex / Math.max(1, result.spectrumPointCount - 1)) * 100}%`, top: '-7px', width: '3px', height: '36px', background: '#fff', boxShadow: '0 0 0 2px rgba(0,0,0,0.7)', borderRadius: '4px' }} />
              <div title={`Current placement: ${result.currentPlacement.name}`} style={{ position: 'absolute', left: `${(result.currentPlacementIndex / Math.max(1, result.spectrumPointCount - 1)) * 100}%`, top: '-4px', width: '7px', height: '30px', border: '2px solid #fff', background: result.currentPlacement.hex, boxShadow: '0 0 14px rgba(0,0,0,0.9)', borderRadius: '3px', transform: 'translateX(-2px)' }} />
            </div>
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', ...muted, fontSize: '0.85rem' }}>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#fff', marginRight: '7px' }} />First hue marker</span>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: result.currentPlacement.hex, border: '1px solid white', marginRight: '7px' }} />Current-placement marker</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '24px' }}>
              <div style={{ border: `1px solid ${result.firstHue.hex}88`, background: `${result.firstHue.hex}18`, borderRadius: '18px', padding: '20px' }}>
                <p style={eyebrow}>FIRST HUE · POINT {result.firstHueIndex + 1}</p>
                <div style={{ width: '100%', height: '62px', borderRadius: '12px', margin: '16px 0', background: result.firstHue.hex }} />
                <h3 style={{ color: result.firstHue.hex, margin: '0 0 5px' }}>{readableName(result.firstHue.name)}</h3>
                <p style={muted}>{result.firstHue.hex} · frequency {result.firstHue.freq}/1000</p>
              </div>
              <div style={{ border: `1px solid ${result.currentPlacement.hex}88`, background: `${result.currentPlacement.hex}18`, borderRadius: '18px', padding: '20px' }}>
                <p style={eyebrow}>CURRENT PLACEMENT · POINT {result.currentPlacementIndex + 1}</p>
                <div style={{ width: '100%', height: '62px', borderRadius: '12px', margin: '16px 0', background: result.currentPlacement.hex }} />
                <h3 style={{ color: result.currentPlacement.hex, margin: '0 0 5px' }}>{readableName(result.currentPlacement.name)}</h3>
                <p style={muted}>{result.currentPlacement.hex} · frequency {result.currentPlacement.freq}/1000</p>
              </div>
            </div>
          </section>

          <section style={panel}>
            <p style={eyebrow}>HISTORICAL ZODIAC FRAME</p>
            <h2 style={{ color: result.firstHue.hex, fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '2.2rem', margin: '12px 0 4px' }}>{result.zodiac.sign}</h2>
            <p style={muted}>{result.zodiac.element} · {result.zodiac.modality} · traditional ruler: {result.zodiac.traditionalRuler}</p>
            <p style={muted}>{result.zodiac.description} The sign's three symbolic channels receive equal one-third weights before they are combined with the age-derived hues.</p>

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

          <section style={{ ...panel, borderColor: `${result.composite.hex}88` }}>
            <p style={eyebrow}>THE NEW COMPOSITE EMOTION</p>
            <div style={{ width: '100%', height: '12px', borderRadius: '99px', background: result.composite.hex, boxShadow: `0 0 32px ${result.composite.hex}55`, margin: '18px 0' }} />
            <h2 style={{ color: result.composite.hex, fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(1.7rem, 5vw, 2.7rem)', margin: '12px 0' }}>{result.composite.name}</h2>
            <p style={muted}>{result.composite.hex} · blended frequency {result.composite.frequency}/1000 · nearest spectrum emotion: {readableName(result.composite.nearestEmotion.name)}</p>
            <p style={{ ...muted, fontSize: '1rem' }}>{result.composite.definition}</p>
            <h3 style={{ fontWeight: 500, marginTop: '26px' }}>Five equal source colors</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '10px' }}>
              {result.composite.sourceWeights.map((source) => (
                <div key={source.source} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '13px', padding: '12px' }}>
                  <div style={{ height: '30px', borderRadius: '7px', background: source.hex, marginBottom: '10px' }} />
                  <p style={{ ...muted, fontSize: '0.78rem', margin: 0 }}>{source.source}</p>
                  <strong style={{ display: 'block', fontSize: '0.87rem', marginTop: '6px' }}>{readableName(source.name)}</strong>
                  <p style={{ ...muted, fontSize: '0.75rem', margin: '5px 0 0' }}>{source.hex} · 20%</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <footer style={{ ...panel, textAlign: 'center', padding: '22px' }}>
        <p style={eyebrow}>ORIGIN ENGINE · VERSION 1</p>
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
