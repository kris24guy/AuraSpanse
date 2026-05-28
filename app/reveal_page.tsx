'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// ─── Color Data ───────────────────────────────────────────────────────────────

const ZODIAC: Record<string, {
  name: string; symbol: string; element: string;
  strength: { label: string; desc: string; color: string };
  balance: { label: string; desc: string; color: string };
  weakness: { label: string; desc: string; color: string };
}> = {
  aries:       { name:'Aries',       symbol:'♈', element:'Fire',
    strength:{ label:'Courageous',   desc:'Aries charges forward where others hesitate. Since antiquity the Ram embodied the warrior spirit—first into battle, first into life.',            color:'#e84040' },
    balance: { label:'Determined',   desc:'Fire tempered with patience becomes unbreakable will. The Ram learns that the right moment matters as much as the force behind it.',            color:'#e87040' },
    weakness:{ label:'Impulsive',    desc:'The same fire that ignites can consume. Aries historically struggled to pause—burning bridges before knowing they were needed.',               color:'#c02020' } },
  taurus:      { name:'Taurus',      symbol:'♉', element:'Earth',
    strength:{ label:'Steadfast',    desc:'Taurus has anchored civilizations. Ancient agrarian cultures revered the Bull as the keeper of harvests—reliable, enduring, immovable.',        color:'#7ab648' },
    balance: { label:'Sensual',      desc:'Venus rules Taurus, blessing it with an eye for beauty and a body that knows pleasure. Balance is found in savoring without clinging.',        color:'#a8c850' },
    weakness:{ label:'Stubborn',     desc:'The Bull that will not move can become the obstacle itself. Historically, Taurus energy resisted change long past its usefulness.',            color:'#4a7a20' } },
  gemini:      { name:'Gemini',      symbol:'♊', element:'Air',
    strength:{ label:'Curious',      desc:'The Twins gifted humanity with language and trade. Mercury-ruled Gemini has always been the bridge—between peoples, between ideas.',            color:'#f0d040' },
    balance: { label:'Adaptable',    desc:'Air takes the shape of its container. Gemini\'s genius is fitting into any space while remaining itself—fluid, never formless.',               color:'#f0e870' },
    weakness:{ label:'Scattered',    desc:'Too many branches, too few roots. Ancient scribes noted the Twins could speak all tongues yet finish no single text.',                         color:'#c0a820' } },
  cancer:      { name:'Cancer',      symbol:'♋', element:'Water',
    strength:{ label:'Nurturing',    desc:'Cancer built the first homes. Lunar and oceanic, the Crab has always carried its shelter—offering sanctuary to those who enter its circle.',   color:'#70b8e0' },
    balance: { label:'Intuitive',    desc:'The tides know before the storm arrives. Cancer reads emotional undercurrents that rational minds miss entirely.',                              color:'#90d0f0' },
    weakness:{ label:'Withdrawing',  desc:'The shell protects and imprisons equally. Historical Cancer energy retreated under pressure, sometimes into permanent silence.',               color:'#3a7898' } },
  leo:         { name:'Leo',         symbol:'♌', element:'Fire',
    strength:{ label:'Radiant',      desc:'Every ancient court had its Leo. The Lion was the solar king—the one whose presence organized the room before a single word was spoken.',      color:'#f09820' },
    balance: { label:'Generous',     desc:'True royalty gives. Leo at its best spends its light freely, knowing the sun does not diminish by illuminating others.',                      color:'#f8c040' },
    weakness:{ label:'Vain',         desc:'When the mirror becomes the throne, the kingdom shrinks. Leo historically fell when applause mattered more than truth.',                     color:'#c07010' } },
  virgo:       { name:'Virgo',       symbol:'♍', element:'Earth',
    strength:{ label:'Precise',      desc:'Virgo mapped the stars before telescopes existed. Mercury in earth creates the archivist, the healer, the one who sees what others overlook.', color:'#80c890' },
    balance: { label:'Discerning',   desc:'Not all perfection is cold. Virgo\'s discernment, at its best, is an act of love—refining things because they matter.',                      color:'#a0e0a0' },
    weakness:{ label:'Critical',     desc:'The same eye that finds the flaw can miss the whole. Ancient healers warned: Virgo energy could dissect the living thing until it ceased.',   color:'#508060' } },
  libra:       { name:'Libra',       symbol:'♎', element:'Air',
    strength:{ label:'Harmonious',   desc:'Libra invented diplomacy. The Scales appear in every ancient justice system—the sign born to weigh, to negotiate, to find the third path.',  color:'#e880c0' },
    balance: { label:'Fair-minded',  desc:'Venus in air seeks beauty in fairness. Libra knows that the most elegant solution is usually the just one.',                                  color:'#f0a0d8' },
    weakness:{ label:'Indecisive',   desc:'When all sides seem equal, the Scales freeze. Historical Libra energy sometimes chose peace over truth and called it balance.',               color:'#b85090' } },
  scorpio:     { name:'Scorpio',     symbol:'♏', element:'Water',
    strength:{ label:'Transforming', desc:'Scorpio descends so others won\'t have to. Pluto\'s energy has always sought what hides beneath—alchemizing darkness into power.',            color:'#8040c0' },
    balance: { label:'Perceptive',   desc:'The Scorpion sees through surfaces. This perception, held with compassion rather than suspicion, becomes extraordinary wisdom.',              color:'#a060e0' },
    weakness:{ label:'Consuming',    desc:'Scorpio\'s intensity can turn inward and devour. Ancient texts warned of the sign that could sting itself when no other target remained.',    color:'#501880' } },
  sagittarius: { name:'Sagittarius', symbol:'♐', element:'Fire',
    strength:{ label:'Visionary',    desc:'Jupiter\'s archer always aimed beyond the horizon. Every great philosophical tradition has a Sagittarius at its origin—bold, expansive, free.', color:'#e06020' },
    balance: { label:'Adventurous',  desc:'The arrow must leave the bow. Sagittarius teaches that wisdom without experience is theory, and theory without wisdom is reckless.',          color:'#f08040' },
    weakness:{ label:'Reckless',     desc:'The arrow loosed without aim wounds indiscriminately. Historical Sagittarius energy confused freedom with the absence of consequence.',       color:'#a04010' } },
  capricorn:   { name:'Capricorn',   symbol:'♑', element:'Earth',
    strength:{ label:'Disciplined',  desc:'Saturn\'s Goat climbed mountains before roads existed. Every enduring institution carries Capricorn energy at its foundation.',               color:'#7090b0' },
    balance: { label:'Strategic',    desc:'Time is Capricorn\'s medium. The Sea-Goat sees ten moves ahead and adjusts without drama, building toward summits others can\'t yet see.',   color:'#90b0d0' },
    weakness:{ label:'Rigid',        desc:'The stone that cannot yield breaks. Ancient wisdom cautioned that Capricorn\'s discipline could calcify into rules that outlived their purpose.', color:'#405870' } },
  aquarius:    { name:'Aquarius',    symbol:'♒', element:'Air',
    strength:{ label:'Visionary',    desc:'Aquarius brought fire to the people. Uranus-ruled, it has always been the revolutionary—arriving before the age was ready.',                  color:'#40b8e0' },
    balance: { label:'Humanitarian', desc:'The Water-Bearer pours for everyone. Aquarius at its best transforms personal insight into collective liberation.',                            color:'#70d8f8' },
    weakness:{ label:'Detached',     desc:'The one who loves humanity sometimes forgets the person beside them. Aquarius historically sacrificed intimacy for ideology.',                color:'#208098' } },
  pisces:      { name:'Pisces',      symbol:'♓', element:'Water',
    strength:{ label:'Empathic',     desc:'Pisces feels what others have buried. Neptune\'s dreamers built every mystical tradition—the boundary between self and cosmos barely exists.', color:'#9060d0' },
    balance: { label:'Creative',     desc:'The two Fish swim in opposite currents—and the tension between them is art. Pisces transforms feeling into form more naturally than any sign.', color:'#b090f0' },
    weakness:{ label:'Escapist',     desc:'The ocean can swallow. Ancient seers warned of Pisces energy dissolving into fantasy when the waking world became too sharp.',               color:'#603898' } },
};

