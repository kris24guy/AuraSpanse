const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(bodyParser.json());

// Simple root route so you see something in the browser
app.get("/", (req, res) => {
  res.send("AuraSpanse server is running.");
});

// NEW: basic aura generator
function generateAura({ name, dob }) {
  // Very simple, deterministic pseudo-reading
  const seed = (dob || "").replace(/[^0-9]/g, "");
  const num = parseInt(seed || "0", 10) || 0;

  const colors = [
    "violet", "indigo", "blue", "green", "yellow", "orange", "red",
  ];
  const vibes = [
    "deeply intuitive", "analytical", "playful", "grounded",
    "creative", "transformational", "expansive",
  ];
  const focuses = [
    "relationships", "career", "inner healing", "self-expression",
    "learning", "adventure", "spiritual growth",
  ];

  const color = colors[num % colors.length];
  const vibe = vibes[(num >> 2) % vibes.length];
  const focus = focuses[(num >> 4) % focuses.length];

  const displayName = name && name.trim() ? name.trim() : "Your";

  return `${displayName} aura glows ${color} today 
— ${vibe} energy with a strong focus on ${focus}.`;
}

// NEW: main aura endpoint
app.post("/aura", (req, res) => {
  try {
    const { name, dob } = req.body || {};

    if (!dob) {
      return res.status(400).json({
        success: false,
        error: "Date of birth (dob) is required",
      });
    }

    const reading = generateAura({ name, dob });

    return res.json({
      success: true,
      reading,
    });
  } catch (err) {
    console.error("/aura route error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Optional: keep dummy /unlock route for now
app.post("/unlock", async (req, res) => {
  try {
    const { summary, full, to } = req.body;

    return res.json({
      success: true,
      echo: { summary, full, to },
    });
  } catch (err) {
    console.error("/unlock route error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Use Render's assigned PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
