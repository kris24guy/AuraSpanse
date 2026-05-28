'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [birthDate, setBirthDate] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;
    router.push(`/reveal?d=${birthDate}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Georgia", serif',
      padding: '2rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Cinzel:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          pointer-events: none;
          animation: drift 12s ease-in-out infinite alternate;
        }
        @keyframes drift {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(40px,-30px) scale(1.1); }
        }
        .date-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.15);
          color: #e8e0d0;
          padding: 1rem 1.25rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          letter-spacing: 0.05em;
          outline: none;
          transition: border-color 0.3s;
          color-scheme: dark;
        }
        .date-input:focus { border-color: rgba(255,200,100,0.5); }
        .cta-btn {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255,200,100,0.6);
          color: #f0d080;
          padding: 1rem;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: all 0.4s;
          text-transform: uppercase;
        }
        .cta-btn:hover:not(:disabled) {
          background: rgba(255,200,100,0.08);
          border-color: rgba(255,200,100,0.9);
          color: #ffd966;
        }
        .cta-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .pulse-ring {
          position: absolute;
          inset: -8px;
          border: 1px solid rgba(255,200,100,0.2);
          border-radius: 0;
          animation: pulse-out 3s ease-out infinite;
          pointer-events: none;
        }
        @keyframes pulse-out {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.04); }
        }
      `}</style>

      {/* Ambient orbs */}
      <div className="orb" style={{ width: 500, height: 500, background: '#4a1a6a', top: '-10%', left: '-10%' }} />
      <div className="orb" style={{ width: 400, height: 400, background: '#1a3a6a', bottom: '-10%', right: '-5%', animationDelay: '4s' }} />
      <div className="orb" style={{ width: 300, height: 300, background: '#6a2a1a', top: '40%', right: '20%', animationDelay: '8s' }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 440, width: '100%', textAlign: 'center' }}>

        {/* Sigil mark */}
        <div style={{ marginBottom: '2.5rem' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 1rem' }}>
            <circle cx="24" cy="24" r="20" stroke="rgba(255,200,100,0.4)" strokeWidth="0.5" />
            <circle cx="24" cy="24" r="12" stroke="rgba(255,200,100,0.25)" strokeWidth="0.5" />
            <line x1="24" y1="4" x2="24" y2="44" stroke="rgba(255,200,100,0.2)" strokeWidth="0.5" />
            <line x1="4" y1="24" x2="44" y2="24" stroke="rgba(255,200,100,0.2)" strokeWidth="0.5" />
            <circle cx="24" cy="24" r="2.5" fill="rgba(255,200,100,0.6)" />
          </svg>
          <h1 style={{
            fontFamily: '"Cinzel", serif',
            fontSize: '2rem',
            fontWeight: 400,
            color: '#e8e0d0',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}>AuraSpanse</h1>
          <p style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            color: 'rgba(232,224,208,0.5)',
            fontSize: '1rem',
            letterSpacing: '0.1em',
          }}>your spectrum revealed</p>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,200,100,0.3))' }} />
          <span style={{ color: 'rgba(255,200,100,0.4)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>✦</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(255,200,100,0.3))' }} />
        </div>

        <p style={{
          fontFamily: '"Cormorant Garamond", serif',
          color: 'rgba(232,224,208,0.65)',
          fontSize: '1.05rem',
          lineHeight: 1.7,
          marginBottom: '2.5rem',
          letterSpacing: '0.03em',
        }}>
          Every soul carries a frequency.<br />
          Yours has been waiting since birth.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontFamily: '"Cinzel", serif',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              color: 'rgba(255,200,100,0.6)',
              marginBottom: '0.6rem',
              textTransform: 'uppercase',
            }}>Date of Birth</label>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              max={today}
              required
              className="date-input"
            />
          </div>

          <div style={{ position: 'relative' }}>
            {birthDate && <div className="pulse-ring" />}
            <button type="submit" disabled={!birthDate} className="cta-btn">
              Reveal My Aura
            </button>
          </div>
        </form>

        <p style={{
          marginTop: '2.5rem',
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic',
          color: 'rgba(232,224,208,0.25)',
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
        }}>
          Three hues. One reading. Yours alone.
        </p>
      </div>
    </main>
  );
}
