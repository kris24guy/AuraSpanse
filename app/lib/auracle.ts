import { EmotionColor } from './emotionColors'

interface AuraScopeInput {
  zodiac: {
    sign: string
    traits: string[]
    birthstone: string
    birthstones?: string[]
    stoneTraits: string[]
    selectedTrait?: {
      polarity: 'positive' | 'neutral' | 'shadow'
      name: string
      hex: string
      freq: number
    }
  }
  lifePath: number
  dayOfYear: number
  hues: EmotionColor[]
  finalAuraName?: string
  primaryAuraName?: string
  secondaryAuraName?: string
  finalEmotion?: EmotionColor
  finalFrequency?: number
  finalHex?: string
  stoneOpacity?: number
  currentAuraDay?: number
  timeWeight?: number
  timeState?: string
  selectedStoneTrait?: EmotionColor
}

export interface AurascopeReading {
  title: string
  subtitleTraits: string[]
  primaryAura: string
  secondaryAura: string
  paragraphs: string[]
  focus: string
  mantra: string
  reading: string
  action: string
  birthstones: string[]
  hueSummary: Array<{
    label: string
    name: string
    hex: string
    meaning: string
  }>
}

const traitWords: Record<string, string> = {
  Empathy: 'Empathic',
  Dreaming: 'Dreamy',
  Sorrow: 'Fluid',
  Courage: 'Brave',
  Spontaneity: 'Spontaneous',
  Anguish: 'Intense',
  Groundedness: 'Grounded',
  Patience: 'Patient',
  Fear: 'Guarded',
  Communication: 'Expressive',
  Wit: 'Clever',
  Nervousness: 'Electric',
  Nurturing: 'Nurturing',
  Nostalgia: 'Remembering',
  Melancholy: 'Tender',
  Radiance: 'Radiant',
  Playfulness: 'Playful',
  Authority: 'Commanding',
  Clarity: 'Clear',
  Restlessness: 'Searching',
  Harmony: 'Harmonic',
  Balance: 'Balanced',
  Edginess: 'Charged',
  Depth: 'Deep',
  Intensity: 'Intense',
  Mystery: 'Mystic',
  Freedom: 'Free',
  Optimism: 'Optimistic',
  Commitment: 'Devoted',
  Endurance: 'Enduring',
  Dread: 'Thresholded',
  Vision: 'Visionary',
  Liberation: 'Liberated',
  Solitude: 'Solitary'
}

const openers = [
  'You are a traveler of the unseen, moving through the world like a current that listens before it speaks.',
  'Your field does not arrive all at once; it reveals itself in layers, like light passing through deep water.',
  'There is a quiet architecture inside your spirit, built from instinct, memory, timing, and emotional weather.',
  'Your aura carries the feeling of a door opening slowly, not because it is heavy, but because what waits behind it matters.'
]

const focuses = [
  'protecting your energy while still letting the right people reach you',
  'turning scattered signals into one clear next move',
  'trusting the message your body notices before your mind explains it',
  'letting your intuition become structure instead of noise',
  'moving from survival-mode reactions into deliberate creation',
  'recognizing which connection is medicine and which one is static'
]

const actions = [
  'Write down one decision you have been delaying, then choose the smallest honest step toward it today.',
  'Spend ten quiet minutes away from screens and notice which thought keeps returning without force.',
  'Before saying yes, ask whether the request expands your spirit or only drains your attention.',
  'Choose one unfinished loop and close it with a message, a note, or a clean boundary.',
  'Create one visible symbol of the future you are building and place it where you will see it daily.',
  'Name the emotion underneath the emotion; the second name is the key.'
]

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length]
}

function cleanName(name: string): string {
  return name.replace(/^The-/, '').replace(/-/g, ' ')
}

function traitLabel(name: string): string {
  return traitWords[name] || cleanName(name)
}

export function generateAurascope(input: AuraScopeInput): AurascopeReading {
  const [hue1, hue2, hue3, hue4] = input.hues
  const finalEmotion = input.finalEmotion || hue3
  const traitSeed = input.lifePath + input.dayOfYear + finalEmotion.freq + (input.timeWeight || 0)
  const selectedTrait = input.zodiac.selectedTrait?.name || pick(input.zodiac.traits, traitSeed)
  const stoneGift = input.selectedStoneTrait?.name || pick(input.zodiac.stoneTraits, traitSeed + hue2.freq)
  const focus = pick(focuses, traitSeed + hue1.freq)
  const action = pick(actions, traitSeed + hue2.freq + hue3.freq)
  const primaryAura = input.primaryAuraName || cleanName(hue1.name)
  const secondaryAura = input.secondaryAuraName || cleanName(hue2.name)
  const title = input.finalAuraName || `${primaryAura} with ${secondaryAura} whispers`
  const birthstones = input.zodiac.birthstones?.length ? input.zodiac.birthstones : [input.zodiac.birthstone]
  const subtitleTraits = input.zodiac.traits.slice(0, 3).map(traitLabel)
  const timeWeight = input.timeWeight ?? 0
  const opacity = Math.round((input.stoneOpacity || 0.5) * 100)

  const paragraphs = [
    pick(openers, traitSeed),
    `Your ${input.zodiac.sign} current opens through ${traitLabel(selectedTrait).toLowerCase()}, giving your primary aura its first signature: ${primaryAura}. This is the part of you that translates pressure into instinct and emotion into direction.`,
    `${input.zodiac.birthstone} enters as ${secondaryAura}, carrying ${cleanName(stoneGift).toLowerCase()} through ${opacity}% opacity. It softens, deepens, or sharpens the zodiac field depending on where your registration time lands on the 0–1000 AuraSpectrum scale.`,
    `The third color is not chosen separately; it is born from the first two hues blending together. That merged color becomes ${cleanName(hue3.name).toLowerCase()}, the bridge between what you came in with and what your field is becoming.`,
    `Your registration-time weight is ${timeWeight}/1000, moving through ${input.timeState || 'the living field'} and tinting the final aura with ${cleanName((hue4 || finalEmotion).name).toLowerCase()}. Trust the ebb and flow of these internal tides, because they reveal how your timing, traits, and stones combine into one AuraScope identity.`
  ]

  const mantra = `I let ${primaryAura}, ${secondaryAura}, and ${cleanName(hue3.name)} become one honest field.`
  const reading = paragraphs.join(' ')

  return {
    title,
    subtitleTraits,
    primaryAura,
    secondaryAura,
    paragraphs,
    focus,
    mantra,
    reading,
    action,
    birthstones,
    hueSummary: [
      {
        label: 'Hue 1 · Zodiac trait channel',
        name: primaryAura,
        hex: hue1.hex,
        meaning: `Your ${input.zodiac.sign} positive, neutral, and shadow traits are weighted by the registration-time scale.`
      },
      {
        label: 'Hue 2 · Birthstone opacity',
        name: secondaryAura,
        hex: hue2.hex,
        meaning: `${input.zodiac.birthstone} contributes ${cleanName(stoneGift).toLowerCase()} at ${opacity}% opacity.`
      },
      {
        label: 'Hue 3 · Combined hue',
        name: cleanName(hue3.name),
        hex: hue3.hex,
        meaning: 'This color is created by blending the zodiac hue and birthstone hue together.'
      },
      {
        label: 'Final aura · Time-weighted blend',
        name: title,
        hex: input.finalHex || finalEmotion.hex,
        meaning: `The final identity is shaped by the ${timeWeight}/1000 registration-time weight.`
      }
    ]
  }
}
