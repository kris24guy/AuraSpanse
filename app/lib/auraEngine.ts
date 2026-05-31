import { emotionColors, getEmotionByFreq, EmotionColor } from './emotionColors';

export interface ZodiacData {
  sign: string;
  traits: string[];
  color: string;
  birthstone: string;
  stoneColor: string;
  stoneTraits: string[];
}

export const ZODIAC_MAP: Record<string, ZodiacData> = {
  Pisces: {
    sign: 'Pisces',
    traits: ['Intuitive', 'Compassionate', 'Artistic'],
    color: '#9c74ff', // Intuition frequency
    birthstone: 'Amethyst',
    stoneColor: '#9966cc',
    stoneTraits: ['Protection', 'Sobriety', 'Inner Peace']
  },
  Aries: {
    sign: 'Aries',
    traits: ['Courageous', 'Determined', 'Confident'],
    color: '#ff2000', // Spontaneity frequency
    birthstone: 'Diamond',
    stoneColor: '#ffffff',
    stoneTraits: ['Invincibility', 'Clarity', 'Strength']
  },
  Taurus: {
    sign: 'Taurus',
    traits: ['Reliable', 'Patient', 'Practical'],
    color: '#10a030', // Vitality frequency
    birthstone: 'Emerald',
    stoneColor: '#50c878',
    stoneTraits: ['Growth', 'Prosperity', 'Love']
  },
  Gemini: {
    sign: 'Gemini',
    traits: ['Adaptable', 'Outgoing', 'Intelligent'],
    color: '#ffe000', // Joy frequency
    birthstone: 'Pearl',
    stoneColor: '#f0ead6',
    stoneTraits: ['Purity', 'Wisdom', 'Calm']
  },
  Cancer: {
    sign: 'Cancer',
    traits: ['Loyal', 'Emotional', 'Sympathetic'],
    color: '#70b0ff', // Peace frequency
    birthstone: 'Ruby',
    stoneColor: '#e0115f',
    stoneTraits: ['Passion', 'Protection', 'Wealth']
  },
  Leo: {
    sign: 'Leo',
    traits: ['Generous', 'Warmhearted', 'Creative'],
    color: '#f06000', // Creativity frequency
    birthstone: 'Peridot',
    stoneColor: '#e6e200',
    stoneTraits: ['Healing', 'Happiness', 'Luck']
  },
  Virgo: {
    sign: 'Virgo',
    traits: ['Loyal', 'Analytical', 'Kind'],
    color: '#80d840', // Groundedness frequency
    birthstone: 'Sapphire',
    stoneColor: '#0f52ba',
    stoneTraits: ['Truth', 'Wisdom', 'Nobility']
  },
  Libra: {
    sign: 'Libra',
    traits: ['Diplomatic', 'Gracious', 'Fair-minded'],
    color: '#a0f050', // Wholeness frequency
    birthstone: 'Opal',
    stoneColor: '#e8f1d4',
    stoneTraits: ['Hope', 'Innocence', 'Creativity']
  },
  Scorpio: {
    sign: 'Scorpio',
    traits: ['Resourceful', 'Brave', 'Passionate'],
    color: '#cc0010', // Passion frequency
    birthstone: 'Topaz',
    stoneColor: '#ffc87c',
    stoneTraits: ['Strength', 'Intelligence', 'Affection']
  },
  Sagittarius: {
    sign: 'Sagittarius',
    traits: ['Generous', 'Idealistic', 'Great sense of humor'],
    color: '#7e4cff', // Spirituality frequency
    birthstone: 'Turquoise',
    stoneColor: '#40e0d0',
    stoneTraits: ['Protection', 'Luck', 'Friendship']
  },
  Capricorn: {
    sign: 'Capricorn',
    traits: ['Responsible', 'Disciplined', 'Self-control'],
    color: '#141088', // Gravitas frequency
    birthstone: 'Garnet',
    stoneColor: '#730800',
    stoneTraits: ['Constancy', 'Faith', 'Energy']
  },
  Aquarius: {
    sign: 'Aquarius',
    traits: ['Progressive', 'Original', 'Independent'],
    color: '#c0f8ff', // Freedom frequency
    birthstone: 'Amethyst',
    stoneColor: '#9966cc',
    stoneTraits: ['Peace', 'Clarity', 'Spirituality']
  }
};

export function calculateLifePath(dateString: string): number {
  const digits = dateString.replace(/\D/g, '');
  let sum = digits.split('').reduce((acc, d) => acc + parseInt(d), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return sum;
}

export function getDayOfYear(date: Date): number {
  const start = new Date(date.getUTCFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function generateAura(dateString: string) {
  const date = new Date(dateString);
  const dayOfYear = getDayOfYear(date);
  const lifePath = calculateLifePath(dateString);
  
  // Zodiac Logic
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  let sign = 'Aries';
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) sign = 'Aries';
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) sign = 'Taurus';
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) sign = 'Gemini';
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) sign = 'Cancer';
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) sign = 'Leo';
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) sign = 'Virgo';
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) sign = 'Libra';
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) sign = 'Scorpio';
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) sign = 'Sagittarius';
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) sign = 'Capricorn';
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) sign = 'Aquarius';
  else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) sign = 'Pisces';

  const zodiac = ZODIAC_MAP[sign];

  // Hue 1: Zodiac Blending (3 traits)
  // Time of registration factor (dawn/noon/dusk) - simulated with dayOfYear % 3
  const timeFactor = (dayOfYear % 3) / 3; 
  const hue1Freq = (parseInt(zodiac.color.replace('#', ''), 16) % 1000);
  const hue1 = getEmotionByFreq(Math.floor(hue1Freq * (0.8 + timeFactor * 0.4)));

  // Hue 2: Birthstone + Numerology
  const stoneFreq = (parseInt(zodiac.stoneColor.replace('#', ''), 16) % 1000);
  const hue2Freq = (stoneFreq + (lifePath * 10)) % 1000;
  const hue2 = getEmotionByFreq(hue2Freq);

  // Hue 3: Balancing of Hue 1 and Hue 2
  const hue3Freq = Math.floor((hue1.freq + hue2.freq) / 2);
  const hue3 = getEmotionByFreq(hue3Freq);

  return {
    zodiac,
    lifePath,
    dayOfYear,
    hues: [hue1, hue2, hue3]
  };
}
