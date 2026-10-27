import type { EmotionColor } from './emotionColors'

const MODULUS = 1_000_003

const ZODIAC_ORDER = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
]

export interface AgeSpectrumPlacement {
  daysAlive: number
  spectrumPointCount: number
  ageSpectrumRatio: number
  completedSpectrumCycles: number
  remainingLifeDays: number
  exponentResidue: number
  exponentIndex: number
  firstHueIndex: number
  currentPlacementIndex: number
  firstHue: EmotionColor
  currentPlacement: EmotionColor
}

/** Calculate base^exponent modulo a bounded prime without constructing the enormous integer. */
function modularPower(base: number, exponent: number, modulus: number): number {
  let result = 1
  let factor = base % modulus
  let power = Math.floor(exponent)

  // Intermediate products stay below modulus² (< 10¹²), safely inside JS integer precision.
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus
    factor = (factor * factor) % modulus
    power = Math.floor(power / 2)
  }

  return result
}

function wrap(index: number, count: number): number {
  return ((index % count) + count) % count
}

/**
 * AuraSpanse age-spectrum rule:
 * 1. Divide days lived by the exact emotion-color point count.
 * 2. Use the bounded residue of points^daysAlive to derive the first hue.
 * 3. Advance the current placement by completed spectrum cycles and the current day-of-year.
 *
 * We intentionally do not calculate points^daysAlive as an ordinary number: it quickly
 * becomes too large. Using a prime modulus greater than the spectrum size keeps the rule
 * deterministic and bounded. The residue is not presented as a scientific measurement.
 */
export function getAgeSpectrumPlacement(
  daysAliveInput: number,
  zodiacSign: string,
  currentDayOfYear: number,
  spectrum: EmotionColor[]
): AgeSpectrumPlacement {
  if (!Number.isFinite(daysAliveInput) || daysAliveInput < 0) {
    throw new Error('daysAlive must be a finite, non-negative number')
  }
  if (!Number.isFinite(currentDayOfYear) || currentDayOfYear < 1) {
    throw new Error('currentDayOfYear must be a positive number')
  }
  if (!Array.isArray(spectrum) || spectrum.length === 0) {
    throw new Error('The AuraSpectrum must contain at least one emotion-color point')
  }

  const daysAlive = Math.floor(daysAliveInput)
  const dayOfYear = Math.floor(currentDayOfYear)
  const spectrumPointCount = spectrum.length

  const ageSpectrumRatio = daysAlive / spectrumPointCount
  const completedSpectrumCycles = Math.floor(ageSpectrumRatio)
  const remainingLifeDays = daysAlive % spectrumPointCount

  // This is the bounded equivalent of spectrumPointCount^daysAlive. Do not change the
  // modulus to spectrumPointCount itself: that would make the residue zero every time.
  const exponentResidue = modularPower(spectrumPointCount, daysAlive, MODULUS)
  const exponentIndex = exponentResidue % spectrumPointCount
  const zodiacIndex = Math.max(0, ZODIAC_ORDER.indexOf(zodiacSign.toLowerCase()))

  const firstHueIndex = wrap(exponentIndex + remainingLifeDays + zodiacIndex, spectrumPointCount)
  const currentPlacementIndex = wrap(
    firstHueIndex + completedSpectrumCycles + dayOfYear - 1,
    spectrumPointCount
  )

  return {
    daysAlive,
    spectrumPointCount,
    ageSpectrumRatio,
    completedSpectrumCycles,
    remainingLifeDays,
    exponentResidue,
    exponentIndex,
    firstHueIndex,
    currentPlacementIndex,
    firstHue: spectrum[firstHueIndex],
    currentPlacement: spectrum[currentPlacementIndex]
  }
}
