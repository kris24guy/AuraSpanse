const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(bodyParser.json());

// Simple root route so you see something in the browser
app.get("/", (req, res) => {
  res.send("AuraSpanse server is running.");
});

// Dummy unlock route that just echoes data (NO email sending, NO htmlContent)
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
