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
    <main style={{ minHeight: '100vh', background: 'black', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <h1>AURASPANSE</h1>

      <input
        type="date"
        value={birthdate}
        onChange={(e) => setBirthdate(e.target.value)}
      />

      <button onClick={goReveal}>
        Reveal My Aura
      </button>
    </main>
  )
}
