'use client'

import { useEffect, useState } from 'react'
import { generateAura } from '../lib/auraEngine'
import { generateAurascope } from '../lib/auracle'
import AuraSpectrum from '../components/AuraSpectrum'

export default function RevealPage() {
  const [auraData, setAuraData] = useState<any>(null)
  const [stage, setStage] = useState(0)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const birthdate = localStorage.getItem('birthdate')
    if (!birthdate) return

    let registeredAt = localStorage.getItem('auracle_registered_at')
    if (!registeredAt) {
      registeredAt = new Date().toISOString()
      localStorage.setItem('auracle_registered_at', registeredAt)
    }

    const data = generateAura(birthdate, registeredAt)
    setAuraData({ ...data, aurascope: generateAurascope(data), registeredAt })
  }, [])

  const handleSendEmail = async () => {
    if (!email || !auraData) return
    setSending(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          birthDate: localStorage.getItem('birthdate'),
          registeredAt: auraData.registeredAt,
        }),
      })
      if (res.ok) setSent(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  if (!auraData) {
    return (
      <main style={{ minHeight: '100vh', background: '#05030a', color: 'white', display: 'grid', placeItems: 'center', padding: '24px', textAlign: 'center' }}>
        <div>
          <p style={{ letterSpacing: '0.28em', opacity: 0.55 }}>AURACLE REVEAL</p>
          <h1>No birth date found</h1>
          <a href="/" style={{ color: '#9c74ff' }}>Return to start</a>
        </div>
      </main>
    )
  }

  const activeHues = auraData.hues.slice(0, stage).map((h: any) => h.hex)
  const aurascope = auraData.aurascope
  const finalColor = auraData.finalHex || auraData.finalEmotion.hex

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(156,116,255,0.18), transparent 30%), #05030a',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <AuraSpectrum
          birthSeed={auraData.lifePath * 111}
          dayOfYear={auraData.currentAuraDay}
          activeHues={activeHues}
          scanMode={stage < 3}
        />
      </div>

      <p style={{ letterSpacing: '0.28em', opacity: 0.55, margin: 0 }}>AURACLE REVEAL</p>
      <h1 style={{ fontSize: '2.5rem', margin: '0', textAlign: 'center' }}>{auraData.zodiac.sign}</h1>

      {stage === 0 && (
        <div className="card" style={{ background: '#111', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '660px', textAlign: 'center' }}>
          <h2 style={{ color: auraData.hues[0].hex }}>Hue 1: Zodiac Triad</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            Your {auraData.zodiac.sign} reveals three emotional traits: <strong>{auraData.zodiac.traits.join(' / ')}</strong>.
            The first aura word comes through <strong style={{ color: auraData.hues[0].hex }}> {auraData.hues[0].name.replace(/-/g, ' ')}</strong>.
          </p>
          <button onClick={() => setStage(1)} style={{ marginTop: '20px', padding: '12px 30px', borderRadius: '99px', border: 'none', background: auraData.hues[0].hex, color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            Reveal Hue 1
          </button>
        </div>
      )}

      {stage === 1 && (
        <div className="card" style={{ background: '#111', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '660px', textAlign: 'center' }}>
          <h2 style={{ color: auraData.hues[1].hex }}>Hue 2: Birthstone Resonance</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            Your birthstone, <strong>{auraData.zodiac.birthstone}</strong>, carries {auraData.zodiac.stoneTraits.join(' / ')}.
            It fades into the AuraSpectrum at <strong>{Math.round(auraData.stoneOpacity * 100)}% opacity</strong>, becoming <strong style={{ color: auraData.hues[1].hex }}> {auraData.hues[1].name.replace(/-/g, ' ')}</strong>.
          </p>
          <button onClick={() => setStage(2)} style={{ marginTop: '20px', padding: '12px 30px', borderRadius: '99px', border: 'none', background: auraData.hues[1].hex, color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            Reveal Hue 2
          </button>
        </div>
      )}

      {stage === 2 && (
        <div className="card" style={{ background: '#111', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '660px', textAlign: 'center' }}>
          <h2 style={{ color: auraData.hues[2].hex }}>Hue 3: {auraData.timeState}</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            Your time factor moves through Aura Day <strong>{auraData.currentAuraDay}</strong> of the 365-day cycle.
            That living position creates the state <strong style={{ color: auraData.hues[2].hex }}> {auraData.timeState}</strong> from {auraData.hues[2].name.replace(/-/g, ' ')}.
          </p>
          <button onClick={() => setStage(3)} style={{ marginTop: '20px', padding: '12px 30px', borderRadius: '99px', border: 'none', background: auraData.hues[2].hex, color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            Blend Final Aura
          </button>
        </div>
      )}

      {stage === 3 && (
        <div className="card" style={{ background: '#111', padding: '34px', borderRadius: '32px', width: '100%', maxWidth: '760px', textAlign: 'center', border: '1px solid #333' }}>
          <p style={{ letterSpacing: '0.2em', opacity: 0.6, marginTop: 0 }}>FINAL AURA POSITIONED</p>
          <h2 style={{ color: finalColor, fontSize: '2rem', marginBottom: '8px' }}>{auraData.finalAuraName}</h2>
          <p style={{ marginTop: 0, opacity: 0.7 }}>{auraData.finalFrequency}hz · {auraData.finalEmotion.name.replace(/-/g, ' ')} · {finalColor}</p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '24px', opacity: 0.9 }}>
            {aurascope.reading}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', margin: '26px 0' }}>
            {aurascope.hueSummary.map((hue: any) => (
              <div key={hue.label} style={{ border: `1px solid ${hue.hex}55`, background: `${hue.hex}14`, borderRadius: '18px', padding: '16px', textAlign: 'left' }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.75rem', opacity: 0.65 }}>{hue.label}</p>
                <strong style={{ color: hue.hex, fontSize: '1.05rem' }}>{hue.name}</strong>
                <p style={{ margin: '10px 0 0', fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.78 }}>{hue.meaning}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#05030a', borderRadius: '24px', padding: '22px', marginBottom: '24px' }}>
            <p style={{ margin: '0 0 8px', opacity: 0.55 }}>Auracle focus</p>
            <p style={{ margin: 0, fontSize: '1.08rem', lineHeight: 1.6 }}>{aurascope.focus}</p>
            <p style={{ margin: '18px 0 8px', opacity: 0.55 }}>Mantra</p>
            <p style={{ margin: 0, fontStyle: 'italic', color: finalColor }}>{aurascope.mantra}</p>
            <p style={{ margin: '18px 0 8px', opacity: 0.55 }}>Action</p>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{aurascope.action}</p>
          </div>

          {!sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="email" placeholder="Enter email for full AuraScope reading" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #444', background: '#000', color: 'white' }} />
              <button onClick={handleSendEmail} disabled={sending} style={{ padding: '15px', borderRadius: '99px', border: 'none', background: 'white', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                {sending ? 'Sending...' : 'Send My Full Reading'}
              </button>
              <p style={{ fontSize: '0.78rem', opacity: 0.55, margin: 0 }}>For entertainment and personal reflection only.</p>
            </div>
          ) : (
            <p style={{ color: '#4caf50', fontWeight: 'bold' }}>Reading sent! Check your inbox.</p>
          )}
        </div>
      )}
    </main>
  )
}
