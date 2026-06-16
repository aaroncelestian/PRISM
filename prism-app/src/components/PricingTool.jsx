import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, TrendingUp, Copy, CheckCheck, Printer } from "lucide-react";
import { WEIGHTS, CONTEXTS, GRADES, applyNonLinearTransform } from "../data/prism.js";

function _PickerScreen({ initScores, initSpec, records, onSelect, onClose }) {
  let best = 0, bestGrade = GRADES[GRADES.length - 1];
  CONTEXTS.forEach(c => {
    const W = WEIGHTS[c.key];
    const s = Math.round(Object.entries(W).reduce((a, [k, w]) => a + (initScores[k] ?? 50) * w, 0));
    if (s > best) { best = s; bestGrade = GRADES.find(g => s >= g.min) || GRADES[GRADES.length - 1]; }
  });
  const curScore = best; const curGrade = bestGrade;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(4,8,18,0.88)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "600px", maxHeight: "92vh", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-dim)", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>� Sell / Trade Market Guide</div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>Select the specimen to evaluate</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Current Evaluation</div>
            <button onClick={() => onSelect(initScores, initSpec)}
              style={{ width: "100%", textAlign: "left", padding: "12px 14px", background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.25)", borderRadius: "7px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.5)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.25)"}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>{initSpec.name || initSpec.species || "Unnamed Specimen"}</div>
                {(initSpec.species || initSpec.locality) && <div style={{ fontSize: "10px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{[initSpec.species, initSpec.locality].filter(Boolean).join(" \u00b7 ")}</div>}
                <div style={{ marginTop: "4px", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>Active session — not yet saved to history</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--mono)", color: curGrade.color, lineHeight: 1 }}>{curScore}</div>
                <div style={{ marginTop: "3px", fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: `${curGrade.color}15`, color: curGrade.color, border: `1px solid ${curGrade.color}30`, fontWeight: 600, letterSpacing: "0.06em", display: "inline-block" }}>{curGrade.emoji} {curGrade.label}</div>
              </div>
            </button>
          </div>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Saved Collection {records.length > 0 ? `(${records.length})` : ""}</div>
            {records.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)", lineHeight: 1.6 }}>No specimens saved to history yet.<br />Save a PRISM evaluation first using the Save button.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {records.map(rec => {
                  const g = GRADES.find(gr => gr.label === rec.grade) || GRADES[GRADES.length - 1];
                  const d = new Date(rec.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  return (
                    <button key={rec.id} onClick={() => onSelect(rec.scores, rec.spec)}
                      style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.3)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>{rec.spec?.name || rec.spec?.species || "Unnamed Specimen"}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{[rec.spec?.species, rec.spec?.locality].filter(Boolean).join(" \u00b7 ")}</div>
                        <div style={{ marginTop: "3px", fontSize: "9px", color: "var(--text-muted)" }}>Saved {d}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--mono)", color: g.color, lineHeight: 1 }}>{rec.prismScore}</div>
                        <div style={{ marginTop: "3px", fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: `${g.color}15`, color: g.color, border: `1px solid ${g.color}30`, fontWeight: 600, letterSpacing: "0.06em", display: "inline-block" }}>{rec.gradeEmoji} {rec.grade}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-dim)", flexShrink: 0 }}>
          <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}><X size={13} /> Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

const SIZE_CLASSES = [
  { key: "thumbnail",  label: "Thumbnail",      range: "< 2.5 cm",     desc: "Fits on a fingertip — the most traded size class." },
  { key: "miniature",  label: "Miniature",      range: "2.5 – 4.5 cm", desc: "Most popular show size. Large collector demand." },
  { key: "small_cab",  label: "Small Cabinet",  range: "4.5 – 7.5 cm", desc: "Excellent display size — broad market." },
  { key: "cabinet",    label: "Cabinet",         range: "7.5 – 12 cm", desc: "Serious collector/show category. Strong value for fine pieces." },
  { key: "large_cab",  label: "Large Cabinet",  range: "12 – 25 cm",   desc: "Major collector territory. Thinner market, higher ceiling." },
  { key: "museum",     label: "Museum",          range: "> 25 cm",      desc: "Institutional-scale specimen. Very thin market; value driven by rarity, provenance, and scientific significance." },
];

const CONDITIONS = [
  { key: "pristine",  label: "Pristine",             icon: "💎", mult: 1.00, desc: "Perfect under 10× loupe. No chips, breaks, or contact damage." },
  { key: "excellent", label: "Display Quality",       icon: "✨", mult: 0.82, desc: "Trivial surface wear. All crystals intact. Ready to display." },
  { key: "good",      label: "Minor Chips / Contact", icon: "🔶", mult: 0.62, desc: "Edge or matrix chips that don't affect the main display face." },
  { key: "repaired",  label: "Repaired / Restored",   icon: "🔧", mult: 0.42, desc: "Professionally repaired — reduces value and MUST be disclosed." },
  { key: "damaged",   label: "Damaged",               icon: "⚠️", mult: 0.22, desc: "Significant breakage, instability, or major loss." },
];

const CHANNELS = [
  {
    key: "private",
    label: "Private Sale",
    icon: "🤝",
    mult: 1.20,
    fees: "0%",
    time: "Weeks – months",
    desc: "Direct sale to a known collector. Best net return — but requires patience and the right contact.",
    tips: [
      "Post on Mindat forums, Facebook mineral groups, or reach out to known collectors of the species/locality.",
      "Price at your mid estimate to leave room for negotiation.",
      "Include provenance docs — serious collectors pay premiums for them.",
    ],
  },
  {
    key: "show",
    label: "Mineral Show",
    icon: "🏪",
    mult: 1.00,
    fees: "Table fee",
    time: "Days",
    desc: "Tucson, Denver, Munich, Springfield — immediate market feedback and browsing buyers. Table fees apply.",
    tips: [
      "Price 10–20% above your target to allow for show negotiation.",
      "Thumbnail-to-small-cabinet sizes move fastest at shows.",
      "Have a printed label or spec sheet for high-value pieces.",
    ],
  },
  {
    key: "online",
    label: "Online Marketplace",
    icon: "🌐",
    mult: 0.85,
    fees: "~13–15%",
    time: "Days – weeks",
    desc: "eBay, Catawiki, Etsy — wide reach, competitive, but platform fees and photography quality matter enormously.",
    tips: [
      "Put the locality and species as the first words of your title.",
      "Show 3+ angles in natural light. Avoid flash.",
      "Include a ruler or coin for scale.",
      "Start eBay auctions at your low estimate on a 7-day auction.",
    ],
  },
  {
    key: "auction",
    label: "Specialist Auction",
    icon: "🔨",
    mult: 1.65,
    fees: "10–20% seller",
    time: "Months",
    desc: "Heritage, Bonhams, Lyon & Turnbull, Casterot — top hammer prices for exceptional pieces, but seller fees are significant.",
    tips: [
      "Best reserved for exceptional pieces. Contact them with photos first — they will advise on suitability.",
      "Negotiate the seller's premium — it's not always fixed.",
      "Allow 3–6 months from consignment to payment.",
      "Auction catalog inclusion adds credibility and future provenance value.",
    ],
  },
  {
    key: "consignment",
    label: "Dealer Consignment",
    icon: "🏷️",
    mult: 0.55,
    fees: "40–50% commission",
    time: "Weeks – months",
    desc: "A dealer sells for you and takes 40–50% commission. Convenient but expensive — they bear the selling effort.",
    tips: [
      "Negotiate the commission rate before agreeing. 30–35% is possible for strong pieces.",
      "Get a signed consignment agreement with your price floor in writing.",
      "Check the dealer's market reach — do they sell at Tucson, Denver, and online?",
    ],
  },
  {
    key: "buyout",
    label: "Dealer Direct Buyout",
    icon: "💵",
    mult: 0.28,
    fees: "None (low price)",
    time: "Immediate",
    desc: "Dealer buys outright at wholesale — fastest cash, lowest return. Typical buyout is 20–35% of retail.",
    tips: [
      "Get quotes from 2–3 dealers before accepting.",
      "Buyout pricing reflects the dealer's carrying cost and risk.",
      "Reasonable choice for pieces outside your collecting focus or for quick estate liquidation.",
    ],
  },
  {
    key: "club",
    label: "Club / Society Sale",
    icon: "👥",
    mult: 0.88,
    fees: "Small commission",
    time: "Weeks",
    desc: "Club auction, AFMS/EFMLS event, or regional swap meet — community pricing, knowledgeable buyers.",
    tips: [
      "Good for mid-grade pieces where the audience will understand their value.",
      "Less competitive than open market — prices can trend low for exceptional pieces.",
      "Great for thumbnail and miniature grades where collectors trade frequently.",
    ],
  },
];

const STEPS = ["Size", "Condition", "Sale Channel", "Market Guide"];

// ── Price calculation ─────────────────────────────────────────────────────────

function computePrimaryScore(scores) {
  const adj = Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, applyNonLinearTransform(k, v ?? 0)])
  );
  let best = 0;
  Object.keys(WEIGHTS).forEach(ctxKey => {
    const W = WEIGHTS[ctxKey];
    const s = Object.keys(W).reduce((sum, d) => sum + (adj[d] ?? 0) * W[d], 0);
    if (s > best) best = s;
  });
  return Math.round(best);
}

