import { emotionColors, getEmotionByFreq, EmotionColor } from './emotionColors'
import { getZodiacSign, zodiacMap } from './zodiacMap'

export interface ZodiacData {
  sign: string
  traits: string[]
  color: string
  birthstone: string
  stoneColor: string
  stoneTraits: string[]
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

const birthstones: Record<number, BirthstoneData> = {
  0: {
    name: 'Garnet',
    color: '#730800',
    pos: findEmotion('Constancy'),
    neu: findEmotion('Faith'),
    neg: findEmotion('Intensity')
  },
  1: {
    name: 'Amethyst',
    color: '#9966cc',
    pos: findEmotion('Wisdom'),
    neu: findEmotion('Spirituality'),
    neg: findEmotion('Dissolution')
  },
  2: {
    name: 'Aquamarine',
    color: '#7EDDD3',
    pos: findEmotion('Communication'),
    neu: findEmotion('Flow'),
    neg: findEmotion('Sorrow')
  },
  3: {
    name: 'Diamond',
    color: '#E8E8E8',
    pos: findEmotion('Clarity'),
    neu: findEmotion('Purity'),
    neg: findEmotion('Authority')
  },
  4: {
    name: 'Emerald',
    color: '#50c878',
    pos: findEmotion('Growth'),
    neu: findEmotion('Memory'),
    neg: findEmotion('Desire')
  },
  5: {
    name: 'Pearl',
    color: '#f0ead6',
    pos: findEmotion('Purity'),
    neu: findEmotion('Serenity'),
    neg: findEmotion('Shyness')
  },
  6: {
    name: 'Ruby',
    color: '#e0115f',
    pos: findEmotion('Passion'),
    neu: findEmotion('Vitality-fire'),
    neg: findEmotion('Desire')
  },
  7: {
    name: 'Peridot',
    color: '#A4BE7B',
    pos: findEmotion('Healing'),
    neu: findEmotion('Vitality'),
    neg: findEmotion('Restlessness')
  },
  8: {
    name: 'Sapphire',
    color: '#0f52ba',
    pos: findEmotion('Integrity'),
    neu: findEmotion('Wisdom'),
    neg: findEmotion('Authority')
  },
  9: {
    name: 'Opal',
    color: '#e8f1d4',
    pos: findEmotion('Hope'),
    neu: findEmotion('Imagination'),
    neg: findEmotion('Mystery')
  },
  10: {
    name: 'Citrine',
    color: '#e4a11b',
    pos: findEmotion('Optimism'),
    neu: findEmotion('Warmth'),
    neg: findEmotion('Ambition')
  },
  11: {
    name: 'Turquoise',
    color: '#40e0d0',
    pos: findEmotion('Empathy'),
    neu: findEmotion('Connection'),
    neg: findEmotion('Restlessness')
  }
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

function blendHex(colors: EmotionColor[]): string {
  const rgbs = colors.map((color) => hexToRgb(color.hex))
  const total = rgbs.length
  return rgbToHex(
    rgbs.reduce((sum, color) => sum + color.r, 0) / total,
    rgbs.reduce((sum, color) => sum + color.g, 0) / total,
    rgbs.reduce((sum, color) => sum + color.b, 0) / total
  )
}

function cleanName(name: string): string {
  return name.replace(/^The-/, '').replace(/-/g, ' ')
}

function colorWordFromEmotion(emotion: EmotionColor): string {
  const freq = emotion.freq
  if (freq < 45) return 'Luminous'
  if (freq < 130) return 'Violet'
  if (freq < 220) return 'Indigo'
  if (freq < 320) return 'Sapphire'
  if (freq < 415) return 'Azure'
  if (freq < 510) return 'Teal'
  if (freq < 640) return 'Emerald'
  if (freq < 735) return 'Golden'
  if (freq < 825) return 'Crimson'
  if (freq < 935) return 'Rose'
  return 'Shadow'
}

function timeStateWord(auraDay: number): string {
  const states = [
    'Origin',
    'Veil',
    'Mirror',
    'Current',
    'Gate',
    'Field',
    'Bloom',
    'Flame',
    'Crown',
    'Threshold',
    'Void',
    'Orbit'
  ]
  const index = Math.min(states.length - 1, Math.floor(((auraDay - 1) / 365) * states.length))
  return states[index]
}

function makeFinalAuraName(zodiacHue: EmotionColor, birthstoneHue: EmotionColor, auraDay: number): string {
  return `${colorWordFromEmotion(zodiacHue)} ${cleanName(birthstoneHue.name).split(' ')[0]} ${timeStateWord(auraDay)}`
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
  const stone = birthstones[birthDate.getUTCMonth()]

  const zodiacTriad = [sign.pos, sign.neu, sign.neg]
  const birthstoneTriad = [stone.pos, stone.neu, stone.neg]

  const zodiacAverage = getEmotionByFreq(averageFreq(zodiacTriad))
  const birthstoneAverage = getEmotionByFreq(averageFreq(birthstoneTriad))

  const zodiacHue = sign.pos
  const birthstoneHue = stone.neu

  const daysAlive = Math.max(1, daysBetween(birthDate, now))
  const tenureDays = daysBetween(registeredDate, now)
  const timeFactor = tenureDays / daysAlive
  const currentAuraDay = ((getDayOfYear(now) + daysAlive + tenureDays) % 365) || 365
  const dayFreq = Math.round(((currentAuraDay - 1) / 364) * 1000)
  const timeHue = getEmotionByFreq(dayFreq)
  const timeState = timeStateWord(currentAuraDay)

  const stoneOpacity = Math.min(1, Math.max(0.15, 0.15 + (birthstoneHue.freq / 1000) * 0.85))
  const finalFrequency = clamp((zodiacHue.freq + birthstoneHue.freq + timeHue.freq) / 3 + Math.min(timeFactor * 100, 33))
  const finalEmotion = getEmotionByFreq(finalFrequency)
  const finalHex = blendHex([zodiacHue, birthstoneHue, timeHue])
  const finalAuraName = makeFinalAuraName(zodiacHue, birthstoneHue, currentAuraDay)

  const zodiac: ZodiacData = {
    sign: sign.sign,
    traits: [sign.pos.name, sign.neu.name, sign.neg.name],
    color: zodiacHue.hex,
    birthstone: stone.name,
    stoneColor: stone.color,
    stoneTraits: [stone.pos.name, stone.neu.name, stone.neg.name]
  }

  return {
    zodiac,
    lifePath,
    dayOfYear,
    hues: [zodiacHue, birthstoneHue, timeHue],
    zodiacTriad,
    birthstoneTriad,
    zodiacAverage,
    birthstoneAverage,
    timeHue,
    timeState,
    finalEmotion,
    finalFrequency,
    finalHex,
    finalAuraName,
    finalNameParts: {
      zodiacColor: colorWordFromEmotion(zodiacHue),
      birthstoneEmotion: cleanName(birthstoneHue.name).split(' ')[0],
      timeState
    },
    stoneOpacity,
    daysAlive,
    tenureDays,
    timeFactor,
    currentAuraDay
  }
}
