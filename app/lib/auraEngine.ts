import { emotionColors, getEmotionByFreq, EmotionColor } from './emotionColors'
import { getZodiacSign, zodiacMap } from './zodiacMap'
import { getAgeSpectrumPlacement } from './ageSpectrum'

export interface ZodiacData {
  sign: string
  element: string
  modality: string
  traditionalRuler: string
  description: string
  traits: string[]
  color: string
  birthstone: string
  birthstones: string[]
  stoneColor: string
  stoneTraits: string[]
  traitChannels: Array<{
    polarity: 'positive' | 'neutral' | 'shadow'
    weight: number
    name: string
    hex: string
    freq: number
  }>
  selectedTrait: {
    polarity: 'positive' | 'neutral' | 'shadow'
    weight: number
    name: string
    hex: string
    freq: number
  }
}

interface BirthstoneData {
  name: string
  color: string
  pos: EmotionColor
  neu: EmotionColor
  neg: EmotionColor
}

const findEmotion = (name: string): EmotionColor => {
  const found = emotionColors.find((color) => color.name.toLowerCase() === name.toLowerCase())
  if (!found) throw new Error(`Emotion not in spectrum: ${name}`)
  return found
}

const birthstones: Record<number, BirthstoneData[]> = {
  0: [
    { name: 'Deep Garnet', color: '#730800', pos: findEmotion('Constancy'), neu: findEmotion('Faith'), neg: findEmotion('Intensity') },
    { name: 'Wolf Onyx', color: '#101010', pos: findEmotion('Groundedness'), neu: findEmotion('Endurance'), neg: findEmotion('Fear') },
    { name: 'Ember Quartz', color: '#d36b22', pos: findEmotion('Courage'), neu: findEmotion('Warmth'), neg: findEmotion('Restlessness') }
  ],
  1: [
    { name: 'Storm Amethyst', color: '#6f4bb8', pos: findEmotion('Wisdom'), neu: findEmotion('Spirituality'), neg: findEmotion('Dissolution') },
    { name: 'Snowdrop Moonstone', color: '#dfe8ff', pos: findEmotion('Intuition'), neu: findEmotion('Serenity'), neg: findEmotion('Shyness') },
    { name: 'Ink Labradorite', color: '#1c2f59', pos: findEmotion('Mystery'), neu: findEmotion('Dreaming'), neg: findEmotion('Sorrow') }
  ],
  2: [
    { name: 'Tide Aquamarine', color: '#7eddd3', pos: findEmotion('Communication'), neu: findEmotion('Flow'), neg: findEmotion('Sorrow') },
    { name: 'Mist Bloodstone', color: '#254d3f', pos: findEmotion('Healing'), neu: findEmotion('Courage'), neg: findEmotion('Intensity') },
    { name: 'River Jade', color: '#4faf8f', pos: findEmotion('Balance'), neu: findEmotion('Acceptance'), neg: findEmotion('Desire') }
  ],
  3: [
    { name: 'Clear Diamond', color: '#e8e8e8', pos: findEmotion('Clarity'), neu: findEmotion('Purity'), neg: findEmotion('Authority') },
    { name: 'Dawn Sapphire', color: '#8fa7ff', pos: findEmotion('Integrity'), neu: findEmotion('Faith'), neg: findEmotion('Dread') },
    { name: 'White Topaz', color: '#f4f4ff', pos: findEmotion('Hope'), neu: findEmotion('Openness'), neg: findEmotion('Solitude') }
  ],
  4: [
    { name: 'Green Emerald', color: '#50c878', pos: findEmotion('Growth'), neu: findEmotion('Memory'), neg: findEmotion('Desire') },
    { name: 'Moss Agate', color: '#6f8d58', pos: findEmotion('Groundedness'), neu: findEmotion('Patience'), neg: findEmotion('Restlessness') },
    { name: 'Rose Quartz', color: '#f4a8c8', pos: findEmotion('Compassion'), neu: findEmotion('Tenderness'), neg: findEmotion('Longing') }
  ],
  5: [
    { name: 'Milk Pearl', color: '#f0ead6', pos: findEmotion('Purity'), neu: findEmotion('Serenity'), neg: findEmotion('Shyness') },
    { name: 'Silver Moonstone', color: '#ccd5e8', pos: findEmotion('Intuition'), neu: findEmotion('Dreaming'), neg: findEmotion('Mystery') },
    { name: 'Alexandrite Veil', color: '#6f5fb8', pos: findEmotion('Transformation'), neu: findEmotion('Balance'), neg: findEmotion('Dissolution') }
  ],
  6: [
    { name: 'Solar Ruby', color: '#e0115f', pos: findEmotion('Passion'), neu: findEmotion('Vitality-fire'), neg: findEmotion('Desire') },
    { name: 'Carnelian Flame', color: '#c94c24', pos: findEmotion('Creativity'), neu: findEmotion('Motivation'), neg: findEmotion('Ambition') },
    { name: 'Sunstone Heart', color: '#f4a33a', pos: findEmotion('Joy'), neu: findEmotion('Optimism'), neg: findEmotion('Authority') }
  ],
  7: [
    { name: 'Leaf Peridot', color: '#a4be7b', pos: findEmotion('Healing'), neu: findEmotion('Vitality'), neg: findEmotion('Restlessness') },
    { name: 'Green Sardonyx', color: '#7c8f4f', pos: findEmotion('Endurance'), neu: findEmotion('Patience'), neg: findEmotion('Fear') },
    { name: 'Honey Citrine', color: '#e4a11b', pos: findEmotion('Optimism'), neu: findEmotion('Warmth'), neg: findEmotion('Ambition') }
  ],
  8: [
    { name: 'Royal Sapphire', color: '#0f52ba', pos: findEmotion('Integrity'), neu: findEmotion('Wisdom'), neg: findEmotion('Authority') },
    { name: 'Lapis Night', color: '#1d3f8f', pos: findEmotion('Hidden-truth'), neu: findEmotion('Depth'), neg: findEmotion('Solitude') },
    { name: 'Blue Spinel', color: '#276bd6', pos: findEmotion('Honor'), neu: findEmotion('Trust'), neg: findEmotion('Melancholy') }
  ],
  9: [
    { name: 'Dream Opal', color: '#e8f1d4', pos: findEmotion('Hope'), neu: findEmotion('Imagination'), neg: findEmotion('Mystery') },
    { name: 'Pink Tourmaline', color: '#d65a9e', pos: findEmotion('Love'), neu: findEmotion('Affection'), neg: findEmotion('Longing-fire') },
    { name: 'Smoky Quartz', color: '#7b6b62', pos: findEmotion('Groundedness'), neu: findEmotion('Memory'), neg: findEmotion('The-shadow') }
  ],
  10: [
    { name: 'Golden Citrine', color: '#e4a11b', pos: findEmotion('Optimism'), neu: findEmotion('Warmth'), neg: findEmotion('Ambition') },
    { name: 'Imperial Topaz', color: '#e67722', pos: findEmotion('Creativity'), neu: findEmotion('Clarity'), neg: findEmotion('Desire') },
    { name: 'Tiger Eye', color: '#b87822', pos: findEmotion('Courage'), neu: findEmotion('Insight'), neg: findEmotion('Authority') }
  ],
  11: [
    { name: 'Sky Turquoise', color: '#40e0d0', pos: findEmotion('Empathy'), neu: findEmotion('Connection'), neg: findEmotion('Restlessness') },
    { name: 'Blue Zircon', color: '#2ca8df', pos: findEmotion('Clarity'), neu: findEmotion('Communication'), neg: findEmotion('Sorrow') },
    { name: 'Tanzanite Dream', color: '#6457c8', pos: findEmotion('Vision'), neu: findEmotion('Spirituality'), neg: findEmotion('Mystery') }
  ]
}

