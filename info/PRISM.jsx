import { useState, useEffect, useRef } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

const WEIGHTS = {
  museum:     { crystal: 0.15, rarity: 0.10, provenance: 0.40, market: 0.05, aesthetics: 0.10, scientific: 0.20 },
  exhibition: { crystal: 0.30, rarity: 0.15, provenance: 0.10, market: 0.10, aesthetics: 0.25, scientific: 0.10 },
  collector:  { crystal: 0.30, rarity: 0.25, provenance: 0.10, market: 0.15, aesthetics: 0.15, scientific: 0.05 },
  study:      { crystal: 0.10, rarity: 0.15, provenance: 0.25, market: 0.05, aesthetics: 0.05, scientific: 0.40 },
  commercial: { crystal: 0.25, rarity: 0.20, provenance: 0.05, market: 0.35, aesthetics: 0.10, scientific: 0.05 },
};

const GRADES = [
  { min: 90, label: "Museum",     color: "#e8b840" },
  { min: 75, label: "Exhibition", color: "#90c0f0" },
  { min: 60, label: "Collector",  color: "#00c880" },
  { min: 45, label: "Study",      color: "#5090ff" },
  { min: 0,  label: "Commercial", color: "#506080" },
];

const CONTEXTS = [
  { key: "museum",     label: "Museum" },
  { key: "exhibition", label: "Exhibition" },
  { key: "collector",  label: "Collector" },
  { key: "study",      label: "Study" },
  { key: "commercial", label: "Commercial" },
];

const DIMS = [
  { key: "crystal",    label: "Crystal quality", short: "Crystal",   desc: "Symmetry, terminations, surface condition" },
  { key: "rarity",     label: "Rarity index",    short: "Rarity",    desc: "Species × locality frequency via Mindat" },
  { key: "provenance", label: "Provenance",       short: "Prov.",     desc: "Chain of custody, legal collection status" },
  { key: "market",     label: "Market price",     short: "Market",    desc: "Position vs. comparable realized sales" },
  { key: "aesthetics", label: "Aesthetics",       short: "Aesthet.",  desc: "Visual appeal, color, compositional balance" },
  { key: "scientific", label: "Scientific value", short: "Science",   desc: "Type locality status, research significance" },
];

