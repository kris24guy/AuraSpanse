import { useState, useEffect } from "react";

// ─── Constants ──────────────────────────────────────────────────────────────

const SCAN_MSGS = [
  "Attuning to your electromagnetic signature...",
  "Reading vibrational layers across the chakric spectrum...",
  "Consulting the ancient library of color wisdom...",
  "Translating light frequencies into living language...",
  "Channeling archetypes from the collective unconscious...",
  "Weaving the luminous threads of your soul's story...",
  "Synthesizing your unique auric constellation...",
];

function makeStars(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    left: +(Math.random() * 100).toFixed(2),
    top: +(Math.random() * 100).toFixed(2),
    size: +(Math.random() * 2 + 0.5).toFixed(1),
    dur: +(Math.random() * 3 + 2).toFixed(1),
    delay: +(Math.random() * 6).toFixed(1),
  }));
}
const STARS = makeStars(160);

const GLOBAL_CSS = `
  @keyframes twinkle {
    0%,100%{opacity:.18}
    50%{opacity:.95}
  }
  @keyframes breathe {
    0%,100%{transform:scale(1)}
    50%{transform:scale(1.07)}
  }
  @keyframes ringOut {
    0%{transform:scale(.88);opacity:.55}
    100%{transform:scale(1.65);opacity:0}
  }
  @keyframes floatY {
    0%,100%{transform:translateY(0)}
    50%{transform:translateY(-14px)}
  }
  @keyframes shimmerGold {
    0%{background-position:0% 50%}
    50%{background-position:100% 50%}
    100%{background-position:0% 50%}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(22px)}
    to{opacity:1;transform:translateY(0)}
  }
  @keyframes spinCW {
    from{transform:rotate(0deg)}
    to{transform:rotate(360deg)}
  }
  @keyframes spinCCW {
    from{transform:rotate(0deg)}
    to{transform:rotate(-360deg)}
  }
  @keyframes hueShift {
    0%,100%{filter:hue-rotate(0deg)}
    50%{filter:hue-rotate(200deg)}
  }

  .aura-input {
    width:100%;
    background:rgba(255,255,255,.04);
    border:1px solid rgba(168,85,247,.3);
    border-radius:10px;
    padding:13px 18px;
    color:#ede8ff;
    font-family:'Crimson Pro',Georgia,serif;
    font-size:1.05rem;
    outline:none;
    transition:border-color .3s,box-shadow .3s;
    box-sizing:border-box;
  }
  .aura-input::placeholder{color:rgba(185,155,255,.32)}
  .aura-input:focus{
    border-color:rgba(168,85,247,.7);
    box-shadow:0 0 0 3px rgba(168,85,247,.12),0 0 28px rgba(168,85,247,.07);
  }

  .btn-reveal {
    background:linear-gradient(135deg,#5b21b6,#8b5cf6,#c026d3);
    border:none;border-radius:50px;
    padding:15px 52px;color:#fff;
    font-family:'Cinzel',serif;
    font-size:.86rem;letter-spacing:.2em;
    cursor:pointer;text-transform:uppercase;
    transition:transform .2s,box-shadow .2s;
    box-shadow:0 4px 30px rgba(91,33,182,.5);
  }
  .btn-reveal:hover{transform:translateY(-2px);box-shadow:0 8px 40px rgba(91,33,182,.65)}

  .btn-email {
    background:linear-gradient(135deg,#064e3b,#059669,#10b981);
    border:none;border-radius:50px;
    padding:14px 44px;color:#fff;
    font-family:'Cinzel',serif;
    font-size:.82rem;letter-spacing:.16em;
    cursor:pointer;text-transform:uppercase;
    transition:transform .2s,box-shadow .2s;
    box-shadow:0 4px 26px rgba(5,150,105,.38);
  }
  .btn-email:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(5,150,105,.55)}

  .btn-ghost {
    background:none;
    border:1px solid rgba(168,85,247,.22);
    border-radius:50px;padding:10px 30px;
    color:rgba(195,165,255,.45);
    font-family:'Cinzel',serif;
    font-size:.7rem;letter-spacing:.18em;
    cursor:pointer;text-transform:uppercase;
    transition:all .25s;
  }
  .btn-ghost:hover{color:rgba(195,165,255,.9);border-color:rgba(168,85,247,.5)}

  .hue-card {
    background:rgba(255,255,255,.03);
    border-radius:18px;
    padding:28px 22px;
    transition:transform .3s;
    backdrop-filter:blur(10px);
  }
  .hue-card:hover{transform:translateY(-5px)}
`;

