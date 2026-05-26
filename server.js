
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(bodyParser.json());

// Simple root route so you see something in the browser
app.get("/", (req, res) => {
  res.send("AuraSpanse server is running.");
});

// Simple GET for testing in a browser
app.get("/aura", (req, res) => {
  res.send("AuraSpanse /aura endpoint is alive. Send POST with { name, dob } JSON.");
});

// --- Aura generation helpers -------------------------------------------------
function pick(arr, seed) {
  return arr[seed % arr.length];
}

function buildReading(dob, name) {
  const seed = parseInt((dob || "").replace(/[^0-9]/g, "")) || 0;

  const hues = [
    {
      hex: "#7c3aed",
      label: "Violet Crown",
      strength: "You are deeply intuitive and drawn to the unseen patterns behind everything.",
      shadow: "You can drift into overthinking or escapism when ungrounded.",
    },
    {
      hex: "#22c55e",
      label: "Emerald Heart",
      strength: "Your presence calms others and invites emotional honesty.",
      shadow: "You may absorb others' emotions as your own.",
    },
    {
      hex: "#facc15",
      label: "Solar Core",
      strength: "You radiate warmth and creative vitality.",
      shadow: "You can burn out when you ignore your own limits.",
    },
  ];

  const h1 = pick(hues, seed);
  const h2 = pick(hues, seed >> 2);
  const h3 = pick(hues, seed >> 4);

  const who = name && name.trim() ? name.trim() : "You";

  const preview = `${who} current field shows three frequencies in motion. One asks you to soften, one asks you to commit, and one is ready to be seen for the first time.`;

  const full_reading = `${who} carry a rare blend of ${h1.label.toLowerCase()} and ${h2.label.toLowerCase()} energy, with a hidden ${h3.label.toLowerCase()} resonance.

Right now, life is asking you to trust the ${h1.label.split(" ")[0].toLowerCase()} part of you — the side that already knows what must be released. As you do, your ${h2.label.split(" ")[0].toLowerCase()} hue stabilizes and your ${h3.label.split(" ")[0].toLowerCase()} begins to glow more clearly.

The more you honor small, practical choices that feel aligned, the more your whole field begins to harmonize.`;

  const mantra = "I trust the timing of my own frequency.";

  return {
    id: `${Date.now()}-${seed}`,
    hue_1: h1.hex,
    hue_1_label: h1.label,
    hue_1_strength: h1.strength,
    hue_1_shadow: h1.shadow,
    hue_2: h2.hex,
    hue_2_label: h2.label,
    hue_2_strength: h2.strength,
    hue_2_shadow: h2.shadow,
    hue_3: h3.hex,
    hue_3_label: h3.label,
    hue_3_strength: h3.strength,
    hue_3_shadow: h3.shadow,
    preview,
    full_reading,
    mantra,
  };
}

// Main backend API AuraSpanse exposes for Aurascope
app.post("/api/reading", (req, res) => {
  try {
    const { birthDate, name } = req.body || {};
    if (!birthDate) {
      return res.status(400).json({ error: "birthDate is required" });
    }
    const reading = buildReading(birthDate, name);
    return res.json(reading);
  } catch (err) {
    console.error("/api/reading error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// (Optional) simple unlock route if you want later
app.post("/api/unlock", (req, res) => {
  try {
    const { readingId, email } = req.body || {};
    if (!readingId || !email) {
      return res.status(400).json({ error: "readingId and email are required" });
    }
    return res.json({
      full_reading: "This is your full Aurascope from AuraSpanse.",
      mantra: "I trust the timing of my own frequency.",
    });
  } catch (err) {
    console.error("/api/unlock error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Keep your old /unlock if something else uses it
app.post("/unlock", async (req, res) => {
  try {
    const { summary, full, to } = req.body;
    return res.json({ success: true, echo: { summary, full, to } });
  } catch (err) {
    console.error("/unlock route error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AuraSpanse server running on port ${PORT}`);
});
