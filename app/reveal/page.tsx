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
    const data = generateAura(birthdate)
    setAuraData({ ...data, aurascope: generateAurascope(data) })
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
          zodiac: auraData.zodiac.sign,
          hue1: auraData.hues[0].name,
          hue2: auraData.hues[1].name,
          hue3: auraData.hues[2].name,
        }),
      })
      if (res.ok) setSent(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  if (!auraData) return null

  const activeHues = auraData.hues.slice(0, stage).map((h: any) => h.hex)
  const aurascope = auraData.aurascope

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
          dayOfYear={auraData.dayOfYear} 
          activeHues={activeHues}
          scanMode={stage < 3}
        />
      </div>

      <p style={{ letterSpacing: '0.28em', opacity: 0.55, margin: 0 }}>AURACLE REVEAL</p>
      <h1 style={{ fontSize: '2.5rem', margin: '0' }}>{auraData.zodiac.sign}</h1>

      {stage === 0 && (
        <div className="card" style={{ background: '#111', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '600px', textAlign: 'center' }}>
          <h2 style={{ color: auraData.zodiac.color }}>Phase 1: The Celestial Origin</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            As a {auraData.zodiac.sign}, your core frequency is built on: 
            <strong> {auraData.zodiac.traits.join(', ')}</strong>.
          </p>
          <button 
            onClick={() => setStage(1)}
            style={{ marginTop: '20px', padding: '12px 30px', borderRadius: '99px', border: 'none', background: auraData.zodiac.color, color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Blend Traits to Hue 1
          </button>
        </div>
      )}

      {stage === 1 && (
        <div className="card" style={{ background: '#111', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '600px', textAlign: 'center' }}>
          <h2 style={{ color: auraData.hues[0].hex }}>Hue 1: {auraData.hues[0].name.replace(/-/g, ' ')}</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            By blending your zodiac traits with the time of your birth, we have stabilized your first hue. 
            This represents your <strong>External Projection</strong>.
          </p>
          <button 
            onClick={() => setStage(2)}
            style={{ marginTop: '20px', padding: '12px 30px', borderRadius: '99px', border: 'none', background: auraData.hues[0].hex, color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Add Birthstone & Numerology
          </button>
        </div>
      )}

      {stage === 2 && (
        <div className="card" style={{ background: '#111', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '600px', textAlign: 'center' }}>
          <h2 style={{ color: auraData.hues[1].hex }}>Hue 2: {auraData.hues[1].name.replace(/-/g, ' ')}</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            Your birthstone, <strong>{auraData.zodiac.birthstone}</strong>, provides properties of {auraData.zodiac.stoneTraits.join(', ')}. 
            Combined with your Life Path number <strong>{auraData.lifePath}</strong>, your second hue emerges.
          </p>
          <button 
            onClick={() => setStage(3)}
            style={{ marginTop: '20px', padding: '12px 30px', borderRadius: '99px', border: 'none', background: auraData.hues[1].hex, color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Balance the Spectrum
          </button>
        </div>
      )}

      {stage === 3 && (
        <div className="card" style={{ background: '#111', padding: '34px', borderRadius: '32px', width: '100%', maxWidth: '720px', textAlign: 'center', border: '1px solid #333' }}>
          <p style={{ letterSpacing: '0.2em', opacity: 0.6, marginTop: 0 }}>HUE 3 GENERATED</p>
          <h2 style={{ color: auraData.hues[2].hex, fontSize: '2rem', marginBottom: '8px' }}>{aurascope.title}</h2>
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
            <p style={{ margin: 0, fontStyle: 'italic', color: auraData.hues[2].hex }}>{aurascope.mantra}</p>
            <p style={{ margin: '18px 0 8px', opacity: 0.55 }}>Action</p>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{aurascope.action}</p>
          </div>
          
          {!sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="email" 
                placeholder="Enter email for full 12-page reading"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '15px', borderRadius: '12px', border: '1px solid #444', background: '#000', color: 'white' }}
              />
              <button 
                onClick={handleSendEmail}
                disabled={sending}
                style={{ padding: '15px', borderRadius: '99px', border: 'none', background: 'white', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {sending ? 'Sending...' : 'Send Full Reading'}
              </button>
            </div>
          ) : (
            <p style={{ color: '#4caf50', fontWeight: 'bold' }}>Reading sent! Check your inbox.</p>
          )}

          <div style={{ marginTop: '40px', borderTop: '1px solid #222', paddingTop: '20px' }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Support the project & get priority readings:</p>
            <a 
              href="https://github.com/sponsors/kris24guy" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: '10px', padding: '10px 20px', borderRadius: '8px', background: '#24292e', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}
            >
              ❤ Donate via GitHub
            </a>
          </div>
        </div>
      )}
    </main>
  )
}
