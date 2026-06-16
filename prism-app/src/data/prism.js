export const WEIGHTS = {
  museum:     { crystal: 0.12, speciesRarity: 0.10,   varietyRarity: 0.10,   localityRarity: 0.25,  provenance: 0.25, aesthetics: 0.04, scientific: 0.14 },
  exhibition: { crystal: 0.42, speciesRarity: 0.035,  varietyRarity: 0.035,  localityRarity: 0.12,  provenance: 0.06, aesthetics: 0.30, scientific: 0.03 },
  collector:  { crystal: 0.22, speciesRarity: 0.13,   varietyRarity: 0.13,   localityRarity: 0.26,  provenance: 0.10, aesthetics: 0.12, scientific: 0.04 },
  study:      { crystal: 0.11, speciesRarity: 0.04,   varietyRarity: 0.04,   localityRarity: 0.08,  provenance: 0.26, aesthetics: 0.05, scientific: 0.42 },
  commercial: { crystal: 0.38, speciesRarity: 0.0775, varietyRarity: 0.0775, localityRarity: 0.155, provenance: 0.08, aesthetics: 0.15, scientific: 0.08 },
};

export const GRADES = [
  { min: 90, label: "Museum",     color: "#e8b840", emoji: "🏛️", desc: "An exceptional piece worthy of a world-class museum collection." },
  { min: 75, label: "Exhibition", color: "#90c0f0", emoji: "✨", desc: "Show-quality specimen — impressive enough to display prominently." },
  { min: 60, label: "Collector",  color: "#00c880", emoji: "💎", desc: "A solid collector piece with clear appeal and value." },
  { min: 45, label: "Study",      color: "#5090ff", emoji: "🔬", desc: "Good for research, teaching, or reference collections." },
  { min: 20, label: "General",    color: "#8aaccc", emoji: "🪨", desc: "Common specimen — minimal collector distinction; fine for beginners or decorative use." },
  { min: 0,  label: "Bulk",       color: "#505060", emoji: "📦", desc: "Below collector grade — suitable for bulk, tumbling, or classroom use only." },
];

export const THRESHOLD = 70;

