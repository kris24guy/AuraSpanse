'use client'

import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { generateAura } from '../lib/auraEngine'
import { generateAurascope } from '../lib/auracle'
import AuraSpectrum from '../components/AuraSpectrum'

const shellStyle: CSSProperties = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at 50% 0%, rgba(156,116,255,0.24), transparent 28%), radial-gradient(circle at 15% 25%, rgba(16,200,192,0.12), transparent 28%), radial-gradient(circle at 85% 40%, rgba(255,224,0,0.08), transparent 24%), #05030a',
  color: 'white',
  padding: '22px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px'
}

function cardStyle(borderColor = 'rgba(255,255,255,0.12)'): CSSProperties {
  return {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))',
    border: `1px solid ${borderColor}`,
    boxShadow: '0 28px 80px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.08)',
    backdropFilter: 'blur(18px)',
    padding: '30px',
    borderRadius: '30px',
    width: '100%',
    maxWidth: '760px',
    textAlign: 'center'
  }
}

function labelStyle(): CSSProperties {
  return {
    letterSpacing: '0.26em',
    textTransform: 'uppercase',
    opacity: 0.56,
    fontSize: '0.72rem',
    margin: 0
  }
}

function cleanName(name: string) {
  return name.replace(/^The-/, '').replace(/-/g, ' ')
}

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
          registeredAt: auraData.registeredAt
        })
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
      <main style={shellStyle}>
        <div style={cardStyle()}>
          <p style={labelStyle()}>AURACLE REVEAL</p>
          <h1>No birth date found</h1>
          <a href="/" style={{ color: '#9c74ff' }}>Return to start</a>
        </div>
      </main>
    )
  }

  const activeHues = auraData.hues.slice(0, Math.min(stage + 1, auraData.hues.length)).map((h: any) => h.hex)
  const aurascope = auraData.aurascope
  const finalColor = auraData.finalHex || auraData.finalEmotion.hex
  const stages = [
    {
      eyebrow: 'PRIMARY AURA',
      title: aurascope.primaryAura,
      color: auraData.hues[0].hex,
      body: `Your ${auraData.zodiac.sign} trait triad opens through ${auraData.zodiac.selectedTrait.name}. Registration time lands at ${auraData.timeWeight}/1000, pulling the field toward the ${auraData.zodiac.selectedTrait.polarity} channel.`,
      button: 'Reveal secondary aura'
    },
    {
      eyebrow: 'SECONDARY AURA',
      title: aurascope.secondaryAura,
      color: auraData.hues[1].hex,
      body: `${auraData.zodiac.birthstone} joins the reading from your month stone set: ${aurascope.birthstones.join(' · ')}. Its properties blend at ${Math.round(auraData.stoneOpacity * 100)}% opacity.`,
      button: 'Reveal combined hue'
    },
    {
      eyebrow: 'THIRD COLOR',
      title: cleanName(auraData.hues[2].name),
      color: auraData.hues[2].hex,
      body: 'This third color is created by blending the primary zodiac hue with the secondary birthstone hue, then preparing it for the final time-weighted aura.',
      button: 'Blend final AuraScope'
    }
  ]

  return (
    <main style={shellStyle}>
      <div style={{ width: '100%', maxWidth: '440px', opacity: 0.92 }}>
        <AuraSpectrum
          birthSeed={auraData.lifePath * 111}
          dayOfYear={auraData.currentAuraDay}
          activeHues={activeHues}
          scanMode={stage < 3}
        />
      </div>

      <p style={labelStyle()}>AURACLE REVEAL</p>

      {stage < 3 && (
        <div style={cardStyle(stages[stage].color + '66')}>
          <p style={labelStyle()}>{stages[stage].eyebrow}</p>
          <h1 style={{ color: stages[stage].color, fontSize: '2.45rem', margin: '12px 0 10px' }}>{stages[stage].title}</h1>
          <p style={{ fontSize: '1.08rem', lineHeight: 1.75, opacity: 0.88, margin: '0 auto', maxWidth: '620px' }}>{stages[stage].body}</p>
          <button
            onClick={() => setStage(stage + 1)}
            style={{
              marginTop: '24px',
              padding: '13px 28px',
              borderRadius: '999px',
              border: 'none',
              background: `linear-gradient(135deg, ${stages[stage].color}, ${finalColor})`,
              color: 'white',
              cursor: 'pointer',
              fontWeight: 800,
              boxShadow: `${stages[stage].color}44 0 14px 36px`
            }}
          >
            {stages[stage].button}
          </button>
        </div>
      )}

      {stage === 3 && (
        <div style={cardStyle(finalColor + '77')}>
          <p style={labelStyle()}>FINAL AURASCOPE</p>
          <h1 style={{ color: finalColor, fontSize: '2.35rem', margin: '12px 0 6px', lineHeight: 1.1 }}>{aurascope.title}</h1>
          <p style={{ letterSpacing: '0.18em', opacity: 0.7, margin: '0 0 28px', fontSize: '0.78rem' }}>
            {auraData.zodiac.sign.toUpperCase()} · {aurascope.subtitleTraits.map((trait: string) => trait.toUpperCase()).join(' · ')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            <div style={{ border: `1px solid ${auraData.hues[0].hex}55`, background: `${auraData.hues[0].hex}14`, borderRadius: '20px', padding: '18px' }}>
              <p style={labelStyle()}>PRIMARY AURA</p>
              <h2 style={{ color: auraData.hues[0].hex, marginBottom: 0 }}>{aurascope.primaryAura}</h2>
            </div>
            <div style={{ border: `1px solid ${auraData.hues[1].hex}55`, background: `${auraData.hues[1].hex}14`, borderRadius: '20px', padding: '18px' }}>
              <p style={labelStyle()}>SECONDARY AURA</p>
              <h2 style={{ color: auraData.hues[1].hex, marginBottom: 0 }}>{aurascope.secondaryAura}</h2>
            </div>
          </div>

          <div style={{ textAlign: 'left', maxWidth: '660px', margin: '0 auto' }}>
            {aurascope.paragraphs.map((paragraph: string, index: number) => (
              <p key={index} style={{ fontSize: '1.08rem', lineHeight: 1.82, opacity: 0.9, margin: '0 0 18px' }}>{paragraph}</p>
            ))}
          </div>

          <div style={{ margin: '28px auto', padding: '22px', borderRadius: '24px', background: 'rgba(0,0,0,0.28)', maxWidth: '660px' }}>
            <p style={labelStyle()}>YOUR BIRTHSTONES</p>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 0 }}>{aurascope.birthstones.join(' · ')}</p>
            <p style={{ opacity: 0.56, fontSize: '0.84rem' }}>
              Based on your birthdate, zodiac resonance, birthstone properties, opacity blending, and subtle field patterns.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', margin: '22px 0' }}>
            {aurascope.hueSummary.map((hue: any) => (
              <div key={hue.label} style={{ border: `1px solid ${hue.hex}55`, background: `${hue.hex}12`, borderRadius: '18px', padding: '15px', textAlign: 'left' }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.68rem', opacity: 0.62 }}>{hue.label}</p>
                <strong style={{ color: hue.hex }}>{hue.name}</strong>
                <p style={{ margin: '9px 0 0', fontSize: '0.86rem', lineHeight: 1.5, opacity: 0.76 }}>{hue.meaning}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
            <a href="/" style={{ color: 'white', border: '1px solid rgba(255,255,255,0.18)', padding: '12px 20px', borderRadius: '999px', textDecoration: 'none' }}>Home</a>
            <button onClick={() => setStage(0)} style={{ color: 'white', background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', padding: '12px 20px', borderRadius: '999px', cursor: 'pointer' }}>Read Again</button>
          </div>

          {!sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '13px', margin: '28px auto 0', maxWidth: '420px' }}>
              <input type="email" placeholder="Enter email for full AuraScope reading" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '15px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.36)', color: 'white' }} />
              <button onClick={handleSendEmail} disabled={sending} style={{ padding: '15px', borderRadius: '99px', border: 'none', background: 'white', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                {sending ? 'Sending...' : 'Send My Full Reading'}
              </button>
              <p style={{ fontSize: '0.78rem', opacity: 0.55, margin: 0 }}>For entertainment and personal reflection only.</p>
            </div>
          ) : (
            <p style={{ color: '#70f0a0', fontWeight: 'bold' }}>Reading sent! Check your inbox.</p>
          )}
        </div>
      )}
    </main>
  )
}
