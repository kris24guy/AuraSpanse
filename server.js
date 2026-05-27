'use strict';
/*
|==========================================================================
| AURASCOPE — server.js
| Single-file Express server. Deploy to Render as-is.
|
| ENV VARS (set in Render dashboard):
|   STRIPE_SECRET_KEY      stripe.com/dashboard/apikeys
|   STRIPE_PRICE_ID        price_xxx from your Stripe product (~$4.99)
|   STRIPE_WEBHOOK_SECRET  stripe.com/dashboard/webhooks (optional)
|   ANTHROPIC_API_KEY      console.anthropic.com
|   RESEND_API_KEY         resend.com  (3,000 free/mo)
|   FROM_EMAIL             verified sender e.g. hello@yourdomain.com
|   BASE_URL               https://realtime-aurascope.onrender.com
|==========================================================================
*/

const express   = require('express');
const crypto    = require('crypto');
const Anthropic = require('@anthropic-ai/sdk');
const { Resend } = require('resend');

let stripe;
try { stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'); }
catch(e) { console.warn('Stripe not loaded:', e.message); }

const app    = express();
const resend = new Resend(process.env.RESEND_API_KEY);
const ai     = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use('/stripe-webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

/*───────────────────────────────────────────────────────────────────────────
  DATA: ZODIACS with rich trait lore
───────────────────────────────────────────────────────────────────────────*/
const ZODIACS = [
  { sign:'Aries', sym:'♈', dates:'Mar 21 – Apr 19',
    strength:'Courage',      sLore:'Courage forms the leading edge of your spectrum — an outward radiance that moves before thought. It is the part of you that steps into the unknown without waiting for permission.',
    balance:'Drive',         bLore:'Drive is the quiet engine beneath your movement. It does not announce itself. It simply continues, steadily reshaping the emotional landscape around you.',
    weakness:'Impulsiveness',wLore:'Impulsiveness introduces fracture lines into your field — moments where the current outpaces the circuit. This is not a flaw. It is velocity without vessel.',
    hues:{ strength:'#CC2200', balance:'#E85E30', weakness:'#8B2010' } },

  { sign:'Taurus', sym:'♉', dates:'Apr 20 – May 20',
    strength:'Loyalty',      sLore:'Loyalty radiates as the slow warmth at the center of your spectrum — a deep-rooted frequency that others feel before they understand it.',
    balance:'Patience',      bLore:'Patience is a holding field. It stores emotional charge without releasing it, allowing your spectrum to build depth others rarely reach.',
    weakness:'Stubbornness',  wLore:'Stubbornness is loyalty turned inward on itself — the same frequency that holds your ground becoming the wall that holds you.',
    hues:{ strength:'#2A6B1A', balance:'#5A9E4A', weakness:'#4A5A20' } },

  { sign:'Gemini', sym:'♊', dates:'May 21 – Jun 20',
    strength:'Adaptability',  sLore:'Adaptability creates a spectral range others cannot match — your frequency shifts like light through moving water, finding angles that fixed things never find.',
    balance:'Curiosity',      bLore:'Curiosity is the part of your spectrum that refuses to stop moving. It creates breadth where depth requires stillness.',
    weakness:'Restlessness',  wLore:'Restlessness is what remains when curiosity has nowhere left to land. The motion continues even after the destination has dissolved.',
    hues:{ strength:'#00B8C4', balance:'#20C2AA', weakness:'#3A72A4' } },

  { sign:'Cancer', sym:'♋', dates:'Jun 21 – Jul 22',
    strength:'Protection',    sLore:'Protection shapes your spectrum\'s outer field — an invisible perimeter you extend toward those you allow inside your frequency.',
    balance:'Sensitivity',    bLore:'Sensitivity is the instrument your spectrum uses to read the room before you consciously choose to. It arrives ahead of decision.',
    weakness:'Moodiness',     wLore:'Moodiness is the tidal pull within your field — the moments when the inner ocean rises without visible cause, reshaping the entire emotional surface.',
    hues:{ strength:'#5BAFD0', balance:'#90C8D8', weakness:'#407A90' } },

  { sign:'Leo', sym:'♌', dates:'Jul 23 – Aug 22',
    strength:'Confidence',    sLore:'Confidence is not volume. In your spectrum it is luminosity — the natural emission of warmth that draws others into your field without demand.',
    balance:'Expression',     bLore:'Expression is how your spectrum distributes itself outward. It is the medium, not the message — the way your frequency becomes legible to others.',
    weakness:'Pride',         wLore:'Pride is luminosity collapsed into a fixed point. The warmth remains, but it no longer radiates — it reflects only itself.',
    hues:{ strength:'#E8A800', balance:'#F0B830', weakness:'#B06600' } },

  { sign:'Virgo', sym:'♍', dates:'Aug 23 – Sep 22',
    strength:'Precision',     sLore:'Precision is the frequency that finds the exact frequency. Your spectrum does not scatter — it focuses, locates, and resolves.',
    balance:'Practicality',   bLore:'Practicality grounds your spectrum in the visible world. It is the tension between your inner field and the structure required to move within reality.',
    weakness:'Overthinking',  wLore:'Overthinking is precision without release — the refinement engine continuing after the solution has already been found.',
    hues:{ strength:'#5A8A22', balance:'#8AC832', weakness:'#4A6A28' } },

  { sign:'Libra', sym:'♎', dates:'Sep 23 – Oct 22',
    strength:'Harmony',       sLore:'Harmony is not the absence of tension in your spectrum — it is the awareness of tension, and the continuous act of recalibration it requires.',
    balance:'Diplomacy',      bLore:'Diplomacy is your spectrum\'s most social frequency — the ability to hold two incompatible fields and find the shared wavelength between them.',
    weakness:'Indecision',    wLore:'Indecision is what occurs when your sensitivity to all possible harmonies prevents the selection of one. The spectrum waits, perfectly balanced, unable to move.',
    hues:{ strength:'#E060A0', balance:'#F090C0', weakness:'#A05070' } },

  { sign:'Scorpio', sym:'♏', dates:'Oct 23 – Nov 21',
    strength:'Determination', sLore:'Determination is the fixed core of your spectrum — a resonance that does not bend toward external pressure, that continues long after the initial wave has passed.',
    balance:'Intensity',      bLore:'Intensity is a catalytic equilibrium. It does not destabilize — it concentrates, deepening the emotional field around every interaction.',
    weakness:'Jealousy',      wLore:'Jealousy emerges when emotional gravity collapses inward. It is the shadow-frequency of devotion, formed when the connection you most protect feels permeable.',
    hues:{ strength:'#8B0020', balance:'#5C1A3A', weakness:'#3A5020' } },

  { sign:'Sagittarius', sym:'♐', dates:'Nov 22 – Dec 21',
    strength:'Adventure',     sLore:'Adventure is your spectrum\'s orientation toward the horizon — an inherent bias toward the unresolved, the unmapped, the frequency not yet translated.',
    balance:'Optimism',       bLore:'Optimism is not naïve in your spectrum. It is structural — a deliberate forward lean that keeps the emotional field from collapsing under accumulated weight.',
    weakness:'Recklessness',  wLore:'Recklessness is the cost of momentum without anchor. Your spectrum sometimes moves faster than its own consequences, leaving the field disorganized behind it.',
    hues:{ strength:'#E07000', balance:'#F09020', weakness:'#C04040' } },

  { sign:'Capricorn', sym:'♑', dates:'Dec 22 – Jan 19',
    strength:'Discipline',    sLore:'Discipline is the architecture of your spectrum — the internal scaffolding that allows the outer field to reach heights others abandon midway.',
    balance:'Restraint',      bLore:'Restraint holds your spectrum in compression. Not suppression — compression. The energy is present, shaped, and held until the precise moment of release.',
    weakness:'Control',       wLore:'Control is discipline extended beyond its function — the architectural impulse turning inward, applying structural logic to emotional frequencies that resist it.',
    hues:{ strength:'#4A3820', balance:'#6A5840', weakness:'#202020' } },

  { sign:'Aquarius', sym:'♒', dates:'Jan 20 – Feb 18',
    strength:'Innovation',    sLore:'Innovation is the part of your spectrum that cannot accept the given frequency as the only frequency. It reconfigures fields that others accept as fixed.',
    balance:'Detachment',     bLore:'Detachment allows your spectrum a clarity that intimacy sometimes obscures. You can read the room from outside the room — a rare and ambiguous gift.',
    weakness:'Isolation',     wLore:'Isolation is detachment extended past its function — the clarity of distance becoming the condition of distance, until the field operates alone.',
    hues:{ strength:'#00A8E8', balance:'#50C0E0', weakness:'#406070' } },

  { sign:'Pisces', sym:'♓', dates:'Feb 19 – Mar 20',
    strength:'Empathy',       sLore:'Empathy is your spectrum\'s primary sensing instrument — a deep permeability that allows you to receive the emotional frequency of others before they have named it themselves.',
    balance:'Dreaming',       bLore:'Dreaming is the state in which your spectrum becomes most itself — the frequency relaxes its edges, blurs its boundaries, and expands into dimensions unavailable while waking.',
    weakness:'Escapism',      wLore:'Escapism is dreaming without return — the expanded state becoming a preference over the contracted one, until the boundary between them dissolves entirely.',
    hues:{ strength:'#6050CC', balance:'#8070EE', weakness:'#402880' } },
];

/*───────────────────────────────────────────────────────────────────────────
  DATA: BIRTHSTONES with L / B / S resonance states
───────────────────────────────────────────────────────────────────────────*/
const BIRTHSTONES = [
  { month:1, name:'Garnet', icon:'🔴',
    light:{ trait:'Devotion',      lore:'Your Light resonance carries the warmth of deep loyalty — a frequency that stabilizes the field of those around you without diminishing your own.',       hue:'#B22234' },
    between:{ trait:'Tension',     lore:'Between states hold competing loyalties in suspension — the spectrum drifts between its anchors, neither releasing nor fully committing.',               hue:'#7A3030' },
    shadow:{ trait:'Obsession',    lore:'Shadow resonance forms where devotion becomes recursive — the same frequency that binds also narrows, collapsing the field inward.',                   hue:'#3A1010' } },

  { month:2, name:'Amethyst', icon:'🟣',
    light:{ trait:'Intuition',     lore:'Your Light resonance carries a rare perceptual clarity — the spectrum reaches beyond its visible range, sensing what has not yet arrived.',            hue:'#7B2FBE' },
    between:{ trait:'Contemplation',lore:'Between states emerge as your spectrum drifts between knowing and questioning. The field is suspended — neither resolved nor collapsed.',             hue:'#5A3A8A' },
    shadow:{ trait:'Withdrawal',   lore:'Shadow resonance forms where clarity turns inward and seals itself — the intuitive field compressing into silence rather than expression.',            hue:'#2A1850' } },

  { month:3, name:'Aquamarine', icon:'🩵',
    light:{ trait:'Clarity',       lore:'Your Light resonance carries a translucent calm — the spectrum becomes a medium through which things are seen more accurately than through others.',   hue:'#5BCCD8' },
    between:{ trait:'Fluidity',    lore:'Between states allow your spectrum to move through emotional landscapes without resistance — neither fully still nor fully in motion.',                 hue:'#3A9AAA' },
    shadow:{ trait:'Drift',        lore:'Shadow resonance forms where adaptability becomes directionlessness — the fluid field losing the tension that gives motion its meaning.',              hue:'#204858' } },

  { month:4, name:'Diamond', icon:'💎',
    light:{ trait:'Brilliance',    lore:'Your Light resonance refracts everything it touches — a spectrum that amplifies surrounding frequencies and returns them transformed.',                 hue:'#C8C8D8' },
    between:{ trait:'Refraction',  lore:'Between states create spectral scatter — the field neither absorbing nor projecting cleanly, caught between the roles of mirror and lens.',           hue:'#9090A8' },
    shadow:{ trait:'Hardness',     lore:'Shadow resonance forms where brilliance calcifies — the spectrum losing permeability, becoming the thing that reflects but no longer receives.',      hue:'#484860' } },

  { month:5, name:'Emerald', icon:'💚',
    light:{ trait:'Growth',        lore:'Your Light resonance carries the patient frequency of expansion — the spectrum reaching toward available light without urgency, finding it inevitably.',hue:'#3CBF68' },
    between:{ trait:'Renewal',     lore:'Between states hold the spectrum in a transitional frequency — neither the old configuration nor the new one, suspended in the act of becoming.',     hue:'#2A8A48' },
    shadow:{ trait:'Envy',         lore:'Shadow resonance forms where growth turns comparative — the outward-reaching frequency collapsing inward when it perceives what it lacks.',           hue:'#184828' } },

  { month:6, name:'Moonstone', icon:'🌙',
    light:{ trait:'Luminosity',    lore:'Your Light resonance carries a cyclic glow — the spectrum intensifies and recedes in rhythms that feel larger than the individual moments that compose them.',hue:'#B0C8E0' },
    between:{ trait:'Mystery',     lore:'Between states hold your spectrum at the edge of legibility — the field present but partially obscured, readable but not fully resolved.',             hue:'#7890A8' },
    shadow:{ trait:'Instability',  lore:'Shadow resonance forms where lunar rhythm becomes lunar volatility — the field cycling through configurations faster than any single one can anchor.',  hue:'#404860' } },

  { month:7, name:'Ruby', icon:'❤️',
    light:{ trait:'Passion',       lore:'Your Light resonance burns as the most direct frequency in the spectrum — unfiltered, immediate, impossible to misread.',                              hue:'#CC1040' },
    between:{ trait:'Intensity',   lore:'Between states hold the full charge of your field without releasing it — the energy present at peak saturation, vibrating within its own compression.', hue:'#8A1030' },
    shadow:{ trait:'Volatility',   lore:'Shadow resonance forms where passion loses its direction — the same full charge that illuminates, now without specific object, burning indiscriminately.',hue:'#501020' } },

  { month:8, name:'Peridot', icon:'🍀',
    light:{ trait:'Vitality',      lore:'Your Light resonance carries a high-frequency aliveness — the spectrum operating at its most energetically available, metabolizing experience readily.',hue:'#88BB28' },
    between:{ trait:'Recalibration',lore:'Between states are moments of metabolic pause — your spectrum processing recent input before converting it to fuel.',                                hue:'#608820' },
    shadow:{ trait:'Jealousy',     lore:'Shadow resonance forms where vitality turns comparative — the energetic surplus noticing lack in relation to others rather than abundance in relation to itself.',hue:'#384818' } },

  { month:9, name:'Sapphire', icon:'🔵',
    light:{ trait:'Wisdom',        lore:'Your Light resonance carries the deep frequency of accumulated understanding — not knowledge, but the emotional memory that outlasts information.',     hue:'#1060C0' },
    between:{ trait:'Loyalty',     lore:'Between states hold the spectrum in its most committed configuration — the field neither expanding nor retreating, simply remaining.',                 hue:'#0A4080' },
    shadow:{ trait:'Rigidity',     lore:'Shadow resonance forms where wisdom becomes doctrine — the deep knowing calcifying around its own conclusions, unable to integrate contradiction.',    hue:'#082040' } },

  { month:10, name:'Opal', icon:'🌈',
    light:{ trait:'Creativity',    lore:'Your Light resonance is the most spectrally complex in the system — the field containing multiple simultaneous frequencies, shifting with each angle of observation.',hue:'#C890EE' },
    between:{ trait:'Iridescence', lore:'Between states hold your spectrum at the intersection of all its colors — the field most fully itself precisely when it is least definable.',          hue:'#9060B8' },
    shadow:{ trait:'Fragility',    lore:'Shadow resonance forms where complexity becomes instability — the multi-frequency field losing its cohesion under direct pressure.',                   hue:'#503080' } },

  { month:11, name:'Topaz', icon:'🌟',
    light:{ trait:'Abundance',     lore:'Your Light resonance radiates a generous frequency — the spectrum operating at surplus, distributing warmth without accounting for what it gives.',    hue:'#E8A000' },
    between:{ trait:'Generosity',  lore:'Between states hold the spectrum in its most socially available configuration — the field extended outward, neither withholding nor overwhelming.',   hue:'#B07800' },
    shadow:{ trait:'Excess',       lore:'Shadow resonance forms where abundance loses its proportion — the generous frequency continuing past the point where it nourishes, into the range where it consumes.',hue:'#704800' } },

  { month:12, name:'Turquoise', icon:'🩵',
    light:{ trait:'Expression',    lore:'Your Light resonance carries the highest communicative frequency in the spectrum — a clarity of transmission that makes the invisible briefly visible.',hue:'#20C8B8' },
    between:{ trait:'Adaptation',  lore:'Between states hold your spectrum at its most environmentally responsive — the field adjusting its frequency to the surrounding field without losing its essential tone.',hue:'#188A80' },
    shadow:{ trait:'Abrasion',     lore:'Shadow resonance forms where expressive clarity becomes expressive excess — the transmission continuing past what the receiver is capable of holding.',hue:'#105848' } },
];

/*───────────────────────────────────────────────────────────────────────────
  HELPERS: Color math
───────────────────────────────────────────────────────────────────────────*/
function hexToRgb(h){ const c=h.replace('#',''); return{r:parseInt(c.slice(0,2),16),g:parseInt(c.slice(2,4),16),b:parseInt(c.slice(4,6),16)}; }
function rgbToHex(r,g,b){ return '#'+[r,g,b].map(v=>Math.min(255,Math.round(v)).toString(16).padStart(2,'0')).join(''); }
function blendHex(arr){ const c=arr.map(hexToRgb); return rgbToHex(c.reduce((s,v)=>s+v.r,0)/c.length,c.reduce((s,v)=>s+v.g,0)/c.length,c.reduce((s,v)=>s+v.b,0)/c.length); }

function h2hsl(hex){ let r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;const M=Math.max(r,g,b),m=Math.min(r,g,b);let h,s,l=(M+m)/2;if(M===m)return[0,0,l*100];const d=M-m;s=l>.5?d/(2-M-m):d/(M+m);if(M===r)h=(g-b)/d+(g<b?6:0);else if(M===g)h=(b-r)/d+2;else h=(r-g)/d+4;return[h*60,s*100,l*100]; }
function hsl2hex(h,s,l){ h=((h%360)+360)%360;s/=100;l/=100;const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12,c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0');};return `#${f(0)}${f(8)}${f(4)}`; }
function blArc(h1,s1,l1,h2,s2,l2,t){ let d=h2-h1;if(d>180)d-=360;if(d<-180)d+=360;return[(h1+d*t+360)%360,s1+(s2-s1)*t,l1+(l2-l1)*t]; }

function applyTimeWeight(hex){
  const now=new Date();
  const secs=now.getHours()*3600+now.getMinutes()*60+now.getSeconds();
  const w=secs/86400;
  const [h,s,l]=h2hsl(hex);
  const nh=(h+w*40+360)%360, ns=Math.max(15,Math.min(90,s*(0.7+w*0.6))), nl=Math.max(22,Math.min(76,l*(0.8+w*0.4)));
  return hsl2hex(nh,ns,nl);
}

const HUE_PREFIXES=['Burnt','Solar','Dust','Molten','Velvet','Frost','Eclipse','Deep','Silent','Radiant','Veiled','Liquid','Hollow','Ancient'];
const HUE_SUFFIXES=['Indigo','Crimson','Amber','Teal','Violet','Gold','Rose','Obsidian','Ember','Slate','Copper','Umber','Iris','Cobalt'];
const RESONANCE_NAMES=['Reflective Drive','Suspended Clarity','Inward Pulse','Quiet Momentum','Spectral Depth','Harmonic Tension','Luminous Drift','Compressed Warmth','Expansive Stillness','Active Resonance'];

function nameHue(hex){
  const [h]=h2hsl(hex);
  const pi=Math.floor((h/360)*HUE_PREFIXES.length);
  const si=Math.floor(((h+180)%360/360)*HUE_SUFFIXES.length);
  return `${HUE_PREFIXES[pi]} ${HUE_SUFFIXES[si]}`;
}
function resonanceName(hex){
  const [h]=h2hsl(hex);
  return RESONANCE_NAMES[Math.floor((h/360)*RESONANCE_NAMES.length)];
}

function getZodiac(m,d){
  const md=`${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  for(const z of ZODIACS){
    if(z.start<=z.end){ if(md>=z.start&&md<=z.end)return z; }
    else{ if(md>=z.start||md<=z.end)return z; }
  }
  return ZODIACS[0];
}
ZODIACS[0].start='12-22'; ZODIACS[0].end='01-19';
ZODIACS[1].start='01-20'; ZODIACS[1].end='02-18';
ZODIACS[2].start='02-19'; ZODIACS[2].end='03-20';
ZODIACS[3].start='03-21'; ZODIACS[3].end='04-19';
ZODIACS[4].start='04-20'; ZODIACS[4].end='05-20';
ZODIACS[5].start='05-21'; ZODIACS[5].end='06-20';
ZODIACS[6].start='06-21'; ZODIACS[6].end='07-22';
ZODIACS[7].start='07-23'; ZODIACS[7].end='08-22';
ZODIACS[8].start='08-23'; ZODIACS[8].end='09-22';
ZODIACS[9].start='09-23'; ZODIACS[9].end='10-22';
ZODIACS[10].start='10-23'; ZODIACS[10].end='11-21';
ZODIACS[11].start='11-22'; ZODIACS[11].end='12-21';

/*───────────────────────────────────────────────────────────────────────────
  MAIN HTML (complete cinematic SPA)
───────────────────────────────────────────────────────────────────────────*/
const HTML = (zodiacs, birthstones) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AuraScope</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#050810;
  --glass:rgba(255,255,255,0.04);
  --border:rgba(255,255,255,0.09);
  --text:#e8eaf4;
  --muted:#707898;
  --accent:#9878f8;
}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:'Georgia',serif;overflow-x:hidden}

/* ── BG GRADIENT ── */
#bg{position:fixed;inset:0;z-index:0;transition:opacity 2s}
#bg canvas{position:absolute;inset:0;width:100%;height:100%}

/* ── LAYOUT ── */
#app{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem 1rem}

/* ── PAGES ── */
.page{display:none;flex-direction:column;align-items:center;text-align:center;max-width:600px;width:100%;animation:fadeUp .7s ease both}
.page.active{display:flex}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}

/* ── ORB ── */
#orb-wrap{margin:2rem 0 1.5rem;position:relative;display:flex;justify-content:center}
#main-orb{border-radius:50%;display:block;filter:drop-shadow(0 0 30px var(--current-hue,#4040a0))}
.orb-glow{position:absolute;inset:-20px;border-radius:50%;background:radial-gradient(circle,var(--current-hue,#4040a0)22 0%,transparent 70%);opacity:.3;pointer-events:none;animation:breathe 4s ease-in-out infinite}
@keyframes breathe{0%,100%{transform:scale(1);opacity:.3}50%{transform:scale(1.08);opacity:.5}}

/* ── TYPOGRAPHY ── */
.title{font-size:clamp(2.2rem,7vw,3.5rem);letter-spacing:.18em;font-weight:300;background:linear-gradient(135deg,#c8b8ff,#a8d8ff,#ffc8a8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.4rem}
.subtitle{font-size:.95rem;color:var(--muted);letter-spacing:.12em;font-style:italic;margin-bottom:2.5rem}
.section-label{font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin-bottom:.6rem}
.sign-display{font-size:4rem;margin-bottom:.25rem;animation:fadeIn 1s ease}
.sign-name{font-size:1.6rem;letter-spacing:.15em;font-weight:300;color:var(--text);margin-bottom:.2rem}
.sign-dates{font-size:.78rem;color:var(--muted);letter-spacing:.1em;margin-bottom:2rem}
.hue-name{font-size:1.8rem;letter-spacing:.1em;font-weight:300;margin-bottom:.3rem}
.hue-hex{font-size:.78rem;letter-spacing:.22em;color:var(--muted);margin-bottom:.75rem;font-family:monospace}
.lore{font-size:.92rem;line-height:1.85;color:#b0b8d0;max-width:480px;margin:.75rem auto 1.75rem;font-style:italic}

/* ── TRAIT CARD ── */
.trait-card{background:var(--glass);border:.5px solid var(--border);border-radius:18px;padding:1.5rem 2rem;max-width:480px;width:100%;margin:.5rem 0;animation:fadeUp .5s ease both;backdrop-filter:blur(8px)}
.trait-type{font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;margin-bottom:.4rem}
.trait-type.strength{color:#88d888}
.trait-type.balance{color:#88b8e8}
.trait-type.weakness{color:#d88888}
.trait-name{font-size:1.3rem;letter-spacing:.1em;font-weight:300;margin-bottom:.75rem}
.trait-dot{width:14px;height:14px;border-radius:50%;margin:0 auto .75rem;box-shadow:0 0 12px currentColor}

/* ── STONE CARD ── */
.stone-header{font-size:1.4rem;margin-bottom:.25rem}
.stone-name{font-size:1.1rem;letter-spacing:.14em;font-weight:300;margin-bottom:.3rem}
.resonance-type{font-size:.65rem;letter-spacing:.22em;text-transform:uppercase;margin-bottom:.4rem}
.resonance-type.light{color:#f8e888}
.resonance-type.between{color:#a8d8e8}
.resonance-type.shadow{color:#a878c8}

/* ── INPUTS ── */
input[type=date],input[type=email]{
  background:var(--glass);border:.5px solid var(--border);border-radius:12px;
  padding:.75rem 1.25rem;font-size:.95rem;color:var(--text);font-family:inherit;
  outline:none;color-scheme:dark;text-align:center;width:100%;max-width:320px;
  transition:border-color .2s,box-shadow .2s;
}
input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(152,120,248,.15)}

/* ── BUTTONS ── */
.btn{
  padding:.75rem 2.5rem;font-size:.82rem;letter-spacing:.16em;text-transform:uppercase;
  background:transparent;border:.5px solid rgba(255,255,255,.2);border-radius:50px;
  color:var(--text);cursor:pointer;font-family:inherit;
  transition:border-color .2s,box-shadow .2s,transform .15s,background .2s;
  margin-top:.75rem;
}
.btn:hover{border-color:rgba(255,255,255,.5);box-shadow:0 0 20px rgba(152,120,248,.25);transform:translateY(-1px)}
.btn:disabled{opacity:.35;cursor:not-allowed;transform:none}
.btn-primary{background:linear-gradient(135deg,rgba(152,120,248,.2),rgba(100,160,255,.2));border-color:rgba(152,120,248,.4)}
.btn-primary:hover{background:linear-gradient(135deg,rgba(152,120,248,.35),rgba(100,160,255,.35));border-color:rgba(152,120,248,.7)}

/* ── SPECTRUM BAR ── */
.spectrum-bar{width:100%;max-width:440px;height:4px;border-radius:2px;margin:.5rem auto 0;overflow:hidden;background:linear-gradient(90deg,#3a1a5a,#1a3a7a,#1a6a5a,#3a5a1a,#6a3a1a,#6a1a3a,#3a1a5a)}
.spectrum-cursor{width:10px;height:10px;border-radius:50%;background:white;margin-top:-3px;transition:margin-left .8s cubic-bezier(.4,0,.2,1);box-shadow:0 0 8px white}

/* ── HUES ORBITING ── */
.hue-orbit{position:relative;width:200px;height:200px;margin:1rem auto}
.orbit-dot{position:absolute;width:18px;height:18px;border-radius:50%;animation:orbit 4s linear infinite}
@keyframes orbit{from{transform:rotate(0deg) translateX(72px) rotate(0deg)}to{transform:rotate(360deg) translateX(72px) rotate(-360deg)}}

/* ── COMBINED REVEAL ── */
.combined-name{font-size:2rem;letter-spacing:.12em;font-weight:300;background:linear-gradient(135deg,var(--h1,#6060cc),var(--h2,#cc6060));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.25rem}
.resonance-reading{font-size:.9rem;line-height:1.9;color:#b0b8d0;max-width:500px;margin:1rem auto;font-style:italic;text-align:left;padding:0 .5rem}

/* ── EMAIL PAGE ── */
.email-heading{font-size:1.5rem;letter-spacing:.1em;font-weight:300;margin-bottom:.35rem}
.email-sub{font-size:.82rem;color:var(--muted);margin-bottom:2rem;font-style:italic;line-height:1.7}
.status-msg{font-size:.78rem;color:var(--muted);margin-top:.75rem;min-height:20px;font-style:italic}
.status-msg.err{color:#e88888}
.status-msg.ok{color:#88d8a8}

/* ── SUCCESS PAGE ── */
.success-icon{font-size:3rem;margin-bottom:1rem;animation:fadeIn 1s ease}
.success-title{font-size:1.6rem;letter-spacing:.12em;font-weight:300;margin-bottom:.5rem}
.success-sub{font-size:.85rem;color:var(--muted);line-height:1.8;max-width:400px;font-style:italic}

/* ── METER ── */
.meter-row{display:flex;justify-content:space-between;font-size:.7rem;color:var(--muted);letter-spacing:.1em;width:100%;max-width:300px;margin:.25rem auto}
.meter-val{color:var(--text)}

/* ── DIVIDER ── */
.div{width:60px;height:.5px;background:var(--border);margin:1.5rem auto}

/* ── LOADING DOTS ── */
.dots{display:inline-flex;gap:5px;margin-left:6px}
.dot{width:4px;height:4px;border-radius:50%;background:var(--text);animation:blink 1.2s ease-in-out infinite}
.dot:nth-child(2){animation-delay:.2s}
.dot:nth-child(3){animation-delay:.4s}
@keyframes blink{0%,80%,100%{opacity:.2}40%{opacity:1}}
</style>
</head>
<body>

<!-- Background -->
<div id="bg"><canvas id="bg-canvas"></canvas></div>

<!-- App -->
<div id="app">

  <!-- PAGE 1: ENTRY -->
  <div class="page active" id="p1">
    <div class="section-label">Your spectrum begins here</div>
    <h1 class="title">AuraScope</h1>
    <p class="subtitle">Discover the hue your spectrum begins with.</p>
    <input type="date" id="bdate" max="2025-12-31" oninput="checkDate()">
    <button class="btn btn-primary" id="reveal-btn" onclick="startReveal()" disabled style="margin-top:1.5rem">Reveal My Spectrum</button>
  </div>

  <!-- PAGE 2a: ZODIAC + STRENGTH -->
  <div class="page" id="p2a">
    <div id="orb-wrap"><canvas id="main-orb" width="160" height="160"></canvas><div class="orb-glow"></div></div>
    <div class="sign-display" id="sign-sym">♏</div>
    <div class="sign-name" id="sign-name">Scorpio</div>
    <div class="sign-dates" id="sign-dates">Oct 23 – Nov 21</div>
    <div class="trait-card" id="strength-card">
      <div class="trait-type strength">Strength</div>
      <div class="trait-dot" style="color:#88d888;background:#88d888"></div>
      <div class="trait-name" id="strength-name">Determination</div>
      <p class="lore" id="strength-lore">Loading…</p>
    </div>
    <button class="btn" onclick="showBalance()">Continue</button>
  </div>

  <!-- PAGE 2b: BALANCE -->
  <div class="page" id="p2b">
    <div id="orb-wrap2"><canvas id="main-orb2" width="160" height="160"></canvas><div class="orb-glow"></div></div>
    <div class="sign-display" id="sign-sym2">♏</div>
    <div class="sign-name" id="sign-name2">Scorpio</div>
    <div class="trait-card" id="balance-card">
      <div class="trait-type balance">Balance</div>
      <div class="trait-dot" style="color:#88b8e8;background:#88b8e8"></div>
      <div class="trait-name" id="balance-name">Intensity</div>
      <p class="lore" id="balance-lore">Loading…</p>
    </div>
    <button class="btn" onclick="showWeakness()">Continue</button>
  </div>

  <!-- PAGE 2c: WEAKNESS -->
  <div class="page" id="p2c">
    <div id="orb-wrap3"><canvas id="main-orb3" width="160" height="160"></canvas><div class="orb-glow"></div></div>
    <div class="sign-display" id="sign-sym3">♏</div>
    <div class="sign-name" id="sign-name3">Scorpio</div>
    <div class="trait-card" id="weakness-card">
      <div class="trait-type weakness">Shadow</div>
      <div class="trait-dot" style="color:#d88888;background:#d88888"></div>
      <div class="trait-name" id="weakness-name">Jealousy</div>
      <p class="lore" id="weakness-lore">Loading…</p>
    </div>
    <button class="btn" onclick="showFirstHue()">Form First Hue</button>
  </div>

  <!-- PAGE 3: FIRST HUE -->
  <div class="page" id="p3">
    <div class="section-label">First Hue Formation</div>
    <div id="orb-wrap4"><canvas id="main-orb4" width="200" height="200"></canvas><div class="orb-glow"></div></div>
    <div class="hue-name" id="h1-name">—</div>
    <div class="hue-hex" id="h1-hex">—</div>
    <p class="lore" id="h1-lore">Your spectrum is emerging.</p>
    <div class="div"></div>
    <div class="spectrum-bar"><div class="spectrum-cursor" id="spec-cursor" style="margin-left:50%"></div></div>
    <div class="meter-row" style="margin-top:.75rem">
      <span>Spectrum Position <span class="meter-val" id="h1-pos">—</span></span>
      <span>Resonance <span class="meter-val" id="h1-res">—</span></span>
    </div>
    <button class="btn" style="margin-top:2rem" onclick="showStoneLight()">Continue</button>
  </div>

  <!-- PAGE 4a: STONE LIGHT -->
  <div class="page" id="p4a">
    <div class="section-label">Birthstone Harmonic</div>
    <div id="orb-wrap5"><canvas id="main-orb5" width="160" height="160"></canvas><div class="orb-glow"></div></div>
    <div class="stone-header" id="stone-icon">💎</div>
    <div class="stone-name" id="stone-name">Diamond</div>
    <div class="trait-card" id="light-card">
      <div class="resonance-type light">Light</div>
      <div class="trait-name" id="light-trait">Brilliance</div>
      <p class="lore" id="light-lore">Loading…</p>
    </div>
    <button class="btn" onclick="showStoneBetween()">Continue</button>
  </div>

  <!-- PAGE 4b: STONE BETWEEN -->
  <div class="page" id="p4b">
    <div id="orb-wrap6"><canvas id="main-orb6" width="160" height="160"></canvas><div class="orb-glow"></div></div>
    <div class="stone-header" id="stone-icon2">💎</div>
    <div class="stone-name" id="stone-name2">Diamond</div>
    <div class="trait-card" id="between-card">
      <div class="resonance-type between">Between</div>
      <div class="trait-name" id="between-trait">Refraction</div>
      <p class="lore" id="between-lore">Loading…</p>
    </div>
    <button class="btn" onclick="showStoneShadow()">Continue</button>
  </div>

  <!-- PAGE 4c: STONE SHADOW -->
  <div class="page" id="p4c">
    <div id="orb-wrap7"><canvas id="main-orb7" width="160" height="160"></canvas><div class="orb-glow"></div></div>
    <div class="stone-header" id="stone-icon3">💎</div>
    <div class="stone-name" id="stone-name3">Diamond</div>
    <div class="trait-card" id="shadow-card">
      <div class="resonance-type shadow">Shadow</div>
      <div class="trait-name" id="shadow-trait">Hardness</div>
      <p class="lore" id="shadow-lore">Loading…</p>
    </div>
    <button class="btn" onclick="showSecondHue()">Refine My Spectrum</button>
  </div>

  <!-- PAGE 5: SECOND HUE + COMBINED -->
  <div class="page" id="p5">
    <div class="section-label">Harmonic Refinement</div>
    <div id="orb-wrap8"><canvas id="main-orb8" width="220" height="220"></canvas><div class="orb-glow"></div></div>
    <div class="hue-name" id="h2-name">—</div>
    <div class="hue-hex" id="h2-hex">—</div>
    <p class="lore" id="h2-lore">Your spectrum is refining.</p>
    <div class="div"></div>
    <div class="section-label" style="margin-top:.5rem">Combined Resonance</div>
    <div class="combined-name" id="combined-name">—</div>
    <div class="hue-hex" id="combined-hex">—</div>
    <div class="meter-row" style="margin-top:.75rem">
      <span>Intensity Radius <span class="meter-val" id="intensity-r">—</span></span>
      <span>Position <span class="meter-val" id="combined-pos">—</span></span>
    </div>
    <p class="resonance-reading" id="combined-lore">Your spectrum is converging.</p>
    <button class="btn btn-primary" style="margin-top:1.5rem" onclick="showEmail()">Receive My AuraScope Reading</button>
  </div>

  <!-- PAGE 6: EMAIL / PAYMENT -->
  <div class="page" id="p6">
    <div id="orb-wrap9"><canvas id="main-orb9" width="140" height="140"></canvas><div class="orb-glow"></div></div>
    <div class="email-heading">Send Me My AuraScope Reading</div>
    <p class="email-sub">Your complete spectrum — first hue, harmonic field,<br>and the full resonance portrait — delivered to you.</p>
    <input type="email" id="email-input" placeholder="your@email.com" style="margin-bottom:.5rem">
    <button class="btn btn-primary" id="pay-btn" onclick="startPayment()">Transmit My Spectrum · $4.99</button>
    <div class="status-msg" id="pay-status"></div>
  </div>

  <!-- PAGE 7: SUCCESS -->
  <div class="page" id="p7">
    <div class="success-icon">✦</div>
    <div class="success-title">Your Spectrum Has Been Sent</div>
    <p class="success-sub">Your AuraScope reading is travelling toward you now. Open it in a quiet moment.</p>
    <button class="btn" style="margin-top:2rem" onclick="location.reload()">Begin Again</button>
  </div>

</div><!-- /app -->

<script>
/*===================================================================
  DATA (server-injected)
===================================================================*/
const ZODIACS = ${JSON.stringify(zodiacs)};
const BIRTHSTONES = ${JSON.stringify(birthstones)};

/*===================================================================
  COLOR MATH
===================================================================*/
const h2r=h=>({r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)});
const mxh=a=>'#'+['r','g','b'].map(k=>Math.round(a.map(h2r).reduce((s,v)=>s+v[k],0)/a.length).toString(16).padStart(2,'0')).join('');
function h2hsl(x){let r=parseInt(x.slice(1,3),16)/255,g=parseInt(x.slice(3,5),16)/255,b=parseInt(x.slice(5,7),16)/255;const M=Math.max(r,g,b),m=Math.min(r,g,b);let h,s,l=(M+m)/2;if(M===m)return[0,0,l*100];const d=M-m;s=l>.5?d/(2-M-m):d/(M+m);if(M===r)h=(g-b)/d+(g<b?6:0);else if(M===g)h=(b-r)/d+2;else h=(r-g)/d+4;return[h*60,s*100,l*100];}
function hsl2h(h,s,l){h=((h%360)+360)%360;s/=100;l/=100;const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12,c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0');};return '#'+f(0)+f(8)+f(4);}
function blArc(h1,s1,l1,h2,s2,l2,t){let d=h2-h1;if(d>180)d-=360;if(d<-180)d+=360;return[(h1+d*t+360)%360,s1+(s2-s1)*t,l1+(l2-l1)*t];}
const hcss=(h,s,l)=>'hsl('+h.toFixed(1)+','+s.toFixed(1)+'%,'+l.toFixed(1)+'%)';

/*===================================================================
  STATE
===================================================================*/
let DATA = {};
let ORB = { cur:{h:240,s:20,l:18}, tgt:{h:240,s:20,l:18}, t:0 };
let rafID = null;
let bgT = 0;
let bgH = 260;

/*===================================================================
  BACKGROUND
===================================================================*/
(function startBg(){
  const cv = document.getElementById('bg-canvas');
  const ctx = cv.getContext('2d');
  function resize(){ cv.width=innerWidth; cv.height=innerHeight; }
  resize(); window.addEventListener('resize', resize);
  function drawBg(){
    const W=cv.width, H=cv.height;
    ctx.clearRect(0,0,W,H);
    bgT += 0.002;
    const h1 = (bgH + bgT*8)%360;
    const h2 = (bgH + 60 + bgT*5)%360;
    const h3 = (bgH + 180 + bgT*3)%360;
    const grd = ctx.createRadialGradient(W*.3+Math.sin(bgT)*W*.1, H*.4+Math.cos(bgT*.7)*H*.1, 0, W*.5, H*.5, W*.8);
    grd.addColorStop(0, 'hsl('+h1+',30%,10%)');
    grd.addColorStop(.5, 'hsl('+h2+',22%,7%)');
    grd.addColorStop(1, 'hsl('+h3+',18%,4%)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,W,H);
    // Subtle particle field
    for(let i=0;i<6;i++){
      const px = W*(0.1+i*0.16+Math.sin(bgT+i)*0.05);
      const py = H*(0.2+Math.cos(bgT*0.6+i*1.1)*0.3);
      const g2 = ctx.createRadialGradient(px,py,0,px,py,W*0.18);
      g2.addColorStop(0,'hsla('+(h1+i*22)%360+',40%,20%,0.08)');
      g2.addColorStop(1,'transparent');
      ctx.fillStyle=g2; ctx.fillRect(0,0,W,H);
    }
    requestAnimationFrame(drawBg);
  }
  drawBg();
})();

function setBgHue(h){ bgH = h; }

/*===================================================================
  ORB ENGINE
===================================================================*/
function drawOrb(cv, col, W, t, rings){
  if(!cv) return;
  const ctx = cv.getContext('2d'), CX=W/2, CY=W/2, R=W/2-2;
  ctx.clearRect(0,0,W,W);
  // Deep base
  ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2);
  ctx.fillStyle = hcss(col.h, col.s*.6, col.l*.35); ctx.fill();
  // Nebula layers
  let seed=42; const rng=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  [[W<180?150:220,.22,24,0],[W<180?60:90,.36,34,8],[W<180?25:40,.54,46,14]].forEach(([cnt,al,lA,sA])=>{
    for(let i=0;i<cnt;i++){
      const ang=rng()*Math.PI*2, r=R*.12+rng()*R*.86;
      const px=CX+Math.cos(ang+t*(.003+rng()*.004))*r, py=CY+Math.sin(ang+t*(.002+rng()*.003))*r;
      ctx.beginPath(); ctx.arc(px,py,.5+rng()*1.8,0,Math.PI*2);
      ctx.fillStyle=hcss((col.h+(rng()-.5)*30+360)%360,Math.min(100,col.s+sA),Math.min(92,col.l+lA));
      ctx.globalAlpha=al*(0.6+rng()*.4); ctx.fill();
    }
  });
  ctx.globalAlpha=1;
  // Rotating haze lobes
  ctx.save(); ctx.translate(CX,CY); ctx.rotate(t*.003);
  for(let i=0;i<3;i++){
    const a=i*(Math.PI*2/3)+t*.002, rx=Math.cos(a)*R*.32, ry=Math.sin(a)*R*.22;
    const g2=ctx.createRadialGradient(rx,ry,0,rx,ry,R*.5);
    g2.addColorStop(0,hcss((col.h+i*55)%360,col.s*.8,Math.min(col.l+24,85))+'20');
    g2.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.arc(rx,ry,R*.5,0,Math.PI*2); ctx.fillStyle=g2; ctx.fill();
  }
  ctx.restore();
  // Rings (for second hue page)
  if(rings){
    ctx.save(); ctx.translate(CX,CY); ctx.rotate(-t*.004);
    for(let i=0;i<(W<180?10:16);i++){
      const a=(i/(W<180?10:16))*Math.PI*2;
      const rx=Math.cos(a)*R*.88, ry=Math.sin(a)*R*.88;
      ctx.beginPath(); ctx.arc(rx,ry,3+Math.sin(t*.08+i)*1.5,0,Math.PI*2);
      ctx.fillStyle=hcss((col.h+40)%360,col.s,col.l+12); ctx.globalAlpha=.55; ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha=1;
  }
  // Core glow
  const grd=ctx.createRadialGradient(CX,CY,0,CX,CY,R*.68);
  grd.addColorStop(0,hcss(col.h,Math.max(col.s-16,0),Math.min(col.l+44,90)));
  grd.addColorStop(.48,hcss(col.h,col.s,col.l+6)+'30'); grd.addColorStop(1,'transparent');
  ctx.beginPath(); ctx.arc(CX,CY,R*.68,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
  // Specular
  const sp=ctx.createRadialGradient(CX-R*.28,CY-R*.28,0,CX-R*.28,CY-R*.28,R*.42);
  sp.addColorStop(0,'rgba(255,255,255,.16)'); sp.addColorStop(1,'transparent');
  ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2); ctx.fillStyle=sp; ctx.fill();
  // Edge vignette
  const ev=ctx.createRadialGradient(CX,CY,R*.5,CX,CY,R);
  ev.addColorStop(0,'transparent'); ev.addColorStop(1,hcss(col.h,col.s*.5,col.l*.2)+'cc');
  ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2); ctx.fillStyle=ev; ctx.fill();
}

let orbT=0;
function startOrbLoop(){
  function loop(){
    let d=ORB.tgt.h-ORB.cur.h; if(d>180)d-=360; if(d<-180)d+=360;
    ORB.cur.h=((ORB.cur.h+d*.05)+360)%360;
    ORB.cur.s+=(ORB.tgt.s-ORB.cur.s)*.05;
    ORB.cur.l+=(ORB.tgt.l-ORB.cur.l)*.05;
    orbT++;
    // Draw on whichever canvas is visible
    ['main-orb','main-orb2','main-orb3','main-orb4','main-orb5','main-orb6','main-orb7','main-orb8','main-orb9'].forEach((id,idx)=>{
      const cv=document.getElementById(id); if(!cv)return;
      const W=cv.width;
      const showRings = id==='main-orb8';
      drawOrb(cv, ORB.cur, W, orbT, showRings);
    });
    // Sync glow color
    const hex=hsl2h(ORB.cur.h,ORB.cur.s,ORB.cur.l);
    document.querySelectorAll('.orb-glow').forEach(el=>el.style.background='radial-gradient(circle,'+hex+'44 0%,transparent 70%)');
    rafID=requestAnimationFrame(loop);
  }
  loop();
}

function setOrbHue(h,s,l){ ORB.tgt={h,s,l}; setBgHue(h); }

/*===================================================================
  ZODIAC HELPERS
===================================================================*/
function getZodiac(m,d){
  const md=String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
  for(const z of ZODIACS){
    if(z.start<=z.end){ if(md>=z.start&&md<=z.end)return z; }
    else{ if(md>=z.start||md<=z.end)return z; }
  }
  return ZODIACS[0];
}
function getStone(m){ return BIRTHSTONES.find(s=>s.month===m)||BIRTHSTONES[0]; }

/*===================================================================
  HUE NAMING
===================================================================*/
const HP=['Burnt','Solar','Dust','Molten','Velvet','Frost','Eclipse','Deep','Silent','Radiant','Veiled','Liquid','Hollow','Ancient'];
const HS=['Indigo','Crimson','Amber','Teal','Violet','Gold','Rose','Obsidian','Ember','Slate','Copper','Umber','Iris','Cobalt'];
const RN=['Reflective Drive','Suspended Clarity','Inward Pulse','Quiet Momentum','Spectral Depth','Harmonic Tension','Luminous Drift','Compressed Warmth','Expansive Stillness','Active Resonance'];
function nameHue(h){ const pi=Math.floor((((h%360)+360)%360)/360*HP.length),si=Math.floor(((h+180)%360)/360*HS.length);return HP[pi]+' '+HS[si]; }
function resName(h){ return RN[Math.floor((((h%360)+360)%360)/360*RN.length)]; }

/*===================================================================
  PAGE TRANSITIONS
===================================================================*/
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const el=document.getElementById(id); if(el){ el.classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); }
}

/*===================================================================
  PAGE 1 → ENTRY
===================================================================*/
function checkDate(){
  const v=document.getElementById('bdate').value;
  document.getElementById('reveal-btn').disabled=!v;
}

function startReveal(){
  const v=document.getElementById('bdate').value; if(!v)return;
  const dt=new Date(v+'T12:00:00');
  const m=dt.getMonth()+1, d=dt.getDate();
  const z=getZodiac(m,d);
  const st=getStone(m);
  // Time weight
  const now=new Date();
  const secs=now.getHours()*3600+now.getMinutes()*60+now.getSeconds();
  const tw=secs/86400;
  // First hue
  const combined=blArc(...h2hsl(z.hues.strength),...h2hsl(z.hues.balance),.5);
  const withWeak=blArc(...combined,...h2hsl(z.hues.weakness),.33);
  const fH=[((withWeak[0]+tw*40)+360)%360, Math.max(15,Math.min(90,withWeak[1]*(0.7+tw*0.6))), Math.max(22,Math.min(76,withWeak[2]*(0.8+tw*0.4)))];
  // Second hue from stone
  const stoneBlend=blArc(...h2hsl(st.light.hue),...h2hsl(st.between.hue),.5);
  const stoneWithShadow=blArc(...stoneBlend,...h2hsl(st.shadow.hue),.33);
  const sH=blArc(...stoneWithShadow,...fH,.25);
  // Combined
  const cH=blArc(...fH,...sH,.5);
  const cH2=blArc(...cH,...[fH[0],fH[1],fH[2]],.3);
  DATA={z,st,m,d,
    fHex:hsl2h(fH[0],fH[1],fH[2]),fH,
    sHex:hsl2h(sH[0],sH[1],sH[2]),sH,
    cHex:hsl2h(cH2[0],cH2[1],cH2[2]),cH:cH2,
    fName:nameHue(fH[0]),fRes:resName(fH[0]),
    sName:nameHue(sH[0]),
    cName:nameHue(cH2[0]),cRes:resName(cH2[0]),
    specPos:Math.round(fH[0]),
    sSpecPos:Math.round(sH[0]),
    intensity:(4+Math.abs(fH[1]-50)/10).toFixed(1),
  };
  // Start orb + fill pages
  startOrbLoop();
  setOrbHue(...h2hsl(z.hues.strength));
  fillPages();
  showPage('p2a');
}

function fillPages(){
  const{z,st}=DATA;
  // p2a
  ['sign-sym','sign-sym2','sign-sym3'].forEach(id=>document.getElementById(id).textContent=z.sym);
  ['sign-name','sign-name2','sign-name3'].forEach(id=>document.getElementById(id).textContent=z.sign);
  document.getElementById('sign-dates').textContent=z.dates;
  document.getElementById('strength-name').textContent=z.strength;
  document.getElementById('strength-lore').textContent=z.sLore;
  document.getElementById('balance-name').textContent=z.balance;
  document.getElementById('balance-lore').textContent=z.bLore;
  document.getElementById('weakness-name').textContent=z.weakness;
  document.getElementById('weakness-lore').textContent=z.wLore;
  // Stone
  ['stone-icon','stone-icon2','stone-icon3'].forEach(id=>document.getElementById(id).textContent=st.icon);
  ['stone-name','stone-name2','stone-name3'].forEach(id=>document.getElementById(id).textContent=st.name);
  document.getElementById('light-trait').textContent=st.light.trait;
  document.getElementById('light-lore').textContent=st.light.lore;
  document.getElementById('between-trait').textContent=st.between.trait;
  document.getElementById('between-lore').textContent=st.between.lore;
  document.getElementById('shadow-trait').textContent=st.shadow.trait;
  document.getElementById('shadow-lore').textContent=st.shadow.lore;
  // Hue pages
  document.getElementById('h1-name').textContent=DATA.fName;
  document.getElementById('h1-hex').textContent=DATA.fHex.toUpperCase();
  document.getElementById('h1-lore').textContent='Your spectrum leans toward '+DATA.fRes.toLowerCase()+' — formed from the intersection of '+z.strength.toLowerCase()+', '+z.balance.toLowerCase()+', and the shadow of '+z.weakness.toLowerCase()+'.';
  document.getElementById('h1-pos').textContent=DATA.specPos+'°';
  document.getElementById('h1-res').textContent=DATA.fRes;
  document.getElementById('spec-cursor').style.marginLeft=(DATA.specPos/360*100)+'%';
  // Second hue
  document.getElementById('h2-name').textContent=DATA.sName;
  document.getElementById('h2-hex').textContent=DATA.sHex.toUpperCase();
  document.getElementById('h2-lore').textContent='The '+st.name.toLowerCase()+' harmonic has entered your field — its '+st.light.trait.toLowerCase()+' and '+st.shadow.trait.toLowerCase()+' frequencies now drift through your spectrum.';
  // Combined
  document.getElementById('combined-name').textContent=DATA.cName;
  document.getElementById('combined-hex').textContent=DATA.cHex.toUpperCase();
  document.getElementById('intensity-r').textContent=DATA.intensity;
  document.getElementById('combined-pos').textContent=DATA.sSpecPos+'°';
  document.getElementById('combined-lore').textContent='Your spectrum currently drifts between '+DATA.fRes.toLowerCase()+' and '+DATA.cRes.toLowerCase()+', creating heightened internal resonance beneath outward calm. The '+st.name+' harmonic refines rather than overwrites — you carry both frequencies now.';
  // Set CSS vars for combined gradient
  document.getElementById('combined-name').style.setProperty('--h1',DATA.fHex);
  document.getElementById('combined-name').style.setProperty('--h2',DATA.sHex);
  document.getElementById('combined-name').style.background='linear-gradient(135deg,'+DATA.fHex+','+DATA.sHex+')';
  document.getElementById('combined-name').style.webkitBackgroundClip='text';
  document.getElementById('combined-name').style.webkitTextFillColor='transparent';
}

/*===================================================================
  PAGE TRANSITIONS
===================================================================*/
function showBalance(){
  setOrbHue(...h2hsl(DATA.z.hues.balance));
  showPage('p2b');
}
function showWeakness(){
  setOrbHue(...h2hsl(DATA.z.hues.weakness));
  showPage('p2c');
}
function showFirstHue(){
  setOrbHue(...DATA.fH);
  showPage('p3');
}
function showStoneLight(){
  setOrbHue(...h2hsl(DATA.st.light.hue));
  showPage('p4a');
}
function showStoneBetween(){
  setOrbHue(...h2hsl(DATA.st.between.hue));
  showPage('p4b');
}
function showStoneShadow(){
  setOrbHue(...h2hsl(DATA.st.shadow.hue));
  showPage('p4c');
}
function showSecondHue(){
  setOrbHue(...DATA.sH);
  showPage('p5');
}
function showEmail(){
  setOrbHue(...DATA.cH);
  showPage('p6');
}

/*===================================================================
  PAYMENT
===================================================================*/
async function startPayment(){
  const email=document.getElementById('email-input').value.trim();
  const st=document.getElementById('pay-status');
  const btn=document.getElementById('pay-btn');
  if(!email||!email.includes('@')){ st.className='status-msg err'; st.textContent='Please enter a valid email address.'; return; }
  btn.disabled=true;
  st.className='status-msg';
  st.innerHTML='Transmitting<span class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';
  try{
    const bdate=document.getElementById('bdate').value;
    const r=await fetch('/create-checkout',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email,bdate,
        firstHue:{name:DATA.fName,hex:DATA.fHex,pos:DATA.specPos,res:DATA.fRes},
        secondHue:{name:DATA.sName,hex:DATA.sHex},
        combined:{name:DATA.cName,hex:DATA.cHex,resonance:DATA.cRes},
        zodiac:DATA.z.sign,stone:DATA.st.name,
        traits:{strength:DATA.z.strength,balance:DATA.z.balance,weakness:DATA.z.weakness},
        stoneLore:{light:DATA.st.light.trait,between:DATA.st.between.trait,shadow:DATA.st.shadow.trait}
      })});
    const d=await r.json();
    if(!r.ok||d.error) throw new Error(d.error||'Payment setup failed');
    window.location.href=d.url;
  }catch(e){
    btn.disabled=false;
    st.className='status-msg err';
    st.textContent=e.message;
  }
}
</script>
</body></html>`;

/*───────────────────────────────────────────────────────────────────────────
  SUCCESS PAGE HTML
───────────────────────────────────────────────────────────────────────────*/
function successHTML(reading, email, data) {
  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const fmtd = String(reading||'')
    .replace(/\*\*(.*?)\*\*/g,'<strong style="color:#e8eaf4">$1</strong>')
    .replace(/\n\n/g,'</p><p style="margin-bottom:1.4rem">')
    .replace(/\n/g,'<br>');
  const ch = data.combined?.hex || data.firstHue?.hex || '#6060cc';
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your AuraScope Reading</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#050810;color:#e8eaf4;font-family:Georgia,serif;display:flex;flex-direction:column;align-items:center;padding:3rem 1.25rem 5rem;min-height:100vh}
.orb{width:100px;height:100px;border-radius:50%;margin:0 auto 2rem;background:${ch};box-shadow:0 0 60px ${ch}55,0 0 120px ${ch}22;animation:pulse 4s ease-in-out infinite}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
h1{font-size:clamp(1.4rem,5vw,2rem);letter-spacing:.15em;font-weight:300;margin-bottom:.3rem;
   background:linear-gradient(135deg,${ch},#c8b8ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.meta{font-size:.72rem;letter-spacing:.15em;text-transform:uppercase;color:#6b7898;margin-bottom:2.5rem}
.card{max-width:660px;width:100%;background:rgba(255,255,255,0.03);border:.5px solid rgba(255,255,255,0.08);border-radius:18px;padding:2rem 2.25rem;margin-bottom:1.5rem}
.reading-text{line-height:1.95;font-size:.93rem;color:#b8c0d8;font-style:italic}
.reading-text p{margin-bottom:1.4rem}
.hue-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:1.5rem}
.hue-chip{display:flex;align-items:center;gap:8px;font-size:.75rem;color:#9090b8}
.hue-dot{width:14px;height:14px;border-radius:50%}
.sent{font-size:.75rem;color:#505878;text-align:center;margin-top:1rem}
a.home{display:inline-block;margin-top:2.5rem;padding:.65rem 1.8rem;border:.5px solid rgba(255,255,255,.14);border-radius:50px;color:#9878f8;text-decoration:none;font-size:.78rem;letter-spacing:.12em}
</style></head>
<body>
<div class="orb"></div>
<h1>Your AuraScope Reading</h1>
<div class="meta">${esc(data.zodiac)} · ${esc(data.stone)} · ${esc(data.combined?.name||data.firstHue?.name)}</div>
<div class="card">
  <div class="hue-row">
    <div class="hue-chip"><div class="hue-dot" style="background:${data.firstHue?.hex||'#888'}"></div>${esc(data.firstHue?.name)}</div>
    <div class="hue-chip"><div class="hue-dot" style="background:${data.secondHue?.hex||'#888'}"></div>${esc(data.secondHue?.name)}</div>
    <div class="hue-chip"><div class="hue-dot" style="background:${ch}"></div>${esc(data.combined?.name)} (Combined)</div>
  </div>
  <div class="reading-text"><p>${fmtd}</p></div>
</div>
<p class="sent">Your reading has been sent to ${esc(email)}</p>
<a class="home" href="/">← Begin Again</a>
</body></html>`;
}

/*───────────────────────────────────────────────────────────────────────────
  EMAIL HTML
───────────────────────────────────────────────────────────────────────────*/
function emailHTML(reading, data) {
  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const fmtd = String(reading||'').replace(/\*\*(.*?)\*\*/g,'<strong style="color:#e8eaf4">$1</strong>').replace(/\n/g,'<br>');
  const ch = data.combined?.hex || data.firstHue?.hex || '#6060cc';
  return `<div style="background:#050810;color:#e8eaf4;padding:48px 32px;font-family:Georgia,serif;max-width:640px;margin:0 auto;border-radius:18px">
  <div style="width:80px;height:80px;border-radius:50%;background:${ch};margin:0 auto 24px;box-shadow:0 0 40px ${ch}55"></div>
  <h2 style="text-align:center;font-weight:300;letter-spacing:.15em;font-size:1.5rem;margin-bottom:6px;background:linear-gradient(135deg,${ch},#c8b8ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Your AuraScope Reading</h2>
  <p style="text-align:center;color:#6b7898;font-size:.72rem;letter-spacing:.15em;text-transform:uppercase;margin-bottom:32px">${esc(data.zodiac)} · ${esc(data.stone)} · ${esc(data.combined?.name)}</p>
  <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px;justify-content:center">
    ${[data.firstHue,data.secondHue,data.combined].filter(Boolean).map(h=>`<span style="display:flex;align-items:center;gap:8px;font-size:13px;color:#9090b8"><span style="width:12px;height:12px;border-radius:50%;background:${h.hex||h.name||'#888'};display:inline-block"></span>${esc(h.name)}</span>`).join('')}
  </div>
  <div style="line-height:1.95;font-size:15px;color:#b8c0d8;font-style:italic">${fmtd}</div>
  <p style="margin-top:40px;text-align:center;color:#383858;font-size:12px">AuraScope · your living spectral identity</p>
</div>`;
}

/*───────────────────────────────────────────────────────────────────────────
  ROUTES
───────────────────────────────────────────────────────────────────────────*/
app.get('/', (_req, res) => {
  res.send(HTML(ZODIACS, BIRTHSTONES));
});

// Legacy /generate for compatibility
app.post('/generate', (req, res) => {
  const { birthdate } = req.body;
  if (!birthdate) return res.status(400).json({ error: 'Birthdate required' });
  const dt = new Date(birthdate + 'T12:00:00');
  const m = dt.getMonth()+1, d = dt.getDate();
  const z = getZodiac(m, d);
  if (!z) return res.status(400).json({ error: 'Unable to calculate zodiac' });
  const combined = blendHex([z.hues.strength, z.hues.balance, z.hues.weakness]);
  const weighted = applyTimeWeight(combined);
  const [h] = h2hsl(weighted);
  res.json({ success:true, zodiac:z.sign, traits:{strength:z.strength,balance:z.balance,weakness:z.weakness},
    subHues:z.hues, firstHue:{ name:nameHue(h), hex:weighted, spectrumPosition:Math.round(h) },
    lore:{ strength:z.sLore, balance:z.bLore, weakness:z.wLore } });
});

// Stripe Checkout
app.post('/create-checkout', async (req, res) => {
  if (!stripe || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
    // Dev mode: skip payment
    return res.json({ url: `/dev-success?email=${encodeURIComponent(req.body.email||'')}` });
  }
  const { email, bdate, firstHue, secondHue, combined, zodiac, stone, traits, stoneLore } = req.body;
  if (!email || !bdate) return res.status(400).json({ error: 'Email and birthdate required' });
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], mode: 'payment',
      customer_email: email,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.BASE_URL||''}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.BASE_URL||''}/`,
      metadata: { email, bdate,
        firstHue: JSON.stringify(firstHue||{}),
        secondHue: JSON.stringify(secondHue||{}),
        combined:  JSON.stringify(combined||{}),
        zodiac: zodiac||'', stone: stone||'',
        traits: JSON.stringify(traits||{}),
        stoneLore: JSON.stringify(stoneLore||{}) },
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error('Stripe error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Success after Stripe payment
app.get('/success', async (req, res) => {
  const { session_id } = req.query;
  if (!session_id || !stripe) return res.redirect('/');
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') return res.redirect('/');
    const { email, bdate, zodiac, stone } = session.metadata;
    const data = {
      zodiac, stone,
      firstHue:  JSON.parse(session.metadata.firstHue  || '{}'),
      secondHue: JSON.parse(session.metadata.secondHue || '{}'),
      combined:  JSON.parse(session.metadata.combined  || '{}'),
      traits:    JSON.parse(session.metadata.traits    || '{}'),
      stoneLore: JSON.parse(session.metadata.stoneLore || '{}'),
    };
    const reading = await generateReading(email, bdate, data);
    await sendEmail(email, reading, data);
    res.send(successHTML(reading, email, data));
  } catch (e) {
    console.error('Success error:', e.message);
    res.redirect('/');
  }
});

// Dev bypass (no Stripe configured)
app.get('/dev-success', async (req, res) => {
  const email = req.query.email || 'test@example.com';
  const data = { zodiac:'Scorpio', stone:'Topaz',
    firstHue:{name:'Burnt Indigo',hex:'#4040aa'}, secondHue:{name:'Velvet Amber',hex:'#aa8040'},
    combined:{name:'Eclipse Violet',hex:'#7050aa',resonance:'Reflective Drive'},
    traits:{strength:'Determination',balance:'Intensity',weakness:'Jealousy'},
    stoneLore:{light:'Abundance',between:'Generosity',shadow:'Excess'} };
  const reading = await generateReading(email, '1990-11-05', data);
  res.send(successHTML(reading, email, data));
});

// Stripe webhook
app.post('/stripe-webhook', (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !stripe) return res.sendStatus(200);
  try {
    const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Stripe webhook:', event.type);
  } catch (e) { return res.status(400).send('Webhook error: ' + e.message); }
  res.sendStatus(200);
});

// Health
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

/*───────────────────────────────────────────────────────────────────────────
  AI READING + EMAIL
───────────────────────────────────────────────────────────────────────────*/
async function generateReading(email, bdate, data) {
  const fallback = `**${data.firstHue?.name || 'Your First Hue'}** emerged from the convergence of ${data.traits?.strength?.toLowerCase() || 'strength'}, ${data.traits?.balance?.toLowerCase() || 'balance'}, and the shadow of ${data.traits?.weakness?.toLowerCase() || 'tension'}.

Your spectrum currently leans toward ${data.combined?.resonance?.toLowerCase() || 'active resonance'} — a frequency that holds outward clarity while maintaining significant internal depth.

The ${data.stone || 'birthstone'} harmonic has introduced a secondary layer that does not override the first. Instead it refracts through it — creating interference patterns unique to this exact configuration.

What you carry forward is not a fixed identity. It is a living field, capable of drift, refinement, and return.`;

  if (!process.env.ANTHROPIC_API_KEY) return fallback;
  try {
    const r = await ai.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 1000,
      messages: [{ role: 'user', content:
        `Write a deeply personal AuraScope reading. Do not use generic horoscope language. Do not say "you will" or "you are destined to". Use present-tense reflective language. Use second person ("your spectrum", "your field", "your resonance").

Subject details:
- Zodiac: ${data.zodiac}
- Birthstone: ${data.stone}
- First Hue: ${data.firstHue?.name} (${data.firstHue?.hex}) — formed from ${data.traits?.strength}, ${data.traits?.balance}, and shadow of ${data.traits?.weakness}
- Stone resonance states: ${data.stoneLore?.light} (Light), ${data.stoneLore?.between} (Between), ${data.stoneLore?.shadow} (Shadow)  
- Combined hue: ${data.combined?.name} — ${data.combined?.resonance}

Write exactly 4 paragraphs. Each paragraph 4-6 sentences. Use **bold** for 2-3 key phrases per paragraph. Tone: poetic, emotionally intelligent, grounded. Atmospheric but not mystical overload. Feels personal not generic. Do not mention algorithms or calculations. Do not start with "Your".` }]
    });
    return r.content[0]?.text || fallback;
  } catch(e) { console.error('AI error:', e.message); return fallback; }
}

async function sendEmail(email, reading, data) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `✦ Your AuraScope Reading — ${data.combined?.name || data.firstHue?.name || 'Your Spectrum'}`,
      html: emailHTML(reading, data),
    });
  } catch(e) { console.error('Email error:', e.message); }
}

/*───────────────────────────────────────────────────────────────────────────
  START
───────────────────────────────────────────────────────────────────────────*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AuraScope running on :${PORT}`));