export const CONTEXTS = [
  {
    key: "museum",
    label: "Museum Specimen",
    icon: "🏛️",
    hidden: true,
    desc: "I'm evaluating this as a potential museum-quality specimen.",
    detail: "Museum-quality specimens are defined by irreplaceability and documentation. Locality rarity (30%) and provenance (25%) dominate — a specimen from an exhausted or unique locality with a verified chain of custody represents the museum ideal. Scientific value is rewarded asymmetrically: absent science doesn't penalize, but exceptional science gets a major non-linear boost. Aesthetics barely factor in at 4%.",
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
// Single best classification — the first entry whose every context meets the
// 70-point passing threshold. Ordered from most to least rare.

export const COMPOUND_GRADES = [
  {
    key: "institutional_masterpiece",
    label: "Institutional Masterpiece",
    emoji: "🔮",
    color: "#ff9040",
    gradient: "linear-gradient(135deg, #e8b840, #90c0f0, #00c880, #5090ff, #ff9040)",
    shortDesc: "All five evaluation grades achieved simultaneously",
    detail: "An irreplaceable specimen excelling across every evaluation dimension — museum, exhibition, collector, scientific, and market standards all met. The rarest possible PRISM classification.",
    contexts: { museum: 70, exhibition: 70, collector: 70, study: 70, commercial: 70 },
    rarity: "Once in a Generation",
  },
  {
    key: "grand_slam",
    label: "Grand Slam",
    emoji: "🏆",
    color: "#e8b840",
    gradient: "linear-gradient(135deg, #e8b840, #90c0f0, #00c880, #5090ff)",
    shortDesc: "Museum · Display · Collector · Science — four prestige grades achieved",
    detail: "An extraordinary specimen meeting institutional, exhibition, collector, and scientific standards simultaneously. Documented, visually exceptional, rare, and significant.",
    contexts: { museum: 70, exhibition: 70, collector: 70, study: 70 },
    rarity: "Extremely Rare",
  },
  {
    key: "museum_trifecta",
    label: "Museum Trifecta",
    emoji: "🌠",
    color: "#c070f0",
    gradient: "linear-gradient(135deg, #e8b840, #90c0f0, #5090ff)",
    shortDesc: "Museum · Display · Science — the institutional prestige combination",
    detail: "Fully documented, visually stunning, and scientifically significant — the most coveted combination for institutional acquisition. Type locality pieces, published specimens, and emerging-science minerals that also dazzle on display.",
    contexts: { museum: 70, exhibition: 70, study: 70 },
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
    contexts: { museum: 70, exhibition: 70, collector: 70 },
    rarity: "Very Rare",
  },
  {
    key: "research_masterpiece",
    label: "Research Masterpiece",
    emoji: "🔭",
    color: "#60a0e0",
    gradient: "linear-gradient(135deg, #e8b840, #00c880, #5090ff)",
    shortDesc: "Museum · Collector · Science — documented rarity with scientific depth",
    detail: "A rare species or classic-locality specimen with full provenance and scientific significance. The gold standard for type collections and specialist researchers.",
    contexts: { museum: 70, collector: 70, study: 70 },
    rarity: "Very Rare",
  },
  {
    key: "scientific_showpiece",
    label: "Scientific Showpiece",
    emoji: "�",
    color: "#80b8f0",
    gradient: "linear-gradient(135deg, #90c0f0, #00c880, #5090ff)",
    shortDesc: "Display · Collector · Science — rare, beautiful, and significant",
    detail: "Beautiful enough to display prominently, rare enough for advanced collectors, and significant enough to study. The triple threat for specialist collectors.",
    contexts: { exhibition: 70, collector: 70, study: 70 },
    rarity: "Rare",
  },
  {
    key: "museum_display",
    label: "Museum Display",
    emoji: "🏛️✨",
    color: "#c0a0f0",
    gradient: "linear-gradient(135deg, #e8b840, #90c0f0)",
    shortDesc: "Museum · Display — institutional provenance with visual impact",
    detail: "Fully documented and visually stunning — exceptional on the show floor and in institutional collections alike.",
    contexts: { museum: 70, exhibition: 70 },
    rarity: "Rare",
  },
  {
    key: "museum_science",
    label: "Museum Science",
    emoji: "🏛️🔬",
    color: "#70b0e0",
    gradient: "linear-gradient(135deg, #e8b840, #5090ff)",
    shortDesc: "Museum · Science — institutional provenance with scientific significance",
    detail: "The gold standard for research institutions — documented, scientifically significant, and suitable for type collections.",
    contexts: { museum: 70, study: 70 },
    rarity: "Rare",
  },
  {
    key: "museum_collector",
    label: "Museum Collector",
    emoji: "🏛️💎",
    color: "#d4a040",
    gradient: "linear-gradient(135deg, #e8b840, #00c880)",
    shortDesc: "Museum · Collector — documented rarity prized by institutions and collectors",
    detail: "The investment-grade holy grail — a rare or classic-locality specimen with full provenance chain. Sought by both institutions and advanced collectors.",
    contexts: { museum: 70, collector: 70 },
    rarity: "Rare",
  },
  {
    key: "collector_display",
    label: "Collector Display",
    emoji: "💎✨",
    color: "#40d0a0",
    gradient: "linear-gradient(135deg, #00c880, #90c0f0)",
    shortDesc: "Collector · Display — show-stopping rarity",
    detail: "Rare species or exhausted locality, and you can't take your eyes off it. The most sought-after category for advanced collectors who also show.",
    contexts: { collector: 70, exhibition: 70 },
    rarity: "Uncommon",
  },
  {
    key: "collector_science",
    label: "Collector Science",
    emoji: "💎🔬",
    color: "#5090ff",
    gradient: "linear-gradient(135deg, #00c880, #5090ff)",
    shortDesc: "Collector · Science — rare specimen with scientific significance",
    detail: "A scarce mineral or classic locality piece that is also scientifically important — valuable to specialist collectors and researchers alike.",
    contexts: { collector: 70, study: 70 },
    rarity: "Uncommon",
  },
  {
    key: "display_science",
    label: "Display Science",
    emoji: "✨🔬",
    color: "#80b8f0",
    gradient: "linear-gradient(135deg, #90c0f0, #5090ff)",
    shortDesc: "Display · Science — visually striking AND scientifically significant",
    detail: "Beautiful enough to display prominently, significant enough to study. Paragenetically complex specimens and type-locality showpieces often qualify.",
    contexts: { exhibition: 70, study: 70 },
    rarity: "Uncommon",
  },
];

// Non-linear dimension transforms — shared by ScorePanel and QuickExport
export function applyNonLinearTransform(dimKey, rawScore) {
  const x = rawScore / 100;
  let transformed;
  switch (dimKey) {
    case 'aesthetics':
    case 'crystal':
      transformed = Math.pow(x, 0.7) * 100;
      break;
    case 'speciesRarity':
    case 'varietyRarity':
    case 'localityRarity': {
      const normalized = (x - 0.5) * 2;
      const sig = 1 / (1 + Math.exp(-3.5 * normalized));
      transformed = sig * 100;
      break;
    }
    case 'provenance': {
      const norm = (x - 0.5) * 2;
      const boost = 10 * (1 / (1 + Math.exp(-3 * norm)) - 0.5) * 2;
      transformed = Math.max(0, Math.min(100, rawScore + boost));
      break;
    }
    case 'scientific': {
      const norm = (x - 0.5) * 2;
      const boost = Math.max(0, 12 * (1 / (1 + Math.exp(-3 * norm)) - 0.5) * 2);
      transformed = Math.min(100, rawScore + boost);
      break;
    }
    default:
      return rawScore;
  }
  return Math.max(0, Math.min(100, transformed));
}

// Helper: detect suspicious score combinations that may indicate input errors
// Returns array of { key, level ('warn'|'info'), dim, msg }
export function detectInconsistencies(scores, spec, sciCriteria) {
  const warnings = [];
  const s = scores ?? {};

  // Scientific score > 0 but no criteria checked (expert slider set without checklist)
  if ((s.scientific ?? 0) > 0 && Array.isArray(sciCriteria) && sciCriteria.every(c => !c)) {
    warnings.push({
      key: "sci_no_criteria", level: "warn", dim: "scientific",
      msg: "Scientific Value is above 0 but no criteria are checked. Use the checklist to set this score, or adjust the slider to 0.",
    });
  }

  // High species rarity but no species entered
  if ((s.speciesRarity ?? 0) > 60 && !spec?.species?.trim()) {
    warnings.push({
      key: "species_no_name", level: "warn", dim: "speciesRarity",
      msg: "Species Rarity is high (>60) but no mineral species is entered. Add the species name to support this score.",
    });
  }

  // High variety rarity but no variety entered
  if ((s.varietyRarity ?? 0) > 60 && !spec?.variety?.trim()) {
    warnings.push({
      key: "variety_no_name", level: "info", dim: "varietyRarity",
      msg: "Variety/Form Uniqueness is high (>60) but no variety is entered in specimen data. Consider documenting the specific form.",
    });
  }

  // High locality rarity but no locality entered
  if ((s.localityRarity ?? 0) > 60 && !spec?.locality?.trim()) {
    warnings.push({
      key: "locality_no_name", level: "warn", dim: "localityRarity",
      msg: "Locality Rarity is high (>60) but no locality is entered. Add the locality to support this score.",
    });
  }

  // Gem-grade crystal but very low aesthetics — unusual combo
  if ((s.crystal ?? 50) >= 85 && (s.aesthetics ?? 50) < 25) {
    warnings.push({
      key: "crystal_aesthetic_mismatch", level: "info", dim: "aesthetics",
      msg: "Crystal Quality is gem-grade (85+) but Aesthetics is very low (<25). This combination is unusual — verify both scores.",
    });
  }

  // Excellent documentation on the most common possible material
  if ((s.provenance ?? 0) >= 85 && (s.speciesRarity ?? 0) <= 15 && (s.localityRarity ?? 0) <= 15) {
    warnings.push({
      key: "provenance_common", level: "info", dim: "provenance",
      msg: "Excellent provenance on a ubiquitous species and active locality. Documentation adds credibility but won't drive collector value for common material.",
    });
  }

  return warnings;
}

// Helper: returns the single highest-prestige compound grade achieved,
// or an empty array if none qualify. Array wrapper preserves API compatibility.
export function detectCompoundGrades(allCtxScores) {
  const match = COMPOUND_GRADES.find(cg =>
    Object.entries(cg.contexts).every(([ctxKey, threshold]) => {
      const s = allCtxScores[ctxKey] ?? 0;
      return s >= threshold;
    })
  );
  return match ? [match] : [];
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
    label: "Species Rarity",
    short: "Species",
    icon: "🌍",
    desc: "How rare is this mineral species globally?",
    detail: "Score based on how few localities worldwide produce this species and how rarely it appears on the market. Do not factor in variety or form here — that is the separate Variety/Form Uniqueness score. Examples: quartz = 5, beryl = 30, phenakite = 70, painite = 98.",
    anchors: [
      { value: 5,  label: "Ubiquitous species",        hint: "Common everywhere — quartz, calcite, pyrite, feldspar" },
      { value: 25, label: "Common species",             hint: "Many worldwide localities; widely available at shows" },
      { value: 50, label: "Uncommon species",           hint: "Moderately scarce; limited number of producing localities" },
      { value: 75, label: "Rare species",               hint: "Very few localities worldwide; infrequently seen at shows" },
      { value: 95, label: "Extremely rare species",     hint: "Fewer than 10 known localities, or newly described" },
    ],
  },
  {
    key: "varietyRarity",
    label: "Variety / Form Uniqueness",
    short: "Variety",
    icon: "🔷",
    desc: "How rare is this specific variety, form, color, or habit of the species?",
    detail: "Score how many localities worldwide produce this specific form. A metallic-blue almandine from a single Arizona locality scores 90+ here even though almandine as a species is common. Common habits like typical quartz prisms score low regardless of species rarity. Examples: typical quartz prism = 5, standard elbaite tourmaline = 30, tourmaline cat's-eye = 70, trapiche ruby = 90.",
    anchors: [
      { value: 5,  label: "Typical / standard form",          hint: "Common habit for this species; widely produced" },
      { value: 25, label: "Recognizable but not distinctive",  hint: "Some variation, but this form available from multiple localities" },
      { value: 55, label: "Uncommon variety",                  hint: "Specific form or coating not widely seen; limited sources" },
      { value: 75, label: "Rare variety",                      hint: "Distinctive form from very few localities; notable in collections" },
      { value: 95, label: "Unique or singular form",           hint: "One locality worldwide for this form, or entirely novel variety" },
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
      { id: "T1", score: 100, desc: "Original field label + full chain of custody + legal collection documentation (permit, BLM form, or landowner permission)" },
      { id: "T2", score: 75, desc: "Original label, partial chain, locality verified" },
      { id: "T3", score: 50, desc: "Known locality and approximate date, no original label, dealer attribution" },
      { id: "T4", score: 25, desc: "Locality stated, undocumented, purchased from dealer" },
      { id: "T5", score: 0, desc: "Locality unknown or unverifiable" },
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
      { key: "emerging",        label: "Emerging science",           desc: "Species has documented applications in technology, medicine, or materials research (e.g. solar, batteries, pharmaceuticals, semiconductors)" },
      { key: "paragenetic",     label: "Paragenetic complexity",     desc: "Two or more associated species present" },
      { key: "literature",      label: "Literature citation",        desc: "This specimen or the locality it is from appears in a published mineralogical study" },
      { key: "compositional",   label: "Compositional significance", desc: "Represents an end-member or unusual composition for the species" },
    ],
  },
];

export const SIZE_CLASSES = [
  { key: "thumbnail",  label: "Thumbnail",     range: "< 2.5 cm" },
  { key: "miniature",  label: "Miniature",      range: "2.5–4.5 cm" },
  { key: "small_cab",  label: "Small Cabinet",  range: "4.5–7.5 cm" },
  { key: "cabinet",    label: "Cabinet",        range: "7.5–12 cm" },
  { key: "large_cab",  label: "Large Cabinet",  range: "12–25 cm" },
  { key: "museum",     label: "Museum",         range: "> 25 cm" },
];