function getGrade(score) {
  return GRADES.find(g => score >= g.min) || GRADES[GRADES.length - 1];
}

// Market position tiers — where this specimen sits among comparable size-class pieces
const POSITION_TIERS = [
  { min: 88, label: "Trophy",          color: "#ff9040", bar: "linear-gradient(90deg, #ff9040, #e8b840)", desc: "Among the finest examples of this size class on the market. Exceptional by any measure." },
  { min: 72, label: "Investment Grade",color: "#e8b840", bar: "linear-gradient(90deg, #e8b840, #d4c060)", desc: "Top quartile for this size class. Serious collectors and institutions take notice." },
  { min: 55, label: "Premium",         color: "#00c880", bar: "linear-gradient(90deg, #00c880, #40d0a0)", desc: "Well above average. Strong collector demand; commands above-market pricing for its size." },
  { min: 38, label: "Above Average",   color: "#90c0f0", bar: "linear-gradient(90deg, #90c0f0, #70a0d0)", desc: "Better than most in this size class. Broad appeal at fair market pricing." },
  { min: 22, label: "Standard",        color: "#7090a0", bar: "linear-gradient(90deg, #7090a0, #607080)", desc: "Typical for this size class. Moves at market pricing with a reasonable buyer pool." },
  { min:  0, label: "Entry / Bulk",    color: "#506070", bar: "linear-gradient(90deg, #506070, #405060)", desc: "Below average for this size class. Competes on price rather than quality." },
];


