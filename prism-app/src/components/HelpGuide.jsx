import { useState } from "react";
import { X } from "lucide-react";

const TABS = [
  { key: "why",        label: "Why PRISM?" },
  { key: "howto",      label: "How to Score" },
  { key: "dimensions", label: "6 Dimensions" },
  { key: "contexts",   label: "Contexts" },
  { key: "research",   label: "Research Mode" },
];

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cyan)", letterSpacing: "0.12em",
        textTransform: "uppercase", marginBottom: "8px", paddingBottom: "5px",
        borderBottom: "1px solid var(--border-dim)" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function P({ children }) {
  return <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.75, margin: "0 0 10px" }}>{children}</p>;
}

function Callout({ icon, color = "var(--cyan)", children }) {
  return (
    <div style={{ display: "flex", gap: "10px", padding: "10px 14px", borderRadius: "6px",
      background: `${color}0d`, border: `1px solid ${color}28`, marginBottom: "10px" }}>
      <span style={{ fontSize: "16px", flexShrink: 0, lineHeight: 1.5 }}>{icon}</span>
      <span style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>{children}</span>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
      <div style={{ width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
        background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--mono)", fontSize: "10px", fontWeight: 700, color: "var(--cyan)" }}>
        {n}
      </div>
      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>{title}</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.65 }}>{children}</div>
      </div>
    </div>
  );
}

function DimCard({ icon, name, weight, desc }) {
  return (
    <div style={{ padding: "10px 14px", background: "var(--bg-panel)", border: "1px solid var(--border)",
      borderRadius: "6px", marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
        <span style={{ fontSize: "15px" }}>{icon}</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)" }}>{name}</span>
        <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "auto", fontFamily: "var(--mono)" }}>{weight}</span>
      </div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
}

function CtxCard({ icon, name, focus, use }) {
  return (
    <div style={{ padding: "10px 14px", background: "var(--bg-panel)", border: "1px solid var(--border)",
      borderRadius: "6px", marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <span style={{ fontSize: "15px" }}>{icon}</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)" }}>{name}</span>
      </div>
      <div style={{ fontSize: "11px", color: "var(--cyan)", marginBottom: "3px" }}>Weights: {focus}</div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.65 }}>{use}</div>
    </div>
  );
}

function TabWhy() {
  return (
    <>
      <Section title="The Problem">
        <P>
          Mineral specimen pricing is one of the least transparent markets in the collectibles world.
          Two Wulfenite specimens from the same mine, same size, can sell for $200 or $2,000 — and buyers
          are often left wondering why.
        </P>
        <P>
          Prices are set by dealer intuition, auction momentum, and collected wisdom that rarely gets
          written down. New collectors pay premiums they shouldn't; experienced collectors struggle to
          justify prices when selling or donating.
        </P>
      </Section>

      <Section title="What PRISM Does">
        <Callout icon="🔬">
          PRISM gives you a <strong>systematic, repeatable score from 0–100</strong> based on the six
          factors that actually drive mineral specimen value: crystal quality, species rarity, locality
          significance, provenance, aesthetics, and scientific interest.
        </Callout>
        <P>
          The score is weighted differently depending on your purpose — a museum curator cares about
          provenance and scientific value far more than a collector focused on beauty.
        </P>
      </Section>

      <Section title="When to Use It">
        <Callout icon="🛍️" color="#00c880">
          <strong>Before buying</strong> — score a specimen you're considering. Compare its asking price
          to other scored pieces in your research database to see if it's fairly priced.
        </Callout>
        <Callout icon="💰" color="#ffb347">
          <strong>Before selling</strong> — use your PRISM score to justify your asking price with buyers.
          Use the Sell/Trade tool to estimate fair market value.
        </Callout>
        <Callout icon="🏛️" color="#7c5cfc">
          <strong>For donations &amp; insurance</strong> — an objective score creates a defensible
          valuation for museum donations or insurance appraisals.
        </Callout>
        <Callout icon="📊" color="#f472b6">
          <strong>Market research</strong> — track listings you find across eBay, iRocks, Tucson shows,
          and dealer sites. Score them and instantly see which localities or vendors price at a premium.
        </Callout>
      </Section>
    </>
  );
}

