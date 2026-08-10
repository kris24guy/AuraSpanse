import { emotionColors, getEmotionByFreq, EmotionColor } from './emotionColors'
import { getZodiacSign, zodiacMap } from './zodiacMap'

export interface ZodiacData {
  sign: string
  traits: string[]
  color: string
  birthstone: string
  birthstones: string[]
  stoneColor: string
  stoneTraits: string[]
  traitChannels: Array<{
    polarity: 'positive' | 'neutral' | 'shadow'
    name: string
    hex: string
    freq: number
  }>
  selectedTrait: {
    polarity: 'positive' | 'neutral' | 'shadow'
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

function weightedRegistrationScale(date: Date): number {
  const ms = date.getUTCHours() * 3600000 + date.getUTCMinutes() * 60000 + date.getUTCSeconds() * 1000 + date.getUTCMilliseconds()
  return clamp((ms / 86400000) * 1000)
}

function channelIndex(weight: number): 0 | 1 | 2 {
  if (weight < 334) return 0
  if (weight < 667) return 1
  return 2
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
  const birthDate = new Date(`${dateString}T00:00:00Z`)
  const now = new Date()
  const registeredDate = registeredDateString ? new Date(registeredDateString) : now
  const dayOfYear = getDayOfYear(birthDate)
  const lifePath = calculateLifePath(dateString)

  const signKey = getZodiacSign(birthDate)
  const sign = zodiacMap[signKey]
  const stones = birthstones[birthDate.getUTCMonth()]
  const timeWeight = weightedRegistrationScale(registeredDate)
  const channel = channelIndex(timeWeight)
  const selectedStone = stones[(lifePath + channel + dayOfYear) % stones.length]

  const zodiacTriad = [sign.pos, sign.neu, sign.neg]
  const birthstoneTriad = [selectedStone.pos, selectedStone.neu, selectedStone.neg]
  const zodiacAverage = getEmotionByFreq(averageFreq(zodiacTriad))
  const birthstoneAverage = getEmotionByFreq(averageFreq(birthstoneTriad))

  const selectedTrait = zodiacTriad[channel]
  const selectedStoneTrait = birthstoneTriad[channel]
  const traitInfluence = 0.45 + timeWeight / 2200
  const stoneOpacity = Math.min(0.92, Math.max(0.25, 0.25 + timeWeight / 1500))

  const zodiacHueFreq = clamp(zodiacAverage.freq * (1 - traitInfluence) + selectedTrait.freq * traitInfluence)
  const birthstoneHueFreq = clamp(birthstoneAverage.freq * (1 - stoneOpacity) + selectedStoneTrait.freq * stoneOpacity)
  const zodiacHue = getEmotionByFreq(zodiacHueFreq)
  const birthstoneHue = getEmotionByFreq(birthstoneHueFreq)

  const blendedHex = blendHex([zodiacHue.hex, birthstoneHue.hex], [1, stoneOpacity])
  const blendedFreq = clamp((zodiacHue.freq + birthstoneHue.freq * stoneOpacity) / (1 + stoneOpacity))
  const blendedHue: EmotionColor = {
    name: `${cleanName(zodiacHue.name)} ${cleanName(birthstoneHue.name)} Blend`,
    hex: blendedHex,
    freq: blendedFreq
  }

  const timeHue = getEmotionByFreq(timeWeight)
  const currentAuraDay = ((getDayOfYear(now) + dayOfYear + lifePath + channel) % 365) || 365
  const finalFrequency = clamp(blendedHue.freq * 0.55 + timeHue.freq * 0.25 + selectedTrait.freq * 0.2)
  const finalEmotion = getEmotionByFreq(finalFrequency)
  const finalHex = blendHex([blendedHue.hex, timeHue.hex, finalEmotion.hex], [0.5, 0.22, 0.28])
  const primaryAuraName = makeAuraName(zodiacHue)
  const secondaryAuraName = makeAuraName(birthstoneHue)
  const finalAuraName = `${primaryAuraName} with ${secondaryAuraName} whispers`
  const daysAlive = Math.max(1, daysBetween(birthDate, now))
  const tenureDays = daysBetween(registeredDate, now)
  const timeFactor = tenureDays / daysAlive

  const polarities: Array<'positive' | 'neutral' | 'shadow'> = ['positive', 'neutral', 'shadow']
  const zodiac: ZodiacData = {
    sign: sign.sign,
    traits: zodiacTriad.map((trait) => trait.name),
    color: zodiacHue.hex,
    birthstone: selectedStone.name,
    birthstones: stones.map((stone) => stone.name),
    stoneColor: selectedStone.color,
    stoneTraits: birthstoneTriad.map((trait) => trait.name),
    traitChannels: zodiacTriad.map((trait, index) => ({
      polarity: polarities[index],
      name: trait.name,
      hex: trait.hex,
      freq: trait.freq
    })),
    selectedTrait: {
      polarity: polarities[channel],
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
