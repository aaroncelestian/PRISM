export const WEIGHTS = {
  museum:     { crystal: 0.13, speciesRarity: 0.13,  localityRarity: 0.13,  provenance: 0.35, aesthetics: 0.06, scientific: 0.20 },
  exhibition: { crystal: 0.42, speciesRarity: 0.07,  localityRarity: 0.12,  provenance: 0.06, aesthetics: 0.30, scientific: 0.03 },
  collector:  { crystal: 0.22, speciesRarity: 0.26,  localityRarity: 0.26,  provenance: 0.10, aesthetics: 0.12, scientific: 0.04 },
  study:      { crystal: 0.11, speciesRarity: 0.08,  localityRarity: 0.08,  provenance: 0.26, aesthetics: 0.05, scientific: 0.42 },
  commercial: { crystal: 0.38, speciesRarity: 0.155, localityRarity: 0.155, provenance: 0.08, aesthetics: 0.15, scientific: 0.08 },
};

export const GRADES = [
  { min: 90, label: "Museum",     color: "#e8b840", emoji: "🏛️", desc: "An exceptional piece worthy of a world-class museum collection." },
  { min: 75, label: "Exhibition", color: "#90c0f0", emoji: "✨", desc: "Show-quality specimen — impressive enough to display prominently." },
  { min: 60, label: "Collector",  color: "#00c880", emoji: "💎", desc: "A solid collector piece with clear appeal and value." },
  { min: 45, label: "Study",      color: "#5090ff", emoji: "🔬", desc: "Good for research, teaching, or reference collections." },
  { min: 0,  label: "General",    color: "#8aaccc", emoji: "🪨", desc: "Common specimen — fine for beginners or bulk collections." },
];

export const CONTEXTS = [
  {
    key: "museum",
    label: "Museum Specimen",
    icon: "🏛️",
    desc: "I'm evaluating this as a potential museum-quality specimen.",
    detail: "Museum-quality specimens must show strength across all pillars. Provenance and scientific significance are the non-negotiable foundation — but locality rarity and species rarity now carry real weight. A common species from a common locality rarely achieves museum grade without extraordinary scientific documentation.",
  },
  {
    key: "exhibition",
    label: "Display / Show",
    icon: "✨",
    desc: "I want to show this at a gem show or display it prominently.",
    detail: "Exhibition contexts reward crystal perfection and visual impact above all. Locality prestige adds show-floor appeal — famous localities command attention. Provenance and science matter little here.",
  },
  {
    key: "collector",
    label: "Collector's Piece",
    icon: "💎",
    desc: "I'm evaluating this as a personal collector's specimen.",
    detail: "Collector value is driven by rarity — species scarcity and locality prestige together account for over half the score. A rare mineral from a classic, exhausted locality at fine quality commands serious collector interest.",
  },
  {
    key: "study",
    label: "Scientific Study",
    icon: "🔬",
    desc: "A researcher or student wants to use this specimen for study.",
    detail: "Scientific value and provenance chain matter most for study specimens.",
  },
  {
    key: "commercial",
    label: "General Market",
    icon: "�",
    desc: "How does this specimen score by general retail market standards?",
    detail: "General market grade weights crystal quality and visual appeal — what most casual buyers look for. For a full pricing estimate, use the Sell / Trade tool.",
  },
];

// ── Compound grades ───────────────────────────────────────────────────────────
// Awarded when a specimen simultaneously meets the score thresholds for
// multiple acquisition contexts. Ordered from most to least rare.
// To compute: check that every context in `contexts[]` meets its threshold.

