import { useState } from "react";
import { X, Search } from "lucide-react";
import { LOCALITIES, COMMON_SPECIES, SIGNIFICANCE, STATUS_LOC, searchLocalities } from "../data/localities.js";

// ── Crystal quality SVG diagrams ─────────────────────────────────────────────
// Each diagram shows a hexagonal prism crystal with progressive damage.
// viewBox: 0 0 100 200

function CrystalSVG({ level }) {
  // level: "gem" | "fine" | "good" | "rough" | "damaged"
  const configs = {
    gem: {
      edgeColor: "#00d4ff", bodyFill: "#0d2535", termFill: "#122d40",
      lustreOpacity: 0.55, chips: [], faceLuster: true, termComplete: true, roughRight: false,
    },
    fine: {
      edgeColor: "#90c0f0", bodyFill: "#0d2030", termFill: "#112838",
      lustreOpacity: 0.35, chips: [{ x: 68, y: 70, size: 7 }], faceLuster: true, termComplete: true, roughRight: false,
    },
    good: {
      edgeColor: "#00c880", bodyFill: "#0d201a", termFill: "#102518",
      lustreOpacity: 0.18, chips: [{ x: 20, y: 105, size: 8 }, { x: 68, y: 65, size: 7 }, { x: 60, y: 148, size: 6 }],
      faceLuster: false, termComplete: true, roughRight: false,
    },
    rough: {
      edgeColor: "#b0a060", bodyFill: "#201c08", termFill: "#251f06",
      lustreOpacity: 0, chips: [{ x: 20, y: 95, size: 10 }, { x: 65, y: 70, size: 9 }, { x: 18, y: 140, size: 10 }, { x: 62, y: 140, size: 8 }],
      faceLuster: false, termComplete: false, roughRight: true,
    },
    damaged: {
      edgeColor: "#b05050", bodyFill: "#201010", termFill: "#251212",
      lustreOpacity: 0, chips: [], faceLuster: false, termComplete: false, roughRight: false, majorBreak: true,
    },
  };

  const c = configs[level] || configs.gem;

  // Crystal geometry
  // Prism body: rect from (18,90) to (82,175)
  // Termination: triangle from apex (50,15) to (18,90) to (82,90)

  const bodyLeft = 18, bodyRight = 82, bodyTop = 90, bodyBottom = 175;
  const apexX = 50, apexY = 15;

  // Chip polygon — small triangle notch cut into left edge of body
  function renderChip(ch) {
    const { x, y, size } = ch;
    // Notch: triangle pointing inward
    if (x < 50) {
      // left side chip
      return <polygon key={`${x}-${y}`} points={`${x},${y} ${x + size},${y - size / 2} ${x + size},${y + size / 2}`} fill="#060e14" stroke={c.edgeColor} strokeWidth="0.8" />;
    } else {
      // right side chip
      return <polygon key={`${x}-${y}`} points={`${x},${y} ${x - size},${y - size / 2} ${x - size},${y + size / 2}`} fill="#060e14" stroke={c.edgeColor} strokeWidth="0.8" />;
    }
  }

  // Rough right edge path (for "rough" quality)
  const roughRightPath = `M 82,90 L 78,105 L 84,120 L 79,135 L 83,150 L 78,165 L 82,175`;

  // Major break (for "damaged") — diagonal shear across bottom half
  const majorBreakPath = `M 18,130 L 55,130 L 82,155 L 82,175 L 18,175 Z`;

  return (
    <svg viewBox="0 0 100 200" width="70" height="140" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`grad-${level}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={c.bodyFill} />
          <stop offset="100%" stopColor={c.edgeColor} stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Prism body */}
      {!c.majorBreak ? (
        <rect x={bodyLeft} y={bodyTop} width={bodyRight - bodyLeft} height={bodyBottom - bodyTop}
          fill={`url(#grad-${level})`} stroke={c.edgeColor} strokeWidth="1.5" />
      ) : (
        <>
          <rect x={bodyLeft} y={bodyTop} width={bodyRight - bodyLeft} height={bodyBottom - bodyTop}
            fill={c.bodyFill} stroke={c.edgeColor} strokeWidth="1.5" />
          {/* Break shear */}
          <polygon points={majorBreakPath.replace(/[ML]/g, "").trim()} fill="#0a0808" stroke="#805050" strokeWidth="1" strokeDasharray="3,2" />
        </>
      )}

      {/* Rough right edge overlay */}
      {c.roughRight && (
        <path d={roughRightPath} fill="none" stroke={c.edgeColor} strokeWidth="1.5" strokeLinecap="round" />
      )}

      {/* Termination */}
      {c.termComplete ? (
        <polygon points={`${apexX},${apexY} ${bodyLeft},${bodyTop} ${bodyRight},${bodyTop}`}
          fill={c.termFill} stroke={c.edgeColor} strokeWidth="1.5" />
      ) : (
        // Blunt / irregular termination
        <polygon points={`${apexX - 4},${apexY + 20} ${apexX + 6},${apexY + 15} ${bodyRight},${bodyTop} ${bodyLeft},${bodyTop}`}
          fill={c.termFill} stroke={c.edgeColor} strokeWidth="1.5" />
      )}

      {/* Termination center line */}
      {c.termComplete && (
        <line x1={apexX} y1={apexY} x2={apexX} y2={bodyTop} stroke={c.edgeColor} strokeWidth="0.5" opacity="0.3" />
      )}

      {/* Luster lines on prism face */}
      {c.lustreOpacity > 0 && [105, 120, 135, 150, 165].map(yy => (
        <line key={yy} x1={bodyLeft + 2} y1={yy} x2={bodyRight - 2} y2={yy}
          stroke={c.edgeColor} strokeWidth="0.6" opacity={c.lustreOpacity} />
      ))}

      {/* Highlight on termination left face */}
      {c.termComplete && level === "gem" && (
        <line x1={apexX - 6} y1={apexY + 10} x2={bodyLeft + 8} y2={bodyTop - 5}
          stroke="white" strokeWidth="0.8" opacity="0.2" />
      )}

      {/* Chips */}
      {c.chips.map(ch => renderChip(ch))}
    </svg>
  );
}

