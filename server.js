require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');

// ── Init data file ──────────────────────────────────────────────────────────
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    metaAds: [],
    emailFunnel: [],
    revenue: [],
    lastUpdated: null
  }, null, 2));
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── GET all data ─────────────────────────────────────────────────────────────
app.get('/api/data', (req, res) => {
  res.json(readData());
});

// ── POST add a record ─────────────────────────────────────────────────────────
app.post('/api/data', (req, res) => {
  const { section, record } = req.body;
  if (!['metaAds', 'emailFunnel', 'revenue'].includes(section)) {
    return res.status(400).json({ error: 'Invalid section' });
  }
  const data = readData();
  record.id = Date.now();
  record.date = record.date || new Date().toISOString().split('T')[0];
  data[section].unshift(record);
  writeData(data);
  res.json({ success: true, record });
});

// ── POST bulk import (CSV parsed records) ─────────────────────────────────────
app.post('/api/data/bulk', (req, res) => {
  const { section, records } = req.body;
  if (!['metaAds', 'emailFunnel', 'revenue'].includes(section)) {
    return res.status(400).json({ error: 'Invalid section' });
  }
  const data = readData();
  const stamped = records.map((r, i) => ({
    ...r,
    id: Date.now() + i,
    date: r.date || new Date().toISOString().split('T')[0]
  }));
  data[section] = [...stamped, ...data[section]];
  writeData(data);
  res.json({ success: true, count: stamped.length });
});

// ── DELETE a record ───────────────────────────────────────────────────────────
app.delete('/api/data/:section/:id', (req, res) => {
  const { section, id } = req.params;
  const data = readData();
  data[section] = data[section].filter(r => r.id !== parseInt(id));
  writeData(data);
  res.json({ success: true });
});

// ── POST parse raw CSV text ───────────────────────────────────────────────────
app.post('/api/parse-csv', (req, res) => {
  const { csv } = req.body;
  const lines = csv.trim().split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h =>
    h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  );
  const records = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const record = {};
    headers.forEach((h, i) => { record[h] = values[i] ?? ''; });
    return record;
  }).filter(r => Object.values(r).some(v => v !== ''));
  res.json({ headers, records, count: records.length });
});

// ── POST generate Daily Pulse via Claude API ──────────────────────────────────
app.post('/api/pulse', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'Set ANTHROPIC_API_KEY in your .env file' });
  }

  const data = readData();
  const recent = {
    metaAds: data.metaAds.slice(0, 10),
    emailFunnel: data.emailFunnel.slice(0, 10),
    revenue: data.revenue.slice(0, 10)
  };

  const prompt = `You are a performance marketing analyst for the Aurascope 90-Day funnel.
  
Here is the most recent data:

META ADS (recent ${recent.metaAds.length} entries):
${JSON.stringify(recent.metaAds, null, 2)}

EMAIL FUNNEL (recent ${recent.emailFunnel.length} entries):
${JSON.stringify(recent.emailFunnel, null, 2)}

REVENUE (recent ${recent.revenue.length} entries):
${JSON.stringify(recent.revenue, null, 2)}

Generate a Daily Pulse report. Use this structure exactly:

## 🔥 Wins
[2-3 bullet points of top positive metrics]

## ⚠️ Watch
[2-3 bullet points of things needing attention]

## 💡 Actions (Top 3)
[3 specific, actionable recommendations]

## 📊 Quick Numbers
[Key metrics table: Spend | Revenue | ROAS | Email CTR | Conversions]

Keep it under 300 words. Be direct and specific. If data is empty, say so and suggest what to add first.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'Claude API error' });
    }

    const result = await response.json();
    res.json({ pulse: result.content[0].text, generated: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅  Aurascope Dashboard → http://localhost:${PORT}`);
  console.log(`📁  Data file: ${DATA_FILE}`);
});