function computeMarketPosition(score, conditionKey) {
  const adj = { pristine: 8, excellent: 0, good: -15, repaired: -32, damaged: -55 }[conditionKey] || 0;
  return Math.max(0, Math.min(100, score + adj));
}


const NEGOTIATION_GUIDE = {
  "Trophy":           { ask: "Price at the high end of your range and hold — exceptional pieces reward patient sellers.", floor: "Expect 85–90% of ask from serious buyers. Don't capitulate below that.", tip: "Document the PRISM score prominently. Top collectors pay premiums for quantified quality." },
  "Investment Grade": { ask: "Price 15–20% above your target. Investment-grade pieces attract committed buyers.", floor: "80% of ask is a firm floor — better buyers exist, don't rush.", tip: "Provenance documentation materially adds to investment-grade value. Include it." },
  "Premium":          { ask: "Price 10–15% above your target to allow normal collector negotiation.", floor: "70–75% of ask is a reasonable floor for this tier.", tip: "Highlight your highest-scoring PRISM dimensions — locality rarity and crystal quality close deals." },
  "Above Average":    { ask: "Price at mid estimate with good presentation.", floor: "65–70% of ask is typical. Below that you're leaving money behind.", tip: "Photography and accurate locality info close deals faster than price adjustments at this tier." },
  "Standard":         { ask: "Price at or slightly below mid estimate to remain competitive.", floor: "60–65% of ask is typical. Bundles and trades often net more than single-piece sales.", tip: "Flexible terms (trades, bundles) move standard-grade pieces more effectively than price cuts." },
  "Entry / Bulk":     { ask: "Price at the low end — this tier is highly price-competitive.", floor: "Quick liquidation beats holding. Set a firm floor and focus on volume.", tip: "Lot sales or trade-up offers are usually more effective than single-piece listings at this tier." },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SelectGrid({ items, selected, onSelect, cols = 2 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "7px" }}>
      {items.map(item => {
        const sel = selected === item.key;
        return (
          <button key={item.key} onClick={() => onSelect(item.key)} style={{
            padding: "10px 12px", borderRadius: "6px", textAlign: "left",
            background: sel ? "rgba(0,212,255,0.07)" : "var(--bg-card)",
            border: `1px solid ${sel ? "rgba(0,212,255,0.4)" : "var(--border)"}`,
            color: sel ? "var(--cyan)" : "var(--text-dim)",
            transition: "all 0.15s",
          }}>
            {item.icon && <div style={{ fontSize: "18px", marginBottom: "4px" }}>{item.icon}</div>}
            <div style={{ fontSize: "12px", fontWeight: sel ? 600 : 500, marginBottom: "2px" }}>{item.label}</div>
            {item.range && <div style={{ fontSize: "10px", color: sel ? "rgba(0,212,255,0.7)" : "var(--text-muted)" }}>{item.range}</div>}
            {item.fees  && <div style={{ fontSize: "10px", color: sel ? "rgba(0,212,255,0.7)" : "var(--text-muted)" }}>Fees: {item.fees}</div>}
          </button>
        );
      })}
    </div>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────

function SizeStep({ sizeClass, setSizeClass, grade, score, spec }) {
  const sel = SIZE_CLASSES.find(s => s.key === sizeClass);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>What size is the specimen?</h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Size class significantly affects market value — a cabinet-sized specimen of the same quality
          typically commands 5–20× the market value of a thumbnail.
        </p>
      </div>

      {/* PRISM grade summary */}
      <div style={{ padding: "10px 14px", background: `${grade.color}0d`, border: `1px solid ${grade.color}35`, borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "3px" }}>PRISM Quality Grade</div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: grade.color }}>{grade.emoji} {grade.label} — {score}/100</div>
          {spec?.name && <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{spec.name}{spec.species ? ` · ${spec.species}` : ""}</div>}
        </div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "right", lineHeight: 1.5 }}>
          This quality level is<br />used in market positioning
        </div>
      </div>

      <SelectGrid items={SIZE_CLASSES} selected={sizeClass} onSelect={setSizeClass} cols={2} />

      {sel && (
        <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: "4px", border: "1px solid var(--border-dim)", fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>
          💡 {sel.desc}
        </div>
      )}
    </div>
  );
}

