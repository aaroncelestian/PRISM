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
      <Section title="Why PRISM Exists">
        <P>
          PRISM was created by Aaron Celestian, Curator of Gem and Minerals at the Natural History
          Museum of Los Angeles County (NHMLAC) — one of the largest natural history collections in
          the western United States.
        </P>
        <P>
          After more than a decade curating a world-class mineral collection, a core problem became
          impossible to ignore: the mineral collecting community has no standard language for what
          makes a specimen truly valuable — and museums are increasingly required to have one.
        </P>
      </Section>

      <Section title="The Compliance Reality">
        <P>
          Museums receiving funding from city, county, state, and federal agencies face mounting pressure
          to document acquisition compliance for every specimen in their collection. Geomaterials rank
          lower in urgency than human remains, cultural artifacts, or vertebrate specimens — but they
          are held to exactly the same institutional standards.
        </P>
        <Callout icon="⚖️" color="#ffa028">
          PRISM is designed to stay ahead of where museum accession standards are heading — not just
          where they are today. The heavy weight given to provenance and scientific value in the Museum
          context is intentional. That is the direction this field is moving, rapidly.
        </Callout>
        <P>
          At the institutional level, an undocumented specimen is a liability — a potential lawsuit,
          a repatriation demand, or an illegal activity investigation that individual collectors might
          consider trivial, but that institutions take extremely seriously.
        </P>
      </Section>

      <Section title="What 'Museum Quality' Actually Means">
        <Callout icon="🎯" color="#ff5050">
          <strong>Forget what you know about "museum quality."</strong> That is a Hollywood myth. Private
          collectors at the Tucson Gem and Mineral Show routinely have more spectacular specimens than
          most museum collections. Museums simply cannot compete with private buyers at today's prices.
          Many collectors don't value donating fine specimens for the public interest.
        </Callout>
        <P>
          Real museum quality means a specimen that is:
        </P>
        <ul style={{ paddingLeft: "18px", margin: "0 0 10px" }}>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.85 }}>Legally collected or legally acquired with a documented chain of custody</li>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.85 }}>Well-documented: locality, collection date, collector name, acquisition history</li>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.85 }}>Scientifically significant, or filling a genuine gap in the institutional collection</li>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.85 }}>Representative of its species, locality, or phenomenon in a way that serves research and public education</li>
        </ul>
        <P>
          A museum quality specimen can serve research or public display — rarely both. Beauty and
          rarity matter, but provenance and scientific value are equally important. This is why the
          Museum context in PRISM weights them accordingly. If that weighting seems strict, that is
          by design.
        </P>
      </Section>

      <Section title="The Paper Trail Is Non-Negotiable">
        <P>
          People collect for recreation. People enter mines where they have verbal permission.
          There has historically been no paper trail, and for personal collecting there doesn't need
          to be one. That is an individual's choice.
        </P>
        <Callout icon="�" color="#c04040">
          <strong>If you want to donate to a museum, there must be a paper trail.</strong> It is not
          the curator's responsibility to create justification on your behalf. The burden is entirely
          on the collector or donor to document legal collection and proper acquisition.
        </Callout>
        <P>
          <strong>Older specimens</strong> are evaluated case by case. Before the establishment of
          national parks and federal land protections, there was essentially no protected land —
          material collected in that era required no permits, and provenance is judged with that
          historical context in mind.
        </P>
        <P>
          <strong>Recent material is different.</strong> If a specimen was collected on National Park
          land, military land, or without the required permits — that is a disqualifying problem for
          institutional acquisition, regardless of how routine the practice seems to collectors.
        </P>
      </Section>

      <Section title="The Curator's Responsibility">
        <P>
          The curator's mandate is to maintain and build a world-class research repository while
          serving the public interest. Those two goals are often in tension. A scientifically critical
          specimen may not be displayable; a visually stunning piece may have no research value.
        </P>
        <Callout icon="🏛️" color="#7c5cfc">
          The museum's collection belongs to the public — held in trust by the institution, not
          owned by it. The curator is the steward of the county's precious collection. That responsibility
          demands the highest standards for what enters the collection, especially for recent acquisitions.
        </Callout>
      </Section>

      <Section title="For Collectors and Dealers">
        <Callout icon="🔬">
          Use PRISM to understand where your specimens stand before approaching a museum or writing
          an insurance appraisal. The scoring framework is the same one institutional curators use
          to evaluate donation candidates.
        </Callout>
        <Callout icon="💰" color="#ffb347">
          <strong>Before selling</strong> — use your PRISM score to justify your asking price.
          Use the Sell/Trade tool to estimate fair market value and identify where your specimen
          sits relative to the market.
        </Callout>
        <Callout icon="📊" color="#f472b6">
          <strong>Market research</strong> — track listings from eBay, iRocks, Tucson shows, and
          dealer sites. Score them and see which localities or vendors price at a premium.
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
          Each scoring step in <strong>Guided mode</strong> has a <strong>"Learn more about scoring this"</strong> helper — click it to expand detailed guidance, anchor descriptions, and calibration tips for that dimension.
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
          focus="Locality 30% · Provenance 25% · Species 15% · Crystal 12% · Scientific 14% · Aesthetics 4%"
          use="Use when evaluating a specimen for museum acquisition, donation, or institutional loan. Locality irreplaceability (30%) and provenance documentation (25%) dominate — a specimen from a unique or exhausted locality with a verified chain of custody is the museum ideal. Scientific value is rewarded asymmetrically: low scores are not penalized (most specimens lack immediate research applications), but high scores receive a strong non-linear boost. Aesthetics barely factor in at 4%." />
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
            PRISM is a research and planning tool — scores are structured estimates, not certified appraisals. Museum acceptance decisions are made by curators on a case-by-case basis.
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
