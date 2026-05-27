require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Email / Resend setup ---
let resend = null;
if (!process.env.RESEND_API_KEY) {
  console.warn('WARNING: RESEND_API_KEY is not set. Emails will not be sent.');
} else {
  resend = new Resend(process.env.RESEND_API_KEY);
}

if (!process.env.EMAIL_FROM) {
  console.warn('WARNING: EMAIL_FROM is not set. Set it in your environment.');
}

app.use(cors());
app.use(bodyParser.json());

// --- 1. Zodiac utilities ---

function getZodiacSign(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1; // 1-12

  // simple Western zodiac ranges
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';

  return null;
}

// 3 traits per sign: strength (+), balance (=), weakness (-)
// Placeholder copy – edit however you like
const zodiacProfiles = {
  aries: {
    name: 'Aries',
    traits: [
      {
        role: '+',
        key: 'strength',
        label: 'Ignited Courage',
        color: '#FF4B3A',
        description:
          'Your fire shows up as fearless starts and bold moves. You light the match when others hesitate.'
      },
      {
        role: '=',
        key: 'balance',
        label: 'Directed Drive',
        color: '#FFA94D',
        description:
          'When your energy is balanced, you move with focus instead of urgency, turning impulse into impact.'
      },
      {
        role: '-',
        key: 'weakness',
        label: 'Scattered Sparks',
        color: '#C92A2A',
        description:
          'When stressed, your fire can jump from idea to idea, burning out before anything fully forms.'
      }
    ]
  },
  taurus: {
    name: 'Taurus',
    traits: [
      {
        role: '+',
        key: 'strength',
        label: 'Grounded Bloom',
        color: '#2B8A3E',
        description:
          'Your aura roots deeply. You bring stability, patience, and steady growth wherever you stand.'
      },
      {
        role: '=',
        key: 'balance',
        label: 'Comforted Presence',
        color: '#82C91E',
        description:
          'In balance, you honor comfort without becoming stuck, creating safe spaces for yourself and others.'
      },
      {
        role: '-',
        key: 'weakness',
        label: 'Fixed Soil',
        color: '#5C940D',
        description:
          'Under pressure, your resistance to change can harden, making it hard to release what no longer fits.'
      }
    ]
  },
  gemini: {
    name: 'Gemini',
    traits: [
      {
        role: '+',
        key: 'strength',
        label: 'Quicksilver Mind',
        color: '#15AABF',
        description:
          'Your energy is bright and curious. You connect ideas, people, and stories in surprising ways.'
      },
      {
        role: '=',
        key: 'balance',
        label: 'Focused Thread',
        color: '#3BC9DB',
        description:
          'In balance, your mind weaves one thread at a time, letting your many ideas take shape in the real world.'
      },
      {
        role: '-',
        key: 'weakness',
        label: 'Signal Overload',
        color: '#0B7285',
        description:
          'When overwhelmed, your thoughts split in too many directions, making it hard to choose and commit.'
      }
    ]
  },
  cancer: {
    name: 'Cancer',
    traits: [
      {
        role: '+',
        key: 'strength',
        label: 'Tidal Empathy',
        color: '#4C6EF5',
        description:
          'Your aura feels like a safe tidepool. You sense what others feel and hold them with real care.'
      },
      {
        role: '=',
        key: 'balance',
        label: 'Protected Shell',
        color: '#748FFC',
        description:
          'In balance, your boundaries are clear but gentle, letting you nurture others without losing yourself.'
      },
      {
        role: '-',
        key: 'weakness',
        label: 'Emotional Undertow',
        color: '#364FC7',
        description:
          'When flooded, your feelings can pull you inward, making it hard to share what you truly need.'
      }
    ]
  },
  leo: {
    name: 'Leo',
    traits: [
      {
        role: '+',
        key: 'strength',
        label: 'Radiant Center',
        color: '#FD7E14',
        description:
          'Your presence glows. You naturally draw attention and use it to uplift, entertain, and inspire.'
      },
      {
        role: '=',
        key: 'balance',
        label: 'Warm Spotlight',
        color: '#FFC078',
        description:
          'In balance, your spotlight is shared. You shine while holding space for others to shine too.'
      },
      {
        role: '-',
        key: 'weakness',
        label: 'Solar Burn',
        color: '#D9480F',
        description:
          'When insecure, your need to be seen can feel demanding, burning the very connections you crave.'
      }
    ]
  },
  virgo: {
    name: 'Virgo',
    traits: [
      {
        role: '+',
        key: 'strength',
        label: 'Refined Focus',
        color: '#2F9E44',
        description:
          'Your aura organizes chaos. You notice details and gently improve what others overlook.'
      },
      {
        role: '=',
        key: 'balance',
        label: 'Sacred Order',
        color: '#51CF66',
        description:
          'In balance, your standards support rather than suffocate, creating systems that serve your peace.'
      },
      {
        role: '-',
        key: 'weakness',
        label: 'Inner Critic',
        color: '#2B8A3E',
        description:
          'When strained, your eye for detail can turn harsh, especially toward yourself.'
      }
    ]
  },
  libra: {
    name: 'Libra',
    traits: [
      {
        role: '+',
        key: 'strength',
        label: 'Harmonic Bridge',
        color: '#9775FA',
        description:
          'Your energy seeks harmony. You bridge differences and help things feel fair and beautiful.'
      },
      {
        role: '=',
        key: 'balance',
        label: 'Measured Choice',
        color: '#BAC8FF',
        description:
          'In balance, you choose with both heart and mind, not just what keeps the peace.'
      },
      {
        role: '-',
        key: 'weakness',
        label: 'Frozen Scales',
        color: '#5F3DC4',
        description:
          'When overthinking, decisions feel heavy, and you may silence your own needs to avoid conflict.'
      }
    ]
  },
  scorpio: {
    name: 'Scorpio',
    traits: [
      {
        role: '+',
        key: 'strength',
        label: 'Depth Current',
        color: '#862E9C',
        description:
          'Your aura runs deep. You sense truths below the surface and aren’t afraid of emotional intensity.'
      },
      {
        role: '=',
        key: 'balance',
        label: 'Sacred Depth',
        color: '#B197FC',
        description:
          'In balance, your depth becomes healing rather than heavy, revealing wisdom without control.'
      },
      {
        role: '-',
        key: 'weakness',
        label: 'Locked Waters',
        color: '#5C1A72',
        description:
          'When wounded, you may seal your feelings away or hold onto stories longer than they deserve.'
      }
    ]
  },
  sagittarius: {
    name: 'Sagittarius',
    traits: [
      {
        role: '+',
        key: 'strength',
        label: 'Wild Horizon',
        color: '#F08C00',
        description:
          'Your energy is expansive and adventurous. You aim your arrow toward meaning and possibility.'
      },
      {
        role: '=',,
        key: 'balance',
        label: 'Honest Flame',
        color: '#FF922B',
        description:
          'In balance, your truth-telling is kind as well as direct, opening doors instead of closing them.'
      },
      {
        role: '-',
        key: 'weakness',
        label: 'Restless Spark',
        color: '#E67700',
        description:
          'When ungrounded, you may chase the next experience to avoid sitting with what is here.'
      }
    ]
  },
  capricorn: {
    name: 'Capricorn',
    traits: [
      {
        role: '+',
        key: 'strength',
        label: 'Mountain Spine',
        color: '#495057',
        description:
          'Your aura is steady and enduring. You move step by step toward what truly matters.'
      },
      {
        role: '=',
        key: 'balance',
        label: 'Measured Climb',
        color: '#868E96',
        description:
          'In balance, your ambition stays aligned with your values, not just expectations from outside.'
      },
      {
        role: '-',
        key: 'weakness',
        label: 'Stone Armor',
        color: '#343A40',
        description:
          'Under stress, you may shut down feelings and carry everything alone, even when help is near.'
      }
    ]
  },
  aquarius: {
    name: 'Aquarius',
    traits: [
      {
        role: '+',
        key: 'strength',
        label: 'Electric Vision',
        color: '#22B8CF',
        description:
          'Your energy is future-focused. You see patterns and possibilities beyond the current moment.'
      },
      {
        role: '=',
        key: 'balance',
        label: 'Human Current',
        color: '#66D9E8',
        description:
          'In balance, your big ideas stay connected to real people, not just concepts.'
      },
      {
        role: '-',
        key: 'weakness',
        label: 'Icy Distance',
        color: '#1098AD',
        description:
          'When pulled away, you may detach instead of feeling, analyzing what you actually need to live.'
      }
    ]
  },
  pisces: {
    name: 'Pisces',
    traits: [
      {
        role: '+',
        key: 'strength',
        label: 'Dream Tide',
        color: '#4DABF7',
        description:
          'Your aura is imaginative and intuitive. You feel into possibilities before they appear.'
      },
      {
        role: '=',
        key: 'balance',
        label: 'Soft Shore',
        color: '#74C0FC',
        description:
          'In balance, you bring your dreams onto solid ground with gentle, consistent steps.'
      },
      {
        role: '-',
        key: 'weakness',
        label: 'Fogged Waters',
        color: '#1C7ED6',
        description:
          'When overwhelmed, your energy can blur boundaries, making it hard to know what is yours and what is not.'
      }
    ]
  }
};

