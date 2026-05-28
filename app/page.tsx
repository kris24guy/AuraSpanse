AuraSpanse/app/reveal
/page.tsx
kris24guy
kris24guy
Create page.tsx
d8b1500
 · 
1 hour ago
AuraSpanse/app/reveal
/page.tsx

Code

Blame
183 lines (160 loc) · 4.1 KB
'use client'

import { useEffect, useState } from 'react'

const zodiacData: any = {
  Aries: {
    strength: {
      title: 'Solar Drive',
      color: '#ff5f5f',
      emotion: 'Determined',
      text: 'Aries historically stabilizes through momentum and fearless initiation.',
    },
    balance: {
      title: 'Velvet Ember',
      color: '#ff9966',
      emotion: 'Focused',
      text: 'Balance comes through controlled action and directional clarity.',
    },
    weakness: {
      title: 'Crimson Static',
      color: '#990000',
      emotion: 'Impulsive',
      text: 'Under pressure, Aries can fragment into reactive intensity.',
    },
  },
}

function getZodiac(dateString: string) {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return 'Aries'
  }

  return 'Aries'
}

export default function RevealPage() {
  const [zodiac, setZodiac] = useState('')
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const birthdate = localStorage.getItem('birthdate')

    if (!birthdate) return

    const z = getZodiac(birthdate)

    setZodiac(z)
  }, [])

  if (!zodiac) {
    return null
  }

  const data = zodiacData[zodiac]

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'black',
        color: 'white',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
      }}
    >
      <h1>{zodiac}</h1>

      {stage >= 0 && (
        <div
          style={{
            background: data.strength.color,
            padding: '30px',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '700px',
          }}
        >
          <h2>Strength — {data.strength.title}</h2>
          <p>{data.strength.text}</p>

          {stage === 0 && (
            <button onClick={() => setStage(1)}>
              Ignite Balance
            </button>
          )}
        </div>
      )}

      {stage >= 1 && (
        <div
          style={{
            background: data.balance.color,
            padding: '30px',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '700px',
          }}
        >
          <h2>Balance — {data.balance.title}</h2>
          <p>{data.balance.text}</p>

          {stage === 1 && (
            <button onClick={() => setStage(2)}>
              Ignite Weakness
            </button>
          )}
        </div>
      )}

      {stage >= 2 && (
        <div
          style={{
            background: data.weakness.color,
            padding: '30px',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '700px',
          }}
        >
          <h2>Weakness — {data.weakness.title}</h2>
          <p>{data.weakness.text}</p>

          {stage === 2 && (
            <button onClick={() => setStage(3)}>
              Generate Hue One
            </button>
          )}
        </div>
      )}

      {stage >= 3 && (
        <div
          style={{
            background: 'linear-gradient(to right, cyan, violet)',
            padding: '40px',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '700px',
            textAlign: 'center',
          }}
        >
          <h1>LUMINAL TIDE</h1>

          <p>
            Your aura spectrum stabilized into a frequency of
            determined intuition and controlled emotional momentum.
          </p>

          <input
            type="email"
            placeholder="Enter email for full reading"
            style={{
              marginTop: '20px',
              padding: '12px',
              width: '100%',
              borderRadius: '12px',
              border: 'none',
            }}
          />

          <button
            style={{
              marginTop: '20px',
              padding: '14px 24px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Send My Reading
          </button>
        </div>
      )}
    </main>
  )
}
