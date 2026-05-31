'use client'

import React, { useEffect, useRef } from 'react';
import { emotionColors } from '../lib/emotionColors';

interface AuraSpectrumProps {
  birthSeed: number;
  dayOfYear: number;
  activeHues?: string[];
  scanMode?: boolean;
}

const AuraSpectrum: React.FC<AuraSpectrumProps> = ({ birthSeed, dayOfYear, activeHues = [], scanMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const birthFreq = birthSeed % 1000;

    const annOffset = (dayOfYear / 365) * Math.PI * 2;
    const norm = (Math.sin(annOffset) + 1) / 2;
    const baseSpeed = 0.00018 + norm * 0.00014;

    const freqToPolar = (freq: number) => {
      const TURNS = 4.5, MIN_R = 18;
      const t = freq / 1000;
      const maxR = (size / 2) - 12;
      return {
        r: MIN_R + t * (maxR - MIN_R),
        theta: t * TURNS * Math.PI * 2
      };
    };

    const toXY = (r: number, theta: number, rotation: number) => {
      return {
        x: cx + r * Math.cos(theta + rotation - Math.PI / 2),
        y: cy + r * Math.sin(theta + rotation - Math.PI / 2)
      };
    };

    let rafId: number;
    const render = () => {
      rotationRef.current += baseSpeed;
      const rotation = rotationRef.current;

      ctx.clearRect(0, 0, size, size);

      // Background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx);
      bg.addColorStop(0, 'rgba(255,255,255,0.05)');
      bg.addColorStop(0.12, 'rgba(180,160,255,0.03)');
      bg.addColorStop(0.42, 'rgba(10,8,20,0.9)');
      bg.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size, size);

      // Spiral ribbon
      const steps = 600;
      for (let i = 0; i < steps - 1; i++) {
        const f0 = (i / steps) * 1000, f1 = ((i + 1) / steps) * 1000;
        const p0 = freqToPolar(f0), p1 = freqToPolar(f1);
        const c0 = toXY(p0.r, p0.theta, rotation), c1 = toXY(p1.r, p1.theta, rotation);
        
        const colorIdx = Math.floor((i / steps) * (emotionColors.length - 1));
        const hex = emotionColors[colorIdx].hex;
        const alpha = i < 60 ? i / 60 : 1;
        const aHex = Math.floor(alpha * 150).toString(16).padStart(2, '0');
        
        ctx.beginPath();
        ctx.moveTo(c0.x, c0.y);
        ctx.lineTo(c1.x, c1.y);
        ctx.strokeStyle = hex + aHex;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Active Hue Glows
      activeHues.forEach((hex, idx) => {
        // Simplified: just show a general glow if active
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.002 + idx);
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
        glow.addColorStop(0, hex + '22');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, size, size);
        ctx.globalCompositeOperation = 'source-over';
      });

      // Birth point
      const bp = freqToPolar(birthFreq);
      const bxy = toXY(bp.r, bp.theta, rotation);
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * (scanMode ? 0.005 : 0.002));
      const BGR = 8;

      // Pulse rings
      for (let ring = 2; ring >= 1; ring--) {
        const rR = BGR * ring * (1 + pulse * 0.2);
        const rGrd = ctx.createRadialGradient(bxy.x, bxy.y, 0, bxy.x, bxy.y, rR);
        rGrd.addColorStop(0, '#ffffff22');
        rGrd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(bxy.x, bxy.y, rR, 0, Math.PI * 2);
        ctx.fillStyle = rGrd;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(bxy.x, bxy.y, BGR, 0, Math.PI * 2);
      const cGrd = ctx.createRadialGradient(bxy.x, bxy.y, 0, bxy.x, bxy.y, BGR);
      cGrd.addColorStop(0, '#ffffff');
      cGrd.addColorStop(1, '#ffffff44');
      ctx.fillStyle = cGrd;
      ctx.fill();

      rafId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(rafId);
  }, [birthSeed, dayOfYear, activeHues, scanMode]);

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto">
      <canvas
        ref={canvasRef}
        width={1000}
        height={1000}
        className="w-full h-full rounded-full"
      />
    </div>
  );
};

export default AuraSpectrum;