// --- 2. Birthstone + intensity (Hue 2) ---

const birthstones = {
  1: { month: 'January', stone: 'Garnet', baseColor: '#8B0000' },
  2: { month: 'February', stone: 'Amethyst', baseColor: '#9966CC' },
  3: { month: 'March', stone: 'Aquamarine', baseColor: '#7FFFD4' },
  4: { month: 'April', stone: 'Diamond', baseColor: '#E5E4E2' },
  5: { month: 'May', stone: 'Emerald', baseColor: '#50C878' },
  6: { month: 'June', stone: 'Pearl', baseColor: '#FDEEF4' },
  7: { month: 'July', stone: 'Ruby', baseColor: '#E0115F' },
  8: { month: 'August', stone: 'Peridot', baseColor: '#B4D33B' },
  9: { month: 'September', stone: 'Sapphire', baseColor: '#0F52BA' },
 10: { month: 'October', stone: 'Opal', baseColor: '#F3E5AB' },
 11: { month: 'November', stone: 'Topaz', baseColor: '#FFC87C' },
 12: { month: 'December', stone: 'Turquoise', baseColor: '#40E0D0' }
};

// Simple time-weighting: how close today is to your birthday in the year
function getBirthstoneIntensity(birthDateStr) {
  const now = new Date();
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return '=';

  const month = birth.getUTCMonth();
  const day = birth.getUTCDate();

  const thisYearBirthday = new Date(Date.UTC(now.getUTCFullYear(), month, day));
  const msInDay = 24 * 60 * 60 * 1000;

  let diffDays = Math.round((thisYearBirthday - now) / msInDay);
  // Normalize to range -182..+182 roughly
  if (diffDays > 182) diffDays -= 365;
  if (diffDays < -182) diffDays += 365;

  const absDiff = Math.abs(diffDays);

  if (absDiff <= 30) return '+'; // within ~1 month of birthday
  if (absDiff >= 150) return '-'; // opposite side of year
  return '='; // middle zone
}

