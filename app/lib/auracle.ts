import { EmotionColor } from './emotionColors'

interface AuraScopeInput {
  zodiac: {
    sign: string
    traits: string[]
    birthstone: string
    stoneTraits: string[]
  }
  lifePath: number
  dayOfYear: number
  hues: EmotionColor[]
  finalAuraName?: string
  finalEmotion?: EmotionColor
  finalFrequency?: number
  stoneOpacity?: number
  daysAlive?: number
  tenureDays?: number
  currentAuraDay?: number
}

export interface AurascopeReading {
  title: string
  focus: string
  mantra: string
  reading: string
  action: string
  hueSummary: Array<{
    label: string
    name: string
    hex: string
    meaning: string
  }>
}

const focuses = [
  'protecting your energy while still letting the right people reach you',
  'turning scattered signals into one clear next move',
  'trusting the message your body notices before your mind explains it',
  'choosing the path that feels calm after the first spark fades',
  'letting your intuition become structure instead of noise',
  'balancing ambition with spiritual timing',
  'moving from survival-mode reactions into deliberate creation',
  'recognizing which connection is medicine and which one is static',
  'letting the old identity finish dissolving before naming the next one'
]

const actions = [
  'Write down one decision you have been delaying, then choose the smallest honest step toward it today.',
  'Spend ten quiet minutes away from screens and notice which thought keeps returning without force.',
  'Before saying yes, ask whether the request expands your spirit or only drains your attention.',
  'Choose one unfinished loop and close it with a message, a note, or a clean boundary.',
  'Create one visible symbol of the future you are building and place it where you will see it daily.',
  'Move your body for three minutes, then reread the problem from that changed state.',
  'Name the emotion underneath the emotion; the second name is the key.',
  'Do one practical task that makes your vision easier to trust tomorrow.',
  'Let one answer be simple today instead of proving it to everyone.'
]

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length]
}

function cleanName(name: string): string {
  return name.replace(/-/g, ' ')
}

export function generateAurascope(input: AuraScopeInput): AurascopeReading {
  const [hue1, hue2, hue3] = input.hues
  const finalEmotion = input.finalEmotion || hue3
  const traitSeed = input.lifePath + input.dayOfYear + finalEmotion.freq
  const dominantTrait = pick(input.zodiac.traits, traitSeed)
  const stoneGift = pick(input.zodiac.stoneTraits, traitSeed + hue2.freq)
  const focus = pick(focuses, traitSeed + hue1.freq)
  const action = pick(actions, traitSeed + hue2.freq + hue3.freq)
  const auraName = input.finalAuraName || `${cleanName(finalEmotion.name)} Auracle`

  const title = auraName
  const mantra = `I blend ${cleanName(hue1.name).toLowerCase()}, ${cleanName(hue2.name).toLowerCase()}, and ${cleanName(hue3.name).toLowerCase()} into ${auraName}.`

  const reading = [
    `Your ${input.zodiac.sign} current opens through ${dominantTrait.toLowerCase()}, giving Hue 1 its zodiac signal: ${cleanName(hue1.name)}.`,
    `${input.zodiac.birthstone} adds ${stoneGift.toLowerCase()} as Hue 2, fading into the AuraSpectrum at ${Math.round((input.stoneOpacity || 0.5) * 100)}% opacity.`,
    `Hue 3 comes from the 365-day time cycle, landing on ${cleanName(hue3.name)} at Aura Day ${input.currentAuraDay || input.dayOfYear}.`,
    `When all three hues blend, they position your final Aura as ${auraName} at ${input.finalFrequency || finalEmotion.freq}hz. This is your AuraScope: ${focus}.`
  ].join(' ')

  return {
    title,
    focus,
    mantra,
    reading,
    action,
    hueSummary: [
      {
        label: 'Hue 1 · Zodiac Triad',
        name: cleanName(hue1.name),
        hex: hue1.hex,
        meaning: `How your ${input.zodiac.sign} positive, neutral, and shadow traits first broadcast into the field.`
      },
      {
        label: 'Hue 2 · Birthstone Resonance',
        name: cleanName(hue2.name),
        hex: hue2.hex,
        meaning: `How ${input.zodiac.birthstone} blends its positive, neutral, and shadow properties into the aura.`
      },
      {
        label: 'Hue 3 · 365-Day Time Hue',
        name: cleanName(hue3.name),
        hex: hue3.hex,
        meaning: 'The living time factor that moves the reading through the AuraSpanse cycle.'
      }
    ]
  }
}