const CRYSTAL_LEVELS = [
  { key: "gem",     score: "85–100", label: "Gem / Perfect",    color: "#00d4ff",
    traits: ["Edges razor-sharp under loupe", "Faces flat and mirror-lustrous", "No chips, contacts, or etching", "Termination complete and undamaged", "Matrix attachment clean"],
    redFlags: ["'Gem quality' with frosted faces", "'Perfect' but no loupe offered", "Only shown under bright light at one angle"] },
  { key: "fine",    score: "65–84",  label: "Very Fine",        color: "#90c0f0",
    traits: ["One or two trivial chips on secondary edges", "Main display face fully intact", "Crystal faces largely lustrous", "Termination complete"],
    redFlags: ["'Minor chip' that actually cleaves through a main face", "Contact along the display face called 'trivial'"] },
  { key: "good",    score: "40–64",  label: "Good / Collector", color: "#00c880",
    traits: ["Several chips, visible without loupe", "Some faces etched or frosted", "Termination may be slightly off-center or worn", "Still clearly identifiable crystal form"],
    redFlags: ["Described as 'fine' when chips are obvious to the naked eye", "Frosted faces called 'natural etching' to excuse low luster"] },
  { key: "rough",   score: "20–39",  label: "Rough / Study",    color: "#b0a060",
    traits: ["Multiple significant chips and breaks", "Faces abraded or partially missing", "Crystal form recognizable but imperfect", "Suitable for scientific study or beginners"],
    redFlags: ["Sold as 'collector grade' without mention of damage", "Heavy matrix hiding breakage"] },
  { key: "damaged", score: "0–19",   label: "Heavily Damaged",  color: "#c06060",
    traits: ["Major breakage across crystal body", "Missing faces or partial crystal only", "Significant instability or reconstruction", "Value largely in species/locality, not form"],
    redFlags: ["Any attempt to grade this as 'good' or 'fine'", "'Repairs' not disclosed", "Sold as broken piece of a larger specimen at full specimen price"] },
];

