const express = require("express");
const https = require("https");
const app = express();
app.use(express.json());

function callClaude(birthdate) {
  return new Promise((resolve, reject) => {
    const prompt = `Generate a full living aura reading for someone born on ${birthdate}.

Tone: intimate color psychology — NOT a horoscope. Speak directly about what each color frequency reveals about innate strengths, hidden shadows, and specific alignment actions grounded in the color's actual frequency, element, and energetic nature.

Return ONLY valid JSON — no markdown, no backticks:
{
  "subHues": [
    {
      "name": "unique 2-3 word poetic hue name",
      "hex": "#rich saturated hex",
      "emotion": "1-3 word primary emotion",
      "frequency": 432,
      "element": "one of: Fire Water Earth Air Ether Plasma Void Starlight Storm Crystal Thunder Mist",
      "strength": "2 sentences — innate gift this color frequency gives them",
      "weakness": "2 sentences — shadow or block this color reveals",
      "action": "2 sentences — specific grounded action to align with this frequency"
    },
    { "name":"...", "hex":"...", "emotion":"...", "frequency": 528, "element":"...", "strength":"...", "weakness":"...", "action":"..." },
    { "name":"...", "hex":"...", "emotion":"...", "frequency": 639, "element":"...", "strength":"...", "weakness":"...", "action":"..." }
  ],
  "finalHue": {
    "name": "unique 2-4 word signature aura name",
    "hex": "#hex harmonizing all three sub-hues",
    "description": "3 sentences on blended aura essence — who they are at their core"
  },
  "aurascope": "6 sentences weaving all three frequencies into a personal portrait: creative architecture, relational patterns, specific fears, concrete inner shifts that would transform their life. Intimate color psychology, not fortune telling.",
  "mantra": "8-12 words — powerful personal mantra reflecting their specific color frequencies"
}`;

    const body = JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      system: "You are the Universe's Aura Oracle — a master of chromotherapy, color frequency psychology, sacred geometry, chakra science, and quantum physics meeting ancient wisdom. You interpret electromagnetic signatures encoded in birth dates to reveal a person's true color nature. You speak with intimate directness — not as a fortune teller, but as a mirror. Every reading is grounded in the specific properties of each color frequency: its Hz range, elemental correspondence, what it opens and blocks in the human energy field.",
      messages: [{ role: "user", content: prompt }]
    });

    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          const text = parsed.content.filter(b => b.type === "text").map(b => b.text).join("");
          const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
          let result;
          try { result = JSON.parse(clean); }
          catch {
            const match = clean.match(/\{[\s\S]*\}/);
            if (match) result = JSON.parse(match[0]);
            else throw new Error("Could not parse aura data");
          }
          resolve(result);
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

app.post("/api/reading", async (req, res) => {
  const { birthdate } = req.body;
  if (!birthdate) return res.status(400).json({ error: "Birth date is required" });
  try {
    const data = await callClaude(birthdate);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Oracle connection failed. Please try again." });
  }
});

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Aurascope</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{min-height:100vh;overflow-x:hidden}
body{background:radial-gradient(ellipse at 28% 22%,#1a0840,#090220 40%,#030110 72%,#000);color:#ede8ff;font-family:'Crimson Pro',Georgia,serif}
#stars{position:fixed;inset:0;pointer-events:none;z-index:0}
.star{position:absolute;border-radius:50%;background:#fff}
.geo{position:fixed;pointer-events:none;opacity:.05}
.screen{position:relative;z-index:2;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(28px,5vw,64px) clamp(16px,4vw,40px);text-align:center}
.hidden{display:none!important}

/* vortex wrapper — circular crop */
.vortex-wrap{border-radius:50%;overflow:hidden;position:relative;flex-shrink:0;transition:box-shadow .6s ease}
.vortex-canvas{display:block;cursor:crosshair}
.vortex-tooltip{position:absolute;pointer-events:none;background:rgba(10,8,20,.92);border:1px solid rgba(255,255,255,.12);padding:.3rem .7rem;font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.18em;color:rgba(232,224,208,.9);text-transform:uppercase;white-space:nowrap;border-radius:4px;opacity:0;transition:opacity .2s;z-index:10}
.vortex-tooltip.show{opacity:1}

/* gold shimmer */
.gold{background:linear-gradient(135deg,#b8922c,#f0d060,#d4a84b,#f5e090,#b8922c);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s ease infinite}

/* inputs */
input[type=date],input[type=email]{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(139,92,246,.3);border-radius:10px;padding:13px 18px;color:#ede8ff;font-family:'Crimson Pro',Georgia,serif;font-size:1.05rem;outline:none;transition:border-color .3s;color-scheme:dark}
input:focus{border-color:rgba(139,92,246,.7);box-shadow:0 0 0 3px rgba(139,92,246,.12)}
input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.6) sepia(1) saturate(2) hue-rotate(240deg);cursor:pointer}
.lbl{display:block;font-family:'Cinzel',serif;font-size:.66rem;letter-spacing:.24em;color:rgba(180,150,255,.35);text-transform:uppercase;margin-bottom:8px;text-align:left}

/* buttons */
.btn-primary{font-family:'Cinzel',serif;font-size:.84rem;letter-spacing:.18em;text-transform:uppercase;background:linear-gradient(135deg,#5b21b6,#8b5cf6,#c026d3);color:#fff;border:none;border-radius:50px;padding:15px 52px;cursor:pointer;box-shadow:0 4px 30px rgba(91,33,182,.5);transition:transform .2s,box-shadow .2s}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 40px rgba(91,33,182,.65)}
.btn-unlock{font-family:'Cinzel',serif;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);color:#fff;border:none;border-radius:50px;padding:14px 42px;cursor:pointer;box-shadow:0 4px 26px rgba(124,58,237,.5);transition:transform .2s}
.btn-unlock:hover{transform:translateY(-2px)}
.btn-ghost{font-family:'Cinzel',serif;font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;background:none;border:1px solid rgba(139,92,246,.22);border-radius:50px;padding:10px 28px;color:rgba(195,165,255,.45);cursor:pointer;transition:all .25s}
.btn-ghost:hover{color:rgba(195,165,255,.9);border-color:rgba(139,92,246,.5)}

/* progress */
.prog-track{height:3px;background:rgba(139,92,246,.13);border-radius:99px;overflow:hidden;width:300px;max-width:80vw}
.prog-fill{height:100%;width:0%;background:linear-gradient(90deg,#5b21b6,#8b5cf6,#c026d3);border-radius:99px;transition:width .6s ease}

/* results layout */
.results-inner{max-width:980px;margin:0 auto;width:100%}
.eyebrow{font-family:'Cinzel',serif;font-size:.64rem;letter-spacing:.34em;color:rgba(180,150,255,.34);text-transform:uppercase;margin-bottom:10px}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px;width:100%}
.hue-card{background:rgba(255,255,255,.025);border-radius:18px;padding:26px 20px;backdrop-filter:blur(10px);text-align:center;transition:transform .3s}
.hue-card:hover{transform:translateY(-4px)}
.tag{display:inline-block;padding:3px 10px;border-radius:99px;font-family:'Cinzel',serif;font-size:.64rem;letter-spacing:.1em;margin:2px}
.card-sec{margin-top:10px;padding:11px 13px;border-radius:10px;text-align:left}
.sec-lbl{font-family:'Cinzel',serif;font-size:.58rem;letter-spacing:.22em;text-transform:uppercase;margin-bottom:5px}

/* aurascope blur/unlock */
.aurascope-wrap{position:relative;background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.2);border-radius:18px;padding:clamp(22px,4vw,42px);max-width:760px;margin:0 auto 24px;overflow:hidden}
.aurascope-txt{font-style:italic;font-size:clamp(.98rem,2.4vw,1.08rem);line-height:2;color:rgba(215,205,255,.8)}
.blurred{filter:blur(7px);user-select:none;pointer-events:none}
.unlock-ov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:linear-gradient(to bottom,rgba(9,2,32,.05) 0%,rgba(9,2,32,.8) 45%,rgba(9,2,32,.97) 100%);border-radius:18px;padding:24px}
.unlock-ov.gone{display:none!important}
.mantra-wrap{background:linear-gradient(135deg,rgba(176,136,56,.07),rgba(230,185,80,.04));border:1px solid rgba(176,136,56,.22);border-radius:12px;padding:18px 28px;max-width:580px;margin:0 auto 40px;transition:filter .8s}
.divider{display:flex;align-items:center;gap:14px;margin:44px auto;max-width:520px;width:100%}
.divider-line{flex:1;height:1px}

/* tiny orb for cards */
.mini-orb-wrap{position:relative;margin:0 auto 18px}

@keyframes twinkle{0%,100%{opacity:.15}50%{opacity:.9}}
@keyframes shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes spinCW{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes spinCCW{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
@keyframes ringOut{0%{transform:scale(.88);opacity:.55}100%{transform:scale(1.65);opacity:0}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
</style>
</head>
<body>

<div id="stars"></div>

<div class="geo" style="top:3%;right:3%;width:170px;height:170px;animation:spinCW 44s linear infinite">
  <svg viewBox="0 0 200 200" fill="none" stroke="#a855f7" stroke-width=".6">
    <circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="60"/><circle cx="100" cy="100" r="28"/>
    <line x1="100" y1="8" x2="100" y2="192"/>
    <line x1="100" y1="8" x2="100" y2="192" transform="rotate(60 100 100)"/>
    <line x1="100" y1="8" x2="100" y2="192" transform="rotate(120 100 100)"/>
    <polygon points="100,14 183,158 17,158"/><polygon points="100,186 17,42 183,42"/>
  </svg>
</div>
<div class="geo" style="bottom:6%;left:2%;width:100px;height:100px;animation:spinCCW 58s linear infinite">
  <svg viewBox="0 0 120 120" fill="none" stroke="#ec4899" stroke-width=".5">
    <circle cx="60" cy="60" r="56"/>
    <line x1="60" y1="4" x2="60" y2="116"/>
    <line x1="60" y1="4" x2="60" y2="116" transform="rotate(45 60 60)"/>
    <line x1="60" y1="4" x2="60" y2="116" transform="rotate(90 60 60)"/>
    <line x1="60" y1="4" x2="60" y2="116" transform="rotate(135 60 60)"/>
  </svg>
</div>

<!-- ═══════════════════ INTRO ═══════════════════ -->
<div id="screen-intro" class="screen">
  <h1 class="gold" style="font-family:'Cinzel Decorative',serif;font-size:clamp(2rem,6vw,3.8rem);letter-spacing:.14em;margin-bottom:6px">AURASCOPE</h1>
  <p style="font-family:'Cinzel',serif;font-size:clamp(.6rem,1.7vw,.78rem);letter-spacing:.28em;color:rgba(180,150,255,.35);text-transform:uppercase;margin-bottom:28px">Read the living frequency of your soul</p>

  <div style="animation:floatY 4s ease-in-out infinite;margin-bottom:28px;position:relative">
    <div class="vortex-wrap" id="vwrap-intro" style="box-shadow:0 0 60px rgba(139,92,246,.35),0 0 120px rgba(139,92,246,.12)">
      <canvas class="vortex-canvas" id="cv-intro"></canvas>
    </div>
    <div class="vortex-tooltip" id="tt-intro"></div>
  </div>

  <div style="display:flex;align-items:center;gap:10px;width:100%;max-width:360px;margin-bottom:24px">
    <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,rgba(139,92,246,.4))"></div>
    <span style="color:rgba(139,92,246,.5);font-size:12px">&#10022;</span>
    <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,rgba(139,92,246,.4))"></div>
  </div>

  <div style="width:100%;max-width:340px">
    <div style="margin-bottom:18px">
      <label class="lbl">Date of Birth</label>
      <input type="date" id="inp-bdate"/>
    </div>
    <p id="intro-err" style="color:#f87171;font-size:.86rem;font-style:italic;min-height:20px;margin-bottom:6px"></p>
    <button class="btn-primary" id="btn-start" style="display:block;margin:0 auto">Reveal My Aura</button>
  </div>

  <p style="margin-top:38px;font-size:.72rem;font-style:italic;color:rgba(180,150,255,.17);max-width:320px;letter-spacing:.04em">
    Your birth date encodes a unique electromagnetic signature — enter it to activate your living frequency map
  </p>
</div>

<!-- ═══════════════════ SCAN ═══════════════════ -->
<div id="screen-scan" class="screen hidden">
  <div style="position:relative;margin-bottom:36px">
    <div class="vortex-wrap" id="vwrap-scan" style="box-shadow:0 0 80px rgba(139,92,246,.5),0 0 160px rgba(139,92,246,.2)">
      <canvas class="vortex-canvas" id="cv-scan"></canvas>
    </div>
    <div class="vortex-tooltip" id="tt-scan"></div>
  </div>
  <h2 style="font-family:'Cinzel',serif;font-size:clamp(.95rem,3vw,1.25rem);letter-spacing:.1em;color:rgba(200,170,255,.9);margin-bottom:8px">Reading Your Frequency...</h2>
  <p id="scan-msg" style="font-style:italic;color:rgba(180,150,255,.5);font-size:.9rem;margin-bottom:44px;min-height:24px;transition:opacity .4s">Decoding your birth frequency...</p>
  <div class="prog-track"><div class="prog-fill" id="prog-fill"></div></div>
  <p id="prog-pct" style="font-family:'Cinzel',serif;font-size:.64rem;letter-spacing:.22em;color:rgba(139,92,246,.4);margin-top:8px;width:300px;max-width:80vw;text-align:right">0%</p>
</div>

<!-- ═══════════════════ RESULTS ═══════════════════ -->
<div id="screen-results" class="screen hidden" style="padding-top:56px;padding-bottom:60px;justify-content:flex-start">
  <div class="results-inner">

    <!-- vortex + final aura side by side or stacked -->
    <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:32px;margin-bottom:48px;animation:fadeUp .9s ease">
      <div style="position:relative">
        <div class="vortex-wrap" id="vwrap-results" style="box-shadow:0 0 50px rgba(139,92,246,.3),0 0 100px rgba(139,92,246,.1)">
          <canvas class="vortex-canvas" id="cv-results"></canvas>
        </div>
        <div class="vortex-tooltip" id="tt-results"></div>
      </div>
      <div style="text-align:center;flex:1;min-width:220px">
        <p class="eyebrow">Aura Reading for</p>
        <h1 id="res-bdate" class="gold" style="font-family:'Cinzel Decorative',serif;font-size:clamp(1.3rem,3.5vw,2.2rem);margin-bottom:10px"></h1>
        <div id="final-name-wrap" style="margin-bottom:14px">
          <h2 id="final-hue-name" style="font-family:'Cinzel Decorative',serif;font-size:clamp(1rem,2.6vw,1.7rem);letter-spacing:.07em;margin-bottom:10px"></h2>
        </div>
        <p id="final-hue-desc" style="font-style:italic;font-size:.95rem;line-height:1.88;color:rgba(215,200,255,.7);max-width:380px;margin:0 auto"></p>
      </div>
    </div>

    <p style="font-style:italic;color:rgba(200,175,255,.55);font-size:.85rem;letter-spacing:.06em;text-align:center;margin-bottom:36px">Three living frequencies encoded in your birth — your strengths, your shadows, your design</p>

    <!-- Hue cards -->
    <div class="cards-grid" id="cards-grid"></div>

    <!-- Divider -->
    <div class="divider" style="animation:fadeUp 1s 1.1s ease both">
      <div class="divider-line" style="background:linear-gradient(to right,transparent,rgba(139,92,246,.3))"></div>
      <svg width="30" height="30" viewBox="0 0 40 40" fill="none" stroke="rgba(139,92,246,.44)" stroke-width=".7">
        <circle cx="20" cy="20" r="17"/><circle cx="20" cy="20" r="7"/>
        <line x1="20" y1="3" x2="20" y2="37"/><line x1="3" y1="20" x2="37" y2="20"/>
        <line x1="20" y1="3" x2="20" y2="37" transform="rotate(60 20 20)"/>
        <line x1="20" y1="3" x2="20" y2="37" transform="rotate(120 20 20)"/>
      </svg>
      <div class="divider-line" style="background:linear-gradient(to left,transparent,rgba(139,92,246,.3))"></div>
    </div>

    <!-- Aurascope blurred -->
    <div style="margin-bottom:24px;animation:fadeUp 1.8s ease both">
      <p class="eyebrow" style="text-align:center;margin-bottom:16px">Your Full Aurascope</p>
      <div class="aurascope-wrap">
        <p id="aurascope-txt" class="aurascope-txt blurred"></p>
        <div class="unlock-ov" id="unlock-ov">
          <p style="font-family:'Cinzel',serif;font-size:.76rem;letter-spacing:.12em;color:rgba(200,170,255,.9);text-transform:uppercase;margin-bottom:2px">Your Full Aurascope Awaits</p>
          <p style="font-style:italic;color:rgba(180,150,255,.55);font-size:.86rem;max-width:300px">Receive your complete soul-frequency reading, mantra, and monthly aura updates</p>
          <input type="email" id="inp-email" placeholder="Your email address..." style="max-width:280px;text-align:center"/>
          <button class="btn-unlock" id="btn-unlock">&#10022; Send My Full Reading</button>
          <p id="email-err" style="color:#f87171;font-size:.82rem;font-style:italic;min-height:18px"></p>
        </div>
      </div>
    </div>

    <!-- Mantra blurred -->
    <div class="mantra-wrap" id="mantra-wrap" style="filter:blur(5px);animation:fadeUp 2s ease both">
      <p class="eyebrow" style="color:rgba(176,136,56,.42);letter-spacing:.28em">Your Sacred Mantra</p>
      <p id="mantra-txt" style="font-family:'Cinzel',serif;font-style:italic;font-size:clamp(.86rem,2vw,1rem);letter-spacing:.09em;color:rgba(232,188,84,.85)"></p>
    </div>

    <div style="display:flex;flex-direction:column;align-items:center;gap:14px;animation:fadeUp 2.2s ease both">
      <button class="btn-ghost" id="btn-reset">Begin a New Reading</button>
    </div>

    <p style="margin-top:56px;font-size:.72rem;font-style:italic;color:rgba(180,150,255,.14);letter-spacing:.06em">
      Channeled through chromotherapy, frequency science &amp; the ancient wisdom of light
    </p>
  </div>
</div>

<script>
// ── Stars ────────────────────────────────────────────────────────────────────
(function(){
  var c = document.getElementById('stars');
  for(var i=0;i<140;i++){
    var s = document.createElement('div');
    s.className = 'star';
    var sz = (Math.random()*1.8+.3).toFixed(1);
    var d  = (Math.random()*3+2).toFixed(1);
    var dl = (Math.random()*7).toFixed(1);
    s.style.cssText = 'left:'+(Math.random()*100).toFixed(1)+'%;top:'+(Math.random()*100).toFixed(1)+'%;width:'+sz+'px;height:'+sz+'px;animation:twinkle '+d+'s '+dl+'s ease-in-out infinite';
    c.appendChild(s);
  }
})();

// ── Emotion color spectrum (0–1000 Hz mapped to spiral) ─────────────────────
var EC = [
  {n:'Cosmic Void',     f:0,   h:'#2e1065'},
  {n:'Deep Mystery',    f:28,  h:'#4c1d95'},
  {n:'Ethereal Violet', f:55,  h:'#6d28d9'},
  {n:'Mystic Purple',   f:80,  h:'#7c3aed'},
  {n:'Soul Indigo',     f:108, h:'#4338ca'},
  {n:'Sacred Blue',     f:135, h:'#1d4ed8'},
  {n:'Celestial Azure', f:160, h:'#0369a1'},
  {n:'Oracle Cyan',     f:188, h:'#0891b2'},
  {n:'Aqua Aether',     f:215, h:'#0d9488'},
  {n:'Emerald Life',    f:242, h:'#047857'},
  {n:'Forest Wisdom',   f:268, h:'#15803d'},
  {n:'Jade Harmony',    f:295, h:'#4d7c0f'},
  {n:'Sage Peace',      f:322, h:'#65a30d'},
  {n:'Golden Light',    f:348, h:'#a16207'},
  {n:'Amber Will',      f:375, h:'#b45309'},
  {n:'Solar Power',     f:402, h:'#c2410c'},
  {n:'Fire Passion',    f:428, h:'#dc2626'},
  {n:'Crimson Heart',   f:455, h:'#b91c1c'},
  {n:'Ruby Love',       f:482, h:'#9f1239'},
  {n:'Rose Tender',     f:508, h:'#be185d'},
  {n:'Magenta Divine',  f:535, h:'#a21caf'},
  {n:'Orchid Spirit',   f:562, h:'#7e22ce'},
  {n:'Violet Dream',    f:588, h:'#6d28d9'},
  {n:'Indigo Deep',     f:615, h:'#3730a3'},
  {n:'Midnight Sea',    f:642, h:'#1e3a8a'},
  {n:'Ocean Vast',      f:668, h:'#1e40af'},
  {n:'Cerulean Calm',   f:695, h:'#0284c7'},
  {n:'Turquoise Flow',  f:722, h:'#0e7490'},
  {n:'Malachite Heal',  f:748, h:'#0f766e'},
  {n:'Pine Ground',     f:775, h:'#166534'},
  {n:'Earth Root',      f:802, h:'#713f12'},
  {n:'Copper Burn',     f:828, h:'#92400e'},
  {n:'Amber Blaze',     f:855, h:'#d97706'},
  {n:'Gold Radiant',    f:882, h:'#f59e0b'},
  {n:'Solar White',     f:908, h:'#fde68a'},
  {n:'Pearl Clarity',   f:935, h:'#e9d5ff'},
  {n:'Lavender Grace',  f:962, h:'#c4b5fd'},
  {n:'Stellar Violet',  f:988, h:'#a78bfa'},
  {n:'Cosmic Return',   f:1000,h:'#7c3aed'}
];

// ── AuraVortex class ─────────────────────────────────────────────────────────
function AuraVortex(canvas, tooltip, birthSeed, dayOfYear) {
  this.canvas    = canvas;
  this.ctx       = canvas.getContext('2d');
  this.tooltip   = tooltip;
  this.birthFreq = birthSeed % 1000;
  this.size      = canvas.width;
  this.rotation  = 0;
  this.rafId     = null;
  this.scanMode  = false;

  var annOffset   = (dayOfYear / 365) * Math.PI * 2;
  var norm        = (Math.sin(annOffset) + 1) / 2;
  this.baseSpeed  = 0.00018 + norm * 0.00014;

  // find birth color
  var bc = EC[0];
  for(var i=0;i<EC.length;i++){
    if(Math.abs(EC[i].f - this.birthFreq) < Math.abs(bc.f - this.birthFreq)) bc = EC[i];
  }
  this.birthColor = bc.h;
}

AuraVortex.prototype.freqToPolar = function(freq) {
  var TURNS = 4.5, MIN_R = 18;
  var t = freq / 1000;
  var maxR = (this.size / 2) - 12;
  return {
    r:     MIN_R + t * (maxR - MIN_R),
    theta: t * TURNS * Math.PI * 2
  };
};

AuraVortex.prototype.toXY = function(r, theta) {
  var cx = this.size/2, cy = this.size/2;
  return {
    x: cx + r * Math.cos(theta + this.rotation - Math.PI/2),
    y: cy + r * Math.sin(theta + this.rotation - Math.PI/2)
  };
};

AuraVortex.prototype.draw = function() {
  var ctx = this.ctx;
  var W = this.size, H = this.size, cx = W/2, cy = H/2;
  ctx.clearRect(0,0,W,H);

  // Background
  var bg = ctx.createRadialGradient(cx,cy,0,cx,cy,cx);
  bg.addColorStop(0,    'rgba(255,255,255,0.10)');
  bg.addColorStop(0.12, 'rgba(180,160,255,0.05)');
  bg.addColorStop(0.42, 'rgba(30,20,60,0.88)');
  bg.addColorStop(0.72, 'rgba(10,8,20,0.96)');
  bg.addColorStop(1,    'rgba(0,0,0,1)');
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,W,H);

  // Spiral ribbon
  var steps = 800;
  for(var i=0;i<steps-1;i++){
    var f0 = (i/steps)*1000,  f1 = ((i+1)/steps)*1000;
    var p0 = this.freqToPolar(f0), p1 = this.freqToPolar(f1);
    var c0 = this.toXY(p0.r,p0.theta), c1 = this.toXY(p1.r,p1.theta);
    var idx = Math.floor((i/steps)*(EC.length-1));
    var hex = EC[idx].h;
    var alpha = i < 60 ? i/60 : 1;
    var aHex = Math.floor(alpha*200).toString(16).padStart(2,'0');
    ctx.beginPath();
    ctx.moveTo(c0.x,c0.y);
    ctx.lineTo(c1.x,c1.y);
    ctx.strokeStyle = hex + aHex;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // Emotion dots
  for(var j=0;j<EC.length;j++){
    var em = EC[j];
    var ep = this.freqToPolar(em.f);
    var exy = this.toXY(ep.r, ep.theta);
    var grd = ctx.createRadialGradient(exy.x,exy.y,0,exy.x,exy.y,9.6);
    grd.addColorStop(0, em.h+'88');
    grd.addColorStop(1,'transparent');
    ctx.beginPath();
    ctx.arc(exy.x,exy.y,9.6,0,Math.PI*2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(exy.x,exy.y,3.2,0,Math.PI*2);
    ctx.fillStyle = em.h;
    ctx.fill();
  }

  // Birth point
  var bp  = this.freqToPolar(this.birthFreq);
  var bxy = this.toXY(bp.r, bp.theta);
  var bh  = this.birthColor;
  var pulse = 0.5 + 0.5 * Math.sin(Date.now() * (this.scanMode ? 0.005 : 0.002));
  var BGR = 9;

  for(var ring=3;ring>=1;ring--){
    var rR = BGR * ring * (1 + pulse * (this.scanMode ? 0.3 : 0.15));
    var rGrd = ctx.createRadialGradient(bxy.x,bxy.y,0,bxy.x,bxy.y,rR);
    var ra = Math.floor(40/ring).toString(16).padStart(2,'0');
    rGrd.addColorStop(0, bh+ra);
    rGrd.addColorStop(1,'transparent');
    ctx.beginPath();
    ctx.arc(bxy.x,bxy.y,rR,0,Math.PI*2);
    ctx.fillStyle = rGrd;
    ctx.fill();
  }
  // extra scan glow
  if(this.scanMode){
    var scanGrd = ctx.createRadialGradient(bxy.x,bxy.y,0,bxy.x,bxy.y,BGR*5*pulse);
    scanGrd.addColorStop(0, bh+'44');
    scanGrd.addColorStop(1,'transparent');
    ctx.beginPath();
    ctx.arc(bxy.x,bxy.y,BGR*5*pulse,0,Math.PI*2);
    ctx.fillStyle = scanGrd;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(bxy.x,bxy.y,BGR,0,Math.PI*2);
  var cGrd = ctx.createRadialGradient(bxy.x,bxy.y,0,bxy.x,bxy.y,BGR);
  cGrd.addColorStop(0,'#ffffff');
  cGrd.addColorStop(0.4, bh);
  cGrd.addColorStop(1, bh+'44');
  ctx.fillStyle = cGrd;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(bxy.x,bxy.y,2.5,0,Math.PI*2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Central light
  var cenGrd = ctx.createRadialGradient(cx,cy,0,cx,cy,MIN_R*2.5);
  var MIN_R = 18;
  cenGrd.addColorStop(0,'rgba(255,255,255,0.88)');
  cenGrd.addColorStop(0.5,'rgba(220,210,255,0.38)');
  cenGrd.addColorStop(1,'transparent');
  ctx.beginPath();
  ctx.arc(cx,cy,MIN_R*2.5,0,Math.PI*2);
  ctx.fillStyle = cenGrd;
  ctx.fill();
};

AuraVortex.prototype.start = function(speedMult) {
  var self = this;
  var spd  = self.baseSpeed * (speedMult || 1);
  var loop = function(){
    self.rotation += spd;
    self.draw();
    self.rafId = requestAnimationFrame(loop);
  };
  self.rafId = requestAnimationFrame(loop);
};

AuraVortex.prototype.stop = function() {
  if(this.rafId) cancelAnimationFrame(this.rafId);
};

AuraVortex.prototype.attachHover = function(wrapEl) {
  var self = this;
  var tt   = this.tooltip;

  wrapEl.addEventListener('mousemove', function(e){
    var rect = self.canvas.getBoundingClientRect();
    var mx   = (e.clientX - rect.left) * (self.size / rect.width);
    var my   = (e.clientY - rect.top)  * (self.size / rect.height);
    var best = null, minD = 22;
    for(var i=0;i<EC.length;i++){
      var p  = self.freqToPolar(EC[i].f);
      var xy = self.toXY(p.r, p.theta);
      var d  = Math.hypot(mx - xy.x, my - xy.y);
      if(d < minD){ minD = d; best = EC[i]; }
    }
    if(best){
      tt.textContent = best.n + ' · ' + best.f + ' Hz';
      tt.style.left  = (e.clientX - wrapEl.getBoundingClientRect().left + 12) + 'px';
      tt.style.top   = (e.clientY - wrapEl.getBoundingClientRect().top  - 12) + 'px';
      tt.classList.add('show');
    } else {
      tt.classList.remove('show');
    }
  });
  wrapEl.addEventListener('mouseleave', function(){ tt.classList.remove('show'); });
};

// ── State ────────────────────────────────────────────────────────────────────
var userBdate = '', auraData = null;
var vortexIntro = null, vortexScan = null, vortexResults = null;
var scanInt = null, msgInt = null;

var MSGS = [
  'Decoding your birth frequency...',
  'Mapping your electromagnetic signature...',
  'Reading vibrational layers across the chakric spectrum...',
  'Translating light frequencies into living language...',
  'Channeling archetypes from the collective unconscious...',
  'Weaving the luminous threads of your soul design...',
  'Synthesizing your unique auric constellation...'
];

function dayOfYear() {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function parseBirthSeed(val) {
  if(!val) return Math.floor(Math.random()*900000)+100000;
  var parts = val.split('-');
  var y = parseInt(parts[0])||2000, m = parseInt(parts[1])||1, d = parseInt(parts[2])||1;
  return y*10000 + m*100 + d;
}

function vortexSize(type) {
  if(type === 'results') return Math.min(260, window.innerWidth - 80);
  return Math.min(340, window.innerWidth - 48);
}

function initVortex(canvasId, wrapId, tooltipId, birthSeed, type) {
  var cv = document.getElementById(canvasId);
  var ww = document.getElementById(wrapId);
  var tt = document.getElementById(tooltipId);
  var sz = vortexSize(type);
  cv.width  = sz;
  cv.height = sz;
  ww.style.width  = sz + 'px';
  ww.style.height = sz + 'px';
  var v = new AuraVortex(cv, tt, birthSeed, dayOfYear());
  v.attachHover(ww);
  return v;
}

function show(id) {
  ['screen-intro','screen-scan','screen-results'].forEach(function(s){
    document.getElementById(s).classList.toggle('hidden', s!==id);
  });
}

function formatBdate(v) {
  var d = new Date(v+'T12:00:00');
  return d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
}

// ── Boot intro vortex ────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function(){
  var seed = parseBirthSeed('');
  vortexIntro = initVortex('cv-intro','vwrap-intro','tt-intro', seed, 'intro');
  vortexIntro.start(1);
  updateIntroGlow(vortexIntro.birthColor);
});

function updateIntroGlow(hex) {
  var wrap = document.getElementById('vwrap-intro');
  wrap.style.boxShadow = '0 0 60px '+hex+'55, 0 0 120px '+hex+'22';
}

// Live-update vortex birth point as user changes date
document.addEventListener('DOMContentLoaded', function(){
  document.getElementById('inp-bdate').addEventListener('change', function(){
    var seed = parseBirthSeed(this.value);
    if(vortexIntro){
      vortexIntro.stop();
      vortexIntro.birthFreq = seed % 1000;
      var bc = EC[0];
      for(var i=0;i<EC.length;i++){
        if(Math.abs(EC[i].f - vortexIntro.birthFreq) < Math.abs(bc.f - vortexIntro.birthFreq)) bc = EC[i];
      }
      vortexIntro.birthColor = bc.h;
      updateIntroGlow(bc.h);
      vortexIntro.start(1);
    }
  });
});

// ── Start reading ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function(){
  document.getElementById('btn-start').addEventListener('click', startReading);
  document.getElementById('inp-bdate').addEventListener('keydown', function(e){ if(e.key==='Enter') startReading(); });
});

function startReading() {
  userBdate = document.getElementById('inp-bdate').value;
  var err = document.getElementById('intro-err');
  if(!userBdate){ err.textContent='Please enter your birth date to begin.'; return; }
  err.textContent='';

  // Stop intro vortex
  if(vortexIntro){ vortexIntro.stop(); }

  show('screen-scan');

  var seed = parseBirthSeed(userBdate);
  vortexScan = initVortex('cv-scan','vwrap-scan','tt-scan', seed, 'scan');
  vortexScan.scanMode = true;
  vortexScan.start(4);

  // Update scan glow to birth color
  document.getElementById('vwrap-scan').style.boxShadow = '0 0 80px '+vortexScan.birthColor+'66, 0 0 160px '+vortexScan.birthColor+'22';

  var pct=0, msgIdx=0;
  var fill = document.getElementById('prog-fill');
  var pctEl = document.getElementById('prog-pct');
  var msgEl = document.getElementById('scan-msg');

  scanInt = setInterval(function(){
    pct = Math.min(pct + Math.random()*8+2, 87);
    fill.style.width = pct.toFixed(0)+'%';
    pctEl.textContent = pct.toFixed(0)+'%';
  }, 700);

  msgInt = setInterval(function(){
    msgIdx = (msgIdx+1) % MSGS.length;
    msgEl.style.opacity = 0;
    setTimeout(function(){ msgEl.textContent = MSGS[msgIdx]; msgEl.style.opacity = 1; }, 300);
  }, 2400);

  fetch('/api/reading',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({birthdate:userBdate})
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    clearInterval(scanInt); clearInterval(msgInt);
    if(data.error) throw new Error(data.error);
    auraData = data;
    fill.style.width='100%'; pctEl.textContent='100%';
    setTimeout(renderResults, 1000);
  })
  .catch(function(e){
    clearInterval(scanInt); clearInterval(msgInt);
    if(vortexScan) vortexScan.stop();
    document.getElementById('intro-err').textContent = e.message||'Oracle connection failed. Please try again.';
    if(vortexIntro) vortexIntro.start(1);
    show('screen-intro');
  });
}

// ── Mini orb for cards ───────────────────────────────────────────────────────
function makeMiniOrb(hex, size) {
  var wrap = document.createElement('div');
  wrap.className = 'mini-orb-wrap';
  wrap.style.cssText = 'width:'+size+'px;height:'+size+'px;margin:0 auto 18px';
  for(var i=0;i<2;i++){
    var r = document.createElement('div');
    var off = (i+1)*16;
    r.style.cssText = 'position:absolute;inset:-'+off+'px;border-radius:50%;border:1px solid '+hex+';opacity:.35;animation:ringOut '+(2.4+i*.8)+'s '+(i*.9)+'s ease-out infinite';
    wrap.appendChild(r);
  }
  var orb = document.createElement('div');
  orb.style.cssText = 'width:100%;height:100%;border-radius:50%;animation:breathe 3.5s ease-in-out infinite;background:radial-gradient(circle at 38% 34%,'+hex+'ff,'+hex+'99,'+hex+'22);box-shadow:0 0 36px '+hex+'55,0 0 80px '+hex+'28';
  var shine = document.createElement('div');
  shine.style.cssText = 'position:absolute;inset:18%;border-radius:50%;background:radial-gradient(circle at 40% 40%,rgba(255,255,255,.3),transparent)';
  wrap.appendChild(orb);
  wrap.appendChild(shine);
  return wrap;
}

// ── Render results ───────────────────────────────────────────────────────────
function renderResults() {
  if(vortexScan) vortexScan.stop();

  var subHues = auraData.subHues, finalHue = auraData.finalHue;

  document.getElementById('res-bdate').textContent = formatBdate(userBdate);

  // Final hue
  var fn = document.getElementById('final-hue-name');
  fn.textContent = finalHue.name;
  fn.style.color = finalHue.hex;
  fn.style.textShadow = '0 0 36px '+finalHue.hex+'84';
  document.getElementById('final-hue-desc').textContent = finalHue.description;

  // Results vortex — uses final hue seed so orb color matches signature aura
  var seed = parseBirthSeed(userBdate);
  vortexResults = initVortex('cv-results','vwrap-results','tt-results', seed, 'results');
  vortexResults.start(0.7);
  document.getElementById('vwrap-results').style.boxShadow = '0 0 50px '+finalHue.hex+'44, 0 0 100px '+finalHue.hex+'18';

  // Cards
  var grid = document.getElementById('cards-grid');
  grid.innerHTML = '';
  subHues.forEach(function(h){
    var card = document.createElement('div');
    card.className = 'hue-card';
    card.style.border = '1px solid '+h.hex+'44';
    card.style.boxShadow = '0 0 28px '+h.hex+'1c,inset 0 0 18px '+h.hex+'09';

    card.appendChild(makeMiniOrb(h.hex, 76));

    var title = document.createElement('h3');
    title.style.cssText = 'font-family:Cinzel,serif;font-size:.94rem;letter-spacing:.07em;color:'+h.hex+';text-shadow:0 0 22px '+h.hex+'72;margin-bottom:12px';
    title.textContent = h.name;
    card.appendChild(title);

    var tags = document.createElement('div');
    tags.style.marginBottom = '16px';
    [[h.element,h.hex],[h.frequency+' Hz','#a855f7'],[h.emotion,'#ec4899']].forEach(function(t){
      var s = document.createElement('span');
      s.className = 'tag';
      s.style.cssText = 'border:1px solid '+t[1]+'36;color:'+t[1]+';background:'+t[1]+'0f';
      s.textContent = t[0];
      tags.appendChild(s);
    });
    card.appendChild(tags);

    [
      ['Strength', h.strength, h.hex+'0d', h.hex+'22', h.hex],
      ['Shadow',   h.weakness, 'rgba(236,72,153,.05)', 'rgba(236,72,153,.18)', 'rgba(236,72,153,.75)'],
      ['Alignment',h.action,   'rgba(16,185,129,.05)', 'rgba(16,185,129,.2)',  'rgba(16,185,129,.75)']
    ].forEach(function(sec){
      var d = document.createElement('div');
      d.style.cssText = 'margin-top:9px;padding:10px 12px;border-radius:10px;background:'+sec[2]+';border:1px solid '+sec[3]+';text-align:left';
      d.innerHTML = '<div style="font-family:Cinzel,serif;font-size:.58rem;letter-spacing:.22em;text-transform:uppercase;margin-bottom:5px;color:'+sec[4]+'">'+sec[0]+'</div><p style="font-size:.87rem;line-height:1.72;color:rgba(220,205,255,.8);font-style:italic">'+sec[1]+'</p>';
      card.appendChild(d);
    });

    grid.appendChild(card);
  });

  // Aurascope + mantra
  document.getElementById('aurascope-txt').textContent = auraData.aurascope;
  document.getElementById('mantra-txt').textContent = '"'+auraData.mantra+'"';

  show('screen-results');
  window.scrollTo({top:0,behavior:'smooth'});
}

// ── Unlock ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function(){
  document.getElementById('btn-unlock').addEventListener('click', function(){
    var email = document.getElementById('inp-email').value.trim();
    var err   = document.getElementById('email-err');
    if(!email||!email.includes('@')){ err.textContent='Please enter a valid email address.'; return; }
    err.textContent='';
    if(!auraData) return;

    var h = auraData.subHues, f = auraData.finalHue, ln = '\n', bar = '='.repeat(48);
    var body = [
      '✦  YOUR FULL AURASCOPE READING  ✦', ln,
      bar, 'BIRTH FREQUENCY: '+userBdate, bar, ln,
      '◈ '+h[0].name.toUpperCase(), h[0].frequency+' Hz | '+h[0].element+' | '+h[0].emotion, ln,
      'STRENGTH: '+h[0].strength, ln, 'SHADOW: '+h[0].weakness, ln, 'ALIGNMENT: '+h[0].action, ln,
      '◈ '+h[1].name.toUpperCase(), h[1].frequency+' Hz | '+h[1].element+' | '+h[1].emotion, ln,
      'STRENGTH: '+h[1].strength, ln, 'SHADOW: '+h[1].weakness, ln, 'ALIGNMENT: '+h[1].action, ln,
      '◈ '+h[2].name.toUpperCase(), h[2].frequency+' Hz | '+h[2].element+' | '+h[2].emotion, ln,
      'STRENGTH: '+h[2].strength, ln, 'SHADOW: '+h[2].weakness, ln, 'ALIGNMENT: '+h[2].action, ln,
      bar, 'SIGNATURE AURA: '+f.name.toUpperCase(), bar, ln, f.description, ln,
      bar, 'YOUR FULL AURASCOPE', bar, ln, auraData.aurascope, ln,
      bar, 'YOUR SACRED MANTRA', bar, ln, '"'+auraData.mantra+'"', ln,
      '✦  ✦  ✦', 'Channeled through Aurascope — the living aura oracle'
    ].join('\n');

    var a = document.createElement('a');
    a.href = 'mailto:'+encodeURIComponent(email)
      +'?subject='+encodeURIComponent('✦ Your Full Aurascope — '+f.name)
      +'&body='+encodeURIComponent(body);
    a.click();

    document.getElementById('aurascope-txt').classList.remove('blurred');
    document.getElementById('unlock-ov').classList.add('gone');
    document.getElementById('mantra-wrap').style.filter = 'none';
  });

  document.getElementById('btn-reset').addEventListener('click', function(){
    auraData = null;
    if(vortexResults) vortexResults.stop();
    if(vortexScan)    vortexScan.stop();
    document.getElementById('inp-bdate').value = '';
    document.getElementById('inp-email').value = '';
    document.getElementById('email-err').textContent = '';
    document.getElementById('aurascope-txt').classList.add('blurred');
    document.getElementById('unlock-ov').classList.remove('gone');
    document.getElementById('mantra-wrap').style.filter = 'blur(5px)';
    show('screen-intro');
    window.scrollTo({top:0});
    var seed = parseBirthSeed('');
    if(vortexIntro){ vortexIntro.stop(); }
    vortexIntro = initVortex('cv-intro','vwrap-intro','tt-intro', seed, 'intro');
    vortexIntro.start(1);
  });
});
</script>
</body>
</html>`;

app.get("*", (req, res) => res.send(HTML));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Aurascope running on port", PORT));
