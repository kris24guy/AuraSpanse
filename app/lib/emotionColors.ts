// AuraSpanse Emotion-Color Spectrum Database

export interface EmotionColor {
  name: string;
  hex: string;
  freq: number; // 0–999
}

export const emotionColors: EmotionColor[] = [
  { name: "Pure Light", hex: "#FFFFFF", freq: 0 },
  { name: "Transcendence", hex: "#F5F3FF", freq: 10 },
  { name: "Serenity", hex: "#E0F7FA", freq: 50 },
  { name: "Joy", hex: "#FFF59D", freq: 120 },
  { name: "Love", hex: "#F48FB1", freq: 180 },
  { name: "Gratitude", hex: "#C5E1A5", freq: 220 },
  { name: "Compassion", hex: "#CE93D8", freq: 260 },
  { name: "Courage", hex: "#90CAF9", freq: 300 },
  { name: "Acceptance", hex: "#B0BEC5", freq: 340 },
  { name: "Curiosity", hex: "#80CBC4", freq: 380 },
  { name: "Contentment", hex: "#FFE082", freq: 420 },
  { name: "Vulnerability", hex: "#FFCCBC", freq: 460 },
  { name: "Uncertainty", hex: "#B39DDB", freq: 500 },
  { name: "Longing", hex: "#EF9A9A", freq: 540 },
  { name: "Sadness", hex: "#90A4AE", freq: 580 },
  { name: "Grief", hex: "#78909C", freq: 620 },
  { name: "Fear", hex: "#EF5350", freq: 660 },
  { name: "Shame", hex: "#8D6E63", freq: 700 },
  { name: "Guilt", hex: "#6D4C41", freq: 740 },
  { name: "Rage", hex: "#C62828", freq: 780 },
  { name: "Despair", hex: "#424242", freq: 820 },
  { name: "Numbness", hex: "#263238", freq: 860 },
  { name: "Void", hex: "#000000", freq: 999 },
];

export function getEmotionByFreq(freq: number): EmotionColor {
  const wrapped = ((freq % 1000) + 1000) % 1000;
  return emotionColors.reduce((closest, emotion) => {
    return Math.abs(emotion.freq - wrapped) < Math.abs(closest.freq - wrapped)
      ? emotion
      : closest;
  }, emotionColors[0]);
}

export function getBirthEmotion(seed: number): EmotionColor {
  const freq = ((seed % 1000) + 1000) % 1000;
  return getEmotionByFreq(freq);
}

export function getAnnualCycleOffset(dayOfYear: number): number {
  const radians = (2 * Math.PI * dayOfYear) / 365;
  return (Math.sin(radians) + 1) / 2;
}
