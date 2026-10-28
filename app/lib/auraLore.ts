import { EmotionColor, emotionColors, getEmotionIndex } from './emotionColors'

function clean(name: string): string {
  return name.replace(/^The-/, '').replace(/-/g, ' ')
}

function spectrumZone(emotion: EmotionColor): string {
  const progress = getEmotionIndex(emotion) / Math.max(1, emotionColors.length - 1)
  if (progress < 0.13) return 'light-violet'
  if (progress < 0.32) return 'indigo-blue'
  if (progress < 0.51) return 'cyan-teal'
  if (progress < 0.64) return 'green-earth'
  if (progress < 0.735) return 'gold-memory'
  if (progress < 0.825) return 'orange-courage'
  if (progress < 0.935) return 'rose-fire'
  return 'shadow-threshold'
}

export function getAuraLore(input: {
  finalAuraName: string
  finalEmotion: EmotionColor
  zodiacSign: string
  birthstone: string
  zodiacHue: EmotionColor
  birthstoneHue: EmotionColor
  timeHue: EmotionColor
  timeState: string
  currentAuraDay: number
  stoneOpacity: number
  daysAlive: number
  tenureDays: number
  timeFactor: number
}) {
  const zone = spectrumZone(input.finalEmotion)
  const birthstoneName = clean(input.birthstoneHue.name)
  const zodiacName = clean(input.zodiacHue.name)
  const timeName = clean(input.timeHue.name)

  const zoneLore: Record<string, string> = {
    'light-violet': 'This part of the spectrum belongs to the old language of light, dream, and inner sight. It moves quietly, like a signal seen before it is spoken.',
    'indigo-blue': 'This part of the spectrum carries depth, loyalty, grief, and truth. Historically, blues and indigos became colors of contemplation because they pull attention inward.',
    'cyan-teal': 'This part of the spectrum carries air, water, communication, and empathy. It is the bridge range, where a feeling starts becoming language.',
    'green-earth': 'This part of the spectrum carries growth, balance, endurance, and repair. Green has long been treated as the resting field between heat and shadow.',
    'gold-memory': 'This part of the spectrum carries warmth, gratitude, stored experience, and memory. Amber-gold is the archive range: light that has lived long enough to become story.',
    'orange-courage': 'This part of the spectrum carries motion, creativity, drive, and courage. It is the ignition range, where feeling turns into action.',
    'rose-fire': 'This part of the spectrum carries passion, love, intensity, and transformation. It is the range of the heart under pressure.',
    'shadow-threshold': 'This part of the spectrum carries surrender, fear, silence, and threshold work. It marks the edge where an old identity breaks down before the next one is named.'
  }

  const origin = `${input.finalAuraName} forms where ${zodiacName} from your ${input.zodiacSign} symbolism meets ${birthstoneName} from ${input.birthstone}, then crosses the ${input.timeState} state on Aura Day ${input.currentAuraDay}. Its color sits in the ${zone.replace(/-/g, ' ')} family of the Aura-Spectrum.`

  const historical = birthstoneName === 'Memory'
    ? `Memory is represented by a warm amber-gold color, used here as a consistent visual symbol for stored experience and reflection.`
    : `${birthstoneName} contributes its own color to this reading at ${Math.round(input.stoneOpacity * 100)}% opacity, so the stone gently tints the surrounding palette.`

  const modern = zoneLore[zone]

  const exercises = {
    morning: `Name the first word: ${input.finalAuraName.split(' ')[0]}. For three minutes, do one small action that matches ${zodiacName.toLowerCase()} without explaining it to anyone. This activates Hue 1 through behavior, not belief.`,
    midday: `Name the second word: ${input.finalAuraName.split(' ')[1]}. Look for where ${birthstoneName.toLowerCase()} showed up today. If it felt hidden, write one sentence that makes it visible. This makes the birthstone layer more opaque.`,
    evening: `Name the third word: ${input.timeState}. Before sleep, write one line about what felt like a gate, edge, loop, or crossing today. This records the current time hue: ${timeName}.`
  }

  const equation = `This reading layers zodiac symbolism, birthstone color, the age-derived starting hue, and today's modeled placement. Days alive: ${input.daysAlive}. Days with Auracle: ${input.tenureDays}.`

  return {
    origin,
    historical,
    modern,
    exercises,
    equation
  }
}