export const COMPOUND_GRADES = [
  {
    key: "grand_slam",
    label: "Grand Slam",
    emoji: "🏆",
    color: "#ff9040",
    gradient: "linear-gradient(135deg, #e8b840, #90c0f0, #00c880, #5090ff)",
    shortDesc: "Museum · Display · Collector · Science — all four grades achieved",
    detail: "An extraordinary specimen meeting institutional, exhibition, collector, and scientific standards simultaneously. Essentially irreplaceable.",
    contexts: { museum: 83, exhibition: 73, collector: 68, study: 65 },
    rarity: "Extremely Rare",
  },
  {
    key: "world_class",
    label: "World-Class Specimen",
    emoji: "🌟",
    color: "#e8c060",
    gradient: "linear-gradient(135deg, #e8b840, #90c0f0, #00c880)",
    shortDesc: "Museum · Display · Collector — three top grades simultaneously",
    detail: "Documented, visually exceptional, and genuinely rare. Suitable for the finest private and public collections worldwide.",
    contexts: { museum: 83, exhibition: 73, collector: 68 },
    rarity: "Very Rare",
  },
  {
    key: "museum_display",
    label: "Museum Display",
    emoji: "🏛️✨",
    color: "#c0a0f0",
    gradient: "linear-gradient(135deg, #e8b840, #90c0f0)",
    shortDesc: "Museum provenance with exhibition-grade visual impact",
    detail: "Fully documented and visually stunning — exceptional on the show floor and in institutional collections alike.",
    contexts: { museum: 83, exhibition: 73 },
    rarity: "Rare",
  },
  {
    key: "museum_collector",
    label: "Museum Collector",
    emoji: "🏛️💎",
    color: "#d4a040",
    gradient: "linear-gradient(135deg, #e8b840, #00c880)",
    shortDesc: "Museum-grade documentation on a collector-grade rarity",
    detail: "The investment-grade holy grail — a rare or classic-locality specimen with full provenance chain. Sought by both institutions and advanced collectors.",
    contexts: { museum: 83, collector: 68 },
    rarity: "Rare",
  },
  {
    key: "museum_science",
    label: "Museum Science",
    emoji: "🏛️🔬",
    color: "#70b0e0",
    gradient: "linear-gradient(135deg, #e8b840, #5090ff)",
    shortDesc: "Institutional provenance with high scientific significance",
    detail: "The gold standard for research institutions — documented, scientifically significant, and suitable for type collections.",
    contexts: { museum: 83, study: 65 },
    rarity: "Uncommon",
  },
  {
    key: "collector_display",
    label: "Collector Display",
    emoji: "💎✨",
    color: "#40d0a0",
    gradient: "linear-gradient(135deg, #00c880, #90c0f0)",
    shortDesc: "Show-stopping rarity — rare AND visually exceptional",
    detail: "The most sought-after category for advanced collectors who also show. Rare species or exhausted locality, and you can't take your eyes off it.",
    contexts: { collector: 68, exhibition: 73 },
    rarity: "Uncommon",
  },
  {
    key: "collector_science",
    label: "Collector Science",
    emoji: "💎🔬",
    color: "#5090ff",
    gradient: "linear-gradient(135deg, #00c880, #5090ff)",
    shortDesc: "Rare specimen with documented scientific significance",
    detail: "A scarce mineral or classic locality piece that is also scientifically important — valuable to specialist collectors and researchers alike.",
    contexts: { collector: 68, study: 65 },
    rarity: "Uncommon",
  },
  {
    key: "display_science",
    label: "Scientific Showpiece",
    emoji: "✨🔬",
    color: "#80b8f0",
    gradient: "linear-gradient(135deg, #90c0f0, #5090ff)",
    shortDesc: "Visually striking AND scientifically significant",
    detail: "Beautiful enough to display prominently, significant enough to study. Paragenetically complex specimens and type-locality showpieces often qualify.",
    contexts: { exhibition: 73, study: 65 },
    rarity: "Uncommon",
  },
];

// Helper: compute which compound grades a specimen achieves
export function detectCompoundGrades(allCtxScores) {
  return COMPOUND_GRADES.filter(cg =>
    Object.entries(cg.contexts).every(([ctxKey, threshold]) => {
      const s = allCtxScores[ctxKey] ?? 0;
      return s >= threshold;
    })
  );
}