const PROVENANCE_GUIDE = [
  { tier: "T1", label: "Type Locality / Institutional", color: "#e8b840",
    has: ["Published scientific literature citing specimen", "Museum deaccession with catalog number", "Type locality documentation"],
    ask: ["Can you show me the original institutional label?", "Is there a literature citation for this piece?"],
    redFlag: "None of these exist but price reflects 'museum grade'" },
  { tier: "T2", label: "Named Collection", color: "#90c0f0",
    has: ["Original collection label with collector name", "Date and specific locality", "Acquisition receipt or auction catalog"],
    ask: ["Who was the original collector?", "Is the collection label present?", "Was this in an auction? Can you show the catalog?"],
    redFlag: "Verbal attribution only — 'this was from the [Famous] collection' with no label" },
  { tier: "T3", label: "Dealer with Documentation", color: "#00c880",
    has: ["Dealer label with locality", "Approximate acquisition date", "Invoice or receipt"],
    ask: ["Can I have a signed receipt with full locality details?", "How long have you had this piece?"],
    redFlag: "'I've had it for years but I don't have paperwork'" },
  { tier: "T4", label: "Locality Known, Unverified", color: "#7090a0",
    has: ["Locality stated verbally by seller", "No documentation to support it"],
    ask: ["What evidence supports this locality attribution?"],
    redFlag: "Locality is a famous name that would add value — incentive to misattribute" },
  { tier: "T5", label: "Unknown Origin", color: "#506070",
    has: ["No locality information", "No chain of custody"],
    ask: ["Where exactly did this come from?", "Why is there no label?"],
    redFlag: "Common for bulk purchased, re-labeled, or recently looted material" },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function BuyerGuide({ onClose }) {
  const [tab, setTab] = useState("crystal");
  const [localitySearch, setLocalitySearch] = useState("");
  const [expandedLocality, setExpandedLocality] = useState(null);
  const [expandedLevel, setExpandedLevel] = useState(null);

  const localityResults = localitySearch.trim().length >= 2
    ? searchLocalities(localitySearch)
    : LOCALITIES.filter(l => l.significance === "world_class");

  const tabs = [
    { key: "crystal",   label: "Crystal Quality" },
    { key: "locality",  label: "Localities" },
    { key: "species",   label: "Common Species" },
    { key: "provenance",label: "Provenance" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1100,
      background: "rgba(4,8,18,0.92)", backdropFilter: "blur(5px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "680px", maxHeight: "92vh",
        background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ padding: "16px 20px 0", borderBottom: "1px solid var(--border-dim)", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>
                🎓 Buyer's Reference Guide
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.4 }}>
                Use this to calibrate what a dealer tells you against objective standards.
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px", lineHeight: 1 }}>
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "2px" }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: "7px 14px", border: "none", borderRadius: "4px 4px 0 0",
                background: tab === t.key ? "var(--bg-panel)" : "transparent",
                color: tab === t.key ? "var(--cyan)" : "var(--text-muted)",
                fontSize: "11px", fontWeight: tab === t.key ? 600 : 400,
                cursor: "pointer", borderBottom: tab === t.key ? "2px solid var(--cyan)" : "2px solid transparent",
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* ── CRYSTAL QUALITY TAB ── */}
          {tab === "crystal" && (
            <>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, padding: "10px 12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
                <strong style={{ color: "var(--text)" }}>How to use:</strong> When a dealer describes crystal quality, compare to these diagrams under the same lighting conditions they use — then look again with your own loupe or from a different angle. Most inflation happens in the transition between "Gem" and "Very Fine" descriptions.
              </div>

              {CRYSTAL_LEVELS.map(level => {
                const expanded = expandedLevel === level.key;
                return (
                  <div key={level.key} style={{ borderRadius: "7px", border: `1px solid ${level.color}30`, background: "var(--bg-panel)", overflow: "hidden" }}>
                    <button
                      onClick={() => setExpandedLevel(expanded ? null : level.key)}
                      style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "12px 14px", textAlign: "left" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <CrystalSVG level={level.key} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: level.color }}>{level.label}</span>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--mono)", background: `${level.color}15`, padding: "2px 7px", borderRadius: "3px" }}>
                              Score {level.score}
                            </span>
                          </div>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                            {expanded ? "Tap to collapse" : "Tap to see what to look for + dealer red flags"}
                          </div>
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                          <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "5px" }}>What to verify</div>
                          {level.traits.map((t, i) => (
                            <div key={i} style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5, marginBottom: "2px" }}>
                              <span style={{ color: level.color }}>✓</span> {t}
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: "1px solid var(--border-dim)", paddingTop: "8px" }}>
                          <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "#ff6060", textTransform: "uppercase", marginBottom: "5px" }}>⚠ Dealer red flags</div>
                          {level.redFlags.map((f, i) => (
                            <div key={i} style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5, marginBottom: "2px" }}>
                              <span style={{ color: "#ff6060" }}>→</span> {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.5, fontStyle: "italic", padding: "8px 12px", borderRadius: "4px", background: "var(--bg-panel)", border: "1px solid var(--border-dim)" }}>
                💡 Always examine under your own 10× loupe in multiple lighting angles. Dealers often display under bright directed light that hides chips and frosting. Natural or diffuse light is more honest.
              </div>
            </>
          )}

          {/* ── LOCALITY TAB ── */}
          {tab === "locality" && (
            <>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, padding: "10px 12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
                <strong style={{ color: "var(--text)" }}>How to use:</strong> Search for the locality or mineral a dealer mentions. If the locality is not in this list, that doesn't make it worthless — but you cannot verify the "famous locality" claim. Default to T4 provenance (locality known, unverified) in that case.
              </div>

              {/* Search */}
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  value={localitySearch}
                  onChange={e => setLocalitySearch(e.target.value)}
                  placeholder="Search locality name, country, or mineral species..."
                  style={{
                    width: "100%", padding: "9px 12px 9px 30px",
                    background: "var(--bg-panel)", border: "1px solid var(--border)",
                    borderRadius: "5px", color: "var(--text)", fontSize: "12px",
                    boxSizing: "border-box", outline: "none",
                  }}
                />
              </div>

              {localitySearch.trim().length < 2 && (
                <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Showing world-class localities — search to filter
                </div>
              )}

              {localityResults.length === 0 && localitySearch.trim().length >= 2 && (
                <div style={{ padding: "14px", textAlign: "center", color: "var(--text-muted)", fontSize: "11px" }}>
                  No match found. If a dealer claims this is a "famous" or "rare" locality, treat it as unverified (T4 provenance).
                </div>
              )}

              {localityResults.map(loc => {
                const sig = SIGNIFICANCE[loc.significance];
                const st = STATUS_LOC[loc.status];
                const expanded = expandedLocality === loc.id;
                return (
                  <div key={loc.id} style={{ borderRadius: "6px", border: `1px solid ${sig.color}25`, background: "var(--bg-panel)", overflow: "hidden" }}>
                    <button
                      onClick={() => setExpandedLocality(expanded ? null : loc.id)}
                      style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "11px 14px", textAlign: "left" }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: sig.color }}>{loc.name}</span>
                            <span style={{ fontSize: "8px", padding: "2px 6px", borderRadius: "3px", background: `${sig.color}18`, color: sig.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                              {sig.label}
                            </span>
                            <span style={{ fontSize: "9px", color: st.color }}>{st.icon} {st.label}</span>
                          </div>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{loc.location} · {loc.continent}</div>
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--mono)", flexShrink: 0, textAlign: "right" }}>
                          <div style={{ fontSize: "8px", color: "var(--text-muted)" }}>Locality Rarity</div>
                          <div style={{ color: sig.color, fontWeight: 600 }}>{loc.localityRaritySuggested}</div>
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div style={{ padding: "0 14px 12px", borderTop: "1px solid var(--border-dim)" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, marginTop: "8px", marginBottom: "8px" }}>{loc.note}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>
                          <strong style={{ color: "var(--text)" }}>Known for:</strong>{" "}
                          {loc.knownFor.join(", ")}
                        </div>
                        <div style={{ fontSize: "10px", padding: "6px 10px", background: `${sig.color}0a`, border: `1px solid ${sig.color}20`, borderRadius: "4px", color: "var(--text-dim)", lineHeight: 1.5, marginTop: "6px" }}>
                          📊 Suggested locality rarity score for PRISM: <strong style={{ color: sig.color }}>{loc.localityRaritySuggested}/100</strong> — adjust downward if specimen lacks documentation.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── COMMON SPECIES TAB ── */}
          {tab === "species" && (
            <>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, padding: "10px 12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
                <strong style={{ color: "var(--text)" }}>How to use:</strong> Species rarity measures how uncommon the mineral species is, not how nice the crystal is. If a dealer implies a common species is rare to justify a high price, that's a red flag. Fine crystal quality of a common species should push Crystal Quality — not Species Rarity.
              </div>

              <div style={{ padding: "8px 12px", background: "rgba(255,160,40,0.06)", border: "1px solid rgba(255,160,40,0.25)", borderRadius: "5px", fontSize: "11px", color: "#ffa028", lineHeight: 1.5 }}>
                ⚠️ The species below should score <strong>10–30</strong> on Species Rarity regardless of how impressive the crystal is. A gem-quality pyrite cube is a beautiful crystal — but pyrite is not a rare species.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {COMMON_SPECIES.map(sp => (
                  <div key={sp.name} style={{ padding: "10px 13px", background: "var(--bg-panel)", border: "1px solid var(--border-dim)", borderRadius: "5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>{sp.name}</span>
                      <span style={{ fontSize: "9px", fontFamily: "var(--mono)", color: "#b0a060", background: "rgba(176,160,96,0.1)", padding: "2px 7px", borderRadius: "3px" }}>
                        Rarity: {sp.rarityRange}
                      </span>
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "3px" }}>Forms: {sp.forms}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.5 }}>{sp.note}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "10px 12px", background: "var(--bg-panel)", border: "1px solid var(--border-dim)", borderRadius: "5px", fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6 }}>
                💡 <strong style={{ color: "var(--text)" }}>Genuinely rare species</strong> include: phoenicochroite, semseyite, sartorite, thalenite, clinohedrite, olmiite, esperite — minerals from just one or two localities globally. If a dealer claims rarity, ask: "How many known localities produce this species?"
              </div>
            </>
          )}

          {/* ── PROVENANCE TAB ── */}
          {tab === "provenance" && (
            <>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, padding: "10px 12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
                <strong style={{ color: "var(--text)" }}>Why provenance matters:</strong> Provenance is the documented history of ownership and origin. It can never be invented after the fact — only discovered. In PRISM, provenance is the single highest-weighted dimension for museum-grade evaluation. No label = significantly lower score.
              </div>

              {PROVENANCE_GUIDE.map(tier => (
                <div key={tier.tier} style={{ padding: "12px 14px", background: "var(--bg-panel)", border: `1px solid ${tier.color}30`, borderRadius: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: tier.color, fontFamily: "var(--mono)" }}>{tier.tier}</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: tier.color }}>{tier.label}</span>
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px" }}>
                    <strong style={{ color: "var(--text-dim)" }}>Has:</strong> {tier.has.join(" · ")}
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    <div style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "3px" }}>Ask the dealer:</div>
                    {tier.ask.map((q, i) => (
                      <div key={i} style={{ fontSize: "11px", color: "var(--cyan)", lineHeight: 1.5 }}>→ "{q}"</div>
                    ))}
                  </div>
                  <div style={{ fontSize: "10px", color: "#ff6060", lineHeight: 1.5, borderTop: "1px solid var(--border-dim)", paddingTop: "6px" }}>
                    ⚠ Red flag: {tier.redFlag}
                  </div>
                </div>
              ))}

              <div style={{ padding: "10px 12px", background: "rgba(0,200,128,0.05)", border: "1px solid rgba(0,200,128,0.2)", borderRadius: "5px", fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6 }}>
                💡 <strong style={{ color: "var(--text)" }}>The golden rule:</strong> A legitimate dealer will always have a paper receipt, a label, or a collection record. If they can't produce any documentation and the price reflects documented provenance, walk away or price it at T4–T5 levels.
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
