import { EmotionColor } from './emotionColors'

function clean(name: string): string {
  return name.replace(/^The-/, '').replace(/-/g, ' ')
}

function spectrumZone(freq: number): string {
  if (freq < 130) return 'light-violet'
  if (freq < 320) return 'indigo-blue'
  if (freq < 510) return 'cyan-teal'
  if (freq < 640) return 'green-earth'
  if (freq < 735) return 'gold-memory'
  if (freq < 825) return 'orange-courage'
  if (freq < 935) return 'rose-fire'
  return 'shadow-threshold'
}

export function getAuraLore(input: {
  finalAuraName: string
  finalEmotion: EmotionColor
  finalHex: string
  finalFrequency: number
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
  const zone = spectrumZone(input.finalFrequency)
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

  const origin = `${input.finalAuraName} forms where ${zodiacName} from your ${input.zodiacSign} current meets ${birthstoneName} from ${input.birthstone}, then crosses the ${input.timeState} state on Aura Day ${input.currentAuraDay}. Its final position is ${input.finalFrequency}hz on the 0-1000 AuraSpectrum.`

  const historical = birthstoneName === 'Memory'
    ? `Memory is a real pigment here: #d86800 at 732hz. It sits in the amber-gold archive range, where color feels warm, stored, reflective, and historical instead of random.`
    : `${birthstoneName} is the birthstone pigment in this reading. It enters at ${input.birthstoneHue.freq}hz and ${Math.round(input.stoneOpacity * 100)}% opacity, so the stone does not decorate the aura; it stains the blend.`

  const modern = zoneLore[zone]

  const exercises = {
    morning: `Name the first word: ${input.finalAuraName.split(' ')[0]}. For three minutes, do one small action that matches ${zodiacName.toLowerCase()} without explaining it to anyone. This activates Hue 1 through behavior, not belief.`,
    midday: `Name the second word: ${input.finalAuraName.split(' ')[1]}. Look for where ${birthstoneName.toLowerCase()} showed up today. If it felt hidden, write one sentence that makes it visible. This makes the birthstone layer more opaque.`,
    evening: `Name the third word: ${input.timeState}. Before sleep, write one line about what felt like a gate, edge, loop, or crossing today. This logs the time hue: ${timeName} at ${input.timeHue.freq}hz.`
  }

  const equation = `(${input.zodiacHue.freq}hz + ${input.birthstoneHue.freq}hz + ${input.timeHue.freq}hz) / 3 + time factor = ${input.finalFrequency}hz. Days alive: ${input.daysAlive}. Days with Auracle: ${input.tenureDays}.`

  return {
    origin,
    historical,
    modern,
    exercises,
    equation
  }
}
