import type { EmotionColor } from './emotionColors'

export interface AuraHoroscopeInput {
  zodiac: { sign: string; traits: string[]; selectedTrait?: { polarity: 'positive' | 'neutral' | 'shadow'; name: string } }
  primaryAura: string
  secondaryAura: string
  blendedHue: EmotionColor
  finalEmotion: EmotionColor
  focus: string
  action: string
}

export interface AuraHoroscope {
  title: string
  overview: string
  strength: string
  balance: string
  relationships: string
  direction: string
  balancingColor: string
  nextStep: string
}

/**
 * Generates an astrology-inspired reflection from the actual AuraSpanse output.
 * This is symbolic entertainment, not a measurement or prediction of a user's state.
 */
export function generateAuraHoroscope(input: AuraHoroscopeInput): AuraHoroscope {
  const sign = input.zodiac.sign
  const selected = input.zodiac.selectedTrait?.name || input.zodiac.traits[0] || 'self-awareness'
  const polarity = input.zodiac.selectedTrait?.polarity || 'neutral'
  const primary = input.primaryAura.toLowerCase()
  const secondary = input.secondaryAura.toLowerCase()
  const blend = input.blendedHue.name.replace(/^The-/, '').replace(/-/g, ' ').toLowerCase()
  const color = input.finalEmotion.name.replace(/^The-/, '').replace(/-/g, ' ')

  const strengthByPolarity: Record<string, string> = {
    positive: `Your selected ${selected.toLowerCase()} theme points toward a resource you can consciously use. In this reading, ${primary} is the lead symbol: notice where that quality helps you act with clarity rather than react automatically.`,
    neutral: `Your selected ${selected.toLowerCase()} theme invites observation before action. The ${primary} symbol suggests that steadiness and curiosity may be more useful than forcing an immediate answer.`,
    shadow: `Your selected ${selected.toLowerCase()} theme is treated as a reflection point, not a flaw. The ${primary} symbol invites you to notice a trigger or habit with compassion and choose your response deliberately.`
  }

  return {
    title: `${sign} Aura Horoscope`,
    overview: `Your ${sign} symbolism is interpreted through a ${primary} primary aura and a ${secondary} secondary aura. Their combined hue, ${blend}, shapes this reading's theme: ${input.focus}. Treat this as a reflective prompt for today, not a factual prediction or a measurement of your current emotions.`,
    strength: strengthByPolarity[polarity],
    balance: `The balancing invitation is to make room for both the signal represented by ${primary} and the counterpoint represented by ${secondary}. If either theme feels unlike your experience, use that difference as a prompt to identify what actually matters to you.`,
    relationships: `In connection with others, consider how ${selected.toLowerCase()} shows up in listening, boundaries, and clear communication. Ask one question before assuming what another person means, and express one need plainly.`,
    direction: `For goals and decisions, the ${blend} theme favors a small, observable next step over a sweeping promise. Choose one priority you can influence, then decide what progress would look like by the end of the day.`,
    balancingColor: `${color} (${input.finalEmotion.hex})`,
    nextStep: input.action
  }
}
