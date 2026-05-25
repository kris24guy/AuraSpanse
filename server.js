const express = require("express");
const bodyParser = require("body-parser");
const { Resend } = require("resend");

const app = express();

// Middleware
app.use(bodyParser.json());

// Resend client (make sure RESEND_API_KEY is set in Render → Environment)
const resend = new Resend(process.env.RESEND_API_KEY);

// Root route so AuraSpanse shows something
app.get("/", (req, res) => {
  res.send("AuraSpanse server is running.");
});

// Example email route for AuraSpanse (if you don't need this, you can delete the whole /unlock block)
app.post("/unlock", async (req, res) => {
  try {
    const { summary, full, to } = req.body;

    if (!summary || !full || !to) {
      return res.status(400).json({
        error: "Missing required fields: summary, full, or to",
      });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>New AuraSpanse Capture</h2>

        <h3>Summary</h3>
        <p>${summary}</p>

        <h3>Full Text</h3>
        <p>${full.replace(/\n/g, "  
")}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "AuraSpanse <noreply@auraspanse.app>",
      to,
      subject: "New AuraSpanse Capture",
      html: htmlContent,
    });

    if (error) {
      console.error("Resend email error:", error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.json({ success: true, data });
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