export const DIMS = [
  {
    key: "crystal",
    label: "Crystal Quality",
    short: "Crystal",
    icon: "💠",
    desc: "How perfect are the crystals themselves?",
    detail: "Look at the crystal faces, edges, and tips. Are they sharp and complete? Are there any chips, breaks, or cloudy areas? A perfect, undamaged crystal with well-formed faces scores highest.",
    anchors: [
      { value: 10, label: "Heavily damaged", hint: "Major chips, breaks, or incomplete crystal faces" },
      { value: 35, label: "Rough / crude", hint: "Recognizable as crystals but imperfect, abraded" },
      { value: 60, label: "Good specimens", hint: "Well-formed, minor contact or small chips" },
      { value: 80, label: "Very fine", hint: "Sharp faces, complete terminations, minor flaws" },
      { value: 95, label: "Gem / flawless", hint: "Perfect geometry, brilliant luster, no damage" },
    ],
  },
  {
    key: "speciesRarity",
    label: "Species rarity",
    short: "Species",
    icon: "🌍",
    desc: "Global occurrence frequency via Mindat",
    detail: "Species rarity reflects how many localities worldwide have produced this mineral species. A species known from hundreds of localities scores low; one known from only a handful — or newly described — scores highest.",
    anchors: [
      { value: 10, label: "Ubiquitous species", hint: "e.g. quartz, calcite — thousands of known localities" },
      { value: 30, label: "Common species", hint: "Many localities worldwide, easily obtained" },
      { value: 55, label: "Moderately rare species", hint: "Dozens of known localities globally" },
      { value: 75, label: "Rare species", hint: "Fewer than 10 known localities worldwide" },
      { value: 95, label: "Extremely rare species", hint: "1–3 known localities or newly described species" },
    ],
  },
  {
    key: "localityRarity",
    label: "Locality rarity",
    short: "Locality",
    icon: "📍",
    desc: "Mine status, pocket frequency, annual auction appearance",
    detail: "Locality rarity scores how available this specific mine's material is on the market today. Is the mine still active? Are new pockets still being found? Does material from this locality appear regularly at auction, or has it become scarce old-stock?",
    anchors: [
      { value: 10, label: "Active mine, common pockets", hint: "Material appears regularly at shows and auctions" },
      { value: 30, label: "Occasional supply", hint: "Pockets found every few years, moderate availability" },
      { value: 55, label: "Limited production", hint: "Mine closed or pockets rare; limited recent material" },
      { value: 75, label: "Exhausted locality", hint: "No production in decades; only old-stock available" },
      { value: 95, label: "Single known pocket", hint: "Unique find; essentially irreplaceable" },
    ],
  },
  {
    key: "provenance",
    label: "Provenance",
    short: "Prov.",
    icon: "📜",
    desc: "How well can you document where this came from and who owned it?",
    detail: "Provenance is the documented history of a specimen — where it was found, who collected it, and the chain of ownership since. Strong provenance adds both scientific and monetary value, and confirms legal collection status.",
    tiers: [
      { id: "T1", score: 95, desc: "Original field label + full chain of custody + legal collection documentation (permit, BLM form, or landowner permission)" },
      { id: "T2", score: 75, desc: "Original label, partial chain, locality verified" },
      { id: "T3", score: 55, desc: "Known locality and approximate date, no original label, dealer attribution" },
      { id: "T4", score: 35, desc: "Locality stated, undocumented, purchased from dealer" },
      { id: "T5", score: 15, desc: "Locality unknown or unverifiable" },
    ],
  },
  {
    key: "aesthetics",
    label: "Aesthetics",
    short: "Aesthet.",
    icon: "🎨",
    desc: "How visually striking is the specimen overall?",
    detail: "Step back and look at the whole piece: the color, composition, contrast with matrix, and overall visual impact. Would a non-collector find it beautiful? A great aesthetic specimen catches your eye instantly.",
    anchors: [
      { value: 10, label: "Dull / unremarkable", hint: "Little visual interest, drab colors" },
      { value: 30, label: "Modest appeal", hint: "Some interest but nothing striking" },
      { value: 55, label: "Attractive", hint: "Pleasing colors and form, display-worthy" },
      { value: 80, label: "Striking", hint: "Vibrant colors, excellent composition" },
      { value: 95, label: "Breathtaking", hint: "Instantly eye-catching, world-class visual impact" },
    ],
  },
  {
    key: "scientific",
    label: "Scientific Value",
    short: "Science",
    icon: "🔬",
    desc: "Does this specimen have special research or educational significance?",
    detail: "Scientific value is scored by checking which of five objective criteria apply. Each criterion that applies adds 20 points. A specimen meeting all five criteria scores 100.",
    criteria: [
      { key: "typeLocality",    label: "Type locality",              desc: "This is the described type locality for the species" },
      { key: "analytical",      label: "Analytical utility",         desc: "Sufficient size and freshness for spectroscopic or diffraction analysis" },
      { key: "paragenetic",     label: "Paragenetic complexity",     desc: "Two or more associated species present" },
      { key: "literature",      label: "Literature citation",        desc: "Specimen or locality appears in a published mineralogical study" },
      { key: "compositional",   label: "Compositional significance", desc: "Represents an end-member or unusual composition for the species" },
    ],
  },
];