function averageFreq(colors: EmotionColor[]): number {
  return Math.round(colors.reduce((sum, color) => sum + color.freq, 0) / colors.length)
}

function clamp(freq: number): number {
  return Math.max(0, Math.min(1000, Math.round(freq)))
}

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('')
}

function blendHex(colors: string[], weights?: number[]): string {
  const totalWeight = weights?.reduce((sum, weight) => sum + weight, 0) || colors.length
  const mixed = colors.reduce(
    (sum, hex, index) => {
      const rgb = hexToRgb(hex)
      const weight = weights?.[index] ?? 1
      return {
        r: sum.r + rgb.r * weight,
        g: sum.g + rgb.g * weight,
        b: sum.b + rgb.b * weight
      }
    },
    { r: 0, g: 0, b: 0 }
  )

  return rgbToHex(mixed.r / totalWeight, mixed.g / totalWeight, mixed.b / totalWeight)
}

function cleanName(name: string): string {
  return name.replace(/^The-/, '').replace(/-/g, ' ')
}

function colorWordFromEmotion(emotion: EmotionColor): string {
  const freq = emotion.freq
  if (freq < 45) return 'Luminous'
  if (freq < 130) return 'Violet'
  if (freq < 220) return 'Indigo'
  if (freq < 320) return 'Oceanic'
  if (freq < 415) return 'Azure'
  if (freq < 510) return 'Teal'
  if (freq < 640) return 'Emerald'
  if (freq < 735) return 'Golden'
  if (freq < 825) return 'Ember'
  if (freq < 935) return 'Rose'
  return 'Ink'
}