// ─── Sub-components ──────────────────────────────────────────────────────────

function StarField() {
  return (
    <div style={{ position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden" }}>
      {STARS.map(s => (
        <div key={s.id} style={{
          position:"absolute",
          left:`${s.left}%`, top:`${s.top}%`,
          width:`${s.size}px`, height:`${s.size}px`,
          borderRadius:"50%", background:"white",
          animation:`twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

function Geo({ top="6%", right="4%", size=190, speed=42, color="#a855f7", dir="CW" }) {
  return (
    <div style={{
      position:"absolute", top, right,
      width:size, height:size, opacity:.055,
      animation:`spin${dir} ${speed}s linear infinite`,
      pointerEvents:"none",
    }}>
      <svg viewBox="0 0 200 200" fill="none" stroke={color} strokeWidth="0.6">
        <circle cx="100" cy="100" r="92"/>
        <circle cx="100" cy="100" r="60"/>
        <circle cx="100" cy="100" r="28"/>
        {[0,60,120,180,240,300].map(a=>(
          <line key={a} x1="100" y1="8" x2="100" y2="192" transform={`rotate(${a} 100 100)`}/>
        ))}
        <polygon points="100,14 183,158 17,158"/>
        <polygon points="100,186 17,42 183,42"/>
      </svg>
    </div>
  );
}

function Orb({ color, size=140, rings=2, delay=0 }) {
  return (
    <div style={{ position:"relative", width:size, height:size, margin:"0 auto" }}>
      {Array.from({length:rings}).map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          inset:`-${(i+1)*20}px`,
          borderRadius:"50%",
          border:`1px solid ${color}`,
          opacity:.3,
          animation:`ringOut ${2.5+i*.8}s ${delay+i*.9}s ease-out infinite`,
        }}/>
      ))}
      <div style={{
        width:"100%", height:"100%",
        borderRadius:"50%",
        background:`radial-gradient(circle at 38% 34%, ${color}ff, ${color}99, ${color}22)`,
        boxShadow:`0 0 42px ${color}55, 0 0 90px ${color}28`,
        animation:"breathe 3.2s ease-in-out infinite",
      }}/>
      <div style={{
        position:"absolute", inset:"18%",
        borderRadius:"50%",
        background:"radial-gradient(circle at 40% 40%, rgba(255,255,255,.28), transparent)",
        pointerEvents:"none",
      }}/>
    </div>
  );
}

function Divider({ anim="fadeUp 1s .8s ease both" }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:14,
      margin:"50px auto", maxWidth:520,
      animation: anim,
    }}>
      <div style={{flex:1,height:1,background:"linear-gradient(to right,transparent,rgba(168,85,247,.3))"}}/>
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" stroke="rgba(168,85,247,.44)" strokeWidth=".7">
        <circle cx="20" cy="20" r="17"/>
        <circle cx="20" cy="20" r="7"/>
        {[0,60,120,180,240,300].map(a=>(
          <line key={a} x1="20" y1="3" x2="20" y2="37" transform={`rotate(${a} 20 20)`}/>
        ))}
      </svg>
      <div style={{flex:1,height:1,background:"linear-gradient(to left,transparent,rgba(168,85,247,.3))"}}/>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AuraReader() {
  const [screen, setScreen]       = useState("intro");
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [auraData, setAuraData]   = useState(null);
  const [scanPct, setScanPct]     = useState(0);
  const [msgIdx, setMsgIdx]       = useState(0);
  const [error, setError]         = useState("");
  const [emailStatus, setEmailStatus] = useState("");

  // Inject fonts + CSS once
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  // ── Generate ──────────────────────────────────────────────────────────────
  const generate = async () => {
    if (!name.trim())  { setError("Please enter your name to begin your reading."); return; }
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }
    setError(""); setScreen("scanning"); setScanPct(0); setMsgIdx(0);

    const prog = setInterval(() => setScanPct(p => p < 87 ? Math.min(p + Math.random()*9 + 2, 87) : p), 700);
    const msg  = setInterval(() => setMsgIdx(i => (i+1) % SCAN_MSGS.length), 2200);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1600,
          system: `You are the Universe's Eternal Aura Oracle — a mystical intelligence versed in chromotherapy, synesthesia, sacred geometry, quantum frequency science, the chakra system, Ayurvedic doshas, Chinese Five Elements, color psychology, Jungian archetypes, numerology, astrology, Kabbalah, Sufi traditions, shamanic lineages, and every mystical and scientific tradition that humanity has ever produced. You perceive the invisible electromagnetic spectrum of human consciousness through color, light, and vibration. Your readings are poetic, intimate, and deeply personal.`,
          messages: [{
            role: "user",
            content: `Generate a full living aura reading for ${name}.

Return ONLY valid JSON — no markdown, no backticks, no commentary whatsoever:
{
  "subHues": [
    {
      "name": "unique 2-3 word poetic hue name (e.g. Twilight Ember Amber, Void Pearl Indigo, Sacred Storm Viridian, Solstice Ash Vermilion)",
      "hex": "#rich saturated hex",
      "emotion": "1-3 word primary emotion",
      "frequency": "integer Hz between 200 and 780",
      "element": "one of: Fire, Water, Earth, Air, Ether, Plasma, Void, Starlight, Storm, Crystal, Thunder, Mist",
      "description": "4 deeply mystical personal sentences for ${name} — weave emotion, archetype, cosmic symbolism, spiritual insight specific to this color frequency. Be intimate and revelatory."
    },
    { "name":"...", "hex":"...", "emotion":"...", "frequency":"...", "element":"...", "description":"..." },
    { "name":"...", "hex":"...", "emotion":"...", "frequency":"...", "element":"...", "description":"..." }
  ],
  "finalHue": {
    "name": "unique 2-4 word signature aura name for ${name}",
    "hex": "#hex that harmonizes the three sub-hues",
    "description": "3 sentences on ${name}'s blended aura essence and life-path significance"
  },
  "aurascope": "6 intimate cosmic poetic sentences — ${name}'s personal aurascope. Weave time cycles, relationships, creative gifts, spiritual awakening, and a glimpse of the near future.",
  "mantra": "exactly 8-12 words — a powerful sacred mantra for ${name}"
}`
          }]
        })
      });

      clearInterval(prog); clearInterval(msg); setScanPct(100);

      const data = await res.json();
      const raw = data.content.filter(b => b.type==="text").map(b => b.text).join("");
      const cleaned = raw.replace(/```json\s*/gi,"").replace(/```/g,"").trim();

      let parsed;
      try { parsed = JSON.parse(cleaned); }
      catch {
        const m = cleaned.match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
        else throw new Error("parse failed");
      }

      setAuraData(parsed);
      setTimeout(() => setScreen("results"), 1100);

    } catch {
      clearInterval(prog); clearInterval(msg);
      setError("The cosmic connection was disrupted. Please try again.");
      setScreen("intro");
    }
  };

  // ── Send Email ────────────────────────────────────────────────────────────
  const sendEmail = () => {
    if (!auraData) return;
    const { subHues, finalHue, aurascope, mantra } = auraData;
    const ln = "\n";
    const bar = "═".repeat(52);
    const body = [
      "✦  YOUR LIVING AURA READING  ✦",
      `Channeled for: ${name}`, ln,
      bar, "THREE AURIC SUB-FREQUENCIES", bar, ln,
      `◈  ${subHues[0].name.toUpperCase()}`,
      `    ${subHues[0].frequency} Hz  ·  ${subHues[0].element}  ·  ${subHues[0].emotion}`, ln,
      `    ${subHues[0].description}`, ln,
      `◈  ${subHues[1].name.toUpperCase()}`,
      `    ${subHues[1].frequency} Hz  ·  ${subHues[1].element}  ·  ${subHues[1].emotion}`, ln,
      `    ${subHues[1].description}`, ln,
      `◈  ${subHues[2].name.toUpperCase()}`,
      `    ${subHues[2].frequency} Hz  ·  ${subHues[2].element}  ·  ${subHues[2].emotion}`, ln,
      `    ${subHues[2].description}`, ln,
      bar, `YOUR SIGNATURE AURA: ${finalHue.name.toUpperCase()}`, bar, ln,
      finalHue.description, ln,
      bar, "YOUR AURASCOPE", bar, ln,
      aurascope, ln,
      bar, "YOUR SACRED MANTRA", bar, ln,
      `"${mantra}"`, ln,
      "✦  ✦  ✦",
      "Channeled through Aurascope — the living aura oracle",
    ].join("\n");

    const a = document.createElement("a");
    a.href = `mailto:${email}?subject=${encodeURIComponent(`✦ Your Aurascope: ${finalHue.name} — A Reading for ${name}`)}&body=${encodeURIComponent(body)}`;
    a.click();
    setEmailStatus("✦ Opening your email client with the full reading...");
  };

  const reset = () => { setScreen("intro"); setAuraData(null); setScanPct(0); setEmailStatus(""); setError(""); };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const bg = {
    minHeight:"100vh",
    background:"radial-gradient(ellipse at 28% 22%, #1a0840 0%, #090220 38%, #030110 72%, #000 100%)",
    color:"#ede8ff",
    fontFamily:"'Crimson Pro',Georgia,serif",
    position:"relative",
    overflow:"hidden",
  };

  const goldText = {
    fontFamily:"'Cinzel Decorative',serif",
    background:"linear-gradient(135deg,#b8922c,#f0d060,#d4a84b,#f5e090,#b8922c)",
    backgroundSize:"300% 300%",
    WebkitBackgroundClip:"text",
    WebkitTextFillColor:"transparent",
    backgroundClip:"text",
    animation:"shimmerGold 5s ease infinite",
  };

  const label = {
    display:"block",
    fontFamily:"'Cinzel',serif",
    fontSize:".68rem",
    letterSpacing:".24em",
    color:"rgba(185,155,255,.4)",
    textTransform:"uppercase",
    marginBottom:8,
  };

  // ════════════════════════════════════════════════
  // INTRO
  // ════════════════════════════════════════════════
  if (screen === "intro") return (
    <div style={bg}>
      <StarField/>
      <Geo/>
      <div style={{
        position:"absolute",bottom:"14%",left:"3%",
        width:130,height:130,opacity:.045,
        animation:"spinCCW 55s linear infinite",
        pointerEvents:"none",
      }}>
        <svg viewBox="0 0 130 130" fill="none" stroke="#ec4899" strokeWidth=".5">
          <circle cx="65" cy="65" r="62"/>
          {[0,45,90,135,180,225,270,315].map(a=>(
            <line key={a} x1="65" y1="3" x2="65" y2="127" transform={`rotate(${a} 65 65)`}/>
          ))}
        </svg>
      </div>

      <div style={{
        display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",
        minHeight:"100vh",padding:"40px 20px",
        position:"relative",zIndex:2,
      }}>
        {/* Primer orb */}
        <div style={{ animation:"floatY 4.5s ease-in-out infinite", marginBottom:38 }}>
          <div style={{ position:"relative",width:172,height:172 }}>
            {[0,1,2].map(i=>(
              <div key={i} style={{
                position:"absolute",
                inset:`-${(i+1)*17}px`,
                borderRadius:"50%",
                border:`1px solid rgba(168,85,247,${.38-i*.1})`,
                animation:`ringOut ${2.2+i*.9}s ${i*.8}s ease-out infinite`,
              }}/>
            ))}
            <div style={{
              width:"100%",height:"100%",borderRadius:"50%",
              background:"conic-gradient(from 0deg,#5b21b6,#8b5cf6,#c026d3,#f59e0b,#10b981,#06b6d4,#3b82f6,#5b21b6)",
              animation:"breathe 3.5s ease-in-out infinite, hueShift 14s ease-in-out infinite",
              boxShadow:"0 0 70px rgba(139,92,246,.55),0 0 130px rgba(139,92,246,.22)",
              filter:"blur(1.2px)",
            }}/>
            <div style={{
              position:"absolute",inset:"19%",borderRadius:"50%",
              background:"radial-gradient(circle at 40% 40%,rgba(255,255,255,.3),transparent)",
            }}/>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ ...goldText, fontSize:"clamp(2.1rem,6vw,4rem)", letterSpacing:".14em", margin:0, marginBottom:10 }}>
          AURASCOPE
        </h1>
        <p style={{
          fontFamily:"'Cinzel',serif",
          fontSize:"clamp(.65rem,2vw,.82rem)",
          letterSpacing:".28em",
          color:"rgba(180,150,255,.5)",
          textTransform:"uppercase",
          marginBottom:28,
          textAlign:"center",
        }}>
          A living reading of your electromagnetic soul signature
        </p>

        {/* Rule */}
        <div style={{
          display:"flex",alignItems:"center",gap:12,
          width:"100%",maxWidth:440,marginBottom:28,
        }}>
          <div style={{flex:1,height:1,background:"linear-gradient(to right,transparent,rgba(168,85,247,.4))"}}/>
          <span style={{color:"rgba(168,85,247,.5)",fontSize:16}}>✦</span>
          <div style={{flex:1,height:1,background:"linear-gradient(to left,transparent,rgba(168,85,247,.4))"}}/>
        </div>

        {/* Inputs */}
        <div style={{width:"100%",maxWidth:440,display:"flex",flexDirection:"column",gap:18}}>
          <div>
            <label style={label}>Your Name</label>
            <input className="aura-input" type="text"
              placeholder="The name your soul answers to..."
              value={name} onChange={e=>{setName(e.target.value);setError("");}}
              onKeyDown={e=>e.key==="Enter"&&generate()}
            />
          </div>
          <div>
            <label style={label}>Email Address</label>
            <input className="aura-input" type="email"
              placeholder="Where shall we send your reading..."
              value={email} onChange={e=>{setEmail(e.target.value);setError("");}}
              onKeyDown={e=>e.key==="Enter"&&generate()}
            />
          </div>

          {error && (
            <p style={{color:"#f87171",fontSize:".88rem",textAlign:"center",fontStyle:"italic"}}>
              {error}
            </p>
          )}

          <button className="btn-reveal" onClick={generate} style={{marginTop:6,alignSelf:"center"}}>
            Reveal My Aura
          </button>
        </div>

        <p style={{
          marginTop:46,fontSize:".76rem",fontStyle:"italic",
          color:"rgba(180,150,255,.22)",textAlign:"center",
          letterSpacing:".06em",maxWidth:380,
        }}>
          Channeled from chromotherapy, quantum frequency science, chakra wisdom & the ancient knowledge of light
        </p>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════
  // SCANNING
  // ════════════════════════════════════════════════
  if (screen === "scanning") return (
    <div style={{...bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <StarField/>
      <div style={{textAlign:"center",position:"relative",zIndex:2,padding:"40px 20px"}}>

        {/* Scanning orb */}
        <div style={{position:"relative",width:280,height:280,margin:"0 auto 50px"}}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{
              position:"absolute",
              inset:`-${i*28}px`,
              borderRadius:"50%",
              border:`${i===0?1.5:1}px ${i%2===0?"solid":"dashed"} rgba(168,85,247,${.52-i*.11})`,
              animation:`${i%2===0?"spinCW":"spinCCW"} ${10+i*6}s linear infinite`,
            }}/>
          ))}
          <div style={{
            width:"100%",height:"100%",borderRadius:"50%",
            background:"conic-gradient(from 0deg,#5b21b6,#8b5cf6,#c026d3,#f59e0b,#10b981,#06b6d4,#3b82f6,#5b21b6)",
            animation:"breathe 2s ease-in-out infinite,hueShift 9s ease-in-out infinite",
            boxShadow:"0 0 110px rgba(139,92,246,.65),0 0 220px rgba(139,92,246,.28)",
            filter:"blur(2px)",
          }}/>
          <div style={{
            position:"absolute",inset:"22%",borderRadius:"50%",
            background:"radial-gradient(circle at 42% 40%,rgba(255,255,255,.42),transparent)",
            animation:"breathe 2s ease-in-out infinite",
          }}/>
        </div>

        <h2 style={{
          fontFamily:"'Cinzel',serif",
          fontSize:"clamp(.98rem,3vw,1.3rem)",
          letterSpacing:".1em",
          color:"rgba(200,170,255,.9)",
          marginBottom:10,
        }}>
          Reading Your Aura, {name}
        </h2>

        <p style={{
          fontStyle:"italic",
          color:"rgba(180,150,255,.48)",
          fontSize:".92rem",
          marginBottom:50,
          minHeight:26,
        }}>
          {SCAN_MSGS[msgIdx]}
        </p>

        <div style={{width:320,maxWidth:"80vw",margin:"0 auto"}}>
          <div style={{height:3,background:"rgba(168,85,247,.13)",borderRadius:99,overflow:"hidden"}}>
            <div style={{
              height:"100%",
              width:`${scanPct}%`,
              background:"linear-gradient(90deg,#5b21b6,#8b5cf6,#c026d3)",
              borderRadius:99,
              transition:"width .6s ease",
            }}/>
          </div>
          <p style={{
            marginTop:9,fontFamily:"'Cinzel',serif",
            fontSize:".66rem",letterSpacing:".22em",
            color:"rgba(168,85,247,.42)",textAlign:"right",
          }}>
            {Math.round(scanPct)}%
          </p>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════
  // RESULTS
  // ════════════════════════════════════════════════
  if (screen === "results" && auraData) {
    const { subHues, finalHue, aurascope, mantra } = auraData;

    return (
      <div style={bg}>
        <StarField/>
        <Geo/>

        <div style={{
          maxWidth:940,margin:"0 auto",
          padding:"clamp(38px,5vw,68px) clamp(16px,4vw,46px)",
          position:"relative",zIndex:2,
        }}>

          {/* Header */}
          <div style={{textAlign:"center",marginBottom:54,animation:"fadeUp .9s ease"}}>
            <p style={{
              fontFamily:"'Cinzel',serif",fontSize:".66rem",
              letterSpacing:".34em",color:"rgba(180,150,255,.36)",
              textTransform:"uppercase",marginBottom:10,
            }}>The Living Aura of</p>
            <h1 style={{...goldText,fontSize:"clamp(1.8rem,4.5vw,3.2rem)",margin:"0 0 8px"}}>
              {name}
            </h1>
            <p style={{
              fontStyle:"italic",color:"rgba(180,150,255,.38)",
              fontSize:".87rem",letterSpacing:".08em",
            }}>
              Three cosmic sub-frequencies converge into your signature aura
            </p>
          </div>

          {/* Three Hue Cards */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
            gap:20,
          }}>
            {subHues.map((h, i) => (
              <div key={i} className="hue-card" style={{
                border:`1px solid ${h.hex}42`,
                boxShadow:`0 0 34px ${h.hex}1c,inset 0 0 22px ${h.hex}09`,
                animation:`fadeUp ${.9+i*.22}s ease both`,
              }}>
                <div style={{marginBottom:22}}>
                  <Orb color={h.hex} size={90} rings={2} delay={i*.4}/>
                </div>

                <h3 style={{
                  fontFamily:"'Cinzel',serif",
                  fontSize:".96rem",letterSpacing:".07em",
                  color:h.hex,
                  textShadow:`0 0 24px ${h.hex}72`,
                  textAlign:"center",marginBottom:14,
                }}>
                  {h.name}
                </h3>

                <div style={{
                  display:"flex",justifyContent:"center",
                  gap:7,flexWrap:"wrap",marginBottom:18,
                }}>
                  {[
                    [h.element, h.hex],
                    [`${h.frequency} Hz`, "#9333ea"],
                    [h.emotion, "#db2777"],
                  ].map(([lbl,c])=>(
                    <span key={lbl} style={{
                      padding:"3px 11px",borderRadius:99,
                      border:`1px solid ${c}36`,color:c,
                      fontSize:".67rem",
                      fontFamily:"'Cinzel',serif",letterSpacing:".1em",
                      background:`${c}0f`,
                    }}>{lbl}</span>
                  ))}
                </div>

                <p style={{
                  fontSize:".93rem",lineHeight:1.82,
                  color:"rgba(210,192,255,.7)",
                  fontStyle:"italic",
                }}>
                  {h.description}
                </p>
              </div>
            ))}
          </div>

          <Divider anim="fadeUp 1s 1.1s ease both"/>

          {/* Final Aura */}
          <div style={{textAlign:"center",marginBottom:54,animation:"fadeUp 1.5s ease both"}}>
            <p style={{
              fontFamily:"'Cinzel',serif",fontSize:".66rem",
              letterSpacing:".34em",color:"rgba(180,150,255,.36)",
              textTransform:"uppercase",marginBottom:30,
            }}>Your Signature Aura</p>

            <div style={{marginBottom:28}}>
              <Orb color={finalHue.hex} size={175} rings={3}/>
            </div>

            <h2 style={{
              fontFamily:"'Cinzel Decorative',serif",
              fontSize:"clamp(1.1rem,3vw,2rem)",
              color:finalHue.hex,
              textShadow:`0 0 40px ${finalHue.hex}84`,
              marginBottom:18,letterSpacing:".07em",
            }}>
              {finalHue.name}
            </h2>

            <p style={{
              maxWidth:590,margin:"0 auto",
              fontSize:"1.05rem",lineHeight:1.88,
              color:"rgba(215,200,255,.72)",
              fontStyle:"italic",
            }}>
              {finalHue.description}
            </p>
          </div>

          {/* Aurascope */}
          <div style={{
            background:"rgba(139,92,246,.06)",
            border:"1px solid rgba(139,92,246,.2)",
            borderRadius:18,
            padding:"clamp(24px,4vw,44px)",
            marginBottom:28,
            animation:"fadeUp 1.8s ease both",
          }}>
            <p style={{
              fontFamily:"'Cinzel',serif",fontSize:".66rem",
              letterSpacing:".34em",color:"rgba(180,150,255,.36)",
              textTransform:"uppercase",marginBottom:20,textAlign:"center",
            }}>Your Aurascope</p>
            <p style={{
              fontSize:"clamp(1rem,2.5vw,1.1rem)",lineHeight:1.98,
              color:"rgba(215,205,255,.8)",
              fontStyle:"italic",textAlign:"center",
            }}>
              {aurascope}
            </p>
          </div>

          {/* Mantra */}
          <div style={{
            background:"linear-gradient(135deg,rgba(176,136,56,.07),rgba(230,185,80,.04))",
            border:"1px solid rgba(176,136,56,.22)",
            borderRadius:12,
            padding:"20px 32px",
            marginBottom:46,textAlign:"center",
            animation:"fadeUp 2s ease both",
          }}>
            <p style={{
              fontFamily:"'Cinzel',serif",fontSize:".64rem",
              letterSpacing:".28em",color:"rgba(176,136,56,.42)",
              textTransform:"uppercase",marginBottom:10,
            }}>Your Sacred Mantra</p>
            <p style={{
              fontFamily:"'Cinzel',serif",
              fontSize:"clamp(.88rem,2.2vw,1.05rem)",
              letterSpacing:".09em",
              color:"rgba(232,188,84,.85)",
              fontStyle:"italic",
            }}>
              "{mantra}"
            </p>
          </div>

          {/* Actions */}
          <div style={{
            display:"flex",flexDirection:"column",
            alignItems:"center",gap:16,
            animation:"fadeUp 2.2s ease both",
          }}>
            <button className="btn-email" onClick={sendEmail}>
              ✦ Send Reading to My Email
            </button>

            {emailStatus && (
              <p style={{
                color:"rgba(52,211,153,.75)",
                fontSize:".88rem",fontStyle:"italic",
                animation:"fadeUp .4s ease",
              }}>
                {emailStatus}
              </p>
            )}

            <button className="btn-ghost" onClick={reset}>
              Begin a New Reading
            </button>
          </div>

          <p style={{
            textAlign:"center",marginTop:66,
            fontSize:".74rem",color:"rgba(180,150,255,.17)",
            fontStyle:"italic",letterSpacing:".07em",
          }}>
            Channeled through chromotherapy, frequency science & the ancient wisdom of light
          </p>
        </div>
      </div>
    );
  }

  return null;
}