function getBirthstoneLayer(birthDateStr) {
  const d = new Date(birthDateStr);
  if (isNaN(d.getTime())) return null;

  const monthIndex = d.getUTCMonth() + 1;
  const base = birthstones[monthIndex];
  if (!base) return null;

  const intensity = getBirthstoneIntensity(birthDateStr); // '+', '=', '-'

  // Slight variations for color by intensity – you can tune these
  const intensityDetails = {
    '+': {
      label: 'Light Aura',
      description:
        `Your ${base.stone} glows in its light aspect, highlighting growth, renewal, and gentle expansion.`,
      shadeModifier: 'light'
    },
    '=': {
      label: 'Balanced Aura',
      description:
        `Your ${base.stone} rests in balance, steadying your energy and holding your center through change.`,
      shadeModifier: 'true'
    },
    '-': {
      label: 'Shadow Aura',
      description:
        `Your ${base.stone} reveals its shadow, surfacing old patterns ready to be seen, honored, and released.`,
      shadeModifier: 'deep'
    }
  };

  return {
    month: base.month,
    stone: base.stone,
    baseColor: base.baseColor,
    intensity,
    label: intensityDetails[intensity].label,
    description: intensityDetails[intensity].description
  };
}

// --- 3. Crystals (Hue 3) ---

const crystals = {
  clearQuartz: {
    key: 'clearQuartz',
    name: 'Clear Quartz',
    states: {
      '+': {
        label: 'Transparent',
        description:
          'Amplifies clarity and intention. In its transparent state, it mirrors back your clearest self.',
        opacity: 0.3
      },
      '=': {
        label: 'Translucent',
        description:
          'Blends clarity with mystery, helping you integrate what you know with what you feel.',
        opacity: 0.6
      },
      '-': {
        label: 'Opaque',
        description:
          'Signals a need to clear static energy and fogged thoughts before the next chapter.',
        opacity: 0.9
      }
    }
  },
  moldavite: {
    key: 'moldavite',
    name: 'Moldavite',
    states: {
      '+': {
        label: 'Transparent',
        description:
          'Catalyzes rapid shifts and spiritual awakenings when you are ready to grow.',
        opacity: 0.3
      },
      '=': {
        label: 'Translucent',
        description:
          'Supports gradual transformation, letting big changes unfold at a humane pace.',
        opacity: 0.6
      },
      '-': {
        label: 'Opaque',
        description:
          'Hints at resistance to change or fear of your own expansion. Gentle grounding is needed first.',
        opacity: 0.9
      }
    }
  },
  blackTourmaline: {
    key: 'blackTourmaline',
    name: 'Black Tourmaline',
    states: {
      '+': {
        label: 'Transparent',
        description:
          'Acts as a clean energetic filter, letting you stay open without absorbing every signal.',
        opacity: 0.3
      },
      '=': {
        label: 'Translucent',
        description:
          'Balances protection and connection, shielding what matters while remaining receptive.',
        opacity: 0.6
      },
      '-': {
        label: 'Opaque',
        description:
          'Shows when your defenses may be too thick, blocking out nourishment along with noise.',
        opacity: 0.9
      }
    }
  }
};

