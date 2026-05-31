'use client'

import { useEffect, useState } from 'react'
import { generateAura } from '../lib/auraEngine'
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
    setAuraData(data)
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

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'black',
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
          <h2 style={{ color: auraData.hues[0].hex }}>Hue 1: {auraData.hues[0].name}</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            By blending your zodiac traits with the time of your birth, we've stabilized your first hue. 
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
          <h2 style={{ color: auraData.hues[1].hex }}>Hue 2: {auraData.hues[1].name}</h2>
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
        <div className="card" style={{ background: '#111', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '600px', textAlign: 'center', border: '1px solid #333' }}>
          <h2 style={{ color: auraData.hues[2].hex }}>The Balanced Hue: {auraData.hues[2].name}</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>
            Your spectrum is now balanced. The competition between your external projection and inner stone properties 
            has harmonized into a final signature frequency.
          </p>
          
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
