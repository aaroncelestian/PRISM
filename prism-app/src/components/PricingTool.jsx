import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, DollarSign, Copy, CheckCheck, Printer } from "lucide-react";
import { WEIGHTS, CONTEXTS, GRADES, THRESHOLD, applyNonLinearTransform } from "../data/prism.js";

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
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>💰 Sell / Trade Price Guide</div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>Select the specimen to price</div>
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
      "Best for pieces likely valued over $2,000. Contact them with photos first.",
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

const STEPS = ["Size", "Condition", "Sale Channel", "Price Guide"];

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

// Channel guidance — qualitative, no dollar amounts
const CHANNEL_GUIDANCE = {
  private:     (p) => p >= 72 ? "Premium positioning — target specialist collectors who focus on this species or locality. Patience pays significantly here."
                              : p >= 38 ? "Solid positioning. Post in Mindat forums or Facebook mineral groups with clear locality info and good photos."
                              : "Competitive price is essential. Consider bundling or trading up rather than holding for top dollar.",
  show:        (p) => p >= 72 ? "Strong show-table piece. Price with negotiation room — informed show buyers recognize premium positioning and will engage."
                              : p >= 38 ? "Good show candidate. Thumbnail and miniature sizes move fastest on show day. Competitive but fair pricing."
                              : "Price aggressively for quick floor traffic, or save for a swap rather than the main floor.",
  online:      (p) => p >= 72 ? "Premium pieces sell online, but listing quality is everything. Professional photos, locality in the title, and a compelling description are essential."
                              : p >= 38 ? "Broad online market. Lead with locality and species name. Natural light photos dramatically outperform flash."
                              : "Expect a skeptical buyer pool. Emphasize any positive attributes; be transparent about limitations.",
  auction:     (p) => p >= 72 ? "Well-suited for specialist auction. Contact Heritage, Bonhams, or Lyon & Turnbull with photos. Catalog exposure also adds provenance value."
                              : "Auction seller fees (10–20%) erode margin on average-positioned pieces. Other channels will likely net more.",
  consignment: (p) => p >= 72 ? "A premium piece gives you leverage to negotiate commission down to 30–35%. Ensure the dealer has the right collector audience."
                              : "Standard consignment rates (40–50%) apply. Confirm the dealer actively sells in the relevant species or locality niche.",
  buyout:      (_) => "Dealer buyout is position-independent — expect 20–35% of what the dealer plans to sell it for, regardless of your PRISM grade. Get 2–3 quotes.",
  club:        (p) => p >= 72 ? "Knowledgeable club audiences appreciate quality, but top-tier pieces may be undervalued compared to open collector markets. Consider private sale first."
                              : "Good fit. Club and society buyers tend to price fairly for mid-grade material, and the audience understands mineralogical value.",
};

function computeMarketPosition(score, conditionKey) {
  const adj = { pristine: 8, excellent: 0, good: -15, repaired: -32, damaged: -55 }[conditionKey] || 0;
  return Math.max(0, Math.min(100, score + adj));
}

// ── Price estimation helpers ──────────────────────────────────────────────────

const BASE_RETAIL = {
  thumbnail: 18,
  miniature: 55,
  small_cab: 145,
  cabinet:   360,
  large_cab: 990,
  museum:    2800,
};

function getQualityMult(score) {
  if (score >= 90) return 8.0;
  if (score >= 75) return 4.0;
  if (score >= 60) return 2.0;
  if (score >= 45) return 1.0;
  if (score >= 22) return 0.5;
  return 0.25;
}

function computePriceRange(score, sizeClass, conditionKey, channelKey) {
  const base    = BASE_RETAIL[sizeClass] ?? 50;
  const qMult   = getQualityMult(score);
  const cMult   = CONDITIONS.find(c => c.key === conditionKey)?.mult ?? 1;
  const chMult  = CHANNELS.find(c => c.key === channelKey)?.mult ?? 1;
  const retail  = base * qMult * cMult;
  const mid     = retail * chMult;
  return {
    low:          Math.round(mid * 0.72),
    mid:          Math.round(mid),
    high:         Math.round(mid * 1.42),
    retail:       Math.round(retail),
    suggestedAsk: Math.round(mid * 1.15),
    floor:        Math.round(mid * 0.80),
  };
}

