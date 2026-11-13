import type { BirthstoneResonance } from './birthstoneResonance'

export interface OriginEmotionColor {
  name: string
  hex: string
}

export interface OriginTraitChannel {
  polarity: 'positive' | 'neutral' | 'shadow'
  name: string
  hex: string
  weight: number
}

interface ZodiacEntry {
  sign: string
  element: string
  modality: string
  traditionalRuler: string
  description: string
  pos: OriginEmotionColor
  neu: OriginEmotionColor
  neg: OriginEmotionColor
}

export interface OriginSpectrumComposite {
  name: string
  hex: string
  baseHex: string
  nearestEmotion: OriginEmotionColor
  definition: string
  sourceWeights: Array<{ source: string; name: string; hex: string; weight: number }>
}

export interface OriginSpectrumHue1 {
  name: string
  hex: string
  nearestEmotion: OriginEmotionColor
  sourceWeights: Array<{ source: string; name: string; hex: string; weight: number }>
}

export interface OriginSpectrumResult {
  birthDate: string
  currentDate: string
  daysAlive: number
  spectrumPointCount: number
  ageSpectrumRatio: number
  completedSpectrumCycles: number
  remainingLifeDays: number
  exponentModulus: number
  exponentResidue: number
  zodiacIndex: number
  firstHueIndex: number
  currentPlacementIndex: number
  firstHue: OriginEmotionColor
  currentPlacement: OriginEmotionColor
  zodiacHue1: OriginSpectrumHue1
  birthstone: BirthstoneResonance
  zodiac: {
    sign: string
    element: string
    modality: string
    traditionalRuler: string
    description: string
    traitChannels: OriginTraitChannel[]
    averageEmotion: OriginEmotionColor
  }
  composite: OriginSpectrumComposite | null
}

/**
 * Independent AuraSpanse Origin Engine.
 *
 * It intentionally does not call the older generateAura() function. It accepts the
 * spectrum and zodiac map as source data, then calculates its own age-driven placement.
 */
const EXPONENT_MODULUS = 1_000_003
const DAY_MS = 86_400_000
const ZODIAC_ORDER = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
] as const

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor
}

function modularPower(base: number, exponent: number, modulus: number): number {
  let result = 1
  let factor = base % modulus
  let power = Math.floor(exponent)

  // Products remain under modulus² (< 1.01e12), within Number's exact integer range.
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus
    factor = (factor * factor) % modulus
    power = Math.floor(power / 2)
  }
  return result
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1)
  return Math.floor((date.getTime() - start) / DAY_MS) + 1
}

function paletteIndex(color: Pick<OriginEmotionColor, 'name' | 'hex'>, spectrum: OriginEmotionColor[]): number {
  const byName = spectrum.findIndex((item) => item.name === color.name)
  if (byName >= 0) return byName
  const channels = (value: string) => [0, 2, 4].map((offset) => Number.parseInt(value.replace('#', '').slice(offset, offset + 2), 16))
  const target = channels(color.hex)
  let bestIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY
  spectrum.forEach((item, index) => {
    const candidate = channels(item.hex)
    const distance = candidate.reduce((sum, channel, i) => sum + (channel - target[i]) ** 2, 0)
    if (distance < bestDistance) { bestDistance = distance; bestIndex = index }
  })
  return bestIndex
}

function nearestEmotionAtIndex(index: number, spectrum: OriginEmotionColor[]): OriginEmotionColor {
  return spectrum[Math.max(0, Math.min(spectrum.length - 1, Math.round(index)))]
}

function averageHex(colors: string[]): string {
  const rgb = colors.map((hex) => {
    const clean = hex.replace('#', '')
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) throw new Error(`Invalid hex color: ${hex}`)
    return [
      Number.parseInt(clean.slice(0, 2), 16),
      Number.parseInt(clean.slice(2, 4), 16),
      Number.parseInt(clean.slice(4, 6), 16)
    ]
  })

  const channels = [0, 1, 2].map((channel) =>
    Math.round(rgb.reduce((sum, item) => sum + item[channel], 0) / rgb.length)
  )
  return '#' + channels.map((value) => value.toString(16).padStart(2, '0')).join('')
}

