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
  'letting the old identity finish dissolving before naming the next one',
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
  'Let one answer be simple today instead of proving it to everyone.',
]

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length]
}

function cleanName(name: string): string {
  return name.replace(/-/g, ' ')
}

export function generateAurascope(input: AuraScopeInput): AurascopeReading {
  const [hue1, hue2, hue3] = input.hues
  const traitSeed = input.lifePath + input.dayOfYear + hue3.freq
  const dominantTrait = pick(input.zodiac.traits, traitSeed)
  const stoneGift = pick(input.zodiac.stoneTraits, traitSeed + hue2.freq)
  const focus = pick(focuses, traitSeed + hue1.freq)
  const action = pick(actions, traitSeed + hue2.freq + hue3.freq)

  const title = `${cleanName(hue3.name)} Auracle`
  const mantra = `I blend ${cleanName(hue1.name).toLowerCase()} with ${cleanName(hue2.name).toLowerCase()} and move through ${cleanName(hue3.name).toLowerCase()}.`

  const reading = [
    `Your ${input.zodiac.sign} current opens through ${dominantTrait.toLowerCase()}, giving your aura a recognizable first signal: ${cleanName(hue1.name)}.`,
    `${input.zodiac.birthstone} adds ${stoneGift.toLowerCase()} beneath the surface, shaping Hue 2 as ${cleanName(hue2.name)} and revealing what your inner field is trying to stabilize.`,
    `When the two hues reconcile, Hue 3 becomes ${cleanName(hue3.name)}. This is your aurascope: ${focus}.`,
  ].join(' ')

  return {
    title,
    focus,
    mantra,
    reading,
    action,
    hueSummary: [
      {
        label: 'Hue 1 · External Projection',
        name: cleanName(hue1.name),
        hex: hue1.hex,
        meaning: `How your ${input.zodiac.sign} traits first broadcast into the field.`,
      },
      {
        label: 'Hue 2 · Inner Stone Frequency',
        name: cleanName(hue2.name),
        hex: hue2.hex,
        meaning: `How ${input.zodiac.birthstone} and Life Path ${input.lifePath} shape the inner signal.`,
      },
      {
        label: 'Hue 3 · Auracle Balance',
        name: cleanName(hue3.name),
        hex: hue3.hex,
        meaning: 'The reconciled frequency that becomes the aurascope reading.',
      },
    ],
  }
}