function ConditionStep({ condition, setCondition }) {
  const sel = CONDITIONS.find(c => c.key === condition);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Physical Condition</h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Assess the specimen honestly. Condition affects price significantly — and misrepresenting
          condition damages your reputation in the collector community.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {CONDITIONS.map(c => {
          const sel = condition === c.key;
          return (
            <button key={c.key} onClick={() => setCondition(c.key)} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 14px", borderRadius: "6px", textAlign: "left",
              background: sel ? "rgba(0,212,255,0.06)" : "var(--bg-card)",
              border: `1px solid ${sel ? "rgba(0,212,255,0.4)" : "var(--border)"}`,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "18px", flexShrink: 0 }}>{c.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", fontWeight: sel ? 600 : 500, color: sel ? "var(--cyan)" : "var(--text)", marginBottom: "1px" }}>
                  {c.label}
                  <span style={{ marginLeft: "8px", fontSize: "10px", color: "var(--text-muted)", fontWeight: 400 }}>
                    {Math.round(c.mult * 100)}% of pristine value
                  </span>
                </div>
                <div style={{ fontSize: "10px", color: sel ? "rgba(0,212,255,0.6)" : "var(--text-muted)", lineHeight: 1.4 }}>{c.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {condition === "repaired" && (
        <div style={{ padding: "10px 12px", background: "rgba(255,160,40,0.08)", border: "1px solid rgba(255,160,40,0.3)", borderRadius: "5px", fontSize: "11px", color: "#ffa028", lineHeight: 1.6 }}>
          ⚠️ <strong>Disclosure required.</strong> Repair or restoration must be disclosed in every listing and in-person sale.
          Failure to disclose is considered fraudulent misrepresentation in the mineral collector community
          and can result in forced returns, reputation damage, and legal liability.
        </div>
      )}
    </div>
  );
}

function ChannelStep({ channel, setChannel }) {
  const sel = CHANNELS.find(c => c.key === channel);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Sale Channel</h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Where and how you sell has a major impact on the price you achieve — and how quickly you get paid.
          Net return after fees varies significantly by channel.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {CHANNELS.map(c => {
          const isSel = channel === c.key;
          return (
            <button key={c.key} onClick={() => setChannel(c.key)} style={{
              display: "flex", alignItems: "flex-start", gap: "12px",
              padding: "10px 14px", borderRadius: "6px", textAlign: "left",
              background: isSel ? "rgba(0,212,255,0.06)" : "var(--bg-card)",
              border: `1px solid ${isSel ? "rgba(0,212,255,0.4)" : "var(--border)"}`,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>{c.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                  <span style={{ fontSize: "12px", fontWeight: isSel ? 600 : 500, color: isSel ? "var(--cyan)" : "var(--text)" }}>{c.label}</span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--mono)" }}>{c.time}</span>
                </div>
                <div style={{ fontSize: "10px", color: isSel ? "rgba(0,212,255,0.6)" : "var(--text-muted)", lineHeight: 1.4 }}>
                  {c.desc}
                </div>
                <div style={{ marginTop: "3px", fontSize: "9px", color: isSel ? "rgba(0,212,255,0.5)" : "var(--border)", letterSpacing: "0.08em" }}>
                  FEES: {c.fees}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Advertising template helpers ─────────────────────────────────────────────

const AD_DIMS = {
  localityRarity: "Locality Rarity", speciesRarity: "Species Rarity",
  varietyRarity:  "Variety Rarity",  crystal:       "Crystal Quality",
  aesthetics:     "Aesthetics",      provenance:    "Provenance",
  scientific:     "Scientific Value",
};

function buildAdTemplate(channel, { spec, score, grade, sz, cond, tier, scores }) {
  const sp  = spec?.species || "";
  const va  = spec?.variety || "";
  const lo  = spec?.locality || "";
  const nm  = spec?.name || sp || "Mineral Specimen";
  const sl  = [sp, va].filter(Boolean).join(" ") || nm;
  const szS = sz  ? `${sz.label} (${sz.range})`  : "";
  const coS = cond ? cond.label : "";
  const hl  = Object.entries(scores || {})
    .filter(([k, v]) => v >= 60 && AD_DIMS[k])
    .sort(([, a], [, b]) => b - a).slice(0, 4)
    .map(([k, v]) => `  \u2022 ${AD_DIMS[k]}: ${v}/100`);
  const hasProv = (scores?.provenance ?? 0) >= 60;
  const today   = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const LINE    = "\u2500".repeat(50);
  const PSCORE  = `PRISM ${score}/100  \u00b7  ${grade.emoji} ${grade.label}  \u00b7  ${tier.label}`;
  const DETAIL  = [
    sp  && `  Species:    ${sp}`,
    va  && `  Variety:    ${va}`,
    lo  && `  Locality:   ${lo}`,
    szS && `  Size:       ${szS}`,
    coS && `  Condition:  ${coS}`,
    `  PRISM:      ${score}/100 \u2014 ${grade.label} (${tier.label})`,
  ].filter(Boolean).join("\n");
  const HL   = hl.length ? `\n\nSTRONGEST ATTRIBUTES\n${hl.join("\n")}` : "";
  const PROV = hasProv ? "\n  Provenance documentation available on request." : "";

  if (channel === "private") return {
    title: "Private Sale Inquiry",
    hint: "Fill in the blanks (marked ___). Edit any section. Delete what doesn\u2019t apply.",
    template: `To: _______________________________________________\nDate: ${today}\nSubject: ${sl}${lo ? " from " + lo : ""} \u2014 PRISM ${grade.label} \u00b7 Available\n\n${LINE}\n\nHi _______________,\n\nI have a ${sl}${lo ? " from " + lo : ""} available for private sale. This piece scored ${score}/100 on the PRISM Mineral Rating Index \u2014 ${grade.label} (${tier.label}).\n\nSPECIMEN DETAILS\n${DETAIL}${HL}${PROV}\n\nAsking: _______________________________________________\n  (Happy to discuss \u2014 serious collectors welcome)\n\nAdditional photos, video, or provenance documentation available on request.\n\n${LINE}\nFrom: _______________________________________________\nContact / email: ____________________________________`,
  };

  if (channel === "show" || channel === "club") return {
    title: channel === "show" ? "Mineral Show Display Label" : "Club / Society Sale Label",
    hint: "Print and display with the specimen. Adjust size as needed for your label holder.",
    template: `${LINE}\n  ${sl.toUpperCase()}\n${lo ? "  " + lo.toUpperCase() + "\n" : ""}${LINE}\n\n  ${[szS, coS].filter(Boolean).join("  \u00b7  ")}\n\n  \u2605  ${PSCORE}\n${hl.length ? "\n  Notable Attributes:\n" + hl.join("\n") + "\n" : ""}\n${LINE}\n  PRICE:  $___________________________________________\n  Seller: _______________________________________________\n${LINE}`,
  };

  if (channel === "online") return {
    title: "Online Marketplace Listing",
    hint: "Copy the title and description separately into your listing platform (eBay, Catawiki, Etsy, etc.).",
    template: `LISTING TITLE\n${[grade.min >= 75 ? "Superb" : grade.min >= 60 ? "Fine" : null, sl, sz?.label, lo || null, `PRISM ${grade.label}`].filter(Boolean).join(" \u2014 ")}\n\nSEARCH TAGS\n${[sp, va, lo, sz?.label, "mineral", "crystal", "specimen", "natural"].filter(Boolean).join(", ")}\n\n${LINE}\nDESCRIPTION\n\n${[coS, sl].filter(Boolean).join(" ")}${lo ? " from " + lo : ""}. PRISM Score: ${score}/100 (${grade.label} \u2014 ${tier.label}).\n\nSPECIMEN DETAILS\n${DETAIL}${HL}${PROV}\n\nShipping: _______________________________________________\nCombined shipping available: ___________________________\n\nAdditional photos available. Questions welcome.`,
  };

  if (channel === "auction") return {
    title: "Specialist Auction Consignment Summary",
    hint: "Submit to the auction house as a consignment summary. They will write final catalog copy.",
    template: `CONSIGNMENT SUBMISSION\n${LINE}\nDate: ${today}\nAuction House: _________________________________________\nLot Reference: _________________________________________\nConsignor: _____________________________________________\nContact: _______________________________________________\n\nSPECIMEN\n${DETAIL}${HL}${PROV}\n\n${LINE}\nMarket Tier: ${tier.label}  \u00b7  Position: ${computeMarketPosition(score, cond?.key)} /100\n\nReserve guidance: ______________________________________\n  (Many specialist houses prefer no reserve \u2014 discuss.)\n\nSeller\u2019s premium rate: _____% (confirm with house)\nExpected timeline: 3\u20136 months consignment to payment\n${LINE}\n\nNote: Final catalog copy will be prepared by the auction house.\nThis summary is for your records only.\n\nSignature: _____________________________________________ Date: ____________`,
  };

  if (channel === "consignment") return {
    title: "Dealer Consignment Record",
    hint: "Keep a signed copy before handing over the specimen. Fill all fields.",
    template: `DEALER CONSIGNMENT AGREEMENT\n${LINE}\nDate: ${today}              Ref: ________________________\n\nDealer:    _______________________________________________\nContact:   _______________________________________________\nLocation:  _______________________________________________\n\nSPECIMEN\n${DETAIL}${HL}${PROV}\n\n${LINE}\nCommission rate agreed:             _________ %\nYour floor price (net, confidential): $________________\nDealer\u2019s agreed asking price:         $________________\n\nProvenance documents handed over:   ${hasProv ? "Yes \u2014 included" : "____________________"}\nPhotos on file / shared:            ____________________\nReturn-if-unsold date:              ____________________\n${LINE}\nDealer signature: ______________________________________\nOwner signature:  ______________________________________\n${LINE}`,
  };

  if (channel === "buyout") return {
    title: "Dealer Direct Buyout \u2014 Specimen Fact Sheet",
    hint: "For dealer evaluation. Do not write your minimum on the copy you hand over.",
    template: `SPECIMEN FACT SHEET \u2014 DEALER EVALUATION\n${LINE}\nDate: ${today}\nPresented to: __________________________________________\n\nSPECIMEN\n${DETAIL}${HL}${PROV}\n\n${LINE}\nMarket Tier: ${tier.label}  \u00b7  PRISM Position: ${computeMarketPosition(score, cond?.key)}/100\n\nComparable sales on record:\n  ____________________________________________________\n  ____________________________________________________\n\nNotes:\n  ____________________________________________________\n  ____________________________________________________\n${LINE}\nPRISM provides qualitative market positioning only.\nNot a formal appraisal. Prices negotiated directly.`,
  };

  return { title: "Market Guide", hint: "", template: "" };
}

function AdvertisingStep({ score, sizeClass, condition, channel, scores, spec }) {
  const sz    = SIZE_CLASSES.find(s => s.key === sizeClass);
  const cond  = CONDITIONS.find(c => c.key === condition);
  const ch    = CHANNELS.find(c => c.key === channel);
  const grade = getGrade(score);
  const position = computeMarketPosition(score, condition);
  const tier  = POSITION_TIERS.find(t => position >= t.min) || POSITION_TIERS[POSITION_TIERS.length - 1];

  const { title, hint, template } = useMemo(
    () => buildAdTemplate(channel, { spec, score, grade, sz, cond, tier, scores }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [channel, score, sizeClass, condition]
  );
  const [text, setText]   = useState(template);
  const [copied, setCopied] = useState(false);
  const neg = NEGOTIATION_GUIDE[tier.label] || {};

  const copyText = () => {
    navigator.clipboard.writeText(text)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); })
      .catch(() => {});
  };

  const printDoc = () => {
    const win = window.open("", "_blank", "width=720,height=960");
    if (!win) return;
    const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Courier New',Courier,monospace;font-size:12px;line-height:1.65;color:#000;background:#fff;padding:48px 52px;max-width:680px;margin:0 auto}
      .doc-header{border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:18px}
      .doc-title{font-size:13px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase}
      .prism-badge{display:inline-block;border:1px solid #000;padding:3px 12px;font-size:11px;font-weight:bold;margin-top:6px;letter-spacing:0.06em}
      pre{white-space:pre-wrap;font-family:'Courier New',Courier,monospace;font-size:12px;line-height:1.65}
      @media print{body{padding:24px 28px}@page{margin:1.2cm}}
    </style></head><body>
      <div class="doc-header">
        <div class="doc-title">${title}</div>
        <div class="prism-badge">PRISM ${score}/100 &nbsp;&middot;&nbsp; ${grade.label} &nbsp;&middot;&nbsp; ${tier.label}</div>
      </div>
      <pre>${safe}</pre>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 450);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── Context bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
        <div style={{ padding: "3px 10px", borderRadius: "4px", background: `${grade.color}15`, border: `1px solid ${grade.color}35`, fontSize: "11px", fontWeight: 700, color: grade.color }}>
          {grade.emoji} PRISM {score}/100 · {grade.label}
        </div>
        <div style={{ padding: "3px 10px", borderRadius: "4px", background: `${tier.color}10`, border: `1px solid ${tier.color}30`, fontSize: "11px", fontWeight: 600, color: tier.color }}>
          {tier.label}
        </div>
        <div style={{ padding: "3px 10px", borderRadius: "4px", background: "var(--bg-panel)", border: "1px solid var(--border)", fontSize: "11px", color: "var(--text-dim)" }}>
          {ch?.icon} {ch?.label} · {ch?.fees} · {ch?.time}
        </div>
      </div>

      {/* ── Channel title + hint ── */}
      <div>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
          {ch?.icon} {title}
        </h3>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55 }}>{hint}</p>
      </div>

      {/* ── Editable template ── */}
      <div>
        <div style={{ fontSize: "8px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "5px" }}>
          Template — pre-filled from PRISM data · edit directly · fill in blanks marked ___
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          spellCheck={false}
          style={{
            width: "100%", boxSizing: "border-box",
            minHeight: (channel === "show" || channel === "club") ? "210px" : "360px",
            padding: "12px 14px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "5px",
            color: "var(--text)",
            fontFamily: "var(--mono)",
            fontSize: "11px",
            lineHeight: 1.65,
            resize: "vertical",
            outline: "none",
          }}
        />
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
        <button
          onClick={copyText}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px 12px", borderRadius: "5px", fontSize: "11px", fontWeight: 600, cursor: "pointer", background: copied ? "rgba(0,200,128,0.09)" : "rgba(0,212,255,0.07)", border: `1px solid ${copied ? "rgba(0,200,128,0.4)" : "rgba(0,212,255,0.3)"}`, color: copied ? "#00c880" : "var(--cyan)", transition: "all 0.2s" }}
        >
          {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy Text"}
        </button>
        <button
          onClick={printDoc}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px 12px", borderRadius: "5px", fontSize: "11px", fontWeight: 600, cursor: "pointer", background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.3)", color: "var(--cyan)" }}
        >
          <Printer size={12} /> Print / Save PDF
        </button>
      </div>

      {/* ── Negotiation reminder ── */}
      {neg.ask && (
        <div style={{ padding: "10px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border-dim)" }}>
          <div style={{ fontSize: "8px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "7px" }}>
            Negotiation · {tier.label}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>📣 <strong style={{ color: "var(--text)" }}>Ask:</strong> {neg.ask}</div>
            {neg.floor && <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>🛑 <strong style={{ color: "var(--text)" }}>Floor:</strong> {neg.floor}</div>}
            {neg.tip   && <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>💡 <strong style={{ color: "var(--text)" }}>Tip:</strong> {neg.tip}</div>}
          </div>
        </div>
      )}

      {/* ── Channel tips ── */}
      {ch?.tips?.length > 0 && (
        <div style={{ padding: "10px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border-dim)" }}>
          <div style={{ fontSize: "8px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
            {ch?.icon} {ch?.label} — Channel Tips
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {ch.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: "7px", fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                <span style={{ color: "var(--cyan)", flexShrink: 0 }}>›</span>{tip}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function PricingTool({ scores: initScores, spec: initSpec, records = [], onClose }) {
  const [showPicker, setShowPicker] = useState(true);
  const [scores, setScores]         = useState(initScores);
  const [spec, setSpec]             = useState(initSpec);
  const [step, setStep]         = useState(0);
  const [sizeClass, setSizeClass] = useState(initSpec?.size || null);
  const [condition, setCondition] = useState(null);
  const [channel, setChannel]   = useState(null);

  const score = useMemo(() => computePrimaryScore(scores), [scores]);
  const grade = getGrade(score);

  if (showPicker) {
    return (
      <_PickerScreen
        initScores={initScores} initSpec={initSpec} records={records}
        onSelect={(s, sp) => { setScores(s); setSpec(sp); setSizeClass(sp?.size || null); setShowPicker(false); }}
        onClose={onClose}
      />
    );
  }

  const canAdvance = () => {
    if (step === 0) return !!sizeClass;
    if (step === 1) return !!condition;
    if (step === 2) return !!channel;
    return true;
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(4,8,18,0.88)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "600px",
        maxHeight: "92vh",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
      }}>

        {/* Header */}
        <div style={{
          padding: "14px 18px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, background: "var(--bg-panel)",
        }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: "7px" }}>
              <TrendingUp size={14} style={{ color: "var(--cyan)" }} /> Sell / Trade Market Guide
            </div>
            {(spec?.name || spec?.species) && (
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                {[spec.name, spec.species].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", padding: "4px", display: "flex", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>

        {/* Step tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "8px 0", textAlign: "center",
              fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
              color: i === step ? "var(--cyan)" : i < step ? "#00c880" : "var(--text-muted)",
              borderBottom: `2px solid ${i === step ? "var(--cyan)" : i < step ? "#00c880" : "transparent"}`,
              transition: "all 0.2s", fontWeight: i === step ? 600 : 400,
            }}>
              {i < step ? "✓ " : `${i + 1}. `}{s}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "22px 24px" }}>
          {step === 0 && <SizeStep sizeClass={sizeClass} setSizeClass={setSizeClass} grade={grade} score={score} spec={spec} />}
          {step === 1 && <ConditionStep condition={condition} setCondition={setCondition} />}
          {step === 2 && <ChannelStep channel={channel} setChannel={setChannel} />}
          {step === 3 && <AdvertisingStep score={score} sizeClass={sizeClass} condition={condition} channel={channel} scores={scores} spec={spec} />}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 18px", borderTop: "1px solid var(--border-dim)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0, background: "var(--bg-panel)",
        }}>
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "7px 14px", background: "none",
              border: "1px solid var(--border)", borderRadius: "4px",
              color: "var(--text-muted)", fontSize: "11px", cursor: "pointer",
            }}
          >
            <ChevronLeft size={13} />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "7px 20px",
                background: canAdvance() ? "rgba(0,212,255,0.09)" : "transparent",
                border: `1px solid ${canAdvance() ? "rgba(0,212,255,0.4)" : "var(--border)"}`,
                borderRadius: "4px",
                color: canAdvance() ? "var(--cyan)" : "var(--text-muted)",
                fontSize: "11px", fontWeight: 600,
                cursor: canAdvance() ? "pointer" : "default",
              }}
            >
              Next <ChevronRight size={13} />
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                padding: "7px 20px",
                background: "rgba(0,212,255,0.09)",
                border: "1px solid rgba(0,212,255,0.4)",
                borderRadius: "4px",
                color: "var(--cyan)",
                fontSize: "11px", fontWeight: 600, cursor: "pointer",
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