function TabHowTo() {
  return (
    <>
      <Section title="Quick Start">
        <Step n="1" title="Choose your mode">
          Use <strong>Guided</strong> (Wand icon) to be walked through each dimension step by step — ideal
          for beginners or when you want to think carefully. Use <strong>Expert</strong> (Sliders icon)
          to set all six dimensions at once.
        </Step>
        <Step n="2" title="Set your context">
          Before scoring, pick the context that matches your purpose: Collector, Museum, Exhibition,
          Study, or Commercial. This changes how much each dimension contributes to the final score.
        </Step>
        <Step n="3" title="Score the specimen name &amp; locality">
          Enter the mineral species and locality. These feed directly into two of the six dimensions.
        </Step>
        <Step n="4" title="Score each dimension">
          Rate crystal quality (0–100), species rarity, locality significance, provenance documentation,
          aesthetics, and scientific value. Each slider has descriptive labels to guide you.
        </Step>
        <Step n="5" title="Read the result">
          Your PRISM score appears live on the right panel with a grade (Museum / Exhibition / Collector /
          Study / General) and any compound grades (e.g., "Jewel Quality", "Historical Archive").
        </Step>
        <Step n="6" title="Save &amp; use the tools">
          Hit <strong>Save</strong> to add the result to your collection history. Use the
          <strong> Tools</strong> menu to export, generate a certificate, get a pricing estimate, or
          evaluate a museum donation.
        </Step>
      </Section>

      <Section title="Tips">
        <Callout icon="💡">
          The <strong>Guided mode</strong> shows calibration examples for each dimension — click "Show
          examples" on any step to see what a score of 25, 50, 75, or 100 looks like in practice.
        </Callout>
        <Callout icon="🔁">
          Use <strong>Reset</strong> (↺ button top-right) to clear all scores and start fresh for a new
          specimen without reloading the page.
        </Callout>
        <Callout icon="📱">
          PRISM works on mobile — use it at shows, auctions, or dealer tables to score specimens on the
          spot before making buying decisions.
        </Callout>
      </Section>
    </>
  );
}

function TabDimensions() {
  return (
    <>
      <Section title="The Six Scoring Dimensions">
        <P>Every PRISM score is built from these six factors, each rated 0–100:</P>
        <DimCard icon="💠" name="Crystal Quality"
          weight="22–42% weight (highest in Exhibition)"
          desc="The physical perfection of the crystals: terminations, luster, clarity, lack of damage. A gem-quality terminated crystal with vitreous luster scores 90+. A broken, dull, or corroded specimen scores below 30." />
        <DimCard icon="🌍" name="Species Rarity"
          weight="8–26% weight (highest in Collector)"
          desc="How rare the mineral species is globally. Common minerals like quartz or calcite score low. Ultra-rare species known from only one or two localities score 90–100. Check the MINDAT occurrence count as a guide." />
        <DimCard icon="📍" name="Locality Significance"
          weight="8–26% weight (highest in Collector)"
          desc="The prestige and production history of the specific mine. World-class localities (Tsumeb, Broken Hill, Herja) score 80–100. Obscure or poorly documented localities score 20–40. Classic closed mines often score higher than currently active ones." />
        <DimCard icon="📜" name="Provenance &amp; Documentation"
          weight="6–35% weight (highest for Museum)"
          desc="The chain of ownership, collection history, and documentation. A specimen with a numbered label from a major collection, acquisition records, and publication history scores 90+. A specimen with no history scores near 0. This dimension matters enormously for museum and insurance contexts." />
        <DimCard icon="🎨" name="Aesthetics &amp; Display"
          weight="6–30% weight (highest in Exhibition)"
          desc="Overall visual appeal: color saturation, contrast against matrix, natural presentation angle, self-standing or display-ready. Stunning color combinations and natural displays score 80+. Dull, matrix-heavy, or awkwardly shaped specimens score lower." />
        <DimCard icon="🔬" name="Scientific Value"
          weight="3–42% weight (highest in Study)"
          desc="Specimens with unusual crystal habits, rare associations, twinning, pseudomorphs, or documented research significance score high. Use the checklist to select applicable scientific criteria — each adds 20 points up to 100." />
      </Section>

      <Section title="How the Score is Calculated">
        <P>
          Your final PRISM score is the weighted average of all six dimensions. Weights vary by context
          (see the Contexts tab). A score of 90+ earns Museum grade; 75–89 is Exhibition; 60–74 is
          Collector; 45–59 is Study; below 45 is General.
        </P>
        <Callout icon="🏅">
          <strong>Compound grades</strong> are awarded on top of the primary grade when specific
          dimension combinations are met — for example, "Jewel Quality" requires both high crystal and
          high aesthetics, while "Historical Archive" requires high provenance and scientific scores.
        </Callout>
      </Section>
    </>
  );
}

