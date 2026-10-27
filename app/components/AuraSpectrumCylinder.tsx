'use client'

import type { OriginEmotionColor } from '../lib/originSpectrumEngine'

interface AuraSpectrumCylinderProps {
  spectrum: OriginEmotionColor[]
  firstHueIndex: number
  currentPlacementIndex: number
  birthstoneHex: string
  birthstoneOpacity: number
}

function rgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ]
}

function mixHex(baseHex: string, overlayHex: string, opacity: number): string {
  const base = rgb(baseHex)
  const overlay = rgb(overlayHex)
  const alpha = Math.min(1, Math.max(0, opacity))
  return '#' + base.map((channel, index) =>
    Math.round(channel * (1 - alpha) + overlay[index] * alpha).toString(16).padStart(2, '0')
  ).join('')
}

function darkenHex(hex: string, darkness: number): string {
  return mixHex(hex, '#07080c', darkness)
}

export default function AuraSpectrumCylinder({
  spectrum,
  firstHueIndex,
  currentPlacementIndex,
  birthstoneHex,
  birthstoneOpacity,
}: AuraSpectrumCylinderProps) {
  const count = spectrum.length
  const cx = 210
  const topY = 46
  const baseY = 388
  const cylinderHeight = baseY - topY
  const radius = 101
  const goldenAngleDegrees = 137.50776405003785
  const currentPoint = ((currentPlacementIndex - firstHueIndex) % count + count) % count

  const points = spectrum.map((_, step) => {
    const position = step / Math.max(1, count - 1)
    const angle = (step * goldenAngleDegrees * Math.PI) / 180

    // The sequence starts at the bright central origin, expands into a cylindrical
    // envelope, then follows a constant-radius golden-angle path upward.
    const radialRamp = Math.min(1, Math.sqrt(step / Math.max(1, count * 0.12)))
    const r = radius * radialRamp
    const x = cx + Math.cos(angle) * r
    const y = baseY - position * cylinderHeight
    const spectrumIndex = (firstHueIndex + step) % count
    const spectrumPoint = spectrum[spectrumIndex]
    const gemLayer = Math.min(1, Math.max(0, birthstoneOpacity)) * (1 - 0.23 * position)
    const colored = mixHex(spectrumPoint.hex, birthstoneHex, gemLayer)
    const color = step === 0 ? '#fffdf7' : darkenHex(colored, 0.05 + 0.78 * position)
    const pointOpacity = step === 0 ? 1 : Math.max(0.14, 0.95 - 0.71 * position)
    const size = step === 0 ? 7.8 : (1.15 + 1.05 * (1 - position))
    return {
      step,
      spectrumIndex,
      spectrumPoint,
      x,
      y,
      color,
      pointOpacity,
      size,
      isCurrent: step === currentPoint,
      isFirst: step === 0,
    }
  })

  return (
    <div style={{ width: '100%', maxWidth: '540px', margin: '0 auto' }}>
      <svg
        viewBox="0 0 420 440"
        role="img"
        aria-label={`Aura-Spectrum cylindrical Fibonacci pattern using ${count} emotion-color points, a bright central origin, upward darkening, and ${birthstoneHex} birthstone resonance at ${Math.round(birthstoneOpacity * 100)} percent opacity`}
        style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="aura-core-glow">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
            <stop offset="27%" stopColor={birthstoneHex} stopOpacity={0.46 + birthstoneOpacity * 0.25} />
            <stop offset="100%" stopColor={birthstoneHex} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="aura-cylinder-fade" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#fffdf7" stopOpacity="0.36" />
            <stop offset="30%" stopColor={birthstoneHex} stopOpacity={birthstoneOpacity * 0.24} />
            <stop offset="100%" stopColor="#030307" stopOpacity="0.10" />
          </linearGradient>
          <filter id="aura-soft-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <ellipse cx={cx} cy={baseY - cylinderHeight / 2} rx={radius + 20} ry={cylinderHeight / 2 + 12}
          fill="url(#aura-cylinder-fade)" opacity="0.18" />
        <path d={`M ${cx - radius} ${topY} L ${cx - radius} ${baseY - 12} M ${cx + radius} ${topY} L ${cx + radius} ${baseY - 12}`}
          fill="none" stroke="#d8d5e8" strokeOpacity="0.12" strokeWidth="1" />
        <ellipse cx={cx} cy={topY} rx={radius} ry="17" fill="none" stroke="#d8d5e8" strokeOpacity="0.12" strokeDasharray="3 7" />
        <ellipse cx={cx} cy={baseY - 10} rx={radius} ry="17" fill="none" stroke={birthstoneHex} strokeOpacity={0.10 + birthstoneOpacity * 0.18} />

        <circle cx={cx} cy={baseY} r="34" fill="url(#aura-core-glow)" filter="url(#aura-soft-glow)" />
        {points.map((point) => (
          <g key={point.step}>
            {point.isCurrent && !point.isFirst && (
              <circle cx={point.x} cy={point.y} r={point.size + 5} fill="none" stroke="#ffffff" strokeOpacity="0.95" strokeWidth="1.4" />
            )}
            <circle
              cx={point.x}
              cy={point.y}
              r={point.size}
              fill={point.color}
              fillOpacity={point.pointOpacity}
              stroke={point.isCurrent ? '#ffffff' : 'none'}
              strokeWidth={point.isCurrent ? 1.5 : 0}
            >
              <title>
                {point.isFirst
                  ? `Bright origin · first hue · spectrum point ${point.spectrumIndex + 1} · ${point.spectrumPoint.name}`
                  : point.isCurrent
                    ? `Current placement · spectrum point ${point.spectrumIndex + 1} · ${point.spectrumPoint.name}`
                    : `Fibonacci point ${point.step + 1} · spectrum point ${point.spectrumIndex + 1} · ${point.spectrumPoint.name}`}
              </title>
            </circle>
          </g>
        ))}
        <circle cx={cx} cy={baseY} r="12" fill="#ffffff" fillOpacity="0.96" />
        <circle cx={cx} cy={baseY} r="22" fill="none" stroke={birthstoneHex} strokeOpacity={birthstoneOpacity} strokeWidth="1.2" />
        <text x={cx} y="20" fill="#a8a5b7" fontSize="9" textAnchor="middle" letterSpacing="2.3">DARKER · UPPER FIELD</text>
        <text x={cx} y="427" fill="#f1eee8" fontSize="9" textAnchor="middle" letterSpacing="2.1">BRIGHT ORIGIN · CENTRAL POINT</text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.76rem', color: 'rgba(243,240,235,0.65)', marginTop: '4px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#fffdf7', boxShadow: '0 0 8px #ffffff' }} />
          First hue origin
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', border: '1.5px solid white', background: '#6d6b7f' }} />
          Current placement
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: birthstoneHex }} />
          Birthstone overlay
        </span>
      </div>
    </div>
  )
}