function cleanEmotionName(name: string): string {
  return name.replace(/^The-/, '').replace(/-/g, ' ')
}

function rgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16)
  ]
}

function nearestEmotionByColor(hex: string, spectrum: OriginEmotionColor[]): OriginEmotionColor {
  const target = rgb(hex)
  return spectrum.reduce((best, item) => {
    const bestRgb = rgb(best.hex)
    const itemRgb = rgb(item.hex)
    const bestDistance = bestRgb.reduce((sum, channel, i) => sum + (channel - target[i]) ** 2, 0)
    const itemDistance = itemRgb.reduce((sum, channel, i) => sum + (channel - target[i]) ** 2, 0)
    return itemDistance < bestDistance ? item : best
  })
}

function blendHex(baseHex: string, overlayHex: string, overlayOpacity: number): string {
  const base = rgb(baseHex)
  const overlay = rgb(overlayHex)
  const opacity = Math.min(1, Math.max(0, overlayOpacity))
  return '#' + base.map((channel, i) =>
    Math.round(channel * (1 - opacity) + overlay[i] * opacity).toString(16).padStart(2, '0')
  ).join('')
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function parseBirthDate(dateString: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)
  if (!match) throw new Error('Birthdate must use YYYY-MM-DD format')

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  if (date.toISOString().slice(0, 10) !== dateString) {
    throw new Error('Birthdate is not a valid calendar date')
  }
  return date
}

