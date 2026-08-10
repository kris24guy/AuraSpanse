import { getEmotionByFreq, EmotionColor } from './emotionColors'
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

const birthstones: Record<number, BirthstoneData> = {
  0: {
    name: 'Garnet',
    color: '#730800',
    pos: getEmotionByFreq(237),
    neu: getEmotionByFreq(347),
    neg: getEmotionByFreq(837)
  },
  1: {
    name: 'Amethyst',
    color: '#9966cc',
    pos: getEmotionByFreq(152),
    neu: getEmotionByFreq(132),
    neg: getEmotionByFreq(980)
  },
  2: {
    name: 'Aquamarine',
    color: '#7EDDD3',
    pos: getEmotionByFreq(396),
    neu: getEmotionByFreq(362),
    neg: getEmotionByFreq(307)
  },
  3: {
    name: 'Diamond',
    color: '#E8E8E8',
    pos: getEmotionByFreq(20),
    neu: getEmotionByFreq(11),
    neg: getEmotionByFreq(162)
  },
  4: {
    name: 'Emerald',
    color: '#50c878',
    pos: getEmotionByFreq(510),
    neu: getEmotionByFreq(862),
    neg: getEmotionByFreq(842)
  },
  5: {
    name: 'Pearl',
    color: '#f0ead6',
    pos: getEmotionByFreq(11),
    neu: getEmotionByFreq(152),
    neg: getEmotionByFreq(78)
  },
  6: {
    name: 'Ruby',
    color: '#e0115f',
    pos: getEmotionByFreq(827),
    neu: getEmotionByFreq(852),
    neg: getEmotionByFreq(842)
  },
  7: {
    name: 'Peridot',
    color: '#A4BE7B',
    pos: getEmotionByFreq(462),
    neu: getEmotionByFreq(647),
    neg: getEmotionByFreq(638)
  },
  8: {
    name: 'Sapphire',
    color: '#0f52ba',
    pos: getEmotionByFreq(232),
    neu: getEmotionByFreq(152),
    neg: getEmotionByFreq(162)
  },
  9: {
    name: 'Opal',
    color: '#e8f1d4',
    pos: getEmotionByFreq(342),
    neu: getEmotionByFreq(117),
    neg: getEmotionByFreq(137)
  },
  10: {
    name: 'Citrine',
    color: '#e4a11b',
    pos: getEmotionByFreq(692),
    neu: getEmotionByFreq(697),
    neg: getEmotionByFreq(797)
  },
  11: {
    name: 'Turquoise',
    color: '#40e0d0',
    pos: getEmotionByFreq(420),
    neu: getEmotionByFreq(444),
    neg: getEmotionByFreq(638)
  }
}

function averageFreq(colors: EmotionColor[]): number {
  return Math.round(colors.reduce((sum, color) => sum + color.freq, 0) / colors.length)
}

function clamp(freq: number): number {
  return Math.max(0, Math.min(1000, Math.round(freq)))
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

function makeFinalAuraName(finalEmotion: EmotionColor, sourceEmotion: EmotionColor, finalFreq: number): string {
  const firstWords = [
    'Luminous',
    'Violet',
    'Indigo',
    'Sapphire',
    'Azure',
    'Teal',
    'Emerald',
    'Golden',
    'Crimson',
    'Rose',
    'Shadow'
  ]

  const lastWords = [
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
    'Void'
  ]

  const index = Math.min(10, Math.floor(clamp(finalFreq) / 91))
  const middle = sourceEmotion.name.replace(/^The-/, '').replace(/-/g, ' ')
  const cleanMiddle = middle.split(' ')[0] || finalEmotion.name.replace(/-/g, ' ')

  return `${firstWords[index]} ${cleanMiddle} ${lastWords[index]}`
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

  const zodiacHue = getEmotionByFreq(averageFreq(zodiacTriad))
  const birthstoneHue = getEmotionByFreq(averageFreq(birthstoneTriad))

  const daysAlive = Math.max(1, daysBetween(birthDate, now))
  const tenureDays = daysBetween(registeredDate, now)
  const timeFactor = tenureDays / daysAlive
  const currentAuraDay = ((getDayOfYear(now) + daysAlive + tenureDays) % 365) || 365
  const timeHue = getEmotionByFreq(Math.round(((currentAuraDay - 1) / 364) * 1000))

  const stoneOpacity = Math.min(1, Math.max(0.15, 0.15 + (birthstoneHue.freq / 1000) * 0.85))
  const finalFreq = clamp(
    zodiacHue.freq * 0.42 +
    birthstoneHue.freq * (0.32 + stoneOpacity * 0.12) +
    timeHue.freq * (0.26 + Math.min(timeFactor, 0.1))
  )
  const finalEmotion = getEmotionByFreq(finalFreq)
  const finalAuraName = makeFinalAuraName(finalEmotion, birthstoneHue, finalFreq)

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
    timeHue,
    finalEmotion,
    finalFrequency: finalFreq,
    finalAuraName,
    stoneOpacity,
    daysAlive,
    tenureDays,
    timeFactor,
    currentAuraDay
  }
}
