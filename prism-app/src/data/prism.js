export const WEIGHTS = {
  //                                                                                                                              ↓ cultural context gives this 20%
  museum:     { crystal: 0.12,  speciesRarity: 0.10,  varietyRarity: 0.10,  localityRarity: 0.23, provenance: 0.22, aesthetics: 0.04, scientific: 0.12, culturalSignificance: 0.07 },
  exhibition: { crystal: 0.41,  speciesRarity: 0.035, varietyRarity: 0.035, localityRarity: 0.12, provenance: 0.06, aesthetics: 0.29, scientific: 0.03, culturalSignificance: 0.02 },
  collector:  { crystal: 0.22,  speciesRarity: 0.13,  varietyRarity: 0.13,  localityRarity: 0.24, provenance: 0.10, aesthetics: 0.11, scientific: 0.03, culturalSignificance: 0.04 },
  cultural:   { crystal: 0.12,  speciesRarity: 0.10,  varietyRarity: 0.02,  localityRarity: 0.13, provenance: 0.27, aesthetics: 0.06, scientific: 0.10, culturalSignificance: 0.20 },
  study:      { crystal: 0.11,  speciesRarity: 0.04,  varietyRarity: 0.04,  localityRarity: 0.08, provenance: 0.26, aesthetics: 0.05, scientific: 0.40, culturalSignificance: 0.02 },
  systematic: { crystal: 0.06,  speciesRarity: 0.10,  varietyRarity: 0.02,  localityRarity: 0.15, provenance: 0.30, aesthetics: 0.02, scientific: 0.33, culturalSignificance: 0.02 },
  commercial: { crystal: 0.20,  speciesRarity: 0.15,  varietyRarity: 0.05,  localityRarity: 0.12, provenance: 0.05, aesthetics: 0.22, scientific: 0.18, culturalSignificance: 0.03 },
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
    gradeLabel: "Museum",
    icon: "🏛️",
    hidden: true,
    desc: "Evaluating as a potential museum-quality specimen.",
    detail: "Museum-quality specimens are defined by irreplaceability and documentation. Locality rarity and provenance dominate — a specimen from an exhausted or unique locality with a verified chain of custody represents the museum ideal. Scientific value is rewarded asymmetrically: absent science doesn't penalize, but exceptional science gets a major non-linear boost. Aesthetics barely factor in at 4%.",
  },
  {
    key: "exhibition",
    label: "Display / Show",
    gradeLabel: "Exhibition",
    icon: "✨",
    desc: "Evaluating for gem show display or prominent exhibition.",
    detail: "Exhibition contexts reward crystal perfection and visual impact above all. Crystal quality (42%) and aesthetics (30%) dominate — famous localities add show-floor prestige. Provenance and science matter little here.",
  },
  {
    key: "collector",
    label: "Collector's Piece",
    gradeLabel: "Collector",
    icon: "💎",
    desc: "Evaluating as a personal collector's specimen.",
    detail: "Collector value is driven by rarity — species scarcity and locality prestige together account for over half the score. A rare mineral from a classic, exhausted locality at fine quality commands serious collector interest.",
  },
  {
    key: "cultural",
    label: "Cultural / Historical",
    gradeLabel: "Collector",
    icon: "�",
    desc: "Evaluating for cultural, historical, or heritage significance.",
    detail: "Cultural and historical specimens derive value primarily from their documented chain of custody and historical context. Provenance (40%) dominates — a specimen from a famous historical collection, estate, or deaccessioned from an institution carries far more weight than one with unknown origins. Locality history and scientific significance support the narrative.",
  },
  {
    key: "study",
    label: "Scientific Study",
    gradeLabel: "Study",
    icon: "🔬",
    desc: "Evaluating for research, teaching, or reference use.",
    detail: "Scientific value (42%) and provenance chain (26%) matter most for study specimens. A well-documented specimen with research relevance — even if visually unremarkable — outscores a beautiful piece with no documentation or scientific context.",
  },
  {
    key: "systematic",
    label: "Systematic / Type",
    gradeLabel: "Study",
    icon: "🗂️",
    desc: "Evaluating as a systematic collection or type specimen.",
    detail: "Systematic and type collections prioritize scientific completeness and documentation above all. Scientific significance (35%) and provenance (30%) together account for nearly two thirds of the score. Locality (15%) reflects the importance of type locality and reference material from well-documented sources. Crystal quality and aesthetics are secondary — a well-documented holotype in average condition far outranks a beautiful specimen with no research context.",
  },
  {
    key: "commercial",
    label: "Teaching / Educational",
    gradeLabel: "General",
    icon: "🎓",
    desc: "Evaluating for classroom, outreach, or educational collection use.",
    detail: "Educational specimens need to be visually engaging and species-diverse — aesthetics (25%) and species character (20%) drive engagement. Scientific and educational relevance (18%) rewards specimens that illustrate concepts clearly. Crystal quality (20%) ensures the specimen is a good example of its kind. Provenance matters less here than practical educational value.",
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
    shortDesc: "All seven evaluation contexts passed simultaneously",
    detail: "An irreplaceable specimen excelling across every evaluation context — museum, exhibition, collector, cultural/historical, scientific study, systematic/type, and educational standards all achieved simultaneously. The rarest possible PRISM classification.",
    contexts: { museum: 70, exhibition: 70, collector: 70, study: 70, commercial: 70, systematic: 70, cultural: 70 },
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
    key: "institutional_archive",
    label: "Institutional Archive",
    emoji: "🏛️📜🗂️",
    color: "#c090d0",
    gradient: "linear-gradient(135deg, #e8b840, #d4a840, #7050d0)",
    shortDesc: "Museum · Cultural · Systematic — the institutional documentation trinity",
    detail: "Institutional-quality provenance, historical significance, and systematic completeness all achieved simultaneously. The rarest combination for archival and type collections — a specimen documented to the highest standards across every institutional dimension.",
    contexts: { museum: 70, cultural: 70, systematic: 70 },
    rarity: "Very Rare",
  },
  {
    key: "heritage_research",
    label: "Heritage Research",
    emoji: "🏛️📜🔬",
    color: "#80a0d0",
    gradient: "linear-gradient(135deg, #e8b840, #d4a840, #5090ff)",
    shortDesc: "Museum · Cultural · Science — historically significant and scientifically studied",
    detail: "Museum-grade documentation, historical collection significance, and active scientific value — the combination that makes a specimen irreplaceable to research institutions. Published type-locality specimens from named historical collections exemplify this grade.",
    contexts: { museum: 70, cultural: 70, study: 70 },
    rarity: "Very Rare",
  },
  {
    key: "type_research_masterpiece",
    label: "Type Research Masterpiece",
    emoji: "🏛️🗂️🔬",
    color: "#6090c0",
    gradient: "linear-gradient(135deg, #e8b840, #7050d0, #5090ff)",
    shortDesc: "Museum · Systematic · Science — museum-grade type specimen with scientific depth",
    detail: "The gold standard for holotypes and systematic reference material. Museum-quality provenance, systematic collection completeness, and direct scientific significance all confirmed. The defining classification for species-defining specimens.",
    contexts: { museum: 70, systematic: 70, study: 70 },
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
    key: "research_heritage",
    label: "Research Heritage",
    emoji: "📜🗂️🔬",
    color: "#5080b0",
    gradient: "linear-gradient(135deg, #d4a840, #7050d0, #5090ff)",
    shortDesc: "Cultural · Systematic · Science — full research-documentation trifecta",
    detail: "Cultural significance, systematic completeness, and scientific value all confirmed without requiring museum-grade provenance. A well-studied, historically attributed type or reference specimen from a documented collection.",
    contexts: { cultural: 70, systematic: 70, study: 70 },
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
    key: "heritage_specimen",
    label: "Heritage Specimen",
    emoji: "🏛️📜",
    color: "#d0a060",
    gradient: "linear-gradient(135deg, #e8b840, #d4a840)",
    shortDesc: "Museum · Cultural — institutional quality with historical provenance",
    detail: "Museum-grade documentation combined with verifiable historical significance. Deaccessioned institutional material, estate-documented specimens, and classic-collection pieces with unbroken attribution exemplify this grade.",
    contexts: { museum: 70, cultural: 70 },
    rarity: "Rare",
  },
  {
    key: "type_collection",
    label: "Type Collection",
    emoji: "🏛️🗂️",
    color: "#a080c0",
    gradient: "linear-gradient(135deg, #e8b840, #7050d0)",
    shortDesc: "Museum · Systematic — museum-grade type or systematic reference specimen",
    detail: "Museum-quality provenance and systematic collection completeness achieved simultaneously. The defining standard for holotypes, paratypes, and primary reference specimens held in institutional collections.",
    contexts: { museum: 70, systematic: 70 },
    rarity: "Rare",
  },
  {
    key: "collector_display",
    label: "Competition Piece",
    emoji: "🏆",
    color: "#40d0a0",
    gradient: "linear-gradient(135deg, #00c880, #90c0f0)",
    shortDesc: "Collector · Display — rare, beautiful, and show-worthy",
    detail: "A specimen that earns both Collector and Exhibition grades simultaneously — rare enough to command serious collector interest and visually stunning enough to win on the show table. The show-competition ideal.",
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
  {
    key: "archive_material",
    label: "Archive Material",
    emoji: "📜🗂️",
    color: "#9090b0",
    gradient: "linear-gradient(135deg, #d4a840, #7050d0)",
    shortDesc: "Cultural · Systematic — historically attributed reference specimen",
    detail: "Cultural significance and systematic documentation confirmed together. A well-attributed historical specimen that also serves as a reference standard — the intersection of provenance research and systematic mineralogy.",
    contexts: { cultural: 70, systematic: 70 },
    rarity: "Uncommon",
  },
  {
    key: "historical_research",
    label: "Historical Research",
    emoji: "📜🔬",
    color: "#7090c0",
    gradient: "linear-gradient(135deg, #d4a840, #5090ff)",
    shortDesc: "Cultural · Science — culturally significant and scientifically studied",
    detail: "A specimen with verifiable historical significance that is also scientifically valuable. Named-collection material from classic localities that continues to inform modern research exemplifies this classification.",
    contexts: { cultural: 70, study: 70 },
    rarity: "Uncommon",
  },
  {
    key: "reference_standard",
    label: "Reference Standard",
    emoji: "🗂️🔬",
    color: "#6080b0",
    gradient: "linear-gradient(135deg, #7050d0, #5090ff)",
    shortDesc: "Systematic · Science — complete systematic specimen with scientific significance",
    detail: "Both systematic completeness and direct scientific value confirmed simultaneously. A fully documented reference or type specimen with active research relevance — the foundation of comprehensive systematic collections.",
    contexts: { systematic: 70, study: 70 },
    rarity: "Uncommon",
  },
  {
    key: "historical_collector",
    label: "Historical Collector",
    emoji: "💎📜",
    color: "#a0c080",
    gradient: "linear-gradient(135deg, #00c880, #d4a840)",
    shortDesc: "Collector · Cultural — rare specimen with verifiable historical provenance",
    detail: "Collector-grade rarity and locality quality combined with documented historical significance. A rare or classic-locality piece from a named collection or estate with an unbroken attribution chain — the investment collector's ideal.",
    contexts: { collector: 70, cultural: 70 },
    rarity: "Uncommon",
  },
  {
    key: "systematic_collector",
    label: "Systematic Collector",
    emoji: "💎🗂️",
    color: "#70c090",
    gradient: "linear-gradient(135deg, #00c880, #7050d0)",
    shortDesc: "Collector · Systematic — type or reference specimen with collector appeal",
    detail: "A specimen that satisfies both serious collector standards and systematic collection requirements. Classic-locality type material, variety end-members, and well-documented reference specimens that also command collector market interest.",
    contexts: { collector: 70, systematic: 70 },
    rarity: "Uncommon",
  },
  {
    key: "heritage_display",
    label: "Heritage Display",
    emoji: "📜✨",
    color: "#c0c080",
    gradient: "linear-gradient(135deg, #d4a840, #90c0f0)",
    shortDesc: "Cultural · Display — visually striking with documented historical significance",
    detail: "A historically documented specimen that is also visually exceptional — beautiful enough to display prominently and significant enough to anchor a provenance story. Aesthetically remarkable pieces from famous historical collections exemplify this grade.",
    contexts: { cultural: 70, exhibition: 70 },
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
export function detectInconsistencies(scores, spec, sciCriteria, culturalCriteria) {
  const warnings = [];
  const s = scores ?? {};

  // Scientific score > 0 but no criteria checked
  if ((s.scientific ?? 0) > 0 && Array.isArray(sciCriteria) && sciCriteria.every(c => !c)) {
    warnings.push({
      key: "sci_no_criteria", level: "warn", dim: "scientific",
      msg: "Scientific Value is above 0 but no criteria are checked. Use the checklist to set this score, or adjust the slider to 0.",
    });
  }

  // Cultural significance score > 0 but no criteria checked
  if ((s.culturalSignificance ?? 0) > 0 && Array.isArray(culturalCriteria) && culturalCriteria.every(c => !c)) {
    warnings.push({
      key: "cultural_no_criteria", level: "warn", dim: "culturalSignificance",
      msg: "Cultural / Historical score is above 0 but no criteria are checked. Use the checklist to document which criteria apply.",
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

  // Exhibition history present but provenance score is low
  if (Array.isArray(spec?.exhibitions) && spec.exhibitions.filter(e => e.venue?.trim()).length > 0 && (s.provenance ?? 0) < 50) {
    warnings.push({
      key: "exhibition_provenance_low", level: "info", dim: "provenance",
      msg: "Exhibition history is documented. Verified show or museum display history typically supports a stronger Provenance score.",
    });
  }

  // Literature refs entered but 'literature' scientific criterion is not checked
  if (Array.isArray(spec?.literatureRefs) && spec.literatureRefs.filter(r => r?.trim()).length > 0 && Array.isArray(sciCriteria) && !sciCriteria[3]) {
    warnings.push({
      key: "lit_ref_no_criterion", level: "info", dim: "scientific",
      msg: "Literature citations are documented — consider checking the 'Literature citation' scientific criterion.",
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
    key: "provenance",
    label: "Provenance",
    short: "Prov.",
    icon: "📜",
    desc: "How well can you document where this came from and who owned it?",
    detail: "Provenance is the documented history of a specimen — where it was found, who collected it, and the chain of ownership since. Strong provenance adds both scientific and monetary value, and confirms legal collection status.",
    tiers: [
      { id: "T1", score: 100, desc: "Original field label + full chain of custody + legal collection documentation (permit, BLM form, or landowner permission)" },
      { id: "TH", score: 85, desc: "Historical collection: named collection catalog, estate or auction lot records, or museum deaccession documentation (pre-1960 attribution)" },
      { id: "T2", score: 75, desc: "Original label, partial chain, locality verified" },
      { id: "T3", score: 50, desc: "Known locality and approximate date, no original label, dealer attribution" },
      { id: "T4", score: 25, desc: "Locality stated, undocumented, purchased from dealer" },
      { id: "T5", score: 0, desc: "Locality unknown or unverifiable" },
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
  {
    key: "culturalSignificance",
    label: "Cultural / Historical",
    short: "Cultural",
    icon: "🏺",
    desc: "Does this specimen have documented cultural, historical, or heritage significance?",
    detail: "Cultural and historical significance reflects a specimen's place in human history beyond its mineralogy. A postage stamp appearance, named-collection provenance, or major show award represents measurable institutional recognition — and real market premium — that raw quality and rarity alone cannot command. Each criterion that applies adds 20 points.",
    criteria: [
      { key: "stamp",           label: "Postage stamp / official media",             desc: "Featured on a postage stamp, coin, banknote, or official government publication (any country)" },
      { key: "namedCollection", label: "Named historical collection",                desc: "From a documented named collection (Pinch, Vaux, Canfield, Bement, Faber, Krantz, or equivalent) with attribution" },
      { key: "published",       label: "Major publication reference",               desc: "Pictured or cited as a key specimen in a book, exhibition catalog, auction catalog, or peer-reviewed journal" },
      { key: "showAward",       label: "Major show award",                          desc: "Won first place or Best-of-Show at a recognized international show (Tucson, Denver, Munich, Sainte-Marie, Hamburg)" },
      { key: "notableOwner",    label: "Notable individual or institutional history", desc: "Documented ownership by royalty, a head of state, a famous scientist, or formal deaccession from an institutional collection" },
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

// ── Heritage / Cultural Significance Flags ────────────────────────────────────
// Structured provenance flags that carry real collector market premium.
// Used in ResearchMode comp entry and ResearchAnalysis heritage premium chart.

// ── Aesthetics sub-dimensions ────────────────────────────────────────────────
// Four sub-scores that average to the overall Aesthetics dimension score.
export const AESTHETICS_SUB_DIMS = [
  {
    key: "color",
    label: "Color / Saturation",
    icon: "🎨",
    desc: "Richness, saturation, and interest of the specimen's color(s)",
    anchors: [
      { value: 10, label: "Poor",                   hint: "Color absent, incorrect for species, or severely compromised" },
      { value: 30, label: "Marginal",               hint: "Color weaker than most comparable specimens; upgrading suggested" },
      { value: 55, label: "Good",                   hint: "Typical, pleasing color for the species; average in good collections" },
      { value: 80, label: "Fine",                   hint: "Exceptional or unusually fine color; better than most known specimens" },
      { value: 95, label: "Exceptional",            hint: "World-class — finest color known for the species or size" },
    ],
  },
  {
    key: "form",
    label: "Crystal Form / Habit",
    icon: "💠",
    desc: "Visual expression of crystal geometry, habit, and structural elegance",
    anchors: [
      { value: 10, label: "Poor",                   hint: "Crystal form absent, habit unclear, or damage severe" },
      { value: 30, label: "Marginal",               hint: "Form less developed than most comparable specimens" },
      { value: 55, label: "Good",                   hint: "Well-expressed habit typical for the species; average in good collections" },
      { value: 80, label: "Fine",                   hint: "Better form than most known specimens; fine geometry and expression" },
      { value: 95, label: "Exceptional",            hint: "World-class — best of species or size known to curators" },
    ],
  },
  {
    key: "presentation",
    label: "Presentation / Balance",
    icon: "🖼️",
    desc: "Matrix quality, specimen composition, and overall display balance",
    anchors: [
      { value: 10, label: "Poor",                   hint: "Aesthetics essentially absent; specimen cannot be effectively displayed" },
      { value: 30, label: "Marginal",               hint: "Poor balance or composition; upgrading suggested" },
      { value: 55, label: "Good",                   hint: "Good balance and arrangement; display-ready; average in good collections" },
      { value: 80, label: "Fine",                   hint: "Composition enhances specimen quality; outstanding display piece" },
      { value: 95, label: "Exceptional",            hint: "Gallery standard — composition and balance are optimal; stops viewers" },
    ],
  },
  {
    key: "luster",
    label: "Luster",
    icon: "✨",
    desc: "Surface brilliance, reflectivity quality, and luster intensity",
    anchors: [
      { value: 10, label: "Poor",                   hint: "No surface reflectivity; dull, earthy, or powdery" },
      { value: 30, label: "Marginal",               hint: "Weak luster; resinous or waxy at best" },
      { value: 55, label: "Good",                   hint: "Good vitreous or characteristic luster for the species" },
      { value: 80, label: "Fine",                   hint: "Brilliant; high reflectivity that stands out in collections" },
      { value: 95, label: "Exceptional",            hint: "Mirror, adamantine, or metallic — finest known for the species" },
    ],
  },
];

// ── Treatment / Enhancement Disclosure ────────────────────────────────────────
// Informational flags for specimen condition disclosure. Not an automatic score
// modifier — the evaluator accounts for treatment status when setting sub-scores.
// Ordered from most to least severe. Synthetic/reconstituted, oiled, and plastic-embedded
// are disallowed in TGMS competitive shows; repaired is allowed only with label disclosure.
// Irradiated and heated are gem-trade additions covering PRISM's broader scope.
export const TREATMENT_FLAGS = [
  { key: "synthetic",      label: "Synthetic / Reconstituted", severity: "critical", desc: "Not naturally formed — lab-grown, man-made, or reconstituted material (TGMS: disallowed)" },
  { key: "crystals_added", label: "Crystals Added",             severity: "critical", desc: "Crystals added to the specimen that were not originally there (TGMS: disallowed)" },
  { key: "matrix_altered", label: "Matrix Altered / Added",    severity: "high",     desc: "Matrix has been altered, added to, or is not original (TGMS: disallowed)" },
  { key: "coated",         label: "Coated / Embedded",         severity: "high",     desc: "Surface coated with added material or embedded in plastic (TGMS: disallowed)" },
  { key: "oiled",          label: "Oiled",                     severity: "high",     desc: "Specimen has been oiled (TGMS: disallowed)" },
  { key: "filled",         label: "Cracks / Gaps Filled",      severity: "medium",   desc: "Cracks or gaps filled with any type of material (TGMS: disallowed)" },
  { key: "lapidary",       label: "Lapidary Treatment",        severity: "medium",   desc: "Crystal faces have lapidary treatment (TGMS: allowed only to reveal inclusions)" },
  { key: "repaired",       label: "Repaired",                  severity: "low",      desc: "Crystal glued back together or onto matrix — label must note repair (TGMS: allowed with disclosure)" },
  { key: "irradiated",     label: "Irradiated",                severity: "high",     desc: "Color enhanced by radiation treatment (blue topaz, some tourmalines)" },
  { key: "heated",         label: "Heated",                    severity: "medium",   desc: "Color or clarity altered by heat treatment (corundum, tanzanite, etc.)" },
];

export const HERITAGE_FLAGS = [
  { key: "stamp",              label: "Postage Stamp",       emoji: "📮", desc: "Featured on a postage stamp (any country)" },
  { key: "named_collection",   label: "Named Collection",    emoji: "🏛️", desc: "From a significant named private or institutional collection" },
  { key: "published",          label: "Published Reference", emoji: "📖", desc: "Pictured or cited in a book, journal, or major mineralogy catalog" },
  { key: "show_award",         label: "Show Award",          emoji: "🏆", desc: "Won an award at a major show (Tucson, Denver, Munich, Sainte-Marie)" },
  { key: "auction_record",     label: "Auction Record",      emoji: "💰", desc: "Sold at a major auction house (Heritage, Bonhams, Christie's, Sotheby's)" },
  { key: "museum_deaccession", label: "Museum Deaccession",  emoji: "🏦", desc: "Formally deaccessioned from an institutional collection with documentation" },
];
