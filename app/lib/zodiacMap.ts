import { EmotionColor, emotionColors } from './emotionColors'

function e(name: string): EmotionColor {
  const found = emotionColors.find((color) => color.name.toLowerCase() === name.toLowerCase())
  if (!found) throw new Error(`Emotion not in spectrum: ${name}`)
  return found
}

export const zodiacMap = {
  aries: {
    sign: 'Aries',
    element: 'Fire',
    dates: 'Mar 21 - Apr 19',
    pos: e('Courage'),
    neu: e('Spontaneity'),
    neg: e('Anguish'),
    description: 'Cardinal fire that starts.'
  },
  taurus: {
    sign: 'Taurus',
    element: 'Earth',
    dates: 'Apr 20 - May 20',
    pos: e('Groundedness'),
    neu: e('Patience'),
    neg: e('Fear'),
    description: 'Fixed earth that holds.'
  },
  gemini: {
    sign: 'Gemini',
    element: 'Air',
    dates: 'May 21 - Jun 20',
    pos: e('Communication'),
    neu: e('Wit'),
    neg: e('Nervousness'),
    description: 'Mutable air that connects.'
  },
  cancer: {
    sign: 'Cancer',
    element: 'Water',
    dates: 'Jun 21 - Jul 22',
    pos: e('Nurturing'),
    neu: e('Nostalgia'),
    neg: e('Melancholy'),
    description: 'Cardinal water that feels.'
  },
  leo: {
    sign: 'Leo',
    element: 'Fire',
    dates: 'Jul 23 - Aug 22',
    pos: e('Radiance'),
    neu: e('Playfulness'),
    neg: e('Authority'),
    description: 'Fixed fire that shines.'
  },
  virgo: {
    sign: 'Virgo',
    element: 'Earth',
    dates: 'Aug 23 - Sep 22',
    pos: e('Clarity'),
    neu: e('Patience'),
    neg: e('Restlessness'),
    description: 'Mutable earth that refines.'
  },
  libra: {
    sign: 'Libra',
    element: 'Air',
    dates: 'Sep 23 - Oct 22',
    pos: e('Harmony'),
    neu: e('Balance'),
    neg: e('Edginess'),
    description: 'Cardinal air that harmonizes.'
  },
  scorpio: {
    sign: 'Scorpio',
    element: 'Water',
    dates: 'Oct 23 - Nov 21',
    pos: e('Depth'),
    neu: e('Intensity'),
    neg: e('Mystery'),
    description: 'Fixed water that transforms.'
  },
  sagittarius: {
    sign: 'Sagittarius',
    element: 'Fire',
    dates: 'Nov 22 - Dec 21',
    pos: e('Freedom'),
    neu: e('Optimism'),
    neg: e('Restlessness'),
    description: 'Mutable fire that expands.'
  },
  capricorn: {
    sign: 'Capricorn',
    element: 'Earth',
    dates: 'Dec 22 - Jan 19',
    pos: e('Commitment'),
    neu: e('Endurance'),
    neg: e('Dread'),
    description: 'Cardinal earth that builds.'
  },
  aquarius: {
    sign: 'Aquarius',
    element: 'Air',
    dates: 'Jan 20 - Feb 18',
    pos: e('Vision'),
    neu: e('Liberation'),
    neg: e('Solitude'),
    description: 'Fixed air that liberates.'
  },
  pisces: {
    sign: 'Pisces',
    element: 'Water',
    dates: 'Feb 19 - Mar 20',
    pos: e('Empathy'),
    neu: e('Dreaming'),
    neg: e('Sorrow'),
    description: 'Mutable water that dissolves.'
  }
} as const

export type ZodiacSign = keyof typeof zodiacMap

export function getZodiacSign(date: Date): ZodiacSign {
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries'
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus'
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini'
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer'
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo'
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo'
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra'
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio'
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius'
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius'
  return 'pisces'
}