function fmt(n) {
  if (n >= 10000) return `$${Math.round(n / 1000)}k`;
  if (n >= 1000)  return `$${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `$${n}`;
}

const NEGOTIATION_GUIDE = {
  "Trophy":           { ask: "Price at the high end of your range and hold — exceptional pieces reward patient sellers.", floor: "Expect 85–90% of ask from serious buyers. Don't capitulate below that.", tip: "Document the PRISM score prominently. Top collectors pay premiums for quantified quality." },
  "Investment Grade": { ask: "Price 15–20% above your target. Investment-grade pieces attract committed buyers.", floor: "80% of ask is a firm floor — better buyers exist, don't rush.", tip: "Provenance documentation materially adds to investment-grade value. Include it." },
  "Premium":          { ask: "Price 10–15% above your target to allow normal collector negotiation.", floor: "70–75% of ask is a reasonable floor for this tier.", tip: "Highlight your highest-scoring PRISM dimensions — locality rarity and crystal quality close deals." },
  "Above Average":    { ask: "Price at mid estimate with good presentation.", floor: "65–70% of ask is typical. Below that you're leaving money behind.", tip: "Photography and accurate locality info close deals faster than price adjustments at this tier." },
  "Standard":         { ask: "Price at or slightly below mid estimate to remain competitive.", floor: "60–65% of ask is typical. Bundles and trades often net more than single-piece sales.", tip: "Flexible terms (trades, bundles) move standard-grade pieces more effectively than price cuts." },
  "Entry / Bulk":     { ask: "Price at the low end — this tier is highly price-competitive.", floor: "Quick liquidation beats holding. Set a firm floor and focus on volume.", tip: "Lot sales or trade-up offers are usually more effective than single-piece listings at this tier." },
};

function buildListingTitle(spec, grade, sizeClass) {
  const sz = SIZE_CLASSES.find(s => s.key === sizeClass);
  const parts = [];
  if (grade.min >= 75) parts.push("Superb");
  else if (grade.min >= 60) parts.push("Fine");
  if (spec?.species) parts.push(spec.species);
  else parts.push("Mineral Specimen");
  if (sz) parts.push(sz.label);
  if (spec?.locality) parts.push(spec.locality);
  parts.push(`PRISM ${grade.label}`);
  return parts.join(" ");
}

function buildMarketReport({ spec, score, grade, sizeClass, condition, channel, position, tier, prices, scores }) {
  const now  = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const sz   = SIZE_CLASSES.find(s => s.key === sizeClass);
  const cond = CONDITIONS.find(c => c.key === condition);
  const ch   = CHANNELS.find(c => c.key === channel);
  const neg  = NEGOTIATION_GUIDE[tier.label] || {};
  const fmtD = n => n >= 1000 ? `$${n.toLocaleString()}` : `$${n}`;
  const LINE = "\u2500".repeat(52);
  const DIM_DISPLAY = [
    { key: "localityRarity", label: "Locality Rarity" },
    { key: "speciesRarity",  label: "Species Rarity"  },
    { key: "varietyRarity",  label: "Variety Rarity"  },
    { key: "crystal",        label: "Crystal Quality" },
    { key: "aesthetics",     label: "Aesthetics"      },
    { key: "provenance",     label: "Provenance"      },
    { key: "scientific",     label: "Scientific Value"},
  ];
  const lines = ["PRISM \u2014 SPECIMEN MARKET REPORT", `Generated: ${now}`, LINE, ""];
  if (spec?.name || spec?.species || spec?.locality) {
    lines.push("SPECIMEN");
    if (spec?.name)     lines.push(`  Name:      ${spec.name}`);
    if (spec?.species)  lines.push(`  Species:   ${spec.species}`);
    if (spec?.locality) lines.push(`  Locality:  ${spec.locality}`);
    lines.push("");
  }
  lines.push(
    "QUALITY",
    `  PRISM Score: ${score}/100`,
    `  Grade:       ${grade.emoji} ${grade.label}`,
    `  Condition:   ${cond?.label}`,
    "",
    "SIZE & CHANNEL",
    `  Size Class:   ${sz?.label} (${sz?.range})`,
    `  Sale Channel: ${ch?.label}`,
    "",
    `ESTIMATED PRICE RANGE \u2014 ${ch?.label}`,
    `  Low: ${fmtD(prices.low)}   Mid: ${fmtD(prices.mid)}   High: ${fmtD(prices.high)}`,
    `  Suggested Ask:   ${fmtD(prices.suggestedAsk)}`,
    `  Walk-Away Floor: ${fmtD(prices.floor)}`,
    "",
    `MARKET POSITION: ${tier.label} (${position}/100 among ${sz?.label} specimens)`,
    `  ${tier.desc}`,
    "",
    "VALUE DIMENSIONS",
  );
  DIM_DISPLAY.forEach(d => {
    const v = scores?.[d.key] ?? 50;
    const arrow = v >= 68 ? "\u2191" : v <= 38 ? "\u2193" : " ";
    lines.push(`  ${arrow} ${d.label}: ${v}/100`);
  });
  const guidance = CHANNEL_GUIDANCE[channel]?.(position);
  lines.push("", "CHANNEL GUIDANCE");
  if (guidance) lines.push(`  ${guidance}`);
  lines.push("", "SELLING TIPS");
  (ch?.tips || []).forEach(t => lines.push(`  \u2022 ${t}`));
  if (neg.ask) {
    lines.push(
      "", "NEGOTIATION",
      `  Suggested Ask:   ${fmtD(prices.suggestedAsk)}`,
      `  Walk-Away Floor: ${fmtD(prices.floor)}`,
      `  Strategy: ${neg.ask}`,
      ...(neg.floor ? [`  Floor:    ${neg.floor}`] : []),
      ...(neg.tip   ? [`  Tip:      ${neg.tip}`]   : []),
    );
  }
  lines.push(
    "", LINE,
    "PRISM (Precision Rating Index of Specimen Minerals)",
    "Estimates are based on market norms and PRISM scoring.",
    "Individual results vary. Not a guarantee of value.",
  );
  return lines.join("\n");
}

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
          Size class is one of the biggest price drivers — a cabinet-sized specimen of the same quality
          typically commands 5–20× the price of a thumbnail.
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
          This quality level is<br />used in price calculation
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

function PriceGuideStep({ score, sizeClass, condition, channel, scores, spec }) {
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedTitle,  setCopiedTitle]  = useState(false);

  const sz       = SIZE_CLASSES.find(s => s.key === sizeClass);
  const cond     = CONDITIONS.find(c => c.key === condition);
  const ch       = CHANNELS.find(c => c.key === channel);
  const grade    = getGrade(score);
  const position = computeMarketPosition(score, condition);
  const tier     = POSITION_TIERS.find(t => position >= t.min) || POSITION_TIERS[POSITION_TIERS.length - 1];
  const guidance = CHANNEL_GUIDANCE[channel]?.(position) || "";
  const prices   = computePriceRange(score, sizeClass, condition, channel);
  const neg      = NEGOTIATION_GUIDE[tier.label] || {};
  const listingTitle = buildListingTitle(spec, grade, sizeClass);

  const DIM_DISPLAY = [
    { key: "localityRarity", label: "Locality Rarity", icon: "📍" },
    { key: "speciesRarity",  label: "Species Rarity",  icon: "🌍" },
    { key: "crystal",        label: "Crystal Quality", icon: "💠" },
    { key: "aesthetics",     label: "Aesthetics",      icon: "🎨" },
    { key: "provenance",     label: "Provenance",      icon: "📜" },
    { key: "scientific",     label: "Scientific Value",icon: "🔬" },
  ];
  const positiveDrivers = DIM_DISPLAY.filter(d => (scores?.[d.key] ?? 50) >= 68).sort((a, b) => (scores?.[b.key] ?? 50) - (scores?.[a.key] ?? 50));
  const negativeDrivers = DIM_DISPLAY.filter(d => (scores?.[d.key] ?? 50) <= 38).sort((a, b) => (scores?.[a.key] ?? 50) - (scores?.[b.key] ?? 50));

  const copyReport = () => {
    const txt = buildMarketReport({ spec, score, grade, sizeClass, condition, channel, position, tier, prices, scores });
    navigator.clipboard.writeText(txt)
      .then(() => { setCopiedReport(true); setTimeout(() => setCopiedReport(false), 2500); })
      .catch(() => {});
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Market Position &amp; Price Guide</h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Estimated pricing for a <strong>{sz?.label}</strong> sold via <strong>{ch?.label}</strong>.
          Ranges reflect real-world variability — individual sales depend on buyer, timing, and presentation.
        </p>
      </div>

      {/* ── Price Range Card ── */}
      <div style={{ padding: "16px 18px", background: "var(--bg-panel)", borderRadius: "8px", border: `1px solid ${tier.color}35` }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>
          Estimated Price Range · {ch?.icon} {ch?.label}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {[
            { label: "Low",  value: prices.low,  color: "var(--text-muted)" },
            { label: "Mid",  value: prices.mid,  color: tier.color },
            { label: "High", value: prices.high, color: "var(--text-dim)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: "center", padding: "10px 8px", background: "var(--bg)", borderRadius: "5px" }}>
              <div style={{ fontSize: "8px", color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
              <div style={{ fontSize: label === "Mid" ? "20px" : "16px", fontWeight: 700, color, fontFamily: "var(--mono)" }}>{fmt(value)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "10px" }}>
          <div style={{ padding: "8px 10px", background: "rgba(0,212,255,0.06)", borderRadius: "5px", border: "1px solid rgba(0,212,255,0.2)" }}>
            <div style={{ fontSize: "8px", color: "rgba(0,212,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "3px" }}>Suggested Ask</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--cyan)", fontFamily: "var(--mono)" }}>{fmt(prices.suggestedAsk)}</div>
            <div style={{ fontSize: "9px", color: "rgba(0,212,255,0.4)", marginTop: "1px" }}>+15% above mid for negotiation room</div>
          </div>
          <div style={{ padding: "8px 10px", background: "rgba(255,80,80,0.04)", borderRadius: "5px", border: "1px solid rgba(255,80,80,0.15)" }}>
            <div style={{ fontSize: "8px", color: "rgba(255,100,100,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "3px" }}>Walk-Away Floor</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#ff8080", fontFamily: "var(--mono)" }}>{fmt(prices.floor)}</div>
            <div style={{ fontSize: "9px", color: "rgba(255,100,100,0.4)", marginTop: "1px" }}>Don't accept below this</div>
          </div>
        </div>
        <div style={{ fontSize: "9px", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Based on PRISM {score}/100 · {cond?.label} · {sz?.label} · {ch?.label} ({ch?.fees} fees).
          Reference ranges only — not a formal appraisal.
        </div>
      </div>

      {/* ── Market Position ── */}
      <div style={{ padding: "14px 16px", background: "var(--bg-panel)", borderRadius: "8px", border: `1px solid ${tier.color}25` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Market Position · {sz?.label} Class
          </div>
          <div style={{ padding: "3px 10px", borderRadius: "4px", background: `${tier.color}18`, border: `1px solid ${tier.color}40`, fontSize: "11px", fontWeight: 700, color: tier.color }}>
            {tier.label}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ fontSize: "26px", fontWeight: 700, color: tier.color, fontFamily: "var(--mono)", lineHeight: 1 }}>
            {position}<span style={{ fontSize: "13px", opacity: 0.6 }}>/100</span>
          </div>
          <div style={{ flex: 1, height: "5px", background: "var(--bg)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${position}%`, background: tier.bar, borderRadius: "2px", transition: "width 0.5s" }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", color: "var(--text-muted)", letterSpacing: "0.07em", marginBottom: "7px" }}>
          <span>Entry</span><span>Standard</span><span>Premium</span><span>Trophy</span>
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>{tier.desc}</div>
      </div>

      {/* ── Value Drivers ── */}
      {(positiveDrivers.length > 0 || negativeDrivers.length > 0 || condition === "repaired") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>Value Drivers</div>
          {positiveDrivers.map(d => (
            <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 10px", background: "rgba(0,200,128,0.05)", border: "1px solid rgba(0,200,128,0.18)", borderRadius: "4px" }}>
              <span style={{ color: "#00c880", fontSize: "12px" }}>↑</span>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>{d.icon} <strong style={{ color: "var(--text)" }}>{d.label}</strong> {scores?.[d.key] ?? 50}/100 — supports premium pricing</span>
            </div>
          ))}
          {negativeDrivers.map(d => (
            <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 10px", background: "rgba(255,80,80,0.05)", border: "1px solid rgba(255,80,80,0.15)", borderRadius: "4px" }}>
              <span style={{ color: "#ff6060", fontSize: "12px" }}>↓</span>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>{d.icon} <strong style={{ color: "var(--text)" }}>{d.label}</strong> {scores?.[d.key] ?? 50}/100 — limiting market position</span>
            </div>
          ))}
          {condition === "repaired" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 10px", background: "rgba(255,160,40,0.06)", border: "1px solid rgba(255,160,40,0.25)", borderRadius: "4px" }}>
              <span style={{ color: "#ffa028", fontSize: "12px" }}>↓</span>
              <span style={{ fontSize: "11px", color: "#ffa028" }}>🔧 Repaired/restored — position adjusted down. <strong>Must disclose in every listing.</strong></span>
            </div>
          )}
        </div>
      )}

      {/* ── Channel guidance + tips ── */}
      {(guidance || ch?.tips?.length > 0) && (
        <div style={{ padding: "10px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border-dim)" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "7px" }}>
            {ch?.icon} {ch?.label} — Channel Strategy
          </div>
          {guidance && <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: ch?.tips?.length ? "8px" : 0 }}>{guidance}</div>}
          {ch?.tips?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {ch.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: "7px", fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--cyan)", flexShrink: 0 }}>›</span>{tip}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Negotiation guide ── */}
      {neg.ask && (
        <div style={{ padding: "10px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border-dim)" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "7px" }}>
            Negotiation Guide · {tier.label}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>📣 <strong style={{ color: "var(--text)" }}>Ask:</strong> {neg.ask}</div>
            {neg.floor && <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>🛑 <strong style={{ color: "var(--text)" }}>Floor:</strong> {neg.floor}</div>}
            {neg.tip   && <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>💡 <strong style={{ color: "var(--text)" }}>Tip:</strong> {neg.tip}</div>}
          </div>
        </div>
      )}

      {/* ── Listing title helper ── */}
      <div style={{ padding: "10px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border-dim)" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "7px" }}>
          Listing Title Helper
        </div>
        <div style={{ fontSize: "12px", color: "var(--text)", lineHeight: 1.5, padding: "7px 10px", background: "var(--bg)", borderRadius: "4px", border: "1px solid var(--border-dim)", marginBottom: "7px", fontStyle: "italic" }}>
          "{listingTitle}"
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(listingTitle).then(() => { setCopiedTitle(true); setTimeout(() => setCopiedTitle(false), 2000); }).catch(() => {})}
          style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "4px", fontSize: "10px", fontWeight: 500, cursor: "pointer", background: copiedTitle ? "rgba(0,200,128,0.09)" : "rgba(0,212,255,0.07)", border: `1px solid ${copiedTitle ? "rgba(0,200,128,0.4)" : "rgba(0,212,255,0.25)"}`, color: copiedTitle ? "#00c880" : "var(--cyan)", transition: "all 0.2s" }}
        >
          {copiedTitle ? <CheckCheck size={11} /> : <Copy size={11} />}
          {copiedTitle ? "Copied!" : "Copy Title"}
        </button>
      </div>

      {/* ── Export ── */}
      <div style={{ borderTop: "1px solid var(--border-dim)", paddingTop: "14px" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
          Export Market Report
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          <button
            onClick={copyReport}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "7px 10px", borderRadius: "5px", fontSize: "10px", fontWeight: 500, cursor: "pointer", background: copiedReport ? "rgba(0,200,128,0.09)" : "var(--bg-card)", border: `1px solid ${copiedReport ? "rgba(0,200,128,0.4)" : "var(--border)"}`, color: copiedReport ? "#00c880" : "var(--text-dim)", transition: "all 0.2s" }}
          >
            {copiedReport ? <CheckCheck size={12} /> : <Copy size={12} />}
            {copiedReport ? "Copied!" : "Copy Report"}
          </button>
          <button
            onClick={() => window.print()}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "7px 10px", borderRadius: "5px", fontSize: "10px", fontWeight: 500, cursor: "pointer", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-dim)" }}
          >
            <Printer size={12} /> Print
          </button>
        </div>
      </div>
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
              <DollarSign size={14} style={{ color: "var(--cyan)" }} /> Sell / Trade Price Guide
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
          {step === 3 && <PriceGuideStep score={score} sizeClass={sizeClass} condition={condition} channel={channel} scores={scores} spec={spec} />}
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