export function generateOriginSpectrum(
  birthDateString: string,
  dependencies: {
    now: Date
    spectrum: OriginEmotionColor[]
    zodiacMap: object
    resolveZodiacSign: (date: Date) => string
    getBirthstoneResonance: (month: number) => BirthstoneResonance
    includeComposite?: boolean
  }
): OriginSpectrumResult {
  const { now, spectrum, zodiacMap, resolveZodiacSign, getBirthstoneResonance } = dependencies
  const includeComposite = dependencies.includeComposite === true
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error('The current date must be valid')
  }
  if (!Array.isArray(spectrum) || spectrum.length < 2) {
    throw new Error('AuraSpanse needs at least two spectrum points')
  }
  if (spectrum.some((item) => !item || typeof item.name !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(item.hex))) {
    throw new Error('Every spectrum point must have a name and a valid display color')
  }

  const birthDate = parseBirthDate(birthDateString)
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (birthDate.getTime() > today.getTime()) throw new Error('Birthdate cannot be in the future')

  const daysAlive = Math.floor((today.getTime() - birthDate.getTime()) / DAY_MS)
  const currentDate = today.toISOString().slice(0, 10)
  const birthstone = getBirthstoneResonance(birthDate.getUTCMonth() + 1)
  const currentDayOfYear = dayOfYear(today)
  const pointCount = spectrum.length
  const ageSpectrumRatio = daysAlive / pointCount
  const completedSpectrumCycles = Math.floor(ageSpectrumRatio)
  const remainingLifeDays = daysAlive % pointCount

  const zodiacKey = resolveZodiacSign(birthDate).toLowerCase()
  const zodiacIndex = ZODIAC_ORDER.indexOf(zodiacKey as (typeof ZODIAC_ORDER)[number])
  if (zodiacIndex < 0) throw new Error(`Unrecognized zodiac sign: ${zodiacKey}`)

  const zodiacRecord = (zodiacMap as unknown as Record<string, ZodiacEntry>)[zodiacKey]
  if (!zodiacRecord?.pos || !zodiacRecord?.neu || !zodiacRecord?.neg) {
    throw new Error(`Zodiac trait channels are incomplete for ${zodiacKey}`)
  }

  // N^D is not constructed as a giant integer. The residue makes the rule executable
  // while preserving the relationship between spectrum size and days lived.
  const exponentResidue = modularPower(pointCount, daysAlive, EXPONENT_MODULUS)
  const exponentIndex = exponentResidue % pointCount
  const firstHueIndex = mod(exponentIndex + remainingLifeDays + zodiacIndex, pointCount)
  const currentPlacementIndex = mod(
    firstHueIndex + completedSpectrumCycles + currentDayOfYear - 1,
    pointCount
  )

  const firstHue = spectrum[firstHueIndex]
  const currentPlacement = spectrum[currentPlacementIndex]
  const rawChannels = [
    { polarity: 'positive' as const, color: zodiacRecord.pos },
    { polarity: 'neutral' as const, color: zodiacRecord.neu },
    { polarity: 'shadow' as const, color: zodiacRecord.neg }
  ]
  const traitChannels: OriginTraitChannel[] = rawChannels.map(({ polarity, color }) => ({
    polarity,
    name: color.name,
    hex: color.hex,
    weight: 1 / 4
  }))
  const zodiacAveragePositionIndex = Math.round(
    rawChannels.reduce((sum, item) => sum + paletteIndex(item.color, spectrum), 0) / rawChannels.length
  )
  const zodiacAverageEmotion = nearestEmotionAtIndex(zodiacAveragePositionIndex, spectrum)

  const hue1ColorSources = [
    { source: 'Zodiac · positive', color: zodiacRecord.pos },
    { source: 'Zodiac · neutral', color: zodiacRecord.neu },
    { source: 'Zodiac · shadow', color: zodiacRecord.neg },
    { source: 'Time-weighted current placement', color: currentPlacement },
  ]
  const zodiacHue1Hex = averageHex(hue1ColorSources.map((item) => item.color.hex))
  const zodiacHue1NearestEmotion = nearestEmotionByColor(zodiacHue1Hex, spectrum)
  const zodiacHue1: OriginSpectrumHue1 = {
    name: zodiacHue1NearestEmotion.name,
    hex: zodiacHue1Hex,
    nearestEmotion: zodiacHue1NearestEmotion,
    sourceWeights: hue1ColorSources.map((item) => ({
      source: item.source,
      name: item.color.name,
      hex: item.color.hex,
      weight: 1 / 4,
    })),
  }

  let composite: OriginSpectrumComposite | null = null
  if (includeComposite) {
    // Hue 1 is formed equally from the zodiac triad plus the time-weighted placement.
    // The final reveal then gives Hue 1 and the literal birthstone Hue 2 equal weight.
    const compositeHex = blendHex(zodiacHue1.hex, birthstone.hex, 0.5)
    const compositeNearestEmotion = nearestEmotionByColor(compositeHex, spectrum)
    const compositeName = `${zodiacRecord.sign} ${cleanEmotionName(zodiacHue1.name)} with ${birthstone.name}`
    const definition = `Zodiac Hue 1 equally blends four color inputs: ${zodiacRecord.pos.name} (positive), ${zodiacRecord.neu.name} (neutral), ${zodiacRecord.neg.name} (shadow), and the time-weighted current placement ${currentPlacement.name}. Hue 2 is the literal natural-stone color for ${birthstone.name}. The final Aura-Spectrum color is an equal blend of those two primaries. The birthstone's ${birthstone.opacityPercent.toFixed(1)}% geographic-resonance reading is contextual and does not change either primary's equal blend weight.`
    composite = {
      name: compositeName,
      hex: compositeHex,
      baseHex: zodiacHue1.hex,
      nearestEmotion: compositeNearestEmotion,
      definition,
      sourceWeights: [
        ...hue1ColorSources.map((item) => ({
          source: item.source,
          name: item.color.name,
          hex: item.color.hex,
          weight: 1 / 8
        })),
        {
          source: `Birthstone Hue 2 · ${birthstone.deposit}`,
          name: birthstone.name,
          hex: birthstone.hex,
          weight: 1 / 2
        }
      ]
    }
  }

  return {
    birthDate: birthDateString,
    currentDate,
    daysAlive,
    spectrumPointCount: pointCount,
    ageSpectrumRatio,
    completedSpectrumCycles,
    remainingLifeDays,
    exponentModulus: EXPONENT_MODULUS,
    exponentResidue,
    zodiacIndex,
    firstHueIndex,
    currentPlacementIndex,
    firstHue,
    currentPlacement,
    zodiacHue1,
    birthstone,
    zodiac: {
      sign: zodiacRecord.sign,
      element: zodiacRecord.element,
      modality: zodiacRecord.modality,
      traditionalRuler: zodiacRecord.traditionalRuler,
      description: zodiacRecord.description,
      traitChannels,
      averageEmotion: zodiacAverageEmotion
    },
    composite
  }
}
