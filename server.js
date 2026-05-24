
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
```

---

# 4. public/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AuraScope</title>
  <link rel="stylesheet" href="style.css" />

  <!-- Meta Pixel Placeholder -->
  <!-- Insert Meta Pixel Here -->
</head>
<body>

  <div class="container">
    <h1>AuraScope</h1>

    <p>
      Discover the emotional spectrum hidden within your birth frequency.
    </p>

    <form id="auraForm">
      <input
        type="email"
        id="email"
        placeholder="Enter your email"
        required
      />

      <input
        type="date"
        id="birthdate"
        required
      />

      <button type="submit">
        Send My AuraScope
      </button>
    </form>

    <div id="result"></div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

---

# 5. public/style.css

```css
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #0f172a, #312e81);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.container {
  width: 90%;
  max-width: 500px;
  padding: 40px;
  background: rgba(255,255,255,0.08);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  text-align: center;
}

h1 {
  font-size: 3rem;
}

p {
  opacity: 0.9;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
}

input,
button {
  padding: 15px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
}

button {
  cursor: pointer;
  font-weight: bold;
}

#result {
  margin-top: 30px;
}
```

---

# 6. public/app.js

```javascript
const form = document.getElementById('auraForm');
const result = document.getElementById('result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const birthdate = document.getElementById('birthdate').value;

  result.innerHTML = 'Generating AuraScope...';

  try {
    const response = await fetch('/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        birthdate
      })
    });

    const data = await response.json();

    if (data.success) {
      result.innerHTML = `
        <h2>${data.zodiac}</h2>
        <p><strong>${data.aura.color}</strong></p>
        <p>${data.aura.message}</p>
        <p>Your full AuraScope has been sent to your email.</p>
      `;
    } else {
      result.innerHTML = 'Something went wrong.';
    }
  } catch (err) {
    console.error(err);
    result.innerHTML = 'Server error.';
  }
});
```

---

# 7. Deploy To Render

## Push to GitHub

```bash
git init
git add .
git commit -m "AuraScope MVP"
git branch -M main
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

---

# 8. Render Setup

Go to:

�urlRender[https://render.com](https://render.com%01)

Then:

1. New Web Service
2. Connect GitHub repo
3. Build command:

```bash
npm install
```

4. Start command:

```bash
npm start
```

5. Add Environment Variables:

```text
BEEHIIV_API_KEY
BEEHIIV_PUBLICATION_ID
```

Deploy.

---

# 9. Meta Ads Funnel

Meta Ad
↓
Landing Page
↓
Email Signup
↓
Beehiiv Welcome Email
↓
AuraScope Delivery
↓
Future Core Offer

---

# 10. Future Expansion

Later you can add:

* AI-generated aura readings
* emotion blending engine
* animated gradients
* React frontend
* subscriptions
* referral rewards
* user dashboards
* saved aura history
* daily emotional forecasts
