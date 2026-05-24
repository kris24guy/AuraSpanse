// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Simple zodiac lookup from birthdate ---
function getZodiacSign(dateString) {
  const date = new Date(dateString);
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // 1–12

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

// --- Aura map for each sign ---
const auraMap = {
  Aries: {
    color: 'Crimson Gold',
    traits: ['fearless', 'impulsive', 'protective'],
    message:
      'You carry initiating fire energy. You move first, then understand later.'
  },
  Taurus: {
    color: 'Emerald Bronze',
    traits: ['grounded', 'loyal', 'resistant'],
    message:
      'Your aura stabilizes emotional environments and absorbs pressure slowly.'
  },
  Gemini: {
    color: 'Silver Yellow',
    traits: ['curious', 'adaptive', 'restless'],
    message:
      'Your frequency moves through language, perception, and emotional duality.'
  },
  Cancer: {
    color: 'Moon Blue',
    traits: ['intuitive', 'protective', 'absorbing'],
    message:
      'You process emotional weather before most people notice it exists.'
  },
  Leo: {
    color: 'Solar Gold',
    traits: ['magnetic', 'creative', 'prideful'],
    message:
      'Your aura naturally pulls attention and emotional intensity toward itself.'
  },
  Virgo: {
    color: 'Muted Jade',
    traits: ['observant', 'precise', 'overthinking'],
    message:
      'Your energy constantly scans environments looking for alignment and correction.'
  },
  Libra: {
    color: 'Rose Quartz',
    traits: ['harmonic', 'social', 'indecisive'],
    message:
      'Your aura seeks emotional balance but often carries other people’s weight.'
  },
  Scorpio: {
    color: 'Obsidian Crimson',
    traits: ['intense', 'private', 'transformative'],
    message:
      'Your frequency moves through emotional depth, secrecy, and inner rebirth.'
  },
  Sagittarius: {
    color: 'Royal Violet',
    traits: ['expansive', 'visionary', 'untethered'],
    message:
      'Your aura expands through movement, philosophy, and emotional freedom.'
  },
  Capricorn: {
    color: 'Stone Silver',
    traits: ['disciplined', 'strategic', 'guarded'],
    message:
      'Your frequency builds structure slowly and carries heavy endurance energy.'
  },
  Aquarius: {
    color: 'Electric Cyan',
    traits: ['innovative', 'detached', 'unpredictable'],
    message:
      'Your aura processes reality differently than most people around you.'
  },
  Pisces: {
    color: 'Opalescent Violet',
    traits: ['sensitive', 'porous', 'dreamlike'],
    message:
      'Your frequency blends boundaries and absorbs the emotional tones around you.'
  }
};

function generateAura(birthdate) {
  const zodiac = getZodiacSign(birthdate);
  const base = auraMap[zodiac];

  if (!base) {
    return {
      zodiac: 'Unknown',
      aura: {
        color: 'Ghost Light',
        traits: ['undefined'],
        message: 'Your frequency sits outside the current AuraScope map.'
      }
    };
  }

  return {
    zodiac,
    aura: base
  };
}

// --- Routes ---

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Aura-only endpoint (no email, just instant result)
app.post('/aura', (req, res) => {
  const { birthdate } = req.body;

  if (!birthdate) {
    return res.status(400).json({ success: false, error: 'Birthdate is required.' });
  }

  const result = generateAura(birthdate);
  return res.json({ success: true, ...result });
});

// Subscribe endpoint: generate aura + send to Beehiiv
app.post('/subscribe', async (req, res) => {
  const { email, birthdate } = req.body;

  if (!email || !birthdate) {
    return res
      .status(400)
      .json({ success: false, error: 'Email and birthdate are required.' });
  }

  const { zodiac, aura } = generateAura(birthdate);

  try {
    if (process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID) {
      await axios.post(
        `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
        {
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: 'aurascope_mvp',
          custom_fields: {
            zodiac,
            aura_color: aura.color,
            aura_traits: aura.traits.join(','),
            aura_message: aura.message
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-ApiKey': process.env.BEEHIIV_API_KEY
          }
        }
      );
    }

    return res.json({ success: true, zodiac, aura });
  } catch (err) {
    console.error('Beehiiv error:', err.response?.data || err.message);
    return res.status(500).json({ success: false, error: 'Subscription failed.' });
  }
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AuraScope server running on port ${PORT}`);
});
