'use client'

import { useEffect } from 'react'

/** Route visitors to the self-contained Aura-Scope prototype shipped in public/. */
export default function PrototypeRedirect() {
  useEffect(() => {
    window.location.replace('/aura-scope-mechanism.html')
  }, [])

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeContent: 'center',
        gap: '16px',
        padding: '24px',
        background: '#07080a',
        color: '#e9e6df',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <p>Opening AuraSpanse…</p>
      <a href="/aura-scope-mechanism.html" style={{ color: '#e9e6df' }}>
        Continue to Aura-Scope
      </a>
    </main>
  )
}
