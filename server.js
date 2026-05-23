const express = require("express");
const https = require("https");
const app = express();
app.use(express.json());

function callClaude(birthdate) {
  return new Promise((resolve, reject) => {
    const prompt = `Generate a full living aura reading for someone born on ${birthdate}.

The tone must NOT be like a horoscope. Instead, speak directly about their personal color frequencies — what each hue reveals about their innate strengths, hidden weaknesses, and specific actionable steps they can take to align with their highest vibration. Ground every insight in the color itself: its frequency, its elemental nature, what it activates and what it blocks.

Return ONLY valid JSON — no markdown, no backticks, no extra text:
{
  "subHues": [
    {
      "name": "unique 2-3 word poetic hue name (e.g. Twilight Ember Amber, Void Pearl Indigo, Sacred Storm Viridian)",
      "hex": "#rich saturated hex",
      "emotion": "1-3 word primary emotion",
      "frequency": 432,
      "element": "one of: Fire Water Earth Air Ether Plasma Void Starlight Storm Crystal Thunder Mist",
      "strength": "2 sentences — what innate gift or power this color frequency gives them",
      "weakness": "2 sentences — what shadow or block this color reveals they must face",
      "action": "2 sentences — a specific grounded action they can take to work with this color frequency"
    },
    { "name":"...", "hex":"...", "emotion":"...", "frequency": 528, "element":"...", "strength":"...", "weakness":"...", "action":"..." },
    { "name":"...", "hex":"...", "emotion":"...", "frequency": 639, "element":"...", "strength":"...", "weakness":"...", "action":"..." }
  ],
  "finalHue": {
    "name": "unique 2-4 word signature aura name",
    "hex": "#hex that harmonizes all three sub-hues",
    "description": "3 sentences on their blended aura essence — what it means for who they are at their core, not predictions"
  },
  "aurascope": "6 sentences that go deeper — weave together the three frequencies into a personal portrait of their soul's design: their creative architecture, their relational patterns, the specific fears that limit them, and the concrete inner shifts that would transform their life. This is intimate color psychology, not fortune telling.",
  "mantra": "exactly 8-12 words — a powerful personal mantra that reflects their specific color frequencies"
}`;

    const body = JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      system: "You are the Universe's Aura Oracle — a master of chromotherapy, color frequency psychology, sacred geometry, chakra science, and the intersection of quantum physics and ancient wisdom. You interpret the electromagnetic signature encoded in a birth date to reveal a person's true color nature. You speak with intimate directness — not as a fortune teller, but as a mirror showing someone their own deepest design. Every reading is grounded in the specific properties of each color frequency: its Hz range, its elemental correspondence, what it opens and what it blocks in the human energy field.",
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
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Aurascope</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{min-height:100vh;overflow-x:hidden}
body{background:radial-gradient(ellipse at 28% 22%,#1a0840,#090220 40%,#030110 72%,#000);color:#ede8ff;font-family:'Crimson Pro',Georgia,serif;}
#stars{position:fixed;inset:0;pointer-events:none;z-index:0}
.star{position:absolute;border-radius:50%;background:#fff;animation:twinkle var(--d,3s) var(--dl,0s) ease-in-out infinite}
.geo{position:fixed;pointer-events:none;opacity:.055}
.screen{position:relative;z-index:2;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(32px,5vw,72px) clamp(16px,4vw,40px);text-align:center;}
.hidden{display:none!important}
.orb-wrap{position:relative}
.orb{width:100%;height:100%;border-radius:50%}
.orb-shine{position:absolute;inset:18%;border-radius:50%;background:radial-gradient(circle at 40% 40%,rgba(255,255,255,.3),transparent);pointer-events:none}
.ring{position:absolute;border-radius:50%;border:1px solid;opacity:.35}
.label{display:block;font-family:'Cinzel',serif;font-size:.68rem;letter-spacing:.24em;color:rgba(180,150,255,.35);text-transform:uppercase;margin-bottom:8px;text-align:left}
input[type=date],input[type=email]{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(139,92,246,.3);border-radius:10px;padding:13px 18px;color:#ede8ff;font-family:'Crimson Pro',Georgia,serif;font-size:1.05rem;outline:none;transition:border-color .3s,box-shadow .3s;color-scheme:dark;}
input:focus{border-color:rgba(139,92,246,.7);box-shadow:0 0 0 3px rgba(139,92,246,.12)}
input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.6) sepia(1) saturate(2) hue-rotate(240deg);cursor:pointer}
.btn-start{font-family:'Cinzel',serif;font-size:.84rem;letter-spacing:.18em;text-transform:uppercase;background:linear-gradient(135deg,#5b21b6,#8b5cf6,#c026d3);color:#fff;border:none;border-radius:50px;padding:15px 52px;cursor:pointer;box-shadow:0 4px 30px rgba(91,33,182,.5);transition:transform .2s,box-shadow .2s;}
.btn-start:hover{transform:translateY(-2px);box-shadow:0 8px 40px rgba(91,33,182,.65)}
.btn-unlock{font-family:'Cinzel',serif;font-size:.82rem;letter-spacing:.16em;text-transform:uppercase;background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);color:#fff;border:none;border-radius:50px;padding:15px 44px;cursor:pointer;box-shadow:0 4px 26px rgba(124,58,237,.5);transition:transform .2s,box-shadow .2s;}
.btn-unlock:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(124,58,237,.65)}
.btn-ghost{font-family:'Cinzel',serif;font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;background:none;border:1px solid rgba(139,92,246,.22);border-radius:50px;padding:10px 30px;color:rgba(195,165,255,.45);cursor:pointer;transition:all .25s;}
.btn-ghost:hover{color:rgba(195,165,255,.9);border-color:rgba(139,92,246,.5)}
.gold{background:linear-gradient(135deg,#b8922c,#f0d060,#d4a84b,#f5e090,#b8922c);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s ease infinite;}
.progress-track{height:3px;background:rgba(139,92,246,.13);border-radius:99px;overflow:hidden;width:320px;max-width:80vw}
.progress-fill{height:100%;width:0%;background:linear-gradient(90deg,#5b21b6,#8b5cf6,#c026d3);border-radius:99px;transition:width .6s ease}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px;width:100%;max-width:980px}
.hue-card{background:rgba(255,255,255,.025);border-radius:18px;padding:28px 22px;backdrop-filter:blur(10px);transition:transform .3s;text-align:center}
.hue-card:hover{transform:translateY(-5px)}
.tag{display:inline-block;padding:3px 11px;border-radius:99px;font-family:'Cinzel',serif;font-size:.67rem;letter-spacing:.1em;margin:3px}
.card-section{margin-top:16px;text-align:left;padding:12px 14px;border-radius:10px}
.card-section-label{font-family:'Cinzel',serif;font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;margin-bottom:6px;opacity:.5}
.aurascope-block{position:relative;border-radius:18px;padding:clamp(24px,4vw,44px);max-width:760px;margin:0 auto 28px;overflow:hidden}
.aurascope-text{font-style:italic;font-size:clamp(1rem,2.5vw,1.1rem);line-height:2;color:rgba(215,205,255,.8)}
.aurascope-blur{filter:blur(7px);user-select:none;pointer-events:none;-webkit-filter:blur(7px)}
.unlock-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:linear-gradient(to bottom,rgba(9,2,32,.1) 0%,rgba(9,2,32,.85) 55%,rgba(9,2,32,.98) 100%);border-radius:18px;padding:20px}
.unlock-overlay.hidden{display:none!important}
.mantra-block{background:linear-gradient(135deg,rgba(176,136,56,.07),rgba(230,185,80,.04));border:1px solid rgba(176,136,56,.22);border-radius:12px;padding:20px 32px;max-width:600px;margin:0 auto 46px}
.eyebrow{font-family:'Cinzel',serif;font-size:.66rem;letter-spacing:.34em;color:rgba(180,150,255,.36);text-transform:uppercase;margin-bottom:12px}
.divider{display:flex;align-items:center;gap:14px;margin:50px auto;max-width:520px;width:100%}
.divider-line{flex:1;height:1px}
.results-inner{max-width:980px;margin:0 auto;width:100%}
.email-capture{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;max-width:380px}

@keyframes twinkle{0%,100%{opacity:.18}50%{opacity:.95}}
@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
@keyframes ringOut{0%{transform:scale(.88);opacity:.55}100%{transform:scale(1.65);opacity:0}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes spinCW{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes spinCCW{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
@keyframes hueShift{0%,100%{filter:hue-rotate(0deg)}50%{filter:hue-rotate(200deg)}}
</style>
</head>
<body>

<div id="stars"></div>

<div class="geo" style="top:4%;right:3%;width:180px;height:180px;animation:spinCW 44s linear infinite">
  <svg viewBox="0 0 200 200" fill="none" stroke="#a855f7" stroke-width=".6">
    <circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="60"/><circle cx="100" cy="100" r="28"/>
    <line x1="100" y1="8" x2="100" y2="192"/>
    <line x1="100" y1="8" x2="100" y2="192" transform="rotate(60 100 100)"/>
    <line x1="100" y1="8" x2="100" y2="192" transform="rotate(120 100 100)"/>
    <polygon points="100,14 183,158 17,158"/><polygon points="100,186 17,42 183,42"/>
  </svg>
</div>
<div class="geo" style="bottom:8%;left:2%;width:110px;height:110px;animation:spinCCW 60s linear infinite">
  <svg viewBox="0 0 120 120" fill="none" stroke="#ec4899" stroke-width=".5">
    <circle cx="60" cy="60" r="56"/>
    <line x1="60" y1="4" x2="60" y2="116"/>
    <line x1="60" y1="4" x2="60" y2="116" transform="rotate(45 60 60)"/>
    <line x1="60" y1="4" x2="60" y2="116" transform="rotate(90 60 60)"/>
    <line x1="60" y1="4" x2="60" y2="116" transform="rotate(135 60 60)"/>
  </svg>
</div>

<!-- INTRO -->
<div id="screen-intro" class="screen">
  <div style="animation:floatY 4.5s ease-in-out infinite;margin-bottom:38px">
    <div class="orb-wrap" style="width:168px;height:168px">
      <div class="ring" style="inset:-17px;border-color:rgba(168,85,247,.38);animation:ringOut 2.2s 0s ease-out infinite"></div>
      <div class="ring" style="inset:-34px;border-color:rgba(168,85,247,.26);animation:ringOut 2.8s .9s ease-out infinite"></div>
      <div class="ring" style="inset:-51px;border-color:rgba(168,85,247,.14);border-style:dashed;animation:ringOut 3.4s 1.8s ease-out infinite"></div>
      <div class="orb" style="background:conic-gradient(from 0deg,#5b21b6,#8b5cf6,#c026d3,#f59e0b,#10b981,#06b6d4,#3b82f6,#5b21b6);box-shadow:0 0 70px rgba(139,92,246,.55),0 0 140px rgba(139,92,246,.22);filter:blur(1.2px);animation:breathe 3.5s ease-in-out infinite,hueShift 14s ease-in-out infinite"></div>
      <div class="orb-shine"></div>
    </div>
  </div>

  <h1 class="gold" style="font-family:'Cinzel Decorative',serif;font-size:clamp(2.2rem,7vw,4.2rem);letter-spacing:.14em;margin-bottom:8px">AURASCOPE</h1>
  <p style="font-family:'Cinzel',serif;font-size:clamp(.62rem,1.8vw,.8rem);letter-spacing:.28em;color:rgba(180,150,255,.35);text-transform:uppercase;margin-bottom:32px">Read the living frequency of your soul</p>

  <div style="display:flex;align-items:center;gap:12px;width:100%;max-width:400px;margin-bottom:34px">
    <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,rgba(139,92,246,.4))"></div>
    <span style="color:rgba(139,92,246,.5)">&#10022;</span>
    <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,rgba(139,92,246,.4))"></div>
  </div>

  <div style="width:100%;max-width:360px">
    <div style="margin-bottom:22px">
      <label class="label">Date of Birth</label>
      <input type="date" id="inp-bdate"/>
    </div>
    <p id="intro-error" style="color:#f87171;font-size:.88rem;font-style:italic;min-height:22px;margin-bottom:8px"></p>
    <button class="btn-start" id="btn-start" style="display:block;margin:0 auto">Reveal My Aura</button>
  </div>

  <p style="margin-top:46px;font-size:.76rem;font-style:italic;color:rgba(180,150,255,.18);max-width:360px;letter-spacing:.05em">
    Your birth date encodes a unique electromagnetic signature — a living map of your color frequencies, strengths, and soul design
  </p>
</div>

<!-- SCANNING -->
<div id="screen-scan" class="screen hidden">
  <div style="position:relative;width:260px;height:260px;margin-bottom:50px">
    <div class="ring" style="inset:-26px;border-color:rgba(168,85,247,.52);border-width:1.5px;animation:spinCW 10s linear infinite;opacity:1"></div>
    <div class="ring" style="inset:-52px;border-color:rgba(168,85,247,.3);border-style:dashed;animation:spinCCW 16s linear infinite;opacity:1"></div>
    <div class="ring" style="inset:-78px;border-color:rgba(168,85,247,.16);animation:spinCW 22s linear infinite;opacity:1"></div>
    <div class="ring" style="inset:-104px;border-color:rgba(168,85,247,.08);border-style:dashed;animation:spinCCW 30s linear infinite;opacity:1"></div>
    <div class="orb" style="background:conic-gradient(from 0deg,#5b21b6,#8b5cf6,#c026d3,#f59e0b,#10b981,#06b6d4,#3b82f6,#5b21b6);box-shadow:0 0 110px rgba(139,92,246,.65),0 0 220px rgba(139,92,246,.28);filter:blur(2px);animation:breathe 2s ease-in-out infinite,hueShift 9s ease-in-out infinite"></div>
    <div class="orb-shine" style="animation:breathe 2s ease-in-out infinite"></div>
  </div>
  <h2 id="scan-label" style="font-family:'Cinzel',serif;font-size:clamp(.95rem,3vw,1.3rem);letter-spacing:.1em;color:rgba(200,170,255,.9);margin-bottom:10px">Reading Your Frequency...</h2>
  <p id="scan-msg" style="font-style:italic;color:rgba(180,150,255,.5);font-size:.92rem;margin-bottom:50px;min-height:28px;transition:opacity .4s">Decoding your birth frequency...</p>
  <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>
  <p id="progress-pct" style="font-family:'Cinzel',serif;font-size:.66rem;letter-spacing:.22em;color:rgba(139,92,246,.4);margin-top:9px;width:320px;max-width:80vw;text-align:right">0%</p>
</div>

<!-- RESULTS -->
<div id="screen-results" class="screen hidden" style="padding-top:60px;padding-bottom:60px">
  <div class="results-inner">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:52px;animation:fadeUp .9s ease">
      <p class="eyebrow">Aura Reading for</p>
      <h1 id="res-bdate" class="gold" style="font-family:'Cinzel Decorative',serif;font-size:clamp(1.4rem,3.5vw,2.4rem);margin-bottom:8px"></h1>
      <p style="font-style:italic;color:rgba(200,175,255,.65);font-size:.87rem;letter-spacing:.08em">Three living frequencies encoded in your birth — your strengths, your shadows, your design</p>
    </div>

    <!-- Sub Hue Cards -->
    <div class="cards-grid" id="cards-grid"></div>

    <!-- Divider -->
    <div class="divider" style="animation:fadeUp 1s 1.1s ease both">
      <div class="divider-line" style="background:linear-gradient(to right,transparent,rgba(139,92,246,.3))"></div>
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" stroke="rgba(139,92,246,.44)" stroke-width=".7">
        <circle cx="20" cy="20" r="17"/><circle cx="20" cy="20" r="7"/>
        <line x1="20" y1="3" x2="20" y2="37"/><line x1="3" y1="20" x2="37" y2="20"/>
        <line x1="20" y1="3" x2="20" y2="37" transform="rotate(60 20 20)"/>
        <line x1="20" y1="3" x2="20" y2="37" transform="rotate(120 20 20)"/>
      </svg>
      <div class="divider-line" style="background:linear-gradient(to left,transparent,rgba(139,92,246,.3))"></div>
    </div>

    <!-- Final Aura -->
    <div style="text-align:center;margin-bottom:52px;animation:fadeUp 1.5s ease both">
      <p class="eyebrow" style="margin-bottom:28px">Your Signature Aura</p>
      <div id="final-orb-wrap" style="margin-bottom:28px"></div>
      <h2 id="final-hue-name" style="font-family:'Cinzel Decorative',serif;font-size:clamp(1.1rem,3vw,1.9rem);margin-bottom:16px;letter-spacing:.07em"></h2>
      <p id="final-hue-desc" style="font-style:italic;max-width:580px;margin:0 auto;font-size:1.05rem;line-height:1.9;color:rgba(215,200,255,.72)"></p>
    </div>

    <!-- Aurascope (blurred + unlock) -->
    <div style="margin-bottom:28px;animation:fadeUp 1.8s ease both">
      <p class="eyebrow" style="text-align:center">Your Full Aurascope</p>
      <div class="aurascope-block" style="background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.2)">
        <p id="aurascope-text" class="aurascope-text aurascope-blur"></p>
        <div class="unlock-overlay" id="unlock-overlay">
          <p style="font-family:'Cinzel',serif;font-size:.82rem;letter-spacing:.12em;color:rgba(200,170,255,.9);text-transform:uppercase;margin-bottom:4px">Your Full Aurascope Awaits</p>
          <p style="font-style:italic;color:rgba(180,150,255,.55);font-size:.9rem;max-width:340px">Receive your complete soul-frequency reading, mantra, and monthly aura updates</p>
          <div class="email-capture">
            <div style="width:100%">
              <input type="email" id="inp-email" placeholder="Your email address..." style="text-align:center"/>
            </div>
            <button class="btn-unlock" id="btn-unlock">&#10022; Send My Full Reading</button>
            <p id="email-error" style="color:#f87171;font-size:.85rem;font-style:italic;min-height:20px"></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mantra (also blurred until unlock) -->
    <div class="mantra-block" id="mantra-block" style="filter:blur(6px);user-select:none;transition:filter .8s ease;animation:fadeUp 2s ease both">
      <p class="eyebrow" style="color:rgba(176,136,56,.42);letter-spacing:.28em">Your Sacred Mantra</p>
      <p id="mantra-text" style="font-family:'Cinzel',serif;font-style:italic;font-size:clamp(.88rem,2.2vw,1.05rem);letter-spacing:.09em;color:rgba(232,188,84,.85)"></p>
    </div>

    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;animation:fadeUp 2.2s ease both">
      <button class="btn-ghost" id="btn-reset">Begin a New Reading</button>
    </div>

    <p style="margin-top:60px;font-size:.74rem;font-style:italic;color:rgba(180,150,255,.15);letter-spacing:.06em">
      Channeled through chromotherapy, frequency science &amp; the ancient wisdom of light
    </p>
  </div>
</div>

<script>
(function(){
  var c=document.getElementById('stars');
  for(var i=0;i<160;i++){
    var s=document.createElement('div');
    s.className='star';
    s.style.cssText='left:'+(Math.random()*100).toFixed(1)+'%;top:'+(Math.random()*100).toFixed(1)+'%;width:'+(Math.random()*2+.4).toFixed(1)+'px;height:'+(Math.random()*2+.4).toFixed(1)+'px;--d:'+(Math.random()*3+2).toFixed(1)+'s;--dl:'+(Math.random()*6).toFixed(1)+'s';
    c.appendChild(s);
  }
})();

var userBdate='', auraData=null;
var scanInt=null, msgInt=null;
var msgs=[
  'Decoding your birth frequency...',
  'Mapping your electromagnetic signature...',
  'Reading vibrational layers across the chakric spectrum...',
  'Translating light frequencies into living language...',
  'Consulting the ancient library of color wisdom...',
  'Weaving the luminous threads of your soul design...',
  'Synthesizing your unique auric constellation...'
];

function show(id){
  ['screen-intro','screen-scan','screen-results'].forEach(function(s){
    document.getElementById(s).classList.toggle('hidden',s!==id);
  });
}

function makeOrb(hex,size,rings){
  var wrap=document.createElement('div');
  wrap.style.cssText='position:relative;width:'+size+'px;height:'+size+'px;margin:0 auto';
  for(var i=0;i<rings;i++){
    var r=document.createElement('div');
    var off=(i+1)*18;
    r.style.cssText='position:absolute;inset:-'+off+'px;border-radius:50%;border:1px solid '+hex+';opacity:.35;animation:ringOut '+(2.4+i*.8)+'s '+(i*.9)+'s ease-out infinite';
    wrap.appendChild(r);
  }
  var orb=document.createElement('div');
  orb.style.cssText='width:100%;height:100%;border-radius:50%;animation:breathe 3.5s ease-in-out infinite;background:radial-gradient(circle at 38% 34%,'+hex+'ff,'+hex+'99,'+hex+'22);box-shadow:0 0 42px '+hex+'55,0 0 90px '+hex+'28';
  var shine=document.createElement('div');
  shine.style.cssText='position:absolute;inset:18%;border-radius:50%;background:radial-gradient(circle at 40% 40%,rgba(255,255,255,.3),transparent);pointer-events:none';
  wrap.appendChild(orb);
  wrap.appendChild(shine);
  return wrap;
}

function formatBdate(val){
  var d=new Date(val+'T12:00:00');
  return d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
}

document.getElementById('btn-start').addEventListener('click', startReading);
document.getElementById('inp-bdate').addEventListener('keydown', function(e){ if(e.key==='Enter') startReading(); });

function startReading(){
  userBdate=document.getElementById('inp-bdate').value;
  var err=document.getElementById('intro-error');
  if(!userBdate){ err.textContent='Please enter your birth date to begin your reading.'; return; }
  err.textContent='';
  show('screen-scan');

  var pct=0, msgIdx=0;
  var fill=document.getElementById('progress-fill');
  var pctEl=document.getElementById('progress-pct');
  var msgEl=document.getElementById('scan-msg');

  scanInt=setInterval(function(){
    pct=Math.min(pct+Math.random()*8+2,87);
    fill.style.width=pct.toFixed(0)+'%';
    pctEl.textContent=pct.toFixed(0)+'%';
  },700);
  msgInt=setInterval(function(){
    msgIdx=(msgIdx+1)%msgs.length;
    msgEl.style.opacity=0;
    setTimeout(function(){ msgEl.textContent=msgs[msgIdx]; msgEl.style.opacity=1; },300);
  },2400);

  fetch('/api/reading',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({birthdate:userBdate})
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    clearInterval(scanInt); clearInterval(msgInt);
    if(data.error) throw new Error(data.error);
    auraData=data;
    fill.style.width='100%'; pctEl.textContent='100%';
    setTimeout(renderResults,1000);
  })
  .catch(function(e){
    clearInterval(scanInt); clearInterval(msgInt);
    document.getElementById('intro-error').textContent=e.message||'Oracle connection failed. Please try again.';
    show('screen-intro');
  });
}

function renderResults(){
  var subHues=auraData.subHues, finalHue=auraData.finalHue;
  document.getElementById('res-bdate').textContent=formatBdate(userBdate);

  var grid=document.getElementById('cards-grid');
  grid.innerHTML='';
  subHues.forEach(function(h){
    var card=document.createElement('div');
    card.className='hue-card';
    card.style.border='1px solid '+h.hex+'44';
    card.style.boxShadow='0 0 34px '+h.hex+'1c,inset 0 0 22px '+h.hex+'09';

    var orbDiv=document.createElement('div');
    orbDiv.style.marginBottom='20px';
    orbDiv.appendChild(makeOrb(h.hex,88,2));
    card.appendChild(orbDiv);

    var title=document.createElement('h3');
    title.style.cssText='font-family:Cinzel,serif;font-size:.96rem;letter-spacing:.07em;color:'+h.hex+';text-shadow:0 0 24px '+h.hex+'72;margin-bottom:14px';
    title.textContent=h.name;
    card.appendChild(title);

    var tags=document.createElement('div');
    tags.style.marginBottom='18px';
    [[h.element,h.hex],[h.frequency+' Hz','#a855f7'],[h.emotion,'#ec4899']].forEach(function(t){
      var s=document.createElement('span');
      s.className='tag';
      s.style.cssText='border:1px solid '+t[1]+'36;color:'+t[1]+';background:'+t[1]+'0f';
      s.textContent=t[0];
      tags.appendChild(s);
    });
    card.appendChild(tags);

    // Strength
    var str=document.createElement('div');
    str.className='card-section';
    str.style.cssText='margin-top:14px;padding:12px 14px;border-radius:10px;background:'+h.hex+'0d;border:1px solid '+h.hex+'22;text-align:left';
    str.innerHTML='<div class="card-section-label" style="font-family:Cinzel,serif;font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;margin-bottom:6px;color:'+h.hex+';opacity:.7">Strength</div><p style="font-size:.9rem;line-height:1.75;color:rgba(220,205,255,.8);font-style:italic">'+h.strength+'</p>';
    card.appendChild(str);

    // Weakness
    var wk=document.createElement('div');
    wk.style.cssText='margin-top:10px;padding:12px 14px;border-radius:10px;background:rgba(236,72,153,.05);border:1px solid rgba(236,72,153,.18);text-align:left';
    wk.innerHTML='<div style="font-family:Cinzel,serif;font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;margin-bottom:6px;color:rgba(236,72,153,.7)">Shadow</div><p style="font-size:.9rem;line-height:1.75;color:rgba(220,205,255,.75);font-style:italic">'+h.weakness+'</p>';
    card.appendChild(wk);

    // Action
    var ac=document.createElement('div');
    ac.style.cssText='margin-top:10px;padding:12px 14px;border-radius:10px;background:rgba(16,185,129,.05);border:1px solid rgba(16,185,129,.2);text-align:left';
    ac.innerHTML='<div style="font-family:Cinzel,serif;font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;margin-bottom:6px;color:rgba(16,185,129,.7)">Alignment</div><p style="font-size:.9rem;line-height:1.75;color:rgba(220,205,255,.75);font-style:italic">'+h.action+'</p>';
    card.appendChild(ac);

    grid.appendChild(card);
  });

  // Final orb
  var fw=document.getElementById('final-orb-wrap');
  fw.innerHTML='';
  fw.appendChild(makeOrb(finalHue.hex,170,3));
  var fn=document.getElementById('final-hue-name');
  fn.textContent=finalHue.name;
  fn.style.color=finalHue.hex;
  fn.style.textShadow='0 0 40px '+finalHue.hex+'84';
  document.getElementById('final-hue-desc').textContent=finalHue.description;

  // Aurascope blurred
  document.getElementById('aurascope-text').textContent=auraData.aurascope;
  document.getElementById('mantra-text').textContent='"'+auraData.mantra+'"';

  show('screen-results');
  window.scrollTo({top:0,behavior:'smooth'});
}

// Unlock / subscribe
document.getElementById('btn-unlock').addEventListener('click', function(){
  var email=document.getElementById('inp-email').value.trim();
  var err=document.getElementById('email-error');
  if(!email||!email.includes('@')){ err.textContent='Please enter a valid email address.'; return; }
  err.textContent='';

  // Send full reading via mailto
  var h=auraData.subHues, f=auraData.finalHue, ln='\n', bar='='.repeat(50);
  var body=[
    '✦  YOUR FULL AURASCOPE READING  ✦',ln,
    bar,'YOUR BIRTH FREQUENCY: '+userBdate,bar,ln,
    bar,'THREE AURIC FREQUENCIES',bar,ln,
    '◈ '+h[0].name.toUpperCase(),' Frequency: '+h[0].frequency+' Hz  |  '+h[0].element+'  |  '+h[0].emotion,ln,
    'STRENGTH: '+h[0].strength,ln,'SHADOW: '+h[0].weakness,ln,'ALIGNMENT: '+h[0].action,ln,
    '◈ '+h[1].name.toUpperCase(),' Frequency: '+h[1].frequency+' Hz  |  '+h[1].element+'  |  '+h[1].emotion,ln,
    'STRENGTH: '+h[1].strength,ln,'SHADOW: '+h[1].weakness,ln,'ALIGNMENT: '+h[1].action,ln,
    '◈ '+h[2].name.toUpperCase(),' Frequency: '+h[2].frequency+' Hz  |  '+h[2].element+'  |  '+h[2].emotion,ln,
    'STRENGTH: '+h[2].strength,ln,'SHADOW: '+h[2].weakness,ln,'ALIGNMENT: '+h[2].action,ln,
    bar,'YOUR SIGNATURE AURA: '+f.name.toUpperCase(),bar,ln,f.description,ln,
    bar,'YOUR FULL AURASCOPE',bar,ln,auraData.aurascope,ln,
    bar,'YOUR SACRED MANTRA',bar,ln,'"'+auraData.mantra+'"',ln,
    '✦  ✦  ✦',ln,'Channeled through Aurascope — the living aura oracle'
  ].join('\n');

  var a=document.createElement('a');
  a.href='mailto:'+encodeURIComponent(email)+'?subject='+encodeURIComponent('✦ Your Full Aurascope Reading — '+f.name)+'&body='+encodeURIComponent(body);
  a.click();

  // Reveal
  document.getElementById('aurascope-text').classList.remove('aurascope-blur');
  document.getElementById('unlock-overlay').classList.add('hidden');
  document.getElementById('mantra-block').style.filter='none';
});

document.getElementById('btn-reset').addEventListener('click', function(){
  auraData=null;
  document.getElementById('inp-bdate').value='';
  document.getElementById('inp-email').value='';
  document.getElementById('email-error').textContent='';
  document.getElementById('aurascope-text').classList.add('aurascope-blur');
  document.getElementById('unlock-overlay').classList.remove('hidden');
  document.getElementById('mantra-block').style.filter='blur(6px)';
  show('screen-intro');
  window.scrollTo({top:0});
});
</script>
</body>
</html>`;

app.get("*", (req, res) => res.send(HTML));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Aurascope running on port", PORT));
