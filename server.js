const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Root route
app.get("/", (req, res) => {
  res.send("AuraSpanse server is running.");
});

// Browser test route
app.get("/aura", (req, res) => {
  res.send("AuraSpanse /aura endpoint is alive.");
});

// ---------------- AURA ENGINE ----------------

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function buildReading(dob, name) {
  const seed = parseInt((dob || "").replace(/[^0-9]/g, "")) || 0;

  const hues = [
    {
      hex: "#7c3aed",
      label: "Violet Crown",
      strength:
        "You are deeply intuitive and drawn to unseen patterns.",
      shadow:
        "You can drift into overthinking when ungrounded.",
    },
    {
      hex: "#22c55e",
      label: "Emerald Heart",
      strength:
        "Your presence calms others and invites honesty.",
      shadow:
        "You absorb emotions around you too easily.",
    },
    {
      hex: "#facc15",
      label: "Solar Core",
      strength:
        "You radiate warmth and creative vitality.",
      shadow:
        "You burn out when you ignore your limits.",
    },
  ];

  const h1 = pick(hues, seed);
  const h2 = pick(hues, seed >> 2);
  const h3 = pick(hues, seed >> 4);

  const who = name && name.trim() ? name.trim() : "You";

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

    preview: `${who}'s aura reveals shifting frequencies between ${h1.label}, ${h2.label}, and ${h3.label}.`,

    full_reading: `${who} carries a blend of ${h1.label}, ${h2.label}, and ${h3.label} energy.

The more aligned your choices become, the stronger your field stabilizes.

You are entering a phase of emotional recalibration and spiritual expansion.`,

    mantra: "I trust the timing of my own frequency.",
  };
}

// ---------------- API ROUTES ----------------

// Main route AuraScope frontend calls
app.post("/api/reading", (req, res) => {
  try {
    const { birthDate, name } = req.body || {};

    if (!birthDate) {
      return res.status(400).json({
        error: "birthDate is required",
      });
    }

    const reading = buildReading(birthDate, name);

    return res.json(reading);
  } catch (err) {
    console.error("API ERROR:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Unlock route
app.post("/api/unlock", (req, res) => {
  try {
    const { readingId, email } = req.body || {};

    if (!readingId || !email) {
      return res.status(400).json({
        error: "readingId and email are required",
      });
    }

    return res.json({
      success: true,
      full_reading:
        "This is your unlocked premium Aurascope reading.",
      mantra:
        "I trust the timing of my own frequency.",
    });
  } catch (err) {
    console.error("UNLOCK ERROR:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// ---------------- START SERVER ----------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AuraSpanse running on port ${PORT}`);
});
