export interface OriginEmotionColor {
  name: string
  hex: string
  freq: number
}

export interface OriginTraitChannel {
  polarity: 'positive' | 'neutral' | 'shadow'
  name: string
  hex: string
  freq: number
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
  zodiac: {
    sign: string
    element: string
    modality: string
    traditionalRuler: string
    description: string
    traitChannels: OriginTraitChannel[]
    averageFrequency: number
    averageEmotion: OriginEmotionColor
  }
  composite: {
    name: string
    hex: string
    frequency: number
    nearestEmotion: OriginEmotionColor
    definition: string
    sourceWeights: Array<{ source: string; name: string; hex: string; freq: number; weight: number }>
  }
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

function nearestEmotion(freq: number, spectrum: OriginEmotionColor[]): OriginEmotionColor {
  return spectrum.reduce((best, item) =>
    Math.abs(item.freq - freq) < Math.abs(best.freq - freq) ? item : best
  )
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
  }
): OriginSpectrumResult {
  const { now, spectrum, zodiacMap, resolveZodiacSign } = dependencies
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error('The current date must be valid')
  }
  if (!Array.isArray(spectrum) || spectrum.length < 2) {
    throw new Error('AuraSpanse needs at least two spectrum points')
  }
  if (spectrum.some((item) => !item || typeof item.name !== 'string' ||
      !Number.isFinite(item.freq) || item.freq < 0 || item.freq > 1000)) {
    throw new Error('Every spectrum point must have a name and a frequency from 0 to 1000')
  }

  const birthDate = parseBirthDate(birthDateString)
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (birthDate.getTime() > today.getTime()) throw new Error('Birthdate cannot be in the future')

  const daysAlive = Math.floor((today.getTime() - birthDate.getTime()) / DAY_MS)
  const currentDate = today.toISOString().slice(0, 10)
  const currentDayOfYear = dayOfYear(today)
  const pointCount = spectrum.length
  const ageSpectrumRatio = daysAlive / pointCount
  const completedSpectrumCycles = Math.floor(ageSpectrumRatio)
  const remainingLifeDays = daysAlive % pointCount

  const zodiacKey = resolveZodiacSign(birthDate).toLowerCase()
  const zodiacIndex = ZODIAC_ORDER.indexOf(zodiacKey as (typeof ZODIAC_ORDER)[number])
  if (zodiacIndex < 0) throw new Error(`Unrecognized zodiac sign: ${zodiacKey}`)

  const zodiacRecord = (zodiacMap as Record<string, ZodiacEntry>)[zodiacKey]
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
    freq: color.freq,
    weight: 1 / 3
  }))
  const zodiacAverageFrequency = Math.round(
    rawChannels.reduce((sum, item) => sum + item.color.freq, 0) / rawChannels.length
  )
  const zodiacAverageEmotion = nearestEmotion(zodiacAverageFrequency, spectrum)

  // All five contributors have equal color weight: the three zodiac channels,
  // the age-derived first hue, and the current placement.
  const sourceColors = [
    { source: 'Zodiac · positive', color: zodiacRecord.pos },
    { source: 'Zodiac · neutral', color: zodiacRecord.neu },
    { source: 'Zodiac · shadow', color: zodiacRecord.neg },
    { source: 'Age-derived first hue', color: firstHue },
    { source: 'Current spectrum placement', color: currentPlacement }
  ]
  const compositeFrequency = Math.round(
    sourceColors.reduce((sum, item) => sum + item.color.freq, 0) / sourceColors.length
  )
  const compositeHex = averageHex(sourceColors.map((item) => item.color.hex))
  const compositeNearestEmotion = nearestEmotion(compositeFrequency, spectrum)
  const compositeName = `${zodiacRecord.sign} ${cleanEmotionName(firstHue.name)}–${cleanEmotionName(currentPlacement.name)} Synthesis`
  const definition = `A symbolic blend of ${zodiacRecord.pos.name} (constructive channel), ${zodiacRecord.neu.name} (steady channel), and ${zodiacRecord.neg.name} (shadow channel), each contributing one third to the zodiac balance. ${cleanEmotionName(firstHue.name)} establishes the birth-anchored first hue; ${cleanEmotionName(currentPlacement.name)} marks today's position. The composite averages all five color contributors equally, holding strengths, steadiness, vulnerability, origin, and present position in one closed-loop reading.`

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
    zodiac: {
      sign: zodiacRecord.sign,
      element: zodiacRecord.element,
      modality: zodiacRecord.modality,
      traditionalRuler: zodiacRecord.traditionalRuler,
      description: zodiacRecord.description,
      traitChannels,
      averageFrequency: zodiacAverageFrequency,
      averageEmotion: zodiacAverageEmotion
    },
    composite: {
      name: compositeName,
      hex: compositeHex,
      frequency: compositeFrequency,
      nearestEmotion: compositeNearestEmotion,
      definition,
      sourceWeights: sourceColors.map((item) => ({
        source: item.source,
        name: item.color.name,
        hex: item.color.hex,
        freq: item.color.freq,
        weight: 1 / sourceColors.length
      }))
    }
  }
}
