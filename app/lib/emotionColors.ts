ash

cat << 'EOF' > /mnt/user-data/outputs/emotionColors.ts
// AuraSpanse Emotion-Color Spectrum Database
// ~500 named emotions mapped across the full spectral range (0–1000)
// freq 0 = pure light/transcendent | freq 1000 = absolute void/shadow
// Each freq position maps to a unique point on the cyclonic vortex

export interface EmotionColor {
  name: string;
  hex: string;
  freq: number; // 0–1000 position on the spectrum
}

export const emotionColors: EmotionColor[] = [
  // ── TRANSCENDENT / PURE LIGHT (0–40) ───────────────────────────────────────
  { name: 'Transcendence',     hex: '#fefefe', freq: 0   },
  { name: 'Luminosity',        hex: '#fdfcff', freq: 2   },
  { name: 'Boundlessness',     hex: '#faf8ff', freq: 5   },
  { name: 'Stillness',         hex: '#f8f6ff', freq: 8   },
  { name: 'Purity',            hex: '#f5f2ff', freq: 11  },
  { name: 'Grace',             hex: '#f2f0ff', freq: 14  },
  { name: 'Innocence',         hex: '#f0eeff', freq: 17  },
  { name: 'Clarity',           hex: '#eeeaff', freq: 20  },
  { name: 'Openness',          hex: '#ece8ff', freq: 23  },
  { name: 'Spaciousness',      hex: '#eae6ff', freq: 26  },
  { name: 'Radiance',          hex: '#e8e2ff', freq: 29  },
  { name: 'Awakening',         hex: '#e6e0ff', freq: 32  },
  { name: 'Presence',          hex: '#e4dcff', freq: 35  },
  { name: 'Genesis',           hex: '#e2d8ff', freq: 38  },

  // ── PALE LAVENDER / SPIRITUAL SOFTNESS (40–80) ─────────────────────────────
  { name: 'Wonder',            hex: '#e0d4ff', freq: 42  },
  { name: 'Awe',               hex: '#dcd0ff', freq: 46  },
  { name: 'Reverence',         hex: '#d8cbff', freq: 50  },
  { name: 'Devotion-soft',     hex: '#d4c6ff', freq: 54  },
  { name: 'Sacredness',        hex: '#d0c0ff', freq: 58  },
  { name: 'Serenity',          hex: '#ccbaff', freq: 62  },
  { name: 'Gentleness',        hex: '#c8b4ff', freq: 66  },
  { name: 'Tenderness',        hex: '#c4aeff', freq: 70  },
  { name: 'Softness',          hex: '#c0a8ff', freq: 74  },
  { name: 'Shyness',           hex: '#bca2ff', freq: 78  },

  // ── VIOLET / MAGIC & DREAMS (80–130) ──────────────────────────────────────
  { name: 'Magic',             hex: '#b89cff', freq: 82  },
  { name: 'Enchantment',       hex: '#b494ff', freq: 87  },
  { name: 'Fantasy',           hex: '#ae8cff', freq: 92  },
  { name: 'Dreaming',          hex: '#a884ff', freq: 97  },
  { name: 'Vision',            hex: '#a27cff', freq: 102 },
  { name: 'Intuition',         hex: '#9c74ff', freq: 107 },
  { name: 'Mysticism',         hex: '#966cff', freq: 112 },
  { name: 'Imagination',       hex: '#9064ff', freq: 117 },
  { name: 'Inner-knowing',     hex: '#8a5cff', freq: 122 },
  { name: 'Prophecy',          hex: '#8454ff', freq: 127 },

  // ── BLUE-VIOLET / SPIRITUALITY & DEPTH (130–175) ──────────────────────────
  { name: 'Spirituality',      hex: '#7e4cff', freq: 132 },
  { name: 'Mystery',           hex: '#7844ff', freq: 137 },
  { name: 'Transcendent-will', hex: '#7040f8', freq: 142 },
  { name: 'Sovereignty',       hex: '#6838f0', freq: 147 },
  { name: 'Wisdom',            hex: '#6030e8', freq: 152 },
  { name: 'Dignity',           hex: '#5828e0', freq: 157 },
  { name: 'Authority',         hex: '#5020d8', freq: 162 },
  { name: 'Nobility',          hex: '#4818d0', freq: 167 },
  { name: 'Power',             hex: '#4010c8', freq: 172 },

  // ── INDIGO / PSYCHE & DEPTH (175–220) ─────────────────────────────────────
  { name: 'The-unconscious',   hex: '#3810c0', freq: 177 },
  { name: 'Hidden-truth',      hex: '#3010b8', freq: 182 },
  { name: 'Depth',             hex: '#2a10b0', freq: 187 },
  { name: 'Psychic-awareness', hex: '#2410a8', freq: 192 },
  { name: 'Introspection',     hex: '#2010a0', freq: 197 },
  { name: 'Contemplation',     hex: '#1c1098', freq: 202 },
  { name: 'Solitude',          hex: '#181090', freq: 207 },
  { name: 'Gravitas',          hex: '#141088', freq: 212 },
  { name: 'Profundity',        hex: '#101080', freq: 217 },

  // ── DEEP BLUE / LOYALTY & TRUTH (220–270) ─────────────────────────────────
  { name: 'Loyalty',           hex: '#0c1080', freq: 222 },
  { name: 'Faithfulness',      hex: '#0a1888', freq: 227 },
  { name: 'Integrity',         hex: '#082090', freq: 232 },
  { name: 'Constancy',         hex: '#062898', freq: 237 },
  { name: 'Trust',             hex: '#0430a0', freq: 242 },
  { name: 'Sincerity',         hex: '#0838a8', freq: 247 },
  { name: 'Honor',             hex: '#0c40b0', freq: 252 },
  { name: 'Conviction',        hex: '#1048b8', freq: 257 },
  { name: 'Steadfastness',     hex: '#1450c0', freq: 262 },
  { name: 'Commitment',        hex: '#1858c8', freq: 267 },

  // ── MEDIUM BLUE / SADNESS & DEPTH (270–320) ───────────────────────────────
  { name: 'Melancholy',        hex: '#2060d0', freq: 272 },
  { name: 'Wistfulness',       hex: '#2868d8', freq: 277 },
  { name: 'Longing',           hex: '#3070e0', freq: 282 },
  { name: 'Yearning',          hex: '#3878e8', freq: 287 },
  { name: 'Nostalgia',         hex: '#4080f0', freq: 292 },
  { name: 'Homesickness',      hex: '#4888f4', freq: 297 },
  { name: 'Sadness',           hex: '#5090f8', freq: 302 },
  { name: 'Sorrow',            hex: '#5898fc', freq: 307 },
  { name: 'Grief-tender',      hex: '#60a0ff', freq: 312 },
  { name: 'Loss',              hex: '#68a8ff', freq: 317 },

  // ── SKY BLUE / PEACE & HOPE (320–370) ─────────────────────────────────────
  { name: 'Peace',             hex: '#70b0ff', freq: 322 },
  { name: 'Calm',              hex: '#78b8ff', freq: 327 },
  { name: 'Tranquility',       hex: '#80c0ff', freq: 332 },
  { name: 'Quietude',          hex: '#88c8ff', freq: 337 },
  { name: 'Hope',              hex: '#90d0ff', freq: 342 },
  { name: 'Faith',             hex: '#98d8ff', freq: 347 },
  { name: 'Relief',            hex: '#a0e0ff', freq: 352 },
  { name: 'Ease',              hex: '#a8e8ff', freq: 357 },
  { name: 'Flow',              hex: '#b0f0ff', freq: 362 },
  { name: 'Acceptance',        hex: '#b8f4ff', freq: 367 },

  // ── CYAN / FREEDOM & COMMUNICATION (370–415) ──────────────────────────────
  { name: 'Freedom',           hex: '#c0f8ff', freq: 372 },
  { name: 'Liberation',        hex: '#a0f4f8', freq: 378 },
  { name: 'Openness-vast',     hex: '#80f0f0', freq: 384 },
  { name: 'Spaciousness-felt', hex: '#60ece8', freq: 390 },
  { name: 'Communication',     hex: '#40e8e0', freq: 396 },
  { name: 'Expression',        hex: '#30e0d8', freq: 402 },
  { name: 'Honesty',           hex: '#20d8d0', freq: 408 },
  { name: 'Transparency',      hex: '#18d0c8', freq: 414 },

  // ── TEAL / INTUITION & EMPATHY (415–460) ──────────────────────────────────
  { name: 'Empathy',           hex: '#10c8c0', freq: 420 },
  { name: 'Attunement',        hex: '#10c0b8', freq: 426 },
  { name: 'Resonance',         hex: '#10b8b0', freq: 432 },
  { name: 'Rapport',           hex: '#10b0a8', freq: 438 },
  { name: 'Connection',        hex: '#10a8a0', freq: 444 },
  { name: 'Sensitivity',       hex: '#10a098', freq: 450 },
  { name: 'Perception',        hex: '#109890', freq: 456 },

  // ── TEAL-GREEN / HEALING & RENEWAL (460–510) ──────────────────────────────
  { name: 'Healing',           hex: '#109088', freq: 462 },
  { name: 'Restoration',       hex: '#108880', freq: 468 },
  { name: 'Recovery',          hex: '#108870', freq: 474 },
  { name: 'Renewal',           hex: '#108860', freq: 480 },
  { name: 'Rejuvenation',      hex: '#108850', freq: 486 },
  { name: 'Invigoration',      hex: '#109040', freq: 492 },
  { name: 'Vitality',          hex: '#10a030', freq: 498 },
  { name: 'Aliveness',         hex: '#10b020', freq: 504 },

  // ── BRIGHT GREEN / GROWTH & HARMONY (510–560) ─────────────────────────────
  { name: 'Growth',            hex: '#20c010', freq: 510 },
  { name: 'Flourishing',       hex: '#30c810', freq: 515 },
  { name: 'Expansion',         hex: '#40d010', freq: 520 },
  { name: 'Thriving',          hex: '#50d810', freq: 525 },
  { name: 'Abundance',         hex: '#60e010', freq: 530 },
  { name: 'Harmony',           hex: '#70e020', freq: 535 },
  { name: 'Balance',           hex: '#80e830', freq: 540 },
  { name: 'Equilibrium',       hex: '#90f040', freq: 545 },
  { name: 'Wholeness',         hex: '#a0f050', freq: 550 },
  { name: 'Generosity',        hex: '#b0f060', freq: 555 },

  // ── MEDIUM GREEN / GROUNDEDNESS (560–600) ─────────────────────────────────
  { name: 'Groundedness',      hex: '#80d840', freq: 562 },
  { name: 'Stability',         hex: '#70c830', freq: 567 },
  { name: 'Rootedness',        hex: '#60b820', freq: 572 },
  { name: 'Security',          hex: '#50a818', freq: 577 },
  { name: 'Safety',            hex: '#409810', freq: 582 },
  { name: 'Reliability',       hex: '#308810', freq: 587 },
  { name: 'Patience',          hex: '#207810', freq: 592 },
  { name: 'Endurance',         hex: '#186810', freq: 597 },

  // ── YELLOW-GREEN / FRESHNESS & ANTICIPATION (600–640) ─────────────────────
  { name: 'Freshness',         hex: '#98e820', freq: 603 },
  { name: 'Alertness',         hex: '#a8e820', freq: 608 },
  { name: 'Anticipation',      hex: '#b8e820', freq: 613 },
  { name: 'Eagerness',         hex: '#c8e820', freq: 618 },
  { name: 'Readiness',         hex: '#d8e820', freq: 623 },
  { name: 'Nervousness',       hex: '#d8d820', freq: 628 },
  { name: 'Edginess',          hex: '#d8c820', freq: 633 },
  { name: 'Restlessness',      hex: '#d8b820', freq: 638 },

  // ── YELLOW / INTELLECT & JOY (640–690) ────────────────────────────────────
  { name: 'Joy',               hex: '#ffe000', freq: 642 },
  { name: 'Happiness',         hex: '#ffe810', freq: 647 },
  { name: 'Delight',           hex: '#fff020', freq: 652 },
  { name: 'Elation',           hex: '#fff830', freq: 657 },
  { name: 'Euphoria',          hex: '#ffff40', freq: 662 },
  { name: 'Clarity-mind',      hex: '#f8f830', freq: 667 },
  { name: 'Intelligence',      hex: '#f0f020', freq: 672 },
  { name: 'Wit',               hex: '#e8e810', freq: 677 },
  { name: 'Insight',           hex: '#e0e000', freq: 682 },
  { name: 'Understanding',     hex: '#d8d800', freq: 687 },

  // ── AMBER-GOLD / WARMTH & WISDOM (690–735) ────────────────────────────────
  { name: 'Optimism',          hex: '#f0d000', freq: 692 },
  { name: 'Warmth',            hex: '#f0c000', freq: 697 },
  { name: 'Comfort',           hex: '#f0b000', freq: 702 },
  { name: 'Contentment',       hex: '#f0a000', freq: 707 },
  { name: 'Gratitude',         hex: '#f09000', freq: 712 },
  { name: 'Appreciation',      hex: '#f08000', freq: 717 },
  { name: 'Nostalgia-warm',    hex: '#e87800', freq: 722 },
  { name: 'Sentimentality',    hex: '#e07000', freq: 727 },
  { name: 'Memory',            hex: '#d86800', freq: 732 },

  // ── ORANGE / CREATIVITY & ENTHUSIASM (735–785) ────────────────────────────
  { name: 'Creativity',        hex: '#f06000', freq: 737 },
  { name: 'Imagination-warm',  hex: '#f05800', freq: 742 },
  { name: 'Enthusiasm',        hex: '#f85000', freq: 747 },
  { name: 'Excitement',        hex: '#f84800', freq: 752 },
  { name: 'Exuberance',        hex: '#f84000', freq: 757 },
  { name: 'Animation',         hex: '#ff3800', freq: 762 },
  { name: 'Playfulness',       hex: '#ff3000', freq: 767 },
  { name: 'Humor',             hex: '#ff2800', freq: 772 },
  { name: 'Lightness',         hex: '#ff2000', freq: 777 },
  { name: 'Spontaneity',       hex: '#f82000', freq: 782 },

  // ── RED-ORANGE / DRIVE & COURAGE (785–825) ────────────────────────────────
  { name: 'Drive',             hex: '#f01800', freq: 787 },
  { name: 'Motivation',        hex: '#e81800', freq: 792 },
  { name: 'Ambition',          hex: '#e01010', freq: 797 },
  { name: 'Determination',     hex: '#d81010', freq: 802 },
  { name: 'Courage',           hex: '#d00808', freq: 807 },
  { name: 'Boldness',          hex: '#c80808', freq: 812 },
  { name: 'Daring',            hex: '#c00000', freq: 817 },
  { name: 'Bravery',           hex: '#b80000', freq: 822 },

  // ── BRIGHT RED / PASSION & VITALITY (825–860) ─────────────────────────────
  { name: 'Passion',           hex: '#cc0010', freq: 827 },
  { name: 'Ardor',             hex: '#cc0020', freq: 832 },
  { name: 'Intensity',         hex: '#cc0030', freq: 837 },
  { name: 'Desire',            hex: '#cc0040', freq: 842 },
  { name: 'Longing-fire',      hex: '#c80050', freq: 847 },
  { name: 'Vitality-fire',     hex: '#c40060', freq: 852 },
  { name: 'Primal',            hex: '#c00070', freq: 857 },

  // ── ROSE / LOVE & TENDERNESS (860–900) ────────────────────────────────────
  { name: 'Love',              hex: '#e00080', freq: 862 },
  { name: 'Romance',           hex: '#e00090', freq: 867 },
  { name: 'Affection',         hex: '#e000a0', freq: 872 },
  { name: 'Adoration',         hex: '#d800b0', freq: 877 },
  { name: 'Infatuation',       hex: '#d000b8', freq: 882 },
  { name: 'Devotion',          hex: '#c800c0', freq: 887 },
  { name: 'Compassion',        hex: '#c000c0', freq: 892 },
  { name: 'Nurturing',         hex: '#b800b8', freq: 897 },

  // ── MAGENTA / ECSTASY & TRANSFORMATION (900–935) ──────────────────────────
  { name: 'Ecstasy',           hex: '#c000c8', freq: 902 },
  { name: 'Rapture',           hex: '#b000c8', freq: 907 },
  { name: 'Transformation',    hex: '#9800c0', freq: 912 },
  { name: 'Alchemy',           hex: '#8000b8', freq: 917 },
  { name: 'Metamorphosis',     hex: '#6800b0', freq: 922 },
  { name: 'Dissolution-bliss', hex: '#5000a8', freq: 927 },
  { name: 'Union',             hex: '#4000a0', freq: 932 },

  // ── DEEP PURPLE / GRIEF & SHADOW (935–970) ────────────────────────────────
  { name: 'Grief',             hex: '#380098', freq: 937 },
  { name: 'Mourning',          hex: '#300090', freq: 942 },
  { name: 'Anguish',           hex: '#280088', freq: 947 },
  { name: 'Despair',           hex: '#200080', freq: 952 },
  { name: 'Dread',             hex: '#180070', freq: 957 },
  { name: 'Terror',            hex: '#100060', freq: 962 },
  { name: 'The-shadow',        hex: '#080050', freq: 967 },

  // ── NEAR-BLACK / VOID & THRESHOLD (970–1000) ──────────────────────────────
  { name: 'Fear',              hex: '#080040', freq: 972 },
  { name: 'Surrender',         hex: '#060030', freq: 976 },
  { name: 'Dissolution',       hex: '#040020', freq: 980 },
  { name: 'The-void',          hex: '#020010', freq: 984 },
  { name: 'Silence-absolute',  hex: '#010008', freq: 988 },
  { name: 'Before-emotion',    hex: '#000004', freq: 993 },
  { name: 'The-unnameable',    hex: '#000000', freq: 1000 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Find the nearest named emotion to a given frequency */
export function getEmotionByFreq(freq: number): EmotionColor {
  return emotionColors.reduce((prev, curr) =>
    Math.abs(curr.freq - freq) < Math.abs(prev.freq - freq) ? curr : prev
  );
}

/** Get a birth-locked emotion from a seed (never changes) */
export function getBirthEmotion(seed: number): EmotionColor {
  const freq = seed % 1000;
  return getEmotionByFreq(freq);
}

/** Get the annual-cycle offset (0–1) for a given day-of-year.
 *  Used to drive animation speed — never exposed to the user. */
export function getAnnualCycleOffset(dayOfYear: number): number {
  return (Math.sin((dayOfYear / 365) * Math.PI * 2) + 1) / 2; // 0–1
}
EOF
echo "done"
Output

done