const BIRTHSTONES: Record<number, { name: string; base: string; shadow: string; light: string }> = {
  1:  { name:'Garnet',      base:'#b22222', shadow:'#5a0f0f', light:'#e88080' },
  2:  { name:'Amethyst',    base:'#9966cc', shadow:'#4a1f6a', light:'#d4a8f0' },
  3:  { name:'Aquamarine',  base:'#7fffd4', shadow:'#2a7a60', light:'#c8fff0' },
  4:  { name:'Diamond',     base:'#d0e8ff', shadow:'#6080a0', light:'#f0f8ff' },
  5:  { name:'Emerald',     base:'#50c878', shadow:'#1a5a30', light:'#a0f0b8' },
  6:  { name:'Pearl',       base:'#f0e8d8', shadow:'#907060', light:'#fdf8f0' },
  7:  { name:'Ruby',        base:'#e0115f', shadow:'#6a0020', light:'#f080a8' },
  8:  { name:'Peridot',     base:'#b8ff40', shadow:'#507010', light:'#e0ff98' },
  9:  { name:'Sapphire',    base:'#0f52ba', shadow:'#061a50', light:'#6090e0' },
  10: { name:'Opal',        base:'#a8a9ad', shadow:'#404248', light:'#e0e2e8' },
  11: { name:'Topaz',       base:'#ffcc00', shadow:'#806000', light:'#ffe880' },
  12: { name:'Blue Topaz',  base:'#87ceeb', shadow:'#2a5870', light:'#c8eeff' },
};