function TabContexts() {
  return (
    <>
      <Section title="Why Context Matters">
        <P>
          A museum acquiring a specimen for its research collection cares deeply about provenance
          documentation and scientific significance — aesthetics are secondary. A collector buying for
          display cares about crystals and beauty. PRISM captures this by shifting the dimension weights
          based on your intended use.
        </P>
      </Section>

      <Section title="The Five Contexts">
        <CtxCard icon="🏛️" name="Museum"
          focus="Provenance 35% · Scientific 20% · Crystal/Species/Locality 13% each"
          use="Use when evaluating a specimen for museum acquisition, donation, or institutional loan. Emphasizes documentation, research value, and species/locality rarity." />
        <CtxCard icon="✨" name="Exhibition"
          focus="Crystal 42% · Aesthetics 30% · Locality 12%"
          use="Use for display-quality specimens destined for showcases, exhibitions, or gallery sales. Crystal perfection and visual impact dominate." />
        <CtxCard icon="💎" name="Collector"
          focus="Crystal 22% · Species 26% · Locality 26%"
          use="The general-purpose collector context. Balances physical quality with rarity — both species rarity and locality significance carry equal weight to crystals." />
        <CtxCard icon="🔬" name="Study / Research"
          focus="Scientific 42% · Provenance 26% · Crystal 11%"
          use="For academic study specimens, type specimens, or reference material. Scientific features and documentation far outweigh visual appeal." />
        <CtxCard icon="🏷️" name="Commercial / General"
          focus="Crystal 38% · Species 15.5% · Locality 15.5% · Aesthetics 15%"
          use="For standard dealer or auction pricing. Weighted toward physical qualities that drive retail sales — a practical baseline for market value estimation." />
      </Section>
    </>
  );
}

function TabResearch() {
  return (
    <>
      <Section title="What Research Mode Is">
        <P>
          Research mode is your personal market intelligence database. Every time you see a mineral
          specimen for sale — on eBay, iRocks, at Tucson, at a dealer table — you can add it as a
          listing with its asking price, size, condition, and source.
        </P>
        <P>
          Once you have a handful of scored listings, the Analysis view shows you patterns that
          are impossible to see otherwise: which localities command a premium, whether a particular
          dealer prices higher than the market, and how price scales with PRISM score.
        </P>
      </Section>

      <Section title="How to Use Research Mode">
        <Step n="1" title="Add listings">
          Click <strong>+ Add Listing</strong> and fill in the species, locality, size class, condition,
          asking price, and source (dealer or platform name). Notes and photos are optional.
        </Step>
        <Step n="2" title="Score listings with PRISM">
          Each listing card has a <strong>Score with PRISM</strong> button. Clicking it takes you into
          Guided mode pre-filled with the specimen's species and locality. When done, save the score
          back to the listing.
        </Step>
        <Step n="3" title="Switch to Analysis view">
          Once you have 2+ listings, click <strong>📊 Analysis</strong> to see charts:
          average price by species and size, price vs PRISM score regression, market position table,
          and the Price Drivers scatter.
        </Step>
        <Step n="4" title="Save &amp; manage your database">
          Click <strong>Save</strong> to download your database as a JSON file you can name and store
          in iCloud, Dropbox, or Google Drive. Use <strong>Open</strong> to reload it later. Use
          <strong> Clear All</strong> to start fresh for a new research session.
        </Step>
      </Section>

      <Section title="Reading the Analysis Charts">
        <Callout icon="📈">
          <strong>Price vs PRISM Score</strong> — uses log-linear regression because mineral prices grow
          exponentially with quality. Switch to "Log" scale to see the relationship as a straight line.
          Green dots are underpriced vs expectation; orange dots are at a premium.
        </Callout>
        <Callout icon="🎯" color="#7c5cfc">
          <strong>Market Position table</strong> — shows each scored listing ranked by how its asking
          price compares to the expected price from the regression. The % column tells you immediately
          whether a listing is a potential deal or overpriced.
        </Callout>
        <Callout icon="🔵" color="#ffb347">
          <strong>Price Drivers scatter</strong> — X-axis is physical size, Y-axis is price, dot size
          is condition quality. Switch "Color by" to <strong>Vendor</strong> to see if a particular
          dealer consistently prices higher across all sizes.
        </Callout>
      </Section>
    </>
  );
}

const TAB_CONTENT = { why: TabWhy, howto: TabHowTo, dimensions: TabDimensions, contexts: TabContexts, research: TabResearch };

export default function HelpGuide({ onClose }) {
  const [tab, setTab] = useState("why");
  const TabComponent = TAB_CONTENT[tab];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1100,
      background: "rgba(4,8,18,0.92)", backdropFilter: "blur(5px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "640px", maxHeight: "90vh",
        background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-dim)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
              ❓ Help &amp; Guide
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "10px" }}>
              PRISM — Precision Rating Index · Specimen Minerals
            </span>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "2px", padding: "0 14px", borderBottom: "1px solid var(--border-dim)",
          overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flexShrink: 0, padding: "9px 14px", border: "none", borderRadius: "4px 4px 0 0",
              background: tab === t.key ? "var(--bg-panel)" : "transparent",
              color: tab === t.key ? "var(--cyan)" : "var(--text-muted)",
              fontSize: "11px", fontWeight: tab === t.key ? 600 : 400,
              borderBottom: tab === t.key ? "2px solid var(--cyan)" : "2px solid transparent",
              cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          <TabComponent />
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border-dim)", flexShrink: 0,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", opacity: 0.6 }}>
            PRISM is a personal research tool — scores are estimates, not certified appraisals.
          </span>
          <button onClick={onClose} style={{ padding: "5px 16px", background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.3)", borderRadius: "4px", color: "var(--cyan)",
            fontSize: "11px", cursor: "pointer" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
