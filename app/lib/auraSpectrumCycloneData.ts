// The visual cylinder uses the same emotion glossary as the Aura-Spectrum reveal engine.
import { emotionColors } from './emotionColors'
import { buildEmotionGlossaryPoints, type EmotionGlossaryPoint } from './emotionGlossary'

export type AuraSpectrumCyclonePoint = EmotionGlossaryPoint

export const AURA_SPECTRUM_CYCLONE_POINTS: AuraSpectrumCyclonePoint[] =
  buildEmotionGlossaryPoints(emotionColors)

// These are the primary candidates selected by the existing Aura-Spectrum age model.
export const AURA_SPECTRUM_PRIMARY_POINTS: AuraSpectrumCyclonePoint[] =
  AURA_SPECTRUM_CYCLONE_POINTS
