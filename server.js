const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("AuraSpanse backend running.");
});

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function buildReading(dob, name) {
  const seed = parseInt((dob || "").replace(/[^0-9]/g, "")) || 0;

  const hues = [
    {
      hex: "#7c3aed",
      label: "Violet Crown"
    },
    {
      hex: "#22c55e",
      label: "Emerald Heart"
    },
    {
      hex: "#facc15",
      label: "Solar Core"
    }
  ];

  const h1 = pick(hues, seed);
  const h2 = pick(hues, seed >> 2);
  const h3 = pick(hues, seed >> 4);

  return {
    preview: `${name} has an aura flowing between ${h1.label}, ${h2.label}, and ${h3.label}.`,
    full_reading:
      `${name} carries deep energetic movement between ${h1.label}, ${h2.label}, and ${h3.label}.`,
    mantra: "I trust the timing of my frequency.",
    colors: [h1, h2, h3]
  };
}

app.post("/api/reading", (req, res) => {
  try {

    const { birthDate, name } = req.body;

    if (!birthDate) {
      return res.status(400).json({
        error: "birthDate required"
      });
    }

    const reading = buildReading(
      birthDate,
      name || "You"
    );

    return res.json(reading);

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "server error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AuraSpanse running on ${PORT}`);
});
