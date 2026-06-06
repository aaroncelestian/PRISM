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
    redFlags: ["Described as 'fine' when chips are obvious to the naked eye", "Random frosting across all surfaces called 'natural etching' — true etching follows crystallographic patterns, not random wear"] },
  { key: "rough",   score: "20–39",  label: "Rough / Study",    color: "#b0a060",
    traits: ["Multiple significant chips and breaks", "Faces abraded or partially missing", "Crystal form recognizable but imperfect", "Suitable for scientific study or beginners"],
    redFlags: ["Sold as 'collector grade' without mention of damage", "Heavy matrix hiding breakage"] },
  { key: "damaged", score: "0–19",   label: "Heavily Damaged",  color: "#c06060",
    traits: ["Major breakage across crystal body", "Missing faces or partial crystal only", "Significant instability or reconstruction", "Value largely in species/locality, not form"],
    redFlags: ["Any attempt to grade this as 'good' or 'fine'", "'Repairs' not disclosed", "Sold as broken piece of a larger specimen at full specimen price"] },
];

// ── Natural character features ───────────────────────────────────────────────
// The key insight: natural chemical processes follow crystallographic rules.
// Mechanical damage is random. Learning this distinction is the foundation
// of specimen evaluation.
const NATURAL_CHARACTER = [
  {
    key: "etching",
    label: "Dissolution Etching",
    icon: "🔭",
    color: "#e0a860",
    isNatural: true,
    examples: "Tanzanian garnets, Erongo aquamarine, many fluorites",
    looks: "Geometric etch pits, trigonal or hexagonal channels, corrosion grooves running parallel to crystal edges. The surface has texture but the underlying crystal form is preserved.",
    howToID: "Natural etching follows the crystal symmetry — pits are triangular on octahedra, hexagonal on quartz prisms. Random frosting that ignores crystal geometry is likely wear or acid damage.",
    scoring: "Crystal Quality: may drop 10–25 pts from 'perfect' baseline. Aesthetics: can increase significantly if the patterns are striking. Scientific: slight increase for well-developed forms. Net result: often scores comparably to a clean specimen of similar quality.",
    noviceTip: "A garnet covered in beautiful geometric etch pits is not a 'damaged' garnet. It is a garnet that sat in a corrosive fluid long enough to show its internal symmetry on the outside. This is a feature, not a flaw.",
  },
  {
    key: "skeletal",
    label: "Skeletal & Hoppered Growth",
    icon: "🦴",
    color: "#a0d4c0",
    isNatural: true,
    examples: "Hoppered halite, skeletal quartz, skeletal bismuth, frame calcite",
    looks: "Crystals where edges and corners grew faster than faces, leaving hollow faces or step-like indentations inward. The crystal form is structurally complete but faces are not flat.",
    howToID: "Hoppered growth is perfectly symmetric — the indentations mirror the crystal symmetry exactly. You can trace the ghost of the 'perfect' crystal form in the skeleton. Damage is asymmetric and random.",
    scoring: "Crystal Quality: 30–60 depending on how complete the form is. Scientific: 20–40 bonus for well-developed examples. Aesthetics: often high — skeletal forms are visually dramatic. Score the aesthetic impact generously.",
    noviceTip: "Hoppered halite cubes have stepped hollow faces — this is how they grew, not how they broke. They are among the most scientifically interesting crystal forms you can own.",
  },
  {
    key: "phantoms",
    label: "Phantoms & Growth Zones",
    icon: "👻",
    color: "#c0a0e0",
    isNatural: true,
    examples: "Phantom quartz, zoned fluorite, color-zoned tourmaline, elestial quartz",
    looks: "Internal outlines of earlier growth stages visible through the crystal, often outlined by inclusions or color change. The crystal grew, stopped, then continued.",
    howToID: "Phantoms are internal and follow the crystal's own symmetry exactly. They are ghosts of earlier crystal faces. Internal features that don't follow crystal symmetry may be fractures or inclusions.",
    scoring: "Crystal Quality: neutral to slightly positive — phantoms don't affect surface quality. Scientific: 20–50 increase. Aesthetics: highly variable — a 'ghost crystal within a crystal' is visually compelling and should score well.",
    noviceTip: "A quartz crystal with a green chlorite phantom inside it grew in two stages: the chlorite coated it, then clear quartz continued growing over the top. You are looking at a record of geological time.",
  },
  {
    key: "striations",
    label: "Natural Growth Striations",
    icon: "≡",
    color: "#90b8d0",
    isNatural: true,
    examples: "Tourmaline (always striated), pyrite cubes, quartz prism faces, stibnite",
    looks: "Parallel lines running along crystal faces, parallel to the crystal's growth direction. They are a record of step-growth during crystallisation.",
    howToID: "Striations are always parallel to each other and to a crystallographic axis. Scratches are random in direction and depth. Pyrite cubes are always striated on their faces — this is normal and expected.",
    scoring: "Crystal Quality: do NOT penalize for species that always show striations (tourmaline, pyrite). Penalize only if striations are unusually coarse and obscure the crystal form entirely.",
    noviceTip: "If every single tourmaline you've ever seen has striated faces — that's because all tourmalines have striated faces. It is not a defect.",
  },
  {
    key: "resorption",
    label: "Resorption & Rounding",
    icon: "🔵",
    color: "#e0c0a0",
    isNatural: true,
    examples: "Spessartine garnets (almost always rounded), hessonite, some corundum",
    looks: "Crystal faces are curved or rounded rather than flat. Edges are smooth rather than sharp. The crystal looks like it partially melted back.",
    howToID: "Resorption is uniform and smooth — rounding follows the crystal form evenly. It often occurs across an entire suite of crystals from the same locality. Chipping is sharp-edged and random.",
    scoring: "Crystal Quality: drop 10–30 pts from 'ideal' for the species, but check: is this normal for the locality? Spessartine from Loliondo, Tanzania is always rounded and resorbed. Score it against what's achievable from that deposit.",
    noviceTip: "Famous Loliondo spessartine garnets are vitreous, richly orange, and heavily rounded — that rounding is natural resorption in the host rock. The finest examples of this species look nothing like a 'perfect' crystal, and they're worth a great deal.",
  },
  {
    key: "iridescence",
    label: "Iridescence & Interference Colors",
    icon: "🌈",
    color: "#d0a0e8",
    isNatural: true,
    examples: "Labradorite (labradorescence), bornite (peacock ore), iris quartz, covellite",
    looks: "Colors that shift as the viewing angle changes. Can be surface iridescence (thin-film interference) or internal scattering.",
    howToID: "True iridescence shifts with angle and is repeatable. Surface coatings applied artificially also shift with angle — check whether iridescence is mentioned as typical for the species from that locality.",
    scoring: "Aesthetics: significant increase — 30 to 50 point uplift for exceptional iridescence. Crystal Quality: neutral — iridescence is a surface optical property, not a crystal quality issue. Scientific: modest increase if phenomenon is well-documented.",
    noviceTip: "Peacock ore (bornite with tarnish iridescence) is one of the most visually striking beginner specimens. The iridescent surface colors are from a natural thin-film tarnish — real, natural, and beautiful. Beware acid-treated specimens sold as 'peacock ore.'",
  },
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

// ── Aesthetics factors ────────────────────────────────────────────────────────
const AESTHETICS_FACTORS = [
  {
    key: "color", label: "Color & Saturation", icon: "🎨", color: "#ff80a0",
    desc: "Depth, saturation, and purity of color. The most immediate aesthetic driver.",
    ranges: [
      { band: "80–100", label: "Exceptional",  text: "Saturated, vivid color at peak for the species. Azurite blue, vanadinite orange, rhodonite pink — immediately arresting. Consistent across the specimen." },
      { band: "60–79",  label: "Very Good",    text: "Good saturation with minor zoning or inconsistency. Still visually appealing and clearly colored." },
      { band: "40–59",  label: "Moderate",     text: "Paler than ideal, slightly washed out, or noticeably inconsistent across the specimen." },
      { band: "20–39",  label: "Weak",         text: "Faded or dull color typical of the species but lacking visual impact. Not a selling point." },
      { band: "0–19",   label: "Absent",       text: "Colorless, heavily oxidized, or so dull as to be visually unremarkable." },
    ],
    tip: "Bright directed light oversaturates colors artificially. Always examine in diffuse or natural light before scoring.",
  },
  {
    key: "matrix", label: "Matrix Presentation", icon: "🪨", color: "#a0c0e0",
    desc: "How crystals sit on, contrast with, or emerge from their matrix.",
    ranges: [
      { band: "80–100", label: "Exceptional",  text: "Crystals elevated prominently above contrasting matrix. Natural pedestal effect, clean base, self-contained composition. A perfect floater also scores here." },
      { band: "60–79",  label: "Good",         text: "Good matrix contrast, crystals well-separated and accessible. Perhaps slightly crowded or with minor base damage." },
      { band: "40–59",  label: "Moderate",     text: "Displayable but crystals partially buried, matrix is plain, or specimen requires an awkward angle to show its best face." },
      { band: "20–39",  label: "Poor",         text: "Crystals partially encrusted, matrix same color/texture as specimen, or heavily saw-trimmed showing cut marks." },
      { band: "0–19",   label: "Detracting",   text: "Broken base, unattractive grinding marks, specimen won't stand without a mount, or matrix actively hides the specimen." },
    ],
    tip: "A perfect floater is not penalized here — score based on presentation quality, not whether matrix exists.",
  },
  {
    key: "composition", label: "Composition & Symmetry", icon: "⚖️", color: "#80d0c0",
    desc: "Natural balance, visual weight distribution, and compositional harmony.",
    ranges: [
      { band: "80–100", label: "Exceptional",  text: "Clear visual center and natural balance. Whether single crystal or multi-crystal group, the composition reads as intentional and complete." },
      { band: "60–79",  label: "Good",         text: "Mostly balanced. One dominant crystal appropriate to the cluster, or good density without chaos." },
      { band: "40–59",  label: "Moderate",     text: "Slightly awkward — off-center, front-heavy, or visually incomplete (e.g. broken half of a cluster)." },
      { band: "20–39",  label: "Poor",         text: "Visually chaotic, obviously a broken fragment, or no satisfying compositional arrangement." },
      { band: "0–19",   label: "Fragment",     text: "Obvious breakage, clearly a portion of a larger piece with no aesthetic independence." },
    ],
    tip: "Thumbnail specimens often score well here — small but complete is better than large but broken.",
  },
  {
    key: "luster", label: "Luster & Surface", icon: "✨", color: "#e0d080",
    desc: "Quality of light interaction — vitreous, adamantine, silky, or metallic brilliance.",
    ranges: [
      { band: "80–100", label: "Exceptional",  text: "Outstanding luster for the species. Adamantine, vitreous with internal reflections, or metallic mirror finish. No frosting or etching." },
      { band: "60–79",  label: "Very Good",    text: "Good luster. Minor etching or frosting in non-critical areas. Still reflective and catches light well." },
      { band: "40–59",  label: "Moderate",     text: "Visible etching, partial frosting, or dulled surfaces that reduce sparkle significantly." },
      { band: "20–39",  label: "Dull",         text: "Heavily frosted, etched throughout, or luster inappropriate for the species." },
      { band: "0–19",   label: "None",         text: "Completely dull, heavily corroded, or surface so altered as to be unrecognizable." },
    ],
    tip: "Over-cleaning with acid removes luster permanently. 'Cleaned' specimens often suffer here compared to untouched material.",
  },
];

// ── Scientific value factors ────────────────────────────────────────────────
const SCIENTIFIC_FACTORS = [
  {
    key: "type_loc", label: "Type Locality Material", icon: "📍", color: "#a080ff", score: "60–100",
    desc: "Specimens from the locality used to formally define and describe a mineral species.",
    detail: "If a specimen is from the type locality of its species — the place where the species was first scientifically described — it carries irreplaceable scientific value. Examples: rhodonite from Franklin NJ (its type locality), sinhalite from Sri Lanka. Type locality material becomes more important over time as mines close. Verify against IMA (International Mineralogical Association) records.",
    redFlag: "'Type locality' is used loosely by some dealers to mean simply 'famous locality.' Only IMA-registered type localities qualify for high scientific credit.",
  },
  {
    key: "habit", label: "Unusual Crystal Habit", icon: "🔬", color: "#60c0ff", score: "40–85",
    desc: "Distortions, elongations, scepters, phantoms, or growth forms not typical for the species.",
    detail: "Crystals showing unusual morphology — spinel-law twins in magnetite, hoppered halite cubes, scepter quartz, phantom quartz with included growth zones, skeletal fluorite — provide information about growth conditions and are scientifically interesting beyond aesthetics. Document all anomalous features in the notes field.",
    redFlag: "Scepters are frequently faked by re-soldering broken crystals. Check the contact zone under 10× magnification — natural overgrowth shows crystal-on-crystal contact with no adhesive.",
  },
  {
    key: "paragenesis", label: "Paragenesis Documentation", icon: "🔗", color: "#80e0a0", score: "30–70",
    desc: "The complete mineral assemblage tells a story about deposit formation conditions.",
    detail: "A specimen showing the full paragenetic sequence — multiple mineral generations, early and late-stage minerals coexisting — is scientifically more valuable than a single-species specimen. List all visible associated minerals in your documentation notes. A labeled specimen from a specific pocket with known paragenesis is a scientific document.",
    redFlag: "Associated minerals can be glued onto specimens. Check attachment points under magnification — natural intergrowths show crystal-on-crystal contact with consistent surface alteration.",
  },
  {
    key: "pseudomorph", label: "Pseudomorphs & Epitaxy", icon: "🔄", color: "#ffa060", score: "50–90",
    desc: "One mineral replacing another while keeping the original crystal shape, or oriented overgrowths.",
    detail: "Pseudomorphs — malachite after azurite, native copper after cuprite, quartz after calcite — show mineral transformation processes and are scientifically compelling. Epitaxial overgrowths (one mineral crystallizing in oriented relationship on another) document crystal chemical relationships. Both types are scientifically and visually interesting.",
    redFlag: "True pseudomorphs have subtle surface textures showing the replacement process. Casts or composite pieces lack these. A complete, 'too perfect' pseudomorph warrants scrutiny.",
  },
  {
    key: "historical", label: "Historical Mine Documentation", icon: "📋", color: "#e0c060", score: "40–80",
    desc: "Specimens from historically significant closed localities with original documentation.",
    detail: "A specimen from Tsumeb (Namibia), Franklin (NJ), or Broken Hill (Australia) with original mine labels, auction records, or collection tags becomes progressively more scientifically important as those deposits are exhausted. Documentation of where in a mine a specimen came from (stope, level, date) adds scientific value that cannot be reconstructed later.",
    redFlag: "Old labels can be forged. If provenance is a major value driver, consider having paper/ink authenticated by a specialist for high-value acquisitions.",
  },
];

// ── Score calibration rubric ────────────────────────────────────────────────
const SCORE_CALIBRATION = [
  {
    key: "crystal", label: "Crystal Quality", icon: "💎", color: "#00d4ff",
    note: "Assess under 10× loupe in multiple lighting conditions. Natural features (etching, striations, resorption) follow crystal symmetry. Mechanical damage is random — they are not the same thing.",
    ranges: [
      { band: "80–100", label: "Gem / Museum",   text: "No damage visible under loupe. Complete termination, pristine faces, exceptional luster. Best-in-class example you could find." },
      { band: "60–79",  label: "Very Fine",      text: "Minor damage in non-critical areas only. Excellent luster, complete or nearly complete termination. Passes the show-table test." },
      { band: "40–59",  label: "Fine",           text: "Some visible damage, partial termination, or dulled surfaces — but clearly a quality specimen with real appeal." },
      { band: "20–39",  label: "Average",        text: "Notable damage, heavy etching, or partial crystal development. Reference quality. Would not be a centrepiece." },
      { band: "0–19",   label: "Below Grade",    text: "Heavily damaged fragment or surface so compromised that crystal quality is not a selling point." },
    ],
  },
  {
    key: "speciesRarity", label: "Species / Variety Rarity", icon: "🧬", color: "#e0a040",
    note: "Score whichever is rarer: the species globally, OR this specific variety/form/coating if it's unique to one locality. A common species with a unique variety should score as rare.",
    ranges: [
      { band: "80–100", label: "Unique variety / extreme",  text: "One locality worldwide for this form or coating. OR fewer than 5 localities for the species. The rarest thing about this specimen is something no other locality produces." },
      { band: "60–79",  label: "Rare variety or species",   text: "Distinctive form/coating from very few localities. OR genuinely rare species (10–30 localities globally)." },
      { band: "40–59",  label: "Uncommon",                  text: "Recognisable form not widely available. OR species that exists but is not abundant in the market." },
      { band: "20–39",  label: "Common species/variety",    text: "Widely available in this form (quartz, calcite, pyrite, typical fluorite). Fine crystals exist but nothing unique." },
      { band: "0–19",   label: "Ubiquitous",                text: "Found virtually everywhere in this form. No rarity premium applies — all value comes from crystal quality and aesthetics." },
    ],
    example: {
      title: "Worked example: Metallic-coated Almandine, Aquarius Mtns, Arizona",
      text: "Almandine-spessartine as a species scores ~10 (thousands of localities worldwide). But metallic-coated almandine from the Aquarius Mountains is documented from one locality on Earth. Score the variety: 90+. The coating is the rare thing, not the garnet species.",
    },
  },
  {
    key: "localityRarity", label: "Locality Rarity", icon: "📍", color: "#90d070",
    note: "Score the locality's prestige and scarcity, not your confidence that the locality is correct.",
    ranges: [
      { band: "80–100", label: "World-Class / Closed", text: "Iconic locality — Tsumeb, Herja, Broken Hill, Minas Gerais classic pockets. Often exhausted. Immediately recognised by any serious collector." },
      { band: "60–79",  label: "Notable Classic",      text: "Well-documented locality with strong collector recognition. May still be active but associated with quality material." },
      { band: "40–59",  label: "Recognised",           text: "Known locality but not famous. Moderate collector interest and modest locality premium." },
      { band: "20–39",  label: "Generic Location",     text: "Province or country known but no specific locality. Minimal premium — evaluate on crystal quality alone." },
      { band: "0–19",   label: "Unknown",              text: "No verified locality. Cannot exceed 20 regardless of visual quality." },
    ],
  },
  {
    key: "provenance", label: "Provenance", icon: "📜", color: "#e8b840",
    note: "Provenance cannot be invented after the fact — only discovered. Default to the lowest tier you can prove.",
    ranges: [
      { band: "80–100", label: "Fully Documented",  text: "Original mine labels, auction catalogue, or museum deaccession with complete verifiable chain of custody." },
      { band: "60–79",  label: "Strong",            text: "Named collection with labels, invoices, or photographs. At least one traceable ownership link." },
      { band: "40–59",  label: "Dealer Documented", text: "Dealer label with locality and approximate date. No prior ownership chain but current purchase documented." },
      { band: "20–39",  label: "Locality Stated",   text: "Locality stated verbally or via generic label. No chain of custody. Common for show purchases." },
      { band: "0–19",   label: "Unknown",           text: "No information. Apply maximum scepticism for any price reflecting documented provenance." },
    ],
  },
  {
    key: "aesthetics", label: "Aesthetics", icon: "🎨", color: "#ff80a0",
    note: "Score overall visual impact: color, luster, matrix, composition together.",
    ranges: [
      { band: "80–100", label: "Display Masterpiece", text: "Stops people in their tracks. Exceptional color, luster, composition, and matrix. Would be the centrepiece of any display." },
      { band: "60–79",  label: "Display Quality",     text: "Clearly beautiful. Looks good in any collection. Good color, reasonable composition, no major flaws from display angle." },
      { band: "40–59",  label: "Presentable",         text: "Attractive but not remarkable. Solid for reference or mid-tier display. Visible flaws at close inspection." },
      { band: "20–39",  label: "Study Grade",         text: "Aesthetics are not a selling point. Scientifically or locality-interesting but not visually compelling." },
      { band: "0–19",   label: "No Aesthetic Merit",  text: "Fragment, heavily damaged, or completely unremarkable. No display value." },
    ],
  },
  {
    key: "scientific", label: "Scientific Value", icon: "🔬", color: "#5090ff",
    note: "Most collector specimens score 0–20 here. That is normal and expected — not a failure.",
    ranges: [
      { band: "80–100", label: "Publication Quality", text: "Type locality material, exceptional pseudomorph, or feature that represents undocumented science. Publishable interest." },
      { band: "60–79",  label: "Research Interest",   text: "Unusual habit, well-documented paragenesis, or historically significant mine with original labels." },
      { band: "40–59",  label: "Educational Value",   text: "Good teaching specimen. Clearly illustrates crystal forms, species traits, or paragenetic relationships." },
      { band: "20–39",  label: "Reference Quality",   text: "Correctly identified with locality. Suitable for reference collection. Standard educational use." },
      { band: "0–19",   label: "No Special Value",    text: "Common species, no documentation, nothing unusual. Score reflects absence of scientific interest, not specimen failure." },
    ],
  },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function BuyerGuide({ onClose }) {
  const [tab, setTab] = useState("crystal");
  const [expandedAesthetic, setExpandedAesthetic] = useState(null);
  const [expandedScientific, setExpandedScientific] = useState(null);
  const [expandedCalib, setExpandedCalib] = useState("crystal");
  const [localitySearch, setLocalitySearch] = useState("");
  const [expandedLocality, setExpandedLocality] = useState(null);
  const [expandedLevel, setExpandedLevel] = useState(null);

  const localityResults = localitySearch.trim().length >= 2
    ? searchLocalities(localitySearch)
    : LOCALITIES.filter(l => l.significance === "world_class");

  const tabs = [
    { key: "crystal",    label: "Crystal Quality" },
    { key: "locality",   label: "Localities" },
    { key: "species",    label: "Common Species" },
    { key: "provenance", label: "Provenance" },
    { key: "aesthetics", label: "Aesthetics" },
    { key: "scientific", label: "Scientific" },
    { key: "calibration",label: "Score Guide" },
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
          <div style={{ display: "flex", gap: "2px", overflowX: "auto", scrollbarWidth: "none" }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flexShrink: 0, padding: "7px 14px", border: "none", borderRadius: "4px 4px 0 0",
                background: tab === t.key ? "var(--bg-panel)" : "transparent",
                color: tab === t.key ? "var(--cyan)" : "var(--text-muted)",
                fontSize: "11px", fontWeight: tab === t.key ? 600 : 400, whiteSpace: "nowrap",
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

              {/* Natural Character section */}
              <div style={{ marginTop: "6px" }}>
                <div style={{ padding: "10px 14px", background: "rgba(0,200,128,0.06)", border: "1px solid rgba(0,200,128,0.25)", borderRadius: "6px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#00c880", marginBottom: "5px" }}>Natural Character vs. Mechanical Damage</div>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6 }}>
                    The most important skill in specimen evaluation is distinguishing <strong style={{ color: "var(--text)" }}>natural geological processes</strong> from <strong style={{ color: "#ff8080" }}>physical damage</strong>. Natural features follow <em>crystallographic rules</em> — they are symmetric, orderly, and repeat across the specimen. Damage is random, sharp-edged, and appears on corners and edges.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px" }}>
                    <div style={{ padding: "8px 10px", background: "rgba(0,200,128,0.07)", borderRadius: "4px", border: "1px solid rgba(0,200,128,0.2)" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#00c880", marginBottom: "5px" }}>✓ Natural Features</div>
                      {["Follows crystal symmetry","Consistent across the specimen","Found on crystal faces (not edges)","Seen across whole suites from same locality","Cannot be replicated in a lab accidentally"].map(t => (
                        <div key={t} style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.55 }}>· {t}</div>
                      ))}
                    </div>
                    <div style={{ padding: "8px 10px", background: "rgba(255,100,80,0.06)", borderRadius: "4px", border: "1px solid rgba(255,100,80,0.2)" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#ff8080", marginBottom: "5px" }}>✗ Mechanical Damage</div>
                      {["Random location — usually edges/corners","Sharp, conchoidal fracture surfaces","Inconsistent across specimen","Not seen on comparable specimens","Often accompanied by white powder (calcite dust)"].map(t => (
                        <div key={t} style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.55 }}>· {t}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Common Natural Character Features</div>
                {NATURAL_CHARACTER.map(feat => (
                  <div key={feat.key} style={{ marginBottom: "10px", padding: "12px 14px", background: "var(--bg-panel)", border: `1px solid ${feat.color}25`, borderRadius: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                      <span style={{ fontSize: "18px" }}>{feat.icon}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: feat.color }}>{feat.label}</span>
                        <span style={{ marginLeft: "8px", fontSize: "9px", color: "var(--text-muted)", fontStyle: "italic" }}>{feat.examples}</span>
                      </div>
                      <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: "rgba(0,200,128,0.1)", border: "1px solid rgba(0,200,128,0.25)", color: "#00c880" }}>NATURAL</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "6px" }}>
                      <strong style={{ color: "var(--text-muted)", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Looks like: </strong>{feat.looks}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "6px" }}>
                      <strong style={{ color: "var(--text-muted)", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>How to identify: </strong>{feat.howToID}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "6px", padding: "6px 9px", background: "var(--bg)", borderRadius: "4px", border: "1px solid var(--border-dim)" }}>
                      <strong style={{ color: "var(--text-muted)", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>How to score in PRISM: </strong>{feat.scoring}
                    </div>
                    <div style={{ fontSize: "11px", color: feat.color, lineHeight: 1.55, padding: "7px 9px", background: `${feat.color}08`, borderRadius: "4px", border: `1px solid ${feat.color}25` }}>
                      💡 {feat.noviceTip}
                    </div>
                  </div>
                ))}
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

          {/* ── AESTHETICS TAB ── */}
          {tab === "aesthetics" && (
            <>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, padding: "10px 12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
                <strong style={{ color: "var(--text)" }}>What aesthetics measures:</strong> Visual impact — color saturation, luster quality, matrix presentation, and compositional balance. Score what you actually see, not what the specimen "should" look like for the species.
              </div>

              {AESTHETICS_FACTORS.map(factor => {
                const open = expandedAesthetic === factor.key;
                return (
                  <div key={factor.key} style={{ borderRadius: "7px", border: `1px solid ${factor.color}30`, background: "var(--bg-panel)", overflow: "hidden" }}>
                    <button onClick={() => setExpandedAesthetic(open ? null : factor.key)}
                      style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "13px 15px", textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "22px", flexShrink: 0 }}>{factor.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: factor.color, marginBottom: "3px" }}>{factor.label}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{factor.desc}</div>
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
                      </div>
                    </button>
                    {open && (
                      <div style={{ padding: "0 15px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        {factor.ranges.map(r => (
                          <div key={r.band} style={{ display: "flex", gap: "10px", padding: "8px 10px", borderRadius: "4px", background: "var(--bg)", border: "1px solid var(--border-dim)" }}>
                            <div style={{ flexShrink: 0, textAlign: "center", minWidth: "52px" }}>
                              <div style={{ fontSize: "10px", fontFamily: "var(--mono)", color: factor.color, fontWeight: 600 }}>{r.band}</div>
                              <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{r.label}</div>
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>{r.text}</div>
                          </div>
                        ))}
                        <div style={{ fontSize: "10px", color: "var(--cyan)", lineHeight: 1.5, padding: "7px 10px", background: "rgba(0,212,255,0.05)", borderRadius: "4px", border: "1px solid rgba(0,212,255,0.15)", marginTop: "4px" }}>
                          💡 {factor.tip}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── SCIENTIFIC TAB ── */}
          {tab === "scientific" && (
            <>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, padding: "10px 12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
                <strong style={{ color: "var(--text)" }}>What scientific value measures:</strong> Documentation quality, locality significance for the species, and any features of scientific interest. Most collector specimens score 0–20 here — that is normal. This dimension drives Museum-context scores.
              </div>

              <div style={{ padding: "8px 12px", background: "rgba(80,144,255,0.06)", border: "1px solid rgba(80,144,255,0.2)", borderRadius: "5px", fontSize: "11px", color: "#78a8ff", lineHeight: 1.5 }}>
                🔬 The Study and Museum contexts weight scientific value at <strong>42%</strong> and <strong>20%</strong> respectively. A specimen with poor science scores will never reach those grades regardless of beauty.
              </div>

              {SCIENTIFIC_FACTORS.map(factor => {
                const open = expandedScientific === factor.key;
                return (
                  <div key={factor.key} style={{ borderRadius: "7px", border: `1px solid ${factor.color}30`, background: "var(--bg-panel)", overflow: "hidden" }}>
                    <button onClick={() => setExpandedScientific(open ? null : factor.key)}
                      style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "13px 15px", textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "1px" }}>{factor.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: factor.color }}>{factor.label}</span>
                            <span style={{ fontSize: "9px", fontFamily: "var(--mono)", color: factor.color, background: `${factor.color}18`, padding: "2px 7px", borderRadius: "3px" }}>Score {factor.score}</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{factor.desc}</div>
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
                      </div>
                    </button>
                    {open && (
                      <div style={{ padding: "0 15px 14px", borderTop: "1px solid var(--border-dim)", paddingTop: "12px" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.65, marginBottom: "10px" }}>{factor.detail}</div>
                        <div style={{ fontSize: "10px", color: "#ff6060", lineHeight: 1.5, padding: "7px 10px", background: "rgba(255,96,96,0.05)", borderRadius: "4px", border: "1px solid rgba(255,96,96,0.2)" }}>
                          ⚠ Watch for: {factor.redFlag}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ padding: "10px 12px", background: "var(--bg-panel)", border: "1px solid var(--border-dim)", borderRadius: "5px", fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6 }}>
                💡 <strong style={{ color: "var(--text)" }}>CriteriaChecklist:</strong> In Expert Mode, expand the Scientific dimension to check specific criteria boxes. Each box adds to the scientific score with appropriate weight. Use the notes field to document your observations.
              </div>
            </>
          )}

          {/* ── SCORE CALIBRATION TAB ── */}
          {tab === "calibration" && (
            <>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, padding: "10px 12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
                <strong style={{ color: "var(--text)" }}>How to use this guide:</strong> For each dimension, find the description that best matches what you observe. Use the corresponding score band as your starting point, then fine-tune within that band. When in doubt, score conservatively.
              </div>

              {SCORE_CALIBRATION.map(dim => {
                const open = expandedCalib === dim.key;
                return (
                  <div key={dim.key} style={{ borderRadius: "7px", border: `1px solid ${dim.color}30`, background: "var(--bg-panel)", overflow: "hidden" }}>
                    <button onClick={() => setExpandedCalib(open ? null : dim.key)}
                      style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "12px 15px", textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px", flexShrink: 0 }}>{dim.icon}</span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: dim.color }}>{dim.label}</span>
                          {!open && <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{dim.note}</div>}
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
                      </div>
                    </button>
                    {open && (
                      <div style={{ padding: "0 15px 14px" }}>
                        <div style={{ fontSize: "10px", color: "var(--cyan)", lineHeight: 1.5, marginBottom: "10px", padding: "6px 10px", background: "rgba(0,212,255,0.05)", borderRadius: "4px", border: "1px solid rgba(0,212,255,0.15)" }}>
                          💡 {dim.note}
                        </div>
                        {dim.ranges.map((r, i) => (
                          <div key={r.band} style={{ display: "flex", gap: "10px", padding: "9px 10px", marginBottom: "5px", borderRadius: "5px", background: i === 0 ? `${dim.color}08` : "var(--bg)", border: `1px solid ${i === 0 ? dim.color + "25" : "var(--border-dim)"}` }}>
                            <div style={{ flexShrink: 0, textAlign: "center", minWidth: "60px" }}>
                              <div style={{ fontSize: "11px", fontFamily: "var(--mono)", color: dim.color, fontWeight: 600 }}>{r.band}</div>
                              <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.3 }}>{r.label}</div>
                            </div>
                            <div style={{ width: "1px", background: "var(--border-dim)", flexShrink: 0 }} />
                            <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.55 }}>{r.text}</div>
                          </div>
                        ))}
                        {dim.example && (
                          <div style={{ marginTop: "8px", padding: "10px 12px", background: `${dim.color}08`, border: `1px solid ${dim.color}30`, borderRadius: "5px" }}>
                            <div style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: dim.color, marginBottom: "5px" }}>📋 {dim.example.title}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6 }}>{dim.example.text}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ padding: "10px 12px", background: "rgba(255,160,40,0.06)", border: "1px solid rgba(255,160,40,0.2)", borderRadius: "5px", fontSize: "11px", color: "#ffa028", lineHeight: 1.6 }}>
                ⚠️ <strong style={{ color: "var(--text)" }}>Calibration principle:</strong> Two evaluators scoring the same specimen should arrive within 10 points of each other on each dimension. If you’re frequently using the full 0–100 range, you’re likely over-scoring extremes. Most real specimens land in the 30–70 range per dimension.
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
