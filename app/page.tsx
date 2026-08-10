'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [birthdate, setBirthdate] = useState('')

  const goReveal = () => {
    if (!birthdate) return
    localStorage.setItem('birthdate', birthdate)
    router.push('/reveal')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 50% 20%, rgba(156,116,255,0.28), transparent 28%), radial-gradient(circle at 10% 90%, rgba(16,200,192,0.2), transparent 24%), #05030a',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <p style={{ letterSpacing: '0.34em', opacity: 0.72, margin: 0 }}>AURASPANSE PRESENTS</p>
      <h1 style={{ fontSize: 'clamp(3rem, 12vw, 7rem)', lineHeight: 0.88, margin: 0 }}>AURACLE</h1>
      <p style={{ maxWidth: '680px', fontSize: '1.1rem', lineHeight: 1.7, opacity: 0.84, margin: 0 }}>
        Reveal your digital aura through three living hues: zodiac traits, birthstone resonance, and a 365-day time factor. The blend becomes your uniquely positioned AuraScope inside AuraSpanse.
      </p>

      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '24px',
          padding: '22px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        }}
      >
        <label style={{ textAlign: 'left', fontSize: '0.85rem', opacity: 0.72 }}>Birth date</label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          style={{
            padding: '15px',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: '#05030a',
            color: 'white',
            fontSize: '1rem',
          }}
        />

        <button
          onClick={goReveal}
          disabled={!birthdate}
          style={{
            padding: '15px 24px',
            borderRadius: '999px',
            border: 'none',
            background: birthdate ? 'linear-gradient(135deg, #9c74ff, #10c8c0)' : '#333',
            color: 'white',
            cursor: birthdate ? 'pointer' : 'not-allowed',
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          Reveal My AuraScope
        </button>
      </div>

      <p style={{ maxWidth: '560px', fontSize: '0.82rem', lineHeight: 1.6, opacity: 0.52, margin: 0 }}>
        AuraScope readings are generated for entertainment and personal reflection. They are not medical, psychological, financial, or professional advice.
      </p>
    </main>
  )
}