export default function PRISM() {
  const [ctx, setCtx] = useState("collector");
  const [scores, setScores] = useState({
    crystal: 72, rarity: 65, provenance: 80, market: 58, aesthetics: 75, scientific: 45
  });
  const [spec, setSpec] = useState({ name: "", species: "", locality: "" });
  const [displayScore, setDisplayScore] = useState(68);
  const animRef = useRef(null);
  const prevRef = useRef(68);

  const W = WEIGHTS[ctx];
  const prismScore = Math.round(Object.entries(W).reduce((acc, [k, w]) => acc + scores[k] * w, 0));
  const grade = GRADES.find(g => prismScore >= g.min) || GRADES[4];

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const from = prevRef.current;
    const to = prismScore;
    prevRef.current = prismScore;
    const t0 = performance.now();
    const run = (t) => {
      const p = Math.min((t - t0) / 320, 1);
      setDisplayScore(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) animRef.current = requestAnimationFrame(run);
    };
    animRef.current = requestAnimationFrame(run);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [prismScore]);

  const radarData = DIMS.map(d => ({ dim: d.short, v: scores[d.key] }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input { outline: none; }
        input::placeholder { color: #1e3050; }
        input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; height: 18px; width: 100%; }
        input[type=range]::-webkit-slider-runnable-track { height: 3px; background: #0d1828; border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 13px; height: 13px; border-radius: 50%; background: #00d4ff; border: 2px solid #080c17; margin-top: -5px; cursor: pointer; transition: transform 0.1s; }
        input[type=range]:hover::-webkit-slider-thumb { transform: scale(1.25); }
        input[type=range]::-moz-range-track { height: 3px; background: #0d1828; border-radius: 2px; }
        input[type=range]::-moz-range-thumb { width: 11px; height: 11px; border-radius: 50%; background: #00d4ff; border: 2px solid #080c17; cursor: pointer; }
        .ctx-btn:hover { border-color: rgba(0,212,255,0.35) !important; color: #6ab0d8 !important; }
        .action-pri:hover { background: rgba(0,212,255,0.14) !important; }
        .action-sec:hover { border-color: #1e3050 !important; color: #3a5878 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080c17; }
        ::-webkit-scrollbar-thumb { background: #101a2c; border-radius: 2px; }
      `}</style>

      <div style={{ fontFamily: "'Exo 2', sans-serif", background: "#080c17", minHeight: "100vh", color: "#b8c8e0", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ borderBottom: "1px solid #101a2c", padding: "12px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#090d1c" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: "15px", color: "#00d4ff", letterSpacing: "0.1em" }}>PRISM</span>
            <span style={{ fontSize: "10px", color: "#1e3050", letterSpacing: "0.14em", textTransform: "uppercase" }}>Precision Rating Index · Specimen Minerals</span>
          </div>
          <div style={{ display: "flex", gap: "3px" }}>
            {CONTEXTS.map(c => (
              <button key={c.key} className="ctx-btn" onClick={() => setCtx(c.key)} style={{
                padding: "4px 11px", borderRadius: "3px",
                border: ctx === c.key ? "1px solid rgba(0,212,255,0.45)" : "1px solid #101a2c",
                background: ctx === c.key ? "rgba(0,212,255,0.08)" : "transparent",
                color: ctx === c.key ? "#00d4ff" : "#253550",
                fontSize: "10px", fontFamily: "'Exo 2', sans-serif",
                fontWeight: ctx === c.key ? 600 : 400,
                cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.15s",
              }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Two-panel body */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", flex: 1, minHeight: 0 }}>

          {/* Left: inputs */}
          <div style={{ padding: "20px 22px", borderRight: "1px solid #101a2c", overflowY: "auto" }}>

            {/* Specimen fields */}
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "8px", letterSpacing: "0.22em", color: "#1e3050", textTransform: "uppercase", marginBottom: "10px" }}>Specimen data</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
                {[
                  { k: "name",     ph: "Catalog no. / label name", col: "1 / -1" },
                  { k: "species",  ph: "Mineral species" },
                  { k: "locality", ph: "Locality" },
                ].map(f => (
                  <input key={f.k} value={spec[f.k]}
                    onChange={e => setSpec(s => ({ ...s, [f.k]: e.target.value }))}
                    placeholder={f.ph}
                    style={{
                      gridColumn: f.col || "auto",
                      background: "#0b1020", border: "1px solid #101a2c", borderRadius: "3px",
                      padding: "7px 10px", color: "#b8c8e0", fontSize: "12px",
                      fontFamily: "'Exo 2', sans-serif",
                    }} />
                ))}
              </div>
            </div>

            {/* Sub-score sliders */}
            <div style={{ fontSize: "8px", letterSpacing: "0.22em", color: "#1e3050", textTransform: "uppercase", marginBottom: "14px" }}>
              Sub-score inputs
              <span style={{ color: "rgba(0,212,255,0.45)", marginLeft: "6px" }}>· {ctx} weights active</span>
            </div>

            {DIMS.map(d => {
              const v = scores[d.key];
              const w = W[d.key];
              const contrib = (v * w).toFixed(1);
              const barColor = v >= 75 ? "#00c880" : v >= 50 ? "#00aed4" : "#405880";
              return (
                <div key={d.key} style={{ marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid #0c1422" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#c0d0e8" }}>{d.label}</span>
                      <span style={{ fontSize: "10px", color: "#1a2e48", marginLeft: "7px", fontStyle: "italic" }}>{d.desc}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginLeft: "10px" }}>
                      <span style={{ fontSize: "9px", color: "rgba(0,212,255,0.5)", letterSpacing: "0.06em" }}>wt {Math.round(w * 100)}%</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "17px", fontWeight: 600, color: barColor, minWidth: "28px", textAlign: "right", transition: "color 0.2s" }}>{v}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#253550", minWidth: "36px", textAlign: "right" }}>+{contrib}</span>
                    </div>
                  </div>
                  <div style={{ position: "relative", height: "3px", background: "#0d1828", borderRadius: "2px" }}>
                    <div style={{
                      position: "absolute", height: "100%", width: `${v}%`,
                      borderRadius: "2px", background: barColor, opacity: 0.65,
                      transition: "width 0.05s, background 0.2s",
                    }} />
                    {/* Weight marker */}
                    <div style={{
                      position: "absolute", width: "1px", height: "7px",
                      background: "rgba(0,212,255,0.35)", top: "-2px",
                      left: `${Math.round(w * 100)}%`,
                    }} />
                  </div>
                  <input type="range" min={0} max={100} value={v}
                    onChange={e => setScores(s => ({ ...s, [d.key]: +e.target.value }))} />
                </div>
              );
            })}

            {/* Running total */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: "8px", paddingTop: "4px" }}>
              <span style={{ fontSize: "9px", color: "#1e3050", letterSpacing: "0.1em", textTransform: "uppercase" }}>Running total</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "22px", fontWeight: 600, color: grade.color, transition: "color 0.3s" }}>{displayScore}</span>
            </div>
          </div>

          {/* Right: output */}
          <div style={{ padding: "18px 16px", background: "#080c17", display: "flex", flexDirection: "column", gap: "15px", overflowY: "auto" }}>

            {/* Score card */}
            <div style={{
              textAlign: "center", padding: "20px 14px 16px",
              background: "#090d1c", borderRadius: "5px",
              border: `1px solid ${grade.color}15`, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${grade.color}07, transparent 60%)`, pointerEvents: "none" }} />
              <div style={{ fontSize: "8px", letterSpacing: "0.22em", color: "#1e3050", textTransform: "uppercase", marginBottom: "4px" }}>PRISM score</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "58px", fontWeight: 600, lineHeight: 1, color: grade.color, transition: "color 0.3s" }}>
                {displayScore}
              </div>
              <div style={{ fontSize: "9px", color: "#1e3050", marginBottom: "12px" }}>/ 100</div>
              <div style={{
                display: "inline-block", padding: "4px 12px", borderRadius: "2px",
                border: `1px solid ${grade.color}30`, background: `${grade.color}0a`,
                color: grade.color, fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
              }}>
                {grade.label} Grade
              </div>

              {/* Grade spectrum bar */}
              <div style={{ display: "flex", gap: "2px", marginTop: "12px" }}>
                {[...GRADES].reverse().map(g => (
                  <div key={g.label} title={`${g.label} (${g.min}+)`} style={{
                    flex: 1, height: "3px", borderRadius: "1px",
                    background: prismScore >= g.min ? g.color : `${g.color}18`,
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                <span style={{ fontSize: "8px", color: "#1e3050" }}>Comm.</span>
                <span style={{ fontSize: "8px", color: "#1e3050" }}>Museum</span>
              </div>
            </div>

            {/* Radar chart */}
            <div>
              <div style={{ fontSize: "8px", letterSpacing: "0.22em", color: "#1e3050", textTransform: "uppercase", marginBottom: "4px" }}>Score profile</div>
              <div style={{ height: "172px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 6, right: 10, bottom: 6, left: 10 }}>
                    <PolarGrid stroke="#101a2c" />
                    <PolarAngleAxis dataKey="dim" tick={{ fontSize: 9, fill: "#253550", fontFamily: "'Exo 2', sans-serif" }} />
                    <Radar dataKey="v" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.1} strokeWidth={1.5}
                      dot={{ fill: "#00d4ff", r: 2, strokeWidth: 0 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Context weight bars */}
            <div>
              <div style={{ fontSize: "8px", letterSpacing: "0.22em", color: "#1e3050", textTransform: "uppercase", marginBottom: "8px" }}>Context weights</div>
              {DIMS.map(d => (
                <div key={d.key} style={{ marginBottom: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                    <span style={{ fontSize: "10px", color: "#2a4060" }}>{d.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "rgba(0,212,255,0.55)" }}>
                      {Math.round(W[d.key] * 100)}%
                    </span>
                  </div>
                  <div style={{ height: "2px", background: "#0d1828", borderRadius: "1px" }}>
                    <div style={{
                      height: "100%", borderRadius: "1px",
                      width: `${Math.min(W[d.key] * 250, 100)}%`,
                      background: "rgba(0,212,255,0.3)",
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
              <button className="action-pri" style={{
                padding: "9px", background: "rgba(0,212,255,0.07)",
                border: "1px solid rgba(0,212,255,0.18)", borderRadius: "3px",
                color: "#00d4ff", fontSize: "10px", fontFamily: "'Exo 2', sans-serif",
                fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: "pointer", transition: "background 0.15s",
              }}>Generate Certificate</button>

              <button className="action-sec" style={{
                padding: "8px", background: "transparent",
                border: "1px solid #101a2c", borderRadius: "3px",
                color: "#253550", fontSize: "10px", fontFamily: "'Exo 2', sans-serif",
                letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.15s",
              }}>Market Comparison</button>

              <button className="action-sec" style={{
                padding: "8px", background: "transparent",
                border: "1px solid #101a2c", borderRadius: "3px",
                color: "#253550", fontSize: "10px", fontFamily: "'Exo 2', sans-serif",
                letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.15s",
              }}>NHMLAC Donation Eval</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