// Map our intensity to crystal state, so hue 3 stays in sync with hue 2
function getCrystalLayer(intensity) {
  const stateKey = intensity === '+' ? '+' : intensity === '-' ? '-' : '=';

  return Object.values(crystals).map((c) => {
    const state = c.states[stateKey];
    return {
      key: c.key,
      name: c.name,
      state: stateKey,
      label: state.label,
      description: state.description,
      opacity: state.opacity
    };
  });
}

// --- 4. Main aura computation ---

function computeAura(birthDateStr) {
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) {
    return { error: 'Invalid birth date.' };
  }

  const signKey = getZodiacSign(birthDateStr);
  const zodiacProfile = signKey ? zodiacProfiles[signKey] : null;

  const monthIndex = birthDate.getUTCMonth() + 1;
  const birthstoneLayer = getBirthstoneLayer(birthDateStr);
  const intensity = birthstoneLayer ? birthstoneLayer.intensity : '=';

  const crystalLayer = getCrystalLayer(intensity);

  // Simple text summary for email body
  const summaryLines = [];

  if (zodiacProfile) {
    summaryLines.push(`Sign: ${zodiacProfile.name}`);
    zodiacProfile.traits.forEach((t) => {
      const symbol = t.role === '+' ? 'Strength' : t.role === '=' ? 'Balance' : 'Shadow';
      summaryLines.push(`${symbol}: ${t.label} — ${t.description}`);
    });
  }

  if (birthstoneLayer) {
    summaryLines.push(
      `Birthstone: ${birthstoneLayer.stone} (${birthstoneLayer.month}) — ${birthstoneLayer.label}: ${birthstoneLayer.description}`
    );
  }

  crystalLayer.forEach((c) => {
    const symbol = c.state === '+' ? 'Transparent' : c.state === '=' ? 'Translucent' : 'Opaque';
    summaryLines.push(`Crystal: ${c.name} [${symbol}] — ${c.description}`);
  });

  const summaryText =
    summaryLines.join('\n\n') +
    '\n\nThis AuraSpanse reading is a symbolic reflection of your energy in this moment. Take what resonates, leave what does not.';

  return {
    birthDate: birthDateStr,
    zodiac: zodiacProfile
      ? {
          key: signKey,
          name: zodiacProfile.name
        }
      : null,
    traits: zodiacProfile ? zodiacProfile.traits : [],
    birthstone: birthstoneLayer,
    crystals: crystalLayer,
    summary: summaryText
  };
}

// --- 5. API routes ---

// 5.1 Compute aura only (no email required)
app.post('/api/auraspanse', (req, res) => {
  const { birthDate } = req.body;

  if (!birthDate) {
    return res.status(400).json({ error: 'birthDate is required.' });
  }

  const result = computeAura(birthDate);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ success: true, ...result, emailSent: false });
});

// 5.2 Compute aura + send full reading to email
app.post('/api/auraspanse/email', async (req, res) => {
  const { birthDate, email } = req.body;

  if (!birthDate || !email) {
    return res.status(400).json({ error: 'birthDate and email are required.' });
  }

  const result = computeAura(birthDate);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  if (!resend || !process.env.EMAIL_FROM) {
    return res.status(500).json({ error: 'Email service not configured on server.' });
  }

  try {
    const subject = `Your AuraSpanse Reading — ${result.zodiac ? result.zodiac.name : 'Aura Profile'}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      text: `AuraSpanse Reading for ${birthDate}\n\n${result.summary}`
    });

    return res.json({ success: true, ...result, emailSent: true });
  } catch (err) {
    console.error('Error sending email via Resend:', err);
    return res.status(500).json({ error: 'Failed to send email.' });
  }
});

// Root/health check
app.get('/', (req, res) => {
  res.send('AuraSpanse server is running.');
});

app.listen(PORT, () => {
  console.log(`AuraSpanse server listening on port ${PORT}`);
});
3. How to hook this up to your UI
On your front end:

When the user enters birthdate and you want the on‑screen auras:
const response = await fetch('/api/auraspanse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ birthDate })
});

const data = await response.json();
// data.traits -> 3 trait cards (click to show description)
// data.birthstone -> birthstone card
// data.crystals -> 3 crystal cards (use opacity, label, description on click)
