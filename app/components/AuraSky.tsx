'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  phase: number
  rate: number
}

/** Decorative static-glow sky; it does not feed or change any Aura-Spectrum calculation. */
export default function AuraSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const stars: Star[] = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 1.15 + 0.2,
      phase: Math.random() * Math.PI * 2,
      rate: 0.35 + Math.random() * 0.8,
    }))

    let frameId = 0
    let cssWidth = 0
    let cssHeight = 0
    let pixelRatio = 1

    const resize = () => {
      pixelRatio = Math.min(2, window.devicePixelRatio || 1)
      cssWidth = window.innerWidth
      cssHeight = window.innerHeight
      canvas.width = Math.round(cssWidth * pixelRatio)
      canvas.height = Math.round(cssHeight * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const draw = (time: number) => {
      context.clearRect(0, 0, cssWidth, cssHeight)

      const atmosphere = context.createRadialGradient(
        cssWidth * 0.5, cssHeight * 0.28, 0,
        cssWidth * 0.5, cssHeight * 0.28, Math.max(cssWidth, cssHeight) * 0.9,
      )
      atmosphere.addColorStop(0, 'rgba(25, 28, 45, 0.66)')
      atmosphere.addColorStop(0.48, 'rgba(10, 11, 18, 0.32)')
      atmosphere.addColorStop(1, 'rgba(7, 8, 12, 0)')
      context.fillStyle = atmosphere
      context.fillRect(0, 0, cssWidth, cssHeight)

      for (const star of stars) {
        const pulse = reducedMotion ? 0.55 : 0.35 + (Math.sin(time * 0.00045 * star.rate + star.phase) + 1) * 0.22
        context.beginPath()
        context.arc(star.x * cssWidth, star.y * cssHeight, star.radius, 0, Math.PI * 2)
        context.fillStyle = 'rgba(246, 241, 232, ' + pulse.toFixed(3) + ')'
        context.fill()
      }
    }

    const animate = (time: number) => {
      draw(time)
      if (!reducedMotion) frameId = window.requestAnimationFrame(animate)
    }

    resize()
    draw(0)
    if (!reducedMotion) frameId = window.requestAnimationFrame(animate)
    window.addEventListener('resize', resize)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        display: 'block',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
