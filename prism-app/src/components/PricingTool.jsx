import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";
import { WEIGHTS, CONTEXTS, GRADES } from "../data/prism.js";

// ── Data ─────────────────────────────────────────────────────────────────────

const SIZE_CLASSES = [
  { key: "thumbnail",  label: "Thumbnail",      range: "< 2.5 cm",    mult: 1,   desc: "Fits on a fingertip — the most traded size class." },
  { key: "miniature",  label: "Miniature",      range: "2.5 – 4.5 cm", mult: 3,  desc: "Most popular show size. Large collector demand." },
  { key: "small_cab",  label: "Small Cabinet",  range: "4.5 – 7.5 cm", mult: 8,  desc: "Excellent display size — broad market." },
  { key: "cabinet",    label: "Cabinet",         range: "7.5 – 12 cm", mult: 20,  desc: "Serious collector/show category. Strong value for fine pieces." },
  { key: "large_cab",  label: "Large Cabinet",  range: "> 12 cm",      mult: 55,  desc: "Museum and major collector territory. Thinner market, higher ceiling." },
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
  // Use museum context as the canonical quality measure (highest weight on provenance/science)
  // Return the highest-scoring context that reflects specimen quality
  let best = 0;
  Object.keys(WEIGHTS).forEach(ctxKey => {
    const W = WEIGHTS[ctxKey];
    const s = Object.keys(W).reduce((sum, d) => sum + (scores[d] ?? 50) * W[d], 0);
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

function PriceGuideStep({ score, sizeClass, condition, channel, scores }) {
  const sz    = SIZE_CLASSES.find(s => s.key === sizeClass);
  const cond  = CONDITIONS.find(c => c.key === condition);
  const ch    = CHANNELS.find(c => c.key === channel);
  const grade = getGrade(score);

  const position = computeMarketPosition(score, condition);
  const tier = POSITION_TIERS.find(t => position >= t.min) || POSITION_TIERS[POSITION_TIERS.length - 1];
  const guidance = CHANNEL_GUIDANCE[channel]?.(position) || "";

  // Dimension drivers
  const DIM_DISPLAY = [
    { key: "localityRarity", label: "Locality Rarity", icon: "📍" },
    { key: "speciesRarity",  label: "Species Rarity",  icon: "🌍" },
    { key: "crystal",        label: "Crystal Quality", icon: "💠" },
    { key: "aesthetics",     label: "Aesthetics",      icon: "🎨" },
    { key: "provenance",     label: "Provenance",      icon: "📜" },
    { key: "scientific",     label: "Scientific Value",icon: "🔬" },
  ];
  const positiveDrivers = DIM_DISPLAY.filter(d => (scores?.[d.key] ?? 50) >= 68).sort((a,b) => (scores?.[b.key] ?? 50) - (scores?.[a.key] ?? 50));
  const negativeDrivers = DIM_DISPLAY.filter(d => (scores?.[d.key] ?? 50) <= 38).sort((a,b) => (scores?.[a.key] ?? 50) - (scores?.[b.key] ?? 50));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Market Position</h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Where this specimen sits among comparable <strong>{sz?.label}</strong> pieces in the collector market —
          relative to others of the same size class, not an absolute dollar figure.
        </p>
      </div>

      {/* Position card */}
      <div style={{ padding: "18px 20px", background: "var(--bg-panel)", borderRadius: "8px", border: `1px solid ${tier.color}30` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
              Position among {sz?.label} specimens
            </div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: tier.color, fontFamily: "var(--mono)", lineHeight: 1 }}>
              {position}<span style={{ fontSize: "16px", opacity: 0.6 }}>/100</span>
            </div>
          </div>
          <div style={{
            padding: "5px 12px", borderRadius: "4px", marginTop: "2px",
            background: `${tier.color}18`, border: `1px solid ${tier.color}40`,
            fontSize: "12px", fontWeight: 700, color: tier.color, letterSpacing: "0.06em",
          }}>
            {tier.label}
          </div>
        </div>

        {/* Position bar */}
        <div style={{ height: "6px", background: "var(--bg)", borderRadius: "3px", marginBottom: "8px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${position}%`, background: tier.bar, borderRadius: "3px", transition: "width 0.5s" }} />
        </div>

        {/* Scale labels */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "10px" }}>
          <span>Entry</span><span>Standard</span><span>Premium</span><span>Trophy</span>
        </div>

        <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>{tier.desc}</div>

        {/* Summary chips */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginTop: "12px" }}>
          {[
            { label: "PRISM Grade", value: `${grade.emoji} ${grade.label}` },
            { label: "Condition",   value: `${cond?.icon} ${cond?.label}` },
            { label: "Size Class",  value: sz?.label },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center", padding: "6px", background: "var(--bg)", borderRadius: "4px" }}>
              <div style={{ fontSize: "8px", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "3px" }}>{label}</div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Position drivers */}
      {(positiveDrivers.length > 0 || negativeDrivers.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>Position Drivers</div>
          {positiveDrivers.map(d => (
            <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", background: "rgba(0,200,128,0.05)", border: "1px solid rgba(0,200,128,0.18)", borderRadius: "4px" }}>
              <span style={{ color: "#00c880", fontSize: "12px" }}>↑</span>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                {d.icon} <strong style={{ color: "var(--text)" }}>{d.label}</strong> ({scores?.[d.key] ?? 50}/100) — pushing position up
              </span>
            </div>
          ))}
          {negativeDrivers.map(d => (
            <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", background: "rgba(255,80,80,0.05)", border: "1px solid rgba(255,80,80,0.15)", borderRadius: "4px" }}>
              <span style={{ color: "#ff6060", fontSize: "12px" }}>↓</span>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                {d.icon} <strong style={{ color: "var(--text)" }}>{d.label}</strong> ({scores?.[d.key] ?? 50}/100) — pulling position down
              </span>
            </div>
          ))}
          {condition === "repaired" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", background: "rgba(255,160,40,0.06)", border: "1px solid rgba(255,160,40,0.25)", borderRadius: "4px" }}>
              <span style={{ color: "#ffa028", fontSize: "12px" }}>↓</span>
              <span style={{ fontSize: "11px", color: "#ffa028" }}>
                🔧 Repaired/restored — position adjusted down 32 pts. <strong>Must disclose.</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Size class context */}
      <div style={{ padding: "9px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border-dim)", fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>
        📐 <strong style={{ color: "var(--text)" }}>{sz?.label}:</strong> {sz?.desc}
      </div>

      {/* Channel guidance */}
      {guidance && (
        <div style={{ padding: "10px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border-dim)" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
            {ch?.icon} {ch?.label} — Channel Guidance
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6 }}>{guidance}</div>
        </div>
      )}

      {/* PRISM note */}
      <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: "4px", border: "1px solid var(--border-dim)", fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.5 }}>
        📊 Position is based on your PRISM score of <strong style={{ color: "var(--text)" }}>{score}/100</strong> ({grade.label}),
        adjusted for condition. Improving Crystal Quality, Aesthetics, or Locality score will raise your market position.
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function PricingTool({ scores, spec, onClose }) {
  const [step, setStep]         = useState(0);
  const [sizeClass, setSizeClass] = useState(null);
  const [condition, setCondition] = useState(null);
  const [channel, setChannel]   = useState(null);

  const score = useMemo(() => computePrimaryScore(scores), [scores]);
  const grade = getGrade(score);

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
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>
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
