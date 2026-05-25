const express = require("express");
const bodyParser = require("body-parser");
const { Resend } = require("resend");

const app = express();

// Middleware
app.use(bodyParser.json());

// Resend client (make sure RESEND_API_KEY is set in Render → Environment)
const resend = new Resend(process.env.RESEND_API_KEY);

// Simple health / root route so you see something at /
app.get("/", (req, res) => {
  res.send("Aurascope server is running.");
});

// Unlock route that sends an email
app.post("/unlock", async (req, res) => {
  try {
    const { summary, full, to } = req.body;

    if (!summary || !full || !to) {
      return res.status(400).json({
        error: "Missing required fields: summary, full, or to",
      });
    }

    // Build HTML content safely. Newlines in `full` become   
 tags.
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>New Aurascope Capture</h2>

        <h3>Summary</h3>
        <p>${summary}</p>

        <h3>Full Text</h3>
        <p>${full.replace(/\n/g, "  
")}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "Aurascope <noreply@aurascope.app>",
      to,
      subject: "New Aurascope Capture",
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
