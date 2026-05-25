// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS + JSON parsing
app.use(cors());
app.use(bodyParser.json());

// Init Resend with API key from env
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('Missing RESEND_API_KEY in environment variables');
}
const resend = new Resend(resendApiKey);

// Simple health check
app.get('/', (req, res) => {
  res.send('AuraSpanse / Aurascope server is running');
});

// POST /email
// Expects JSON like: { "from": "AuraSpanse <noreply@auraspanse.com>", "to": "you@email.com", "subject": "Hi", "text": "Message" }
app.post('/email', async (req, res) => {
  try {
    const { from, to, subject, text, html } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Missing "to" address' });
    }

    const emailFrom = from || 'AuraSpanse <onboarding@auraspanse.com>'; // adjust as needed
    const emailSubject = subject || 'Message from AuraSpanse';
    const emailText = text || 'Hello from AuraSpanse.';
    const emailHtml = html || `<p>${emailText}</p>`;

    const data = await resend.emails.send({
      from: emailFrom,
      to,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, error: error.message || 'Email failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
