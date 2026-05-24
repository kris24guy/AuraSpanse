require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

function getZodiac(month, day) {
  const zodiacSigns = [
    ['Capricorn', 19],
    ['Aquarius', 18],
    ['Pisces', 20],
    ['Aries', 19],
    ['Taurus', 20],
    ['Gemini', 20],
    ['Cancer', 22],
    ['Leo', 22],
    ['Virgo', 22],
    ['Libra', 22],
    ['Scorpio', 21],
    ['Sagittarius', 21],
    ['Capricorn', 31]
  ];

  return day <= zodiacSigns[month - 1][1]
    ? zodiacSigns[month - 1][0]
    : zodiacSigns[month][0];
}

function generateAura(sign) {
  const auraMap = {
    Aries: {
      color: 'Crimson Gold',
      message: 'Your aura burns with initiating fire and fearless movement.'
    },
    Taurus: {
      color: 'Emerald Bronze',
      message: 'Your aura reflects grounded abundance and emotional steadiness.'
    },
    Gemini: {
      color: 'Silver Yellow',
      message: 'Your aura vibrates with curiosity, language, and duality.'
    },
    Cancer: {
      color: 'Moon Blue',
      message: 'Your aura carries deep emotional tides and intuitive sensitivity.'
    },
    Leo: {
      color: 'Solar Gold',
      message: 'Your aura radiates warmth, identity, and magnetic expression.'
    },
    Virgo: {
      color: 'Muted Jade',
      message: 'Your aura reveals precision, observation, and healing energy.'
    },
    Libra: {
      color: 'Rose Quartz',
      message: 'Your aura seeks balance, beauty, and harmonic connection.'
    },
    Scorpio: {
      color: 'Obsidian Crimson',
      message: 'Your aura moves through transformation, secrecy, and emotional depth.'
    },
    Sagittarius: {
      color: 'Royal Violet',
      message: 'Your aura expands through philosophy, exploration, and freedom.'
    },
    Capricorn: {
      color: 'Stone Silver',
      message: 'Your aura reflects discipline, endurance, and structural power.'
    },
    Aquarius: {
      color: 'Electric Cyan',
      message: 'Your aura pulses with innovation and detached perception.'
    },
    Pisces: {
      color: 'Opalescent Lavender',
      message: 'Your aura flows with dreams, emotion, and spiritual absorption.'
    }
  };

  return auraMap[sign];
}

app.post('/subscribe', async (req, res) => {
  try {
    const { email, birthdate } = req.body;

    if (!email || !birthdate) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const date = new Date(birthdate);

    const month = date.getMonth() + 1;
    const day = date.getDate();

    const zodiac = getZodiac(month, day);
    const aura = generateAura(zodiac);

    await axios.post(
      `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: 'aurascope'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      zodiac,
      aura
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: 'Subscription failed'
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AuraScope running on port ${PORT}`);
});
