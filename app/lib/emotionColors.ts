// AuraSpanse Emotion-Color Spectrum Database
// Palette order is the spectrum's sequence. Each entry stores a name and a display color.

export interface EmotionColor {
  name: string;
  hex: string;
}

export const emotionColors: EmotionColor[] = [
  // ── TRANSCENDENT / PURE LIGHT ───────────────────────────────────────
  { name: 'Transcendence',     hex: '#fefefe'},
  { name: 'Luminosity',        hex: '#fdfcff'},
  { name: 'Boundlessness',     hex: '#faf8ff'},
  { name: 'Stillness',         hex: '#f8f6ff'},
  { name: 'Purity',            hex: '#f5f2ff'},
  { name: 'Grace',             hex: '#f2f0ff'},
  { name: 'Innocence',         hex: '#f0eeff'},
  { name: 'Clarity',           hex: '#eeeaff'},
  { name: 'Openness',          hex: '#ece8ff'},
  { name: 'Spaciousness',      hex: '#eae6ff'},
  { name: 'Radiance',          hex: '#e8e2ff'},
  { name: 'Awakening',         hex: '#e6e0ff'},
  { name: 'Presence',          hex: '#e4dcff'},
  { name: 'Genesis',           hex: '#e2d8ff'},

  // ── PALE LAVENDER / SPIRITUAL SOFTNESS ─────────────────────────────
  { name: 'Wonder',            hex: '#e0d4ff'},
  { name: 'Awe',               hex: '#dcd0ff'},
  { name: 'Reverence',         hex: '#d8cbff'},
  { name: 'Devotion-soft',     hex: '#d4c6ff'},
  { name: 'Sacredness',        hex: '#d0c0ff'},
  { name: 'Serenity',          hex: '#ccbaff'},
  { name: 'Gentleness',        hex: '#c8b4ff'},
  { name: 'Tenderness',        hex: '#c4aeff'},
  { name: 'Softness',          hex: '#c0a8ff'},
  { name: 'Shyness',           hex: '#bca2ff'},

  // ── VIOLET / MAGIC & DREAMS ──────────────────────────────────────
  { name: 'Magic',             hex: '#b89cff'},
  { name: 'Enchantment',       hex: '#b494ff'},
  { name: 'Fantasy',           hex: '#ae8cff'},
  { name: 'Dreaming',          hex: '#a884ff'},
  { name: 'Vision',            hex: '#a27cff'},
  { name: 'Intuition',         hex: '#9c74ff'},
  { name: 'Mysticism',         hex: '#966cff'},
  { name: 'Imagination',       hex: '#9064ff'},
  { name: 'Inner-knowing',     hex: '#8a5cff'},
  { name: 'Prophecy',          hex: '#8454ff'},

  // ── BLUE-VIOLET / SPIRITUALITY & DEPTH ──────────────────────────
  { name: 'Spirituality',      hex: '#7e4cff'},
  { name: 'Mystery',           hex: '#7844ff'},
  { name: 'Transcendent-will', hex: '#7040f8'},
  { name: 'Sovereignty',       hex: '#6838f0'},
  { name: 'Wisdom',            hex: '#6030e8'},
  { name: 'Dignity',           hex: '#5828e0'},
  { name: 'Authority',         hex: '#5020d8'},
  { name: 'Nobility',          hex: '#4818d0'},
  { name: 'Power',             hex: '#4010c8'},

  // ── INDIGO / PSYCHE & DEPTH ─────────────────────────────────────
  { name: 'The-unconscious',   hex: '#3810c0'},
  { name: 'Hidden-truth',      hex: '#3010b8'},
  { name: 'Depth',             hex: '#2a10b0'},
  { name: 'Psychic-awareness', hex: '#2410a8'},
  { name: 'Introspection',     hex: '#2010a0'},
  { name: 'Contemplation',     hex: '#1c1098'},
  { name: 'Solitude',          hex: '#181090'},
  { name: 'Gravitas',          hex: '#141088'},
  { name: 'Profundity',        hex: '#101080'},

  // ── DEEP BLUE / LOYALTY & TRUTH ─────────────────────────────────
  { name: 'Loyalty',           hex: '#0c1080'},
  { name: 'Faithfulness',      hex: '#0a1888'},
  { name: 'Integrity',         hex: '#082090'},
  { name: 'Constancy',         hex: '#062898'},
  { name: 'Trust',             hex: '#0430a0'},
  { name: 'Sincerity',         hex: '#0838a8'},
  { name: 'Honor',             hex: '#0c40b0'},
  { name: 'Conviction',        hex: '#1048b8'},
  { name: 'Steadfastness',     hex: '#1450c0'},
  { name: 'Commitment',        hex: '#1858c8'},

  // ── MEDIUM BLUE / SADNESS & DEPTH ───────────────────────────────
  { name: 'Melancholy',        hex: '#2060d0'},
  { name: 'Wistfulness',       hex: '#2868d8'},
  { name: 'Longing',           hex: '#3070e0'},
  { name: 'Yearning',          hex: '#3878e8'},
  { name: 'Nostalgia',         hex: '#4080f0'},
  { name: 'Homesickness',      hex: '#4888f4'},
  { name: 'Sadness',           hex: '#5090f8'},
  { name: 'Sorrow',            hex: '#5898fc'},
  { name: 'Grief-tender',      hex: '#60a0ff'},
  { name: 'Loss',              hex: '#68a8ff'},

  // ── SKY BLUE / PEACE & HOPE ─────────────────────────────────────
  { name: 'Peace',             hex: '#70b0ff'},
  { name: 'Calm',              hex: '#78b8ff'},
  { name: 'Tranquility',       hex: '#80c0ff'},
  { name: 'Quietude',          hex: '#88c8ff'},
  { name: 'Hope',              hex: '#90d0ff'},
  { name: 'Faith',             hex: '#98d8ff'},
  { name: 'Relief',            hex: '#a0e0ff'},
  { name: 'Ease',              hex: '#a8e8ff'},
  { name: 'Flow',              hex: '#b0f0ff'},
  { name: 'Acceptance',        hex: '#b8f4ff'},

  // ── CYAN / FREEDOM & COMMUNICATION ──────────────────────────────
  { name: 'Freedom',           hex: '#c0f8ff'},
  { name: 'Liberation',        hex: '#a0f4f8'},
  { name: 'Openness-vast',     hex: '#80f0f0'},
  { name: 'Spaciousness-felt', hex: '#60ece8'},
  { name: 'Communication',     hex: '#40e8e0'},
  { name: 'Expression',        hex: '#30e0d8'},
  { name: 'Honesty',           hex: '#20d8d0'},
  { name: 'Transparency',      hex: '#18d0c8'},

  // ── TEAL / INTUITION & EMPATHY ──────────────────────────────────
  { name: 'Empathy',           hex: '#10c8c0'},
  { name: 'Attunement',        hex: '#10c0b8'},
  { name: 'Resonance',         hex: '#10b8b0'},
  { name: 'Rapport',           hex: '#10b0a8'},
  { name: 'Connection',        hex: '#10a8a0'},
  { name: 'Sensitivity',       hex: '#10a098'},
  { name: 'Perception',        hex: '#109890'},

  // ── TEAL-GREEN / HEALING & RENEWAL ──────────────────────────────
  { name: 'Healing',           hex: '#109088'},
  { name: 'Restoration',       hex: '#108880'},
  { name: 'Recovery',          hex: '#108870'},
  { name: 'Renewal',           hex: '#108860'},
  { name: 'Rejuvenation',      hex: '#108850'},
  { name: 'Invigoration',      hex: '#109040'},
  { name: 'Vitality',          hex: '#10a030'},
  { name: 'Aliveness',         hex: '#10b020'},

  // ── BRIGHT GREEN / GROWTH & HARMONY ─────────────────────────────
  { name: 'Growth',            hex: '#20c010'},
  { name: 'Flourishing',       hex: '#30c810'},
  { name: 'Expansion',         hex: '#40d010'},
  { name: 'Thriving',          hex: '#50d810'},
  { name: 'Abundance',         hex: '#60e010'},
  { name: 'Harmony',           hex: '#70e020'},
  { name: 'Balance',           hex: '#80e830'},
  { name: 'Equilibrium',       hex: '#90f040'},
  { name: 'Wholeness',         hex: '#a0f050'},
  { name: 'Generosity',        hex: '#b0f060'},

  // ── MEDIUM GREEN / GROUNDEDNESS ─────────────────────────────────
  { name: 'Groundedness',      hex: '#80d840'},
  { name: 'Stability',         hex: '#70c830'},
  { name: 'Rootedness',        hex: '#60b820'},
  { name: 'Security',          hex: '#50a818'},
  { name: 'Safety',            hex: '#409810'},
  { name: 'Reliability',       hex: '#308810'},
  { name: 'Patience',          hex: '#207810'},
  { name: 'Endurance',         hex: '#186810'},

  // ── YELLOW-GREEN / FRESHNESS & ANTICIPATION ─────────────────────
  { name: 'Freshness',         hex: '#98e820'},
  { name: 'Alertness',         hex: '#a8e820'},
  { name: 'Anticipation',      hex: '#b8e820'},
  { name: 'Eagerness',         hex: '#c8e820'},
  { name: 'Readiness',         hex: '#d8e820'},
  { name: 'Nervousness',       hex: '#d8d820'},
  { name: 'Edginess',          hex: '#d8c820'},
  { name: 'Restlessness',      hex: '#d8b820'},

  // ── YELLOW / INTELLECT & JOY ────────────────────────────────────
  { name: 'Joy',               hex: '#ffe000'},
  { name: 'Happiness',         hex: '#ffe810'},
  { name: 'Delight',           hex: '#fff020'},
  { name: 'Elation',           hex: '#fff830'},
  { name: 'Euphoria',          hex: '#ffff40'},
  { name: 'Clarity-mind',      hex: '#f8f830'},
  { name: 'Intelligence',      hex: '#f0f020'},
  { name: 'Wit',               hex: '#e8e810'},
  { name: 'Insight',           hex: '#e0e000'},
  { name: 'Understanding',     hex: '#d8d800'},

  // ── AMBER-GOLD / WARMTH & WISDOM ────────────────────────────────
  { name: 'Optimism',          hex: '#f0d000'},
  { name: 'Warmth',            hex: '#f0c000'},
  { name: 'Comfort',           hex: '#f0b000'},
  { name: 'Contentment',       hex: '#f0a000'},
  { name: 'Gratitude',         hex: '#f09000'},
  { name: 'Appreciation',      hex: '#f08000'},
  { name: 'Nostalgia-warm',    hex: '#e87800'},
  { name: 'Sentimentality',    hex: '#e07000'},
  { name: 'Memory',            hex: '#d86800'},

  // ── ORANGE / CREATIVITY & ENTHUSIASM ────────────────────────────
  { name: 'Creativity',        hex: '#f06000'},
  { name: 'Imagination-warm',  hex: '#f05800'},
  { name: 'Enthusiasm',        hex: '#f85000'},
  { name: 'Excitement',        hex: '#f84800'},
  { name: 'Exuberance',        hex: '#f84000'},
  { name: 'Animation',         hex: '#ff3800'},
  { name: 'Playfulness',       hex: '#ff3000'},
  { name: 'Humor',             hex: '#ff2800'},
  { name: 'Lightness',         hex: '#ff2000'},
  { name: 'Spontaneity',       hex: '#f82000'},

  // ── RED-ORANGE / DRIVE & COURAGE ────────────────────────────────
  { name: 'Drive',             hex: '#f01800'},
  { name: 'Motivation',        hex: '#e81800'},
  { name: 'Ambition',          hex: '#e01010'},
  { name: 'Determination',     hex: '#d81010'},
  { name: 'Courage',           hex: '#d00808'},
  { name: 'Boldness',          hex: '#c80808'},
  { name: 'Daring',            hex: '#c00000'},
  { name: 'Bravery',           hex: '#b80000'},

  // ── BRIGHT RED / PASSION & VITALITY ─────────────────────────────
  { name: 'Passion',           hex: '#cc0010'},
  { name: 'Ardor',             hex: '#cc0020'},
  { name: 'Intensity',         hex: '#cc0030'},
  { name: 'Desire',            hex: '#cc0040'},
  { name: 'Longing-fire',      hex: '#c80050'},
  { name: 'Vitality-fire',     hex: '#c40060'},
  { name: 'Primal',            hex: '#c00070'},

  // ── ROSE / LOVE & TENDERNESS ────────────────────────────────────
  { name: 'Love',              hex: '#e00080'},
  { name: 'Romance',           hex: '#e00090'},
  { name: 'Affection',         hex: '#e000a0'},
  { name: 'Adoration',         hex: '#d800b0'},
  { name: 'Infatuation',       hex: '#d000b8'},
  { name: 'Devotion',          hex: '#c800c0'},
  { name: 'Compassion',        hex: '#c000c0'},
  { name: 'Nurturing',         hex: '#b800b8'},

  // ── MAGENTA / ECSTASY & TRANSFORMATION ──────────────────────────
  { name: 'Ecstasy',           hex: '#c000c8'},
  { name: 'Rapture',           hex: '#b000c8'},
  { name: 'Transformation',    hex: '#9800c0'},
  { name: 'Alchemy',           hex: '#8000b8'},
  { name: 'Metamorphosis',     hex: '#6800b0'},
  { name: 'Dissolution-bliss', hex: '#5000a8'},
  { name: 'Union',             hex: '#4000a0'},

  // ── DEEP PURPLE / GRIEF & SHADOW ────────────────────────────────
  { name: 'Grief',             hex: '#380098'},
  { name: 'Mourning',          hex: '#300090'},
  { name: 'Anguish',           hex: '#280088'},
  { name: 'Despair',           hex: '#200080'},
  { name: 'Dread',             hex: '#180070'},
  { name: 'Terror',            hex: '#100060'},
  { name: 'The-shadow',        hex: '#080050'},

  // ── NEAR-BLACK / VOID & THRESHOLD ──────────────────────────────
  { name: 'Fear',              hex: '#080040'},
  { name: 'Surrender',         hex: '#060030'},
  { name: 'Dissolution',       hex: '#040020'},
  { name: 'The-void',          hex: '#020010'},
  { name: 'Silence-absolute',  hex: '#010008'},
  { name: 'Before-emotion',    hex: '#000004'},
  { name: 'The-unnameable',    hex: '#000000'},
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Clamp a palette position to the existing ordered color list. */
export function getEmotionByIndex(index: number): EmotionColor {
  const safeIndex = Math.max(0, Math.min(emotionColors.length - 1, Math.round(index)));
  return emotionColors[safeIndex];
}

/** Find an emotion's ordered palette position; blended colors use their nearest swatch. */
export function getEmotionIndex(emotion: Pick<EmotionColor, 'name' | 'hex'>): number {
  const namedIndex = emotionColors.findIndex((item) => item.name === emotion.name);
  if (namedIndex >= 0) return namedIndex;

  const channels = (value: string) => {
    const clean = value.replace('#', '');
    return [0, 2, 4].map((offset) => Number.parseInt(clean.slice(offset, offset + 2), 16));
  };
  const target = channels(emotion.hex);
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  emotionColors.forEach((item, index) => {
    const candidate = channels(item.hex);
    const distance = candidate.reduce((sum, channel, i) => sum + (channel - target[i]) ** 2, 0);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });
  return nearestIndex;
}

/** Get a stable, birth-locked palette entry from a numeric seed. */
export function getBirthEmotion(seed: number): EmotionColor {
  const index = ((Math.trunc(seed) % emotionColors.length) + emotionColors.length) % emotionColors.length;
  return emotionColors[index];
}

/** Get the annual-cycle offset (0–1) for a given day-of-year.
 *  Used to drive animation speed — never exposed to the user. */
export function getAnnualCycleOffset(dayOfYear: number): number {
  return (Math.sin((dayOfYear / 365) * Math.PI * 2) + 1) / 2; // 0–1
}