const WILDCARD = {
  moldavite:       { name:'Moldavite',        hex:'#2d5016', quality:'translucent', desc:'Cosmic glass born of meteor impact. It carries extraterrestrial memory and accelerates what must change.' },
  clearQuartz:     { name:'Clear Quartz',     hex:'#f0f8ff', quality:'transparent', desc:'The universal amplifier. It holds no agenda—only magnifies the truest signal of your intent.' },
  blackTourmaline: { name:'Black Tourmaline', hex:'#1a1a1a', quality:'opaque',      desc:'The guardian stone. Dense and absolute, it grounds your spectrum into the earth and seals it.' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blendColors(hex1: string, hex2: string, ratio = 0.5): string {
  const n1 = parseInt(hex1.replace('#',''),16), n2 = parseInt(hex2.replace('#',''),16);
  const r = Math.round(((n1>>16)&255)*(1-ratio) + ((n2>>16)&255)*ratio);
  const g = Math.round(((n1>>8)&255)*(1-ratio) + ((n2>>8)&255)*ratio);
  const b = Math.round((n1&255)*(1-ratio) + (n2&255)*ratio);
  return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
}

function getZodiac(month: number, day: number) {
  if ((month===3&&day>=21)||(month===4&&day<=19)) return ZODIAC.aries;
  if ((month===4&&day>=20)||(month===5&&day<=20)) return ZODIAC.taurus;
  if ((month===5&&day>=21)||(month===6&&day<=20)) return ZODIAC.gemini;
  if ((month===6&&day>=21)||(month===7&&day<=22)) return ZODIAC.cancer;
  if ((month===7&&day>=23)||(month===8&&day<=22)) return ZODIAC.leo;
  if ((month===8&&day>=23)||(month===9&&day<=22)) return ZODIAC.virgo;
  if ((month===9&&day>=23)||(month===10&&day<=22)) return ZODIAC.libra;
  if ((month===10&&day>=23)||(month===11&&day<=21)) return ZODIAC.scorpio;
  if ((month===11&&day>=22)||(month===12&&day<=21)) return ZODIAC.sagittarius;
  if ((month===12&&day>=22)||(month===1&&day<=19)) return ZODIAC.capricorn;
  if ((month===1&&day>=20)||(month===2&&day<=18)) return ZODIAC.aquarius;
  return ZODIAC.pisces;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RevealPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const birthDateStr = searchParams.get('d') || '';

  const [stage, setStage] = useState<'strength'|'balance'|'weakness'|'hue1'|'hue2'|'hue3'|'capture'>('strength');
  const [flaring, setFlaring] = useState<string|null>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!birthDateStr) router.replace('/'); }, [birthDateStr]);

  if (!birthDateStr) return null;

  const [year, month, day] = birthDateStr.split('-').map(Number);
  const seed = year * 10000 + month * 100 + day;
  const zodiac = getZodiac(month, day);
  const stone = BIRTHSTONES[month];

  // Time weight (invisible blend factor from day-of-year)
  const dayOfYear = Math.floor((new Date(year,month-1,day).getTime() - new Date(year,0,0).getTime()) / 86400000);
  const timeWeight = (dayOfYear % 100) / 100;

  // Hue 1 — blend strength + balance + weakness + time weight
  const hue1Base = blendColors(blendColors(zodiac.strength.color, zodiac.balance.color, 0.5), zodiac.weakness.color, 0.3);
  const hue1 = blendColors(hue1Base, `hsl(${(seed % 360)},60%,50%)`.replace('hsl','#').replace(/[^#0-9a-f]/g,'').slice(0,7) || hue1Base, timeWeight * 0.2);

  // Hue 2 — blend birthstone shadow + light + balance
  const hue2 = blendColors(blendColors(stone.shadow, stone.light, 0.5), stone.base, 0.4);

  // Hue 3 — blend all three wildcard stones
  const wcKeys = ['moldavite','clearQuartz','blackTourmaline'] as const;
  const wc = wcKeys[seed % 3];
  const hue3 = blendColors(blendColors(WILDCARD.moldavite.hex, WILDCARD.clearQuartz.hex, 0.4), WILDCARD.blackTourmaline.hex, 0.35);

  const flareTrait = (color: string, next: typeof stage) => {
    setFlaring(color);
    setTimeout(() => { setFlaring(null); setStage(next); }, 900);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, birthDate: birthDateStr, zodiac: zodiac.name, hue1, hue2, hue3 }),
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  const stageOrder = ['strength','balance','weakness','hue1','hue2','hue3','capture'];
  const stageIndex = stageOrder.indexOf(stage);

  return (
    <main style={{ minHeight:'100vh', background:'#0a0a0f', color:'#e8e0d0', fontFamily:'"Georgia",serif', padding:'2rem 1rem', overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Cinzel:wght@400;500&display=swap');
        * { box-sizing:border-box; }
        body { background:#0a0a0f; }
        .card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:2rem; margin-bottom:1.5rem; transition:all 0.6s; }
        .reveal-btn {
          background:transparent; border:1px solid rgba(255,200,100,0.4); color:#f0d080;
          padding:0.75rem 2rem; font-family:'Cinzel',serif; font-size:0.75rem;
          letter-spacing:0.2em; cursor:pointer; text-transform:uppercase; transition:all 0.3s; width:100%;
        }
        .reveal-btn:hover { background:rgba(255,200,100,0.08); border-color:rgba(255,200,100,0.8); }
        .flare-overlay { position:fixed; inset:0; pointer-events:none; z-index:100; transition:opacity 0.9s; }
        .color-swatch { width:100%; height:120px; border-radius:2px; transition:all 0.5s; }
        .email-input {
          width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.15);
          color:#e8e0d0; padding:0.875rem 1.25rem; font-family:'Cormorant Garamond',serif;
          font-size:1.05rem; outline:none; letter-spacing:0.03em;
        }
        .email-input:focus { border-color:rgba(255,200,100,0.5); }
        .submit-btn {
          width:100%; background:rgba(255,200,100,0.1); border:1px solid rgba(255,200,100,0.6);
          color:#f0d080; padding:1rem; font-family:'Cinzel',serif; font-size:0.8rem;
          letter-spacing:0.2em; cursor:pointer; text-transform:uppercase; transition:all 0.3s;
        }
        .submit-btn:hover:not(:disabled) { background:rgba(255,200,100,0.2); }
        .submit-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .blur-teaser { filter:blur(6px); user-select:none; pointer-events:none; }
        @keyframes fade-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fade-up 0.7s ease-out forwards; }
        @keyframes flare-in { 0%{opacity:0} 30%{opacity:0.35} 70%{opacity:0.35} 100%{opacity:0} }
        .flare-anim { animation: flare-in 0.9s ease-out forwards; }
        .label-sm { font-family:'Cinzel',serif; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,200,100,0.5); margin-bottom:0.5rem; }
        .big-label { font-family:'Cinzel',serif; font-size:1rem; letter-spacing:0.2em; text-transform:uppercase; color:#e8e0d0; margin-bottom:0.75rem; }
        .body-text { font-family:'Cormorant Garamond',serif; font-size:1.05rem; line-height:1.7; color:rgba(232,224,208,0.75); }
        .italic-text { font-style:italic; }
        .divider { height:1px; background:linear-gradient(to right,transparent,rgba(255,200,100,0.2),transparent); margin:1.5rem 0; }
        .back-btn { background:none; border:none; color:rgba(232,224,208,0.3); font-family:'Cinzel',serif; font-size:0.65rem; letter-spacing:0.2em; cursor:pointer; text-transform:uppercase; padding:0; margin-bottom:2rem; }
        .back-btn:hover { color:rgba(232,224,208,0.6); }
        .hue-row { display:flex; gap:0.75rem; margin-bottom:1rem; }
        .hue-mini { flex:1; height:60px; border-radius:2px; }
      `}</style>

      {/* Flare overlay */}
      {flaring && (
        <div className="flare-overlay flare-anim" style={{ background: flaring, mixBlendMode:'screen' as any }} />
      )}

      <div style={{ maxWidth:520, margin:'0 auto' }}>

        <button className="back-btn" onClick={() => router.replace('/')}>← New Reading</button>

        {/* Zodiac header — always visible */}
        <div className="card fade-up" style={{ borderColor:'rgba(255,200,100,0.15)', marginBottom:'2rem' }}>
          <p className="label-sm">Your Sign</p>
          <h1 style={{ fontFamily:'"Cinzel",serif', fontSize:'1.8rem', fontWeight:400, letterSpacing:'0.1em', marginBottom:'0.25rem' }}>
            {zodiac.name} {zodiac.symbol}
          </h1>
          <p style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', color:'rgba(232,224,208,0.4)', fontSize:'0.9rem' }}>
            {zodiac.element} · Born {birthDateStr}
          </p>
        </div>

        {/* STRENGTH */}
        <div className="card fade-up" style={{ borderLeftColor: stageIndex >= 0 ? zodiac.strength.color : 'transparent', borderLeftWidth:2 }}>
          <p className="label-sm" style={{ color:'rgba(120,220,120,0.6)' }}>Strength</p>
          <p className="big-label">{zodiac.strength.label}</p>
          <p className="body-text italic-text">{zodiac.strength.desc}</p>
          {stage === 'strength' && (
            <button className="reveal-btn" style={{ marginTop:'1.25rem' }} onClick={() => flareTrait(zodiac.strength.color, 'balance')}>
              Ignite · Reveal Balance
            </button>
          )}
        </div>

        {/* BALANCE */}
        {stageIndex >= 1 && (
          <div className="card fade-up" style={{ borderLeftColor: zodiac.balance.color, borderLeftWidth:2 }}>
            <p className="label-sm" style={{ color:'rgba(100,160,240,0.6)' }}>Balance</p>
            <p className="big-label">{zodiac.balance.label}</p>
            <p className="body-text italic-text">{zodiac.balance.desc}</p>
            {stage === 'balance' && (
              <button className="reveal-btn" style={{ marginTop:'1.25rem' }} onClick={() => flareTrait(zodiac.balance.color, 'weakness')}>
                Ignite · Reveal Weakness
              </button>
            )}
          </div>
        )}

        {/* WEAKNESS */}
        {stageIndex >= 2 && (
          <div className="card fade-up" style={{ borderLeftColor: zodiac.weakness.color, borderLeftWidth:2 }}>
            <p className="label-sm" style={{ color:'rgba(240,100,100,0.6)' }}>Weakness</p>
            <p className="big-label">{zodiac.weakness.label}</p>
            <p className="body-text italic-text">{zodiac.weakness.desc}</p>
            {stage === 'weakness' && (
              <button className="reveal-btn" style={{ marginTop:'1.25rem' }} onClick={() => flareTrait(zodiac.weakness.color, 'hue1')}>
                Ignite · Generate First Hue
              </button>
            )}
          </div>
        )}

        {/* HUE 1 */}
        {stageIndex >= 3 && (
          <div className="card fade-up">
            <p className="label-sm">Hue 1 · Aura Spectrum</p>
            <div className="hue-row">
              <div className="hue-mini" style={{ background:zodiac.strength.color, opacity:0.7 }} title="Strength" />
              <div className="hue-mini" style={{ background:zodiac.balance.color,  opacity:0.7 }} title="Balance" />
              <div className="hue-mini" style={{ background:zodiac.weakness.color, opacity:0.7 }} title="Weakness" />
            </div>
            <div className="color-swatch" style={{ background:`linear-gradient(135deg, ${zodiac.strength.color}, ${hue1}, ${zodiac.weakness.color})`, marginBottom:'1rem' }} />
            <p className="body-text italic-text">
              Three forces—your strength, your balance, your shadow—woven through the weight of your exact birth moment. This frequency is yours alone.
            </p>
            {stage === 'hue1' && (
              <button className="reveal-btn" style={{ marginTop:'1.25rem' }} onClick={() => { setStage('hue2'); }}>
                Generate Second Hue
              </button>
            )}
          </div>
        )}

        {/* HUE 2 */}
        {stageIndex >= 4 && (
          <div className="card fade-up">
            <p className="label-sm">Hue 2 · Birthstone · {stone.name}</p>
            <div className="hue-row">
              <div>
                <p style={{ fontFamily:'"Cinzel",serif', fontSize:'0.55rem', letterSpacing:'0.15em', color:'rgba(232,224,208,0.3)', marginBottom:'0.4rem' }}>SHADOW</p>
                <div style={{ width:80, height:80, background:stone.shadow, borderRadius:2 }} />
              </div>
              <div>
                <p style={{ fontFamily:'"Cinzel",serif', fontSize:'0.55rem', letterSpacing:'0.15em', color:'rgba(232,224,208,0.3)', marginBottom:'0.4rem' }}>LIGHT</p>
                <div style={{ width:80, height:80, background:stone.light, borderRadius:2 }} />
              </div>
              <div>
                <p style={{ fontFamily:'"Cinzel",serif', fontSize:'0.55rem', letterSpacing:'0.15em', color:'rgba(232,224,208,0.3)', marginBottom:'0.4rem' }}>BALANCE</p>
                <div style={{ width:80, height:80, background:stone.base, borderRadius:2 }} />
              </div>
            </div>
            <div className="divider" />
            <div className="color-swatch" style={{ background:`linear-gradient(135deg, ${stone.shadow}, ${hue2}, ${stone.light})`, marginBottom:'1rem' }} />
            <p className="body-text italic-text">
              {stone.name}—the stone of your birth month—carries its own spectrum. Shadow, light, and balance collapse into your second hue.
            </p>
            {stage === 'hue2' && (
              <button className="reveal-btn" style={{ marginTop:'1.25rem' }} onClick={() => { setStage('hue3'); }}>
                Generate Third Hue
              </button>
            )}
          </div>
        )}

        {/* HUE 3 */}
        {stageIndex >= 5 && (
          <div className="card fade-up">
            <p className="label-sm">Hue 3 · Wildcard Stones</p>
            <div className="hue-row">
              <div title="Moldavite">
                <div style={{ width:80, height:80, background:WILDCARD.moldavite.hex, borderRadius:2, border:'1px solid rgba(255,255,255,0.1)' }} />
                <p style={{ fontFamily:'"Cinzel",serif', fontSize:'0.5rem', letterSpacing:'0.1em', color:'rgba(232,224,208,0.3)', marginTop:'0.4rem', textAlign:'center' }}>MOLDAVITE</p>
              </div>
              <div title="Clear Quartz">
                <div style={{ width:80, height:80, background:WILDCARD.clearQuartz.hex, borderRadius:2, border:'1px solid rgba(255,255,255,0.15)' }} />
                <p style={{ fontFamily:'"Cinzel",serif', fontSize:'0.5rem', letterSpacing:'0.1em', color:'rgba(232,224,208,0.3)', marginTop:'0.4rem', textAlign:'center' }}>CLEAR QUARTZ</p>
              </div>
              <div title="Black Tourmaline">
                <div style={{ width:80, height:80, background:WILDCARD.blackTourmaline.hex, borderRadius:2, border:'1px solid rgba(255,255,255,0.08)' }} />
                <p style={{ fontFamily:'"Cinzel",serif', fontSize:'0.5rem', letterSpacing:'0.1em', color:'rgba(232,224,208,0.3)', marginTop:'0.4rem', textAlign:'center' }}>TOURMALINE</p>
              </div>
            </div>
            <div className="divider" />
            <div className="color-swatch" style={{ background:`linear-gradient(135deg, ${WILDCARD.moldavite.hex}, ${hue3}, ${WILDCARD.clearQuartz.hex})`, marginBottom:'1rem' }} />
            <p className="body-text italic-text">
              Translucent, transparent, opaque. The three states of matter rendered as stone. Together they seal and complete your spectrum.
            </p>
            {stage === 'hue3' && (
              <button className="reveal-btn" style={{ marginTop:'1.25rem' }} onClick={() => setStage('capture')}>
                Complete My Reading
              </button>
            )}
          </div>
        )}

        {/* EMAIL CAPTURE */}
        {stage === 'capture' && !submitted && (
          <div className="card fade-up" style={{ borderColor:'rgba(255,200,100,0.2)' }}>
            {/* Blurred teaser */}
            <div className="blur-teaser" style={{ marginBottom:'1.5rem', padding:'1rem', background:'rgba(255,255,255,0.02)', borderRadius:2 }}>
              <p className="label-sm">Full Spectrum Reading</p>
              <p className="body-text" style={{ fontSize:'0.9rem', lineHeight:1.6 }}>
                Your three hues form a complete energetic portrait. The intersection of {zodiac.name}'s {zodiac.strength.label.toLowerCase()} nature, the {stone.name}'s crystalline memory, and the cosmic alignment of your birth moment creates a reading of unusual depth. Your dominant frequency sits in the ████████ range, suggesting ████████████████████████████...
              </p>
            </div>

            <div className="divider" />

            <p className="label-sm" style={{ textAlign:'center', marginBottom:'1rem' }}>Receive Your Full Reading · Free</p>
            <p className="body-text italic-text" style={{ textAlign:'center', marginBottom:'1.5rem', fontSize:'0.95rem' }}>
              Enter your email and we'll send your complete AuraSpanse reading.
            </p>

            {/* Three hue preview */}
            <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
              <div style={{ flex:1, height:8, background:hue1, borderRadius:1 }} />
              <div style={{ flex:1, height:8, background:hue2, borderRadius:1 }} />
              <div style={{ flex:1, height:8, background:hue3, borderRadius:1 }} />
            </div>

            <form onSubmit={handleEmailSubmit} style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <input
                type="email"
                className="email-input"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={!email || submitting} className="submit-btn">
                {submitting ? 'Sending...' : 'Send My Reading'}
              </button>
            </form>
          </div>
        )}

        {/* SUCCESS */}
        {submitted && (
          <div className="card fade-up" style={{ textAlign:'center', borderColor:'rgba(255,200,100,0.3)' }}>
            <div style={{ marginBottom:'1rem' }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin:'0 auto' }}>
                <circle cx="20" cy="20" r="18" stroke="rgba(255,200,100,0.5)" strokeWidth="0.5" />
                <path d="M12 20 L18 26 L28 14" stroke="#f0d080" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <p className="big-label">Reading Sent</p>
            <p className="body-text italic-text" style={{ fontSize:'0.95rem' }}>
              Your AuraSpanse reading is on its way to {email}.
            </p>
            <div style={{ display:'flex', gap:'0.5rem', margin:'1.5rem 0' }}>
              <div style={{ flex:1, height:6, background:hue1, borderRadius:1 }} />
              <div style={{ flex:1, height:6, background:hue2, borderRadius:1 }} />
              <div style={{ flex:1, height:6, background:hue3, borderRadius:1 }} />
            </div>
            <button className="reveal-btn" onClick={() => router.replace('/')}>Begin Another Reading</button>
          </div>
        )}

      </div>
    </main>
  );
}