function auraMotionWord(freq: number): string {
  const words = ['Stillness', 'Veil', 'Whisper', 'Quiet', 'Current', 'Bloom', 'Flare', 'Pulse', 'Flame', 'Crown', 'Threshold']
  return words[Math.min(words.length - 1, Math.floor((freq / 1001) * words.length))]
}

function timeStateWord(weight: number): string {
  const states = ['Origin', 'Veil', 'Mirror', 'Current', 'Gate', 'Field', 'Bloom', 'Flame', 'Crown', 'Threshold']
  return states[Math.min(states.length - 1, Math.floor((weight / 1001) * states.length))]
}

function makeAuraName(emotion: EmotionColor, fallbackHex?: string): string {
  return `${colorWordFromEmotion(emotion)} ${auraMotionWord(emotion.freq || parseInt((fallbackHex || '#000000').slice(1, 3), 16))}`
}

export function calculateLifePath(dateString: string): number {
  const digits = dateString.replace(/\D/g, '')
  let sum = digits.split('').reduce((acc, d) => acc + parseInt(d), 0)

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0)
  }

  return sum
}

export function getDayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0))
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export function daysBetween(start: Date, end: Date): number {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000))
}

export function generateAura(dateString: string, registeredDateString?: string) {
  const dateMatch = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(dateString)
  if (!dateMatch) throw new Error('Birthdate must use YYYY-MM-DD format')

  const birthYear = Number(dateMatch[1])
  const birthMonth = Number(dateMatch[2])
  const birthDay = Number(dateMatch[3])
  const birthDate = new Date(Date.UTC(birthYear, birthMonth - 1, birthDay))
  if (birthDate.toISOString().slice(0, 10) !== dateString) {
    throw new Error('Birthdate is not a valid calendar date')
  }

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (birthDate.getTime() > today.getTime()) {
    throw new Error('Birthdate cannot be in the future')
  }

  const parsedRegistration = registeredDateString ? new Date(registeredDateString) : now
  const registeredDate = Number.isNaN(parsedRegistration.getTime()) ? now : parsedRegistration
  const dayOfYear = getDayOfYear(birthDate)
  const currentDayOfYear = getDayOfYear(today)
  const lifePath = calculateLifePath(dateString)
  const daysAlive = daysBetween(birthDate, today)

  const signKey = getZodiacSign(birthDate)
  const sign = zodiacMap[signKey]
  const agePlacement = getAgeSpectrumPlacement(daysAlive, signKey, currentDayOfYear, emotionColors)
  const firstHue = agePlacement.firstHue
  const currentPlacement = agePlacement.currentPlacement
  const timeWeight = clamp(currentPlacement.freq)
  const channel = (agePlacement.currentPlacementIndex % 3) as 0 | 1 | 2
  const stones = birthstones[birthDate.getUTCMonth()]
  const selectedStone = stones[(lifePath + channel + dayOfYear + agePlacement.firstHueIndex) % stones.length]

  // Historical zodiac channel balancing: positive, neutral, and shadow traits each
  // contribute exactly one third to the base zodiac average. The selected trait is
  // a rotating reflective focus, not a heavier mathematical vote.
  const zodiacTriad = [sign.pos, sign.neu, sign.neg]
  const birthstoneTriad = [selectedStone.pos, selectedStone.neu, selectedStone.neg]
  const zodiacAverage = getEmotionByFreq(averageFreq(zodiacTriad))
  const birthstoneAverage = getEmotionByFreq(averageFreq(birthstoneTriad))
  const selectedTrait = zodiacTriad[channel]
  const selectedStoneTrait = birthstoneTriad[channel]

  const opacityRange = Math.max(1, agePlacement.spectrumPointCount - 1)
  const stoneOpacity = Math.min(
    0.92,
    Math.max(0.25, 0.25 + (agePlacement.exponentIndex / opacityRange) * 0.67)
  )

  // The first hue influences, but does not replace, the equal-weight zodiac triad.
  const zodiacHueFreq = clamp(zodiacAverage.freq * 0.8 + firstHue.freq * 0.2)
  const birthstoneHueFreq = clamp(
    birthstoneAverage.freq * (1 - stoneOpacity) + selectedStoneTrait.freq * stoneOpacity
  )
  const zodiacHue = getEmotionByFreq(zodiacHueFreq)
  const birthstoneHue = getEmotionByFreq(birthstoneHueFreq)

  const blendedHex = blendHex(
    [zodiacHue.hex, birthstoneHue.hex, firstHue.hex],
    [0.55, 0.30, 0.15]
  )
  const blendedFreq = clamp(
    zodiacHue.freq * 0.55 + birthstoneHue.freq * 0.30 + firstHue.freq * 0.15
  )
  const blendedHue: EmotionColor = {
    name: `${cleanName(zodiacHue.name)} ${cleanName(birthstoneHue.name)} ${cleanName(firstHue.name)} Blend`,
    hex: blendedHex,
    freq: blendedFreq
  }

  const daysInCurrentYear = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1)).getTime() -
    new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).getTime() > 365 * 86400000 ? 366 : 365
  const seasonalFreq = clamp(((currentDayOfYear - 1) / (daysInCurrentYear - 1)) * 1000)
  const timeHue = getEmotionByFreq(seasonalFreq)
  const currentAuraDay = ((currentDayOfYear + agePlacement.currentPlacementIndex + lifePath + channel) % daysInCurrentYear) || daysInCurrentYear

  // The current placement and the first hue are both explicit contributors to the
  // final blend, so the age/spectrum equation changes the actual reading, not only its copy.
  const finalFrequency = clamp(
    blendedHue.freq * 0.45 +
    timeHue.freq * 0.10 +
    firstHue.freq * 0.20 +
    currentPlacement.freq * 0.25
  )
  const finalEmotion = getEmotionByFreq(finalFrequency)
  const finalHex = blendHex(
    [blendedHue.hex, timeHue.hex, firstHue.hex, currentPlacement.hex, finalEmotion.hex],
    [0.42, 0.10, 0.18, 0.15, 0.15]
  )
  const primaryAuraName = makeAuraName(zodiacHue)
  const secondaryAuraName = makeAuraName(birthstoneHue)
  const finalAuraName = `${primaryAuraName} with ${secondaryAuraName} whispers`
  const tenureDays = daysBetween(registeredDate, now)
  const timeFactor = tenureDays / Math.max(1, daysAlive)

  const polarities: Array<'positive' | 'neutral' | 'shadow'> = ['positive', 'neutral', 'shadow']
  const zodiac: ZodiacData = {
    sign: sign.sign,
    element: sign.element,
    modality: sign.modality,
    traditionalRuler: sign.traditionalRuler,
    description: sign.description,
    traits: zodiacTriad.map((trait) => trait.name),
    color: zodiacHue.hex,
    birthstone: selectedStone.name,
    birthstones: stones.map((stone) => stone.name),
    stoneColor: selectedStone.color,
    stoneTraits: birthstoneTriad.map((trait) => trait.name),
    traitChannels: zodiacTriad.map((trait, index) => ({
      polarity: polarities[index],
      weight: 1 / 3,
      name: trait.name,
      hex: trait.hex,
      freq: trait.freq
    })),
    selectedTrait: {
      polarity: polarities[channel],
      weight: 1 / 3,
      name: selectedTrait.name,
      hex: selectedTrait.hex,
      freq: selectedTrait.freq
    }
  }

  return {
    zodiac,
    lifePath,
    dayOfYear,
    hues: [zodiacHue, birthstoneHue, blendedHue, timeHue],
    zodiacTriad,
    birthstoneTriad,
    zodiacAverage,
    birthstoneAverage,
    selectedStone,
    selectedStoneTrait,
    blendedHue,
    timeHue,
    firstHue,
    currentPlacement,
    spectrumPointCount: agePlacement.spectrumPointCount,
    ageSpectrumRatio: agePlacement.ageSpectrumRatio,
    completedSpectrumCycles: agePlacement.completedSpectrumCycles,
    exponentResidue: agePlacement.exponentResidue,
    firstHueIndex: agePlacement.firstHueIndex,
    currentPlacementIndex: agePlacement.currentPlacementIndex,
    currentDayOfYear,
    timeState: timeStateWord(timeWeight),
    timeWeight,
    finalEmotion,
    finalFrequency,
    finalHex,
    finalAuraName,
    primaryAuraName,
    secondaryAuraName,
    stoneOpacity,
    daysAlive,
    tenureDays,
    timeFactor,
    currentAuraDay
  }
}
