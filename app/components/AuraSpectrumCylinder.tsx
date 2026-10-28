'use client'

import { useState } from 'react'
import type { EmotionGlossaryPoint } from '../lib/emotionGlossary'

interface AuraSpectrumCylinderProps {
  spectrum: EmotionGlossaryPoint[]
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const count = spectrum.length
  const cx = 210
  const topY = 54
  const baseY = 710
  const cylinderHeight = baseY - topY
  const radius = 104
  const goldenAngleDegrees = 137.50776405003785
  const currentPoint = ((currentPlacementIndex - firstHueIndex) % count + count) % count

  const points = spectrum.map((_, step) => {
    const position = step / Math.max(1, count - 1)
    const angle = (step * goldenAngleDegrees * Math.PI) / 180
    const radialRamp = Math.min(1, Math.sqrt(step / Math.max(1, count * 0.12)))
    const r = radius * radialRamp
    const x = cx + Math.cos(angle) * r
    const y = baseY - position * cylinderHeight
    const spectrumIndex = (firstHueIndex + step) % count
    const spectrumPoint = spectrum[spectrumIndex]
    const gemLayer = Math.min(1, Math.max(0, birthstoneOpacity)) * (1 - 0.23 * position)
    const colored = mixHex(spectrumPoint.hex, birthstoneHex, gemLayer)
    const color = step === 0 ? colored : darkenHex(colored, 0.05 + 0.78 * position)
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
      isSelected: spectrumIndex === selectedIndex,
    }
  })

  const selectedPoint = points.find((point) => point.spectrumIndex === selectedIndex)
    ?? points.find((point) => point.isCurrent)
    ?? points[0]
  const filteredEntries = spectrum.map((point, index) => ({ point, index })).filter(({ point }) => {
    const query = search.trim().toLocaleLowerCase()
    return !query || (point.name + ' ' + point.definition).toLocaleLowerCase().includes(query)
  })

  return (
    <div style={{ width: '100%', maxWidth: '660px', margin: '0 auto' }}>
      <svg
        viewBox="0 0 420 760"
        role="img"
        aria-label={'Aura-Spectrum cyclone with ' + count + ' separately defined emotion points; bright origin at the base, a cylindrical golden-angle path, birthstone color blending, and upward darkening.'}
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
        <path
          d={'M ' + (cx - radius) + ' ' + topY + ' L ' + (cx - radius) + ' ' + (baseY - 12) + ' M ' + (cx + radius) + ' ' + topY + ' L ' + (cx + radius) + ' ' + (baseY - 12)}
          fill="none" stroke="#d8d5e8" strokeOpacity="0.12" strokeWidth="1"
        />
        <ellipse cx={cx} cy={topY} rx={radius} ry="17" fill="none" stroke="#d8d5e8" strokeOpacity="0.12" strokeDasharray="3 7" />
        <ellipse cx={cx} cy={baseY - 10} rx={radius} ry="17" fill="none" stroke={birthstoneHex} strokeOpacity={0.10 + birthstoneOpacity * 0.18} />
        <circle cx={cx} cy={baseY} r="34" fill="url(#aura-core-glow)" filter="url(#aura-soft-glow)" />

        {points.map((point) => (
          <g key={point.step}>
            {point.isCurrent && !point.isFirst && (
              <circle cx={point.x} cy={point.y} r={point.size + 5} fill="none" stroke="#ffffff" strokeOpacity="0.95" strokeWidth="1.4" />
            )}
            {point.isSelected && (
              <circle cx={point.x} cy={point.y} r={point.size + 3} fill="none" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="1.1" />
            )}
            <circle
              cx={point.x}
              cy={point.y}
              r={point.size}
              fill={point.color}
              fillOpacity={point.pointOpacity}
              stroke={point.isCurrent ? '#ffffff' : 'none'}
              strokeWidth={point.isCurrent ? 1.5 : 0}
              onClick={() => setSelectedIndex(point.spectrumIndex)}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={-1}
              aria-label={point.spectrumPoint.name + ': ' + point.spectrumPoint.definition + '. Base color ' + point.spectrumPoint.hex}
            >
              <title>{point.spectrumPoint.name + ' · ' + point.spectrumPoint.hex + ' · ' + point.spectrumPoint.definition}</title>
            </circle>
          </g>
        ))}
        <circle cx={cx} cy={baseY} r="12" fill="#ffffff" fillOpacity="0.96" />
        <circle cx={cx} cy={baseY} r="22" fill="none" stroke={birthstoneHex} strokeOpacity={birthstoneOpacity} strokeWidth="1.2" />
        <text x={cx} y="24" fill="#a8a5b7" fontSize="9" textAnchor="middle" letterSpacing="2.3">DARKER · UPPER FIELD</text>
        <text x={cx} y="744" fill="#f1eee8" fontSize="9" textAnchor="middle" letterSpacing="2.1">BRIGHT ORIGIN · CYCLONE BASE</text>
      </svg>

      {selectedPoint && (
        <section aria-live="polite" style={{ margin: '12px 0 16px', padding: '18px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', background: 'rgba(255,255,255,0.035)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span aria-hidden="true" style={{ display: 'inline-block', width: '25px', height: '25px', borderRadius: '50%', background: selectedPoint.spectrumPoint.hex, boxShadow: '0 0 18px ' + selectedPoint.spectrumPoint.hex + '55', flex: '0 0 auto' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 500 }}>{selectedPoint.spectrumPoint.name}</h3>
            <span style={{ marginLeft: 'auto', color: selectedPoint.spectrumPoint.hex, fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>{selectedPoint.spectrumPoint.hex}</span>
          </div>
          <p style={{ color: 'rgba(243,240,235,0.82)', lineHeight: 1.7, margin: '10px 0' }}>{selectedPoint.spectrumPoint.definition}</p>
          <p style={{ margin: 0, fontSize: '0.77rem', color: 'rgba(243,240,235,0.58)' }}>
            Point {selectedPoint.spectrumIndex + 1} of {count} · frequency {selectedPoint.spectrumPoint.freq}/1000 · {selectedPoint.spectrumPoint.colorAssignment === 'exact' ? 'exact palette-name match' : 'inferred band using nearest existing palette color: ' + selectedPoint.spectrumPoint.colorSourceName}
          </p>
        </section>
      )}

      <section style={{ marginTop: '18px' }}>
        <label htmlFor="aura-emotion-point-search" style={{ display: 'block', marginBottom: '8px', fontSize: '0.83rem', color: 'rgba(243,240,235,0.8)' }}>
          Search all {count} colored points and definitions
        </label>
        <input
          id="aura-emotion-point-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search a feeling or a phrase in its definition"
          style={{ boxSizing: 'border-box', width: '100%', padding: '12px 14px', borderRadius: '11px', border: '1px solid rgba(255,255,255,0.18)', outlineOffset: '3px', background: 'rgba(0,0,0,0.28)', color: '#f3f0eb', font: 'inherit' }}
        />
        <div aria-label="Emotion glossary points" style={{ maxHeight: '370px', overflowY: 'auto', marginTop: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '13px' }}>
          {filteredEntries.map(({ point, index }) => (
            <button
              key={point.name + '-' + index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-pressed={selectedIndex === index}
              style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', width: '100%', textAlign: 'left', padding: '10px 12px', border: 0, borderBottom: '1px solid rgba(255,255,255,0.055)', borderRadius: 0, background: selectedIndex === index ? 'rgba(255,255,255,0.09)' : 'transparent', color: '#f3f0eb', cursor: 'pointer' }}
            >
              <span aria-hidden="true" style={{ width: '13px', height: '13px', borderRadius: '50%', background: point.hex, boxShadow: '0 0 10px ' + point.hex + '44', marginTop: '4px', flex: '0 0 auto' }} />
              <span style={{ flex: '1 1 auto', minWidth: 0 }}>
                <strong style={{ display: 'block', fontWeight: 500, fontSize: '0.86rem' }}>{point.name}</strong>
                <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '3px', fontSize: '0.76rem', lineHeight: 1.45, color: 'rgba(243,240,235,0.66)' }}>{point.definition}</span>
              </span>
              <span style={{ flex: '0 0 auto', fontSize: '0.72rem', color: point.hex }}>{point.hex}</span>
            </button>
          ))}
          {filteredEntries.length === 0 && <p style={{ padding: '15px', color: 'rgba(243,240,235,0.65)' }}>No glossary entries match that search.</p>}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'rgba(243,240,235,0.55)', lineHeight: 1.5 }}>
          Select any row to highlight its point and open its full definition. Terms with a direct palette match retain that color; other terms use the nearest existing palette color selected by a deterministic semantic frequency band.
        </p>
      </section>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.76rem', color: 'rgba(243,240,235,0.65)', marginTop: '15px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: spectrum[firstHueIndex]?.hex ?? '#fffdf7', boxShadow: '0 0 8px #ffffff' }} />
          First hue origin
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', border: '1.5px solid white', background: spectrum[currentPlacementIndex]?.hex ?? '#6d6b7f' }} />
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
