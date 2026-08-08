export const WEIGHTS = {
  //                                                                                                                              ↓ cultural context emphasizes heritage recognition
  museum:     { crystal: 0.12,  speciesRarity: 0.10,  varietyRarity: 0.10,  localityRarity: 0.23, provenance: 0.22, aesthetics: 0.04, scientific: 0.12, culturalSignificance: 0.07 },
  exhibition: { crystal: 0.41,  speciesRarity: 0.035, varietyRarity: 0.035, localityRarity: 0.12, provenance: 0.06, aesthetics: 0.29, scientific: 0.03, culturalSignificance: 0.02 },
  collector:  { crystal: 0.22,  speciesRarity: 0.13,  varietyRarity: 0.13,  localityRarity: 0.24, provenance: 0.10, aesthetics: 0.11, scientific: 0.03, culturalSignificance: 0.04 },
  cultural:   { crystal: 0.16,  speciesRarity: 0.06,  varietyRarity: 0.02,  localityRarity: 0.10, provenance: 0.22, aesthetics: 0.14, scientific: 0.06, culturalSignificance: 0.24 },
  study:      { crystal: 0.11,  speciesRarity: 0.04,  varietyRarity: 0.04,  localityRarity: 0.08, provenance: 0.26, aesthetics: 0.05, scientific: 0.40, culturalSignificance: 0.02 },
  systematic: { crystal: 0.06,  speciesRarity: 0.10,  varietyRarity: 0.02,  localityRarity: 0.15, provenance: 0.30, aesthetics: 0.02, scientific: 0.33, culturalSignificance: 0.02 },
  commercial: { crystal: 0.20,  speciesRarity: 0.15,  varietyRarity: 0.05,  localityRarity: 0.12, provenance: 0.05, aesthetics: 0.22, scientific: 0.18, culturalSignificance: 0.03 },
};

export const GRADES = [
  { min: 90, label: "Museum",     color: "#9a7a14", emoji: "🏛️", desc: "An exceptional piece worthy of a world-class museum collection." },
  { min: 75, label: "Exhibition", color: "#2f6fa8", emoji: "✨", desc: "Show-quality specimen — impressive enough to display prominently." },
  { min: 60, label: "Collector",  color: "#0a7a52", emoji: "💎", desc: "A solid collector piece with clear appeal and value." },
  { min: 45, label: "Study",      color: "#2a5fd0", emoji: "🔬", desc: "Good for research, teaching, or reference collections." },
  { min: 20, label: "General",    color: "#4a6a88", emoji: "🪨", desc: "Common specimen — minimal collector distinction; fine for beginners or decorative use." },
  { min: 0,  label: "Bulk",       color: "#4a4a58", emoji: "📦", desc: "Below collector grade — suitable for bulk, tumbling, or classroom use only." },
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
    gradeLabel: "Collector", // numeric grade band when score is mid-tier; UI threshold copy uses context label, not this
    icon: "🏺",
    desc: "Evaluating for cultural, historical, or heritage significance.",
    detail: "Cultural and historical specimens balance documented heritage recognition (24%) with provenance (22%), crystal quality (16%), and aesthetics (14%). Media or exhibition history still matters, but a showpiece with verified heritage can clear the threshold without stacking every checklist item — beauty alone will not.",
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
// Labels describe evaluative profile (which contexts pass), not prestige or
// monetary value — GIA Fancy-style naming. "Institutional" is used only when
// the Museum context is in the mix. Keys are stable for stored-data compatibility.
export const COMPOUND_GRADES = [
  {
    key: "institutional_masterpiece",
    label: "Full Spectrum",
    emoji: "🔮",
    color: "#ff9040",
    gradient: "linear-gradient(135deg, #e8b840, #90c0f0, #0a7a52, #5090ff, #ff9040)",
    shortDesc: "All seven evaluation contexts passed simultaneously",
    detail: "Meets every PRISM evaluation context at once — museum, exhibition, collector, cultural/historical, scientific study, systematic/type, and educational. The broadest possible profile in the system.",
    contexts: { museum: 70, exhibition: 70, collector: 70, study: 70, commercial: 70, systematic: 70, cultural: 70 },
    rarity: "Once in a Generation",
  },
  {
    key: "grand_slam",
    label: "Core Spectrum",
    emoji: "🏆",
    color: "#e8b840",
    gradient: "linear-gradient(135deg, #e8b840, #90c0f0, #0a7a52, #5090ff)",
    shortDesc: "Museum · Display · Collection · Science",
    detail: "Meets the four core contexts together: institutional (museum), display, collection, and science. Documented, display-capable, collection-relevant, and scientifically significant.",
    contexts: { museum: 70, exhibition: 70, collector: 70, study: 70 },
    rarity: "Extremely Rare",
  },
  {
    key: "museum_trifecta",
    label: "Institutional Display Science",
    emoji: "🌠",
    color: "#c070f0",
    gradient: "linear-gradient(135deg, #e8b840, #90c0f0, #5090ff)",
    shortDesc: "Museum · Display · Science",
    detail: "Meets museum, display, and science contexts together — documented, suitable for exhibition, and scientifically significant. Common profile for published or type-locality material that also holds up on display.",
    contexts: { museum: 70, exhibition: 70, study: 70 },
    rarity: "Extremely Rare",
  },
  {
    key: "world_class",
    label: "Institutional Display Collection",
    emoji: "🌟",
    color: "#e8c060",
    gradient: "linear-gradient(135deg, #e8b840, #90c0f0, #0a7a52)",
    shortDesc: "Museum · Display · Collection",
    detail: "Meets museum, display, and collection contexts together — documented, exhibition-capable, and relevant to serious collection standards.",
    contexts: { museum: 70, exhibition: 70, collector: 70 },
    rarity: "Very Rare",
  },
  {
    key: "research_masterpiece",
    label: "Institutional Collection Science",
    emoji: "🔭",
    color: "#60a0e0",
    gradient: "linear-gradient(135deg, #e8b840, #0a7a52, #5090ff)",
    shortDesc: "Museum · Collection · Science",
    detail: "Meets museum, collection, and science contexts together — documented provenance with collection relevance and scientific significance. Typical profile for research and type-collection material.",
    contexts: { museum: 70, collector: 70, study: 70 },
    rarity: "Very Rare",
  },
  {
    key: "institutional_archive",
    label: "Institutional Heritage Type",
    emoji: "🏛️📜🗂️",
    color: "#c090d0",
    gradient: "linear-gradient(135deg, #e8b840, #d4a840, #7050d0)",
    shortDesc: "Museum · Cultural · Systematic",
    detail: "Meets museum, cultural/historical, and systematic contexts together — documented provenance, historical attribution, and systematic completeness.",
    contexts: { museum: 70, cultural: 70, systematic: 70 },
    rarity: "Very Rare",
  },
  {
    key: "heritage_research",
    label: "Institutional Heritage Science",
    emoji: "🏛️📜🔬",
    color: "#80a0d0",
    gradient: "linear-gradient(135deg, #e8b840, #d4a840, #5090ff)",
    shortDesc: "Museum · Cultural · Science",
    detail: "Meets museum, cultural/historical, and science contexts together — documented, historically attributed, and scientifically significant. Often applies to published material from named historical collections.",
    contexts: { museum: 70, cultural: 70, study: 70 },
    rarity: "Very Rare",
  },
  {
    key: "type_research_masterpiece",
    label: "Institutional Type Science",
    emoji: "🏛️🗂️🔬",
    color: "#6090c0",
    gradient: "linear-gradient(135deg, #e8b840, #7050d0, #5090ff)",
    shortDesc: "Museum · Systematic · Science",
    detail: "Meets museum, systematic, and science contexts together — documented type or reference material with direct scientific significance.",
    contexts: { museum: 70, systematic: 70, study: 70 },
    rarity: "Very Rare",
  },
  {
    key: "scientific_showpiece",
    label: "Display Collection Science",
    emoji: "🔬",
    color: "#80b8f0",
    gradient: "linear-gradient(135deg, #90c0f0, #0a7a52, #5090ff)",
    shortDesc: "Display · Collection · Science",
    detail: "Meets display, collection, and science contexts together — exhibition-capable, collection-relevant, and scientifically significant.",
    contexts: { exhibition: 70, collector: 70, study: 70 },
    rarity: "Rare",
  },
  {
    key: "research_heritage",
    label: "Heritage Type Science",
    emoji: "📜🗂️🔬",
    color: "#5080b0",
    gradient: "linear-gradient(135deg, #d4a840, #7050d0, #5090ff)",
    shortDesc: "Cultural · Systematic · Science",
    detail: "Meets cultural/historical, systematic, and science contexts together — historically attributed reference or type material with scientific significance, without requiring the museum context.",
    contexts: { cultural: 70, systematic: 70, study: 70 },
    rarity: "Rare",
  },
  {
    key: "museum_display",
    label: "Institutional Display",
    emoji: "🏛️✨",
    color: "#c0a0f0",
    gradient: "linear-gradient(135deg, #e8b840, #90c0f0)",
    shortDesc: "Museum · Display",
    detail: "Meets museum and display contexts together — documented provenance with exhibition suitability.",
    contexts: { museum: 70, exhibition: 70 },
    rarity: "Rare",
  },
  {
    key: "museum_science",
    label: "Institutional Science",
    emoji: "🏛️🔬",
    color: "#70b0e0",
    gradient: "linear-gradient(135deg, #e8b840, #5090ff)",
    shortDesc: "Museum · Science",
    detail: "Meets museum and science contexts together — documented provenance with scientific significance.",
    contexts: { museum: 70, study: 70 },
    rarity: "Rare",
  },
  {
    key: "museum_collector",
    label: "Institutional Collection",
    emoji: "🏛️💎",
    color: "#d4a040",
    gradient: "linear-gradient(135deg, #e8b840, #0a7a52)",
    shortDesc: "Museum · Collection",
    detail: "Meets museum and collection contexts together — documented provenance with collection relevance.",
    contexts: { museum: 70, collector: 70 },
    rarity: "Rare",
  },
  {
    key: "heritage_specimen",
    label: "Institutional Heritage",
    emoji: "🏛️📜",
    color: "#d0a060",
    gradient: "linear-gradient(135deg, #e8b840, #d4a840)",
    shortDesc: "Museum · Cultural",
    detail: "Meets museum and cultural/historical contexts together — documented provenance with verifiable historical attribution.",
    contexts: { museum: 70, cultural: 70 },
    rarity: "Rare",
  },
  {
    key: "type_collection",
    label: "Institutional Type",
    emoji: "🏛️🗂️",
    color: "#a080c0",
    gradient: "linear-gradient(135deg, #e8b840, #7050d0)",
    shortDesc: "Museum · Systematic",
    detail: "Meets museum and systematic contexts together — documented type or systematic reference material.",
    contexts: { museum: 70, systematic: 70 },
    rarity: "Rare",
  },
  {
    key: "collector_display",
    label: "Display Collection",
    emoji: "✨💎",
    color: "#40d0a0",
    gradient: "linear-gradient(135deg, #0a7a52, #90c0f0)",
    shortDesc: "Collection · Display",
    detail: "Meets collection and display contexts together — collection-relevant and suitable for exhibition.",
    contexts: { collector: 70, exhibition: 70 },
    rarity: "Uncommon",
  },
  {
    key: "collector_science",
    label: "Collection Science",
    emoji: "💎🔬",
    color: "#5090ff",
    gradient: "linear-gradient(135deg, #0a7a52, #5090ff)",
    shortDesc: "Collection · Science",
    detail: "Meets collection and science contexts together — collection-relevant material with scientific significance.",
    contexts: { collector: 70, study: 70 },
    rarity: "Uncommon",
  },
  {
    key: "display_science",
    label: "Display Science",
    emoji: "✨🔬",
    color: "#80b8f0",
    gradient: "linear-gradient(135deg, #90c0f0, #5090ff)",
    shortDesc: "Display · Science",
    detail: "Meets display and science contexts together — exhibition-capable and scientifically significant.",
    contexts: { exhibition: 70, study: 70 },
    rarity: "Uncommon",
  },
  {
    key: "archive_material",
    label: "Heritage Type",
    emoji: "📜🗂️",
    color: "#9090b0",
    gradient: "linear-gradient(135deg, #d4a840, #7050d0)",
    shortDesc: "Cultural · Systematic",
    detail: "Meets cultural/historical and systematic contexts together — historically attributed reference or type material.",
    contexts: { cultural: 70, systematic: 70 },
    rarity: "Uncommon",
  },
  {
    key: "historical_research",
    label: "Heritage Science",
    emoji: "📜🔬",
    color: "#7090c0",
    gradient: "linear-gradient(135deg, #d4a840, #5090ff)",
    shortDesc: "Cultural · Science",
    detail: "Meets cultural/historical and science contexts together — historically attributed material with scientific significance.",
    contexts: { cultural: 70, study: 70 },
    rarity: "Uncommon",
  },
  {
    key: "reference_standard",
    label: "Type Science",
    emoji: "🗂️🔬",
    color: "#6080b0",
    gradient: "linear-gradient(135deg, #7050d0, #5090ff)",
    shortDesc: "Systematic · Science",
    detail: "Meets systematic and science contexts together — type or reference material with scientific significance.",
    contexts: { systematic: 70, study: 70 },
    rarity: "Uncommon",
  },
  {
    key: "historical_collector",
    label: "Collection Heritage",
    emoji: "💎📜",
    color: "#a0c080",
    gradient: "linear-gradient(135deg, #0a7a52, #d4a840)",
    shortDesc: "Collection · Cultural",
    detail: "Meets collection and cultural/historical contexts together — collection-relevant material with verifiable historical attribution.",
    contexts: { collector: 70, cultural: 70 },
    rarity: "Uncommon",
  },
  {
    key: "systematic_collector",
    label: "Collection Type",
    emoji: "💎🗂️",
    color: "#70c090",
    gradient: "linear-gradient(135deg, #0a7a52, #7050d0)",
    shortDesc: "Collection · Systematic",
    detail: "Meets collection and systematic contexts together — collection-relevant type or reference material.",
    contexts: { collector: 70, systematic: 70 },
    rarity: "Uncommon",
  },
  {
    key: "heritage_display",
    label: "Heritage Display",
    emoji: "📜✨",
    color: "#c0c080",
    gradient: "linear-gradient(135deg, #d4a840, #90c0f0)",
    shortDesc: "Cultural · Display",
    detail: "Meets cultural/historical and display contexts together — historically attributed material suitable for exhibition.",
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

/**
 * Cross-dimension synergy for Cultural context — heritage recognition × specimen excellence.
 * Uses raw (pre-transform) scores so slider/checklist values match the gates the user sees.
 */
export function computeSynergyBonus(ctxKey, rawScores) {
  if (ctxKey !== "cultural") return { bonus: 0, label: null };
  const cultural = rawScores.culturalSignificance ?? 0;
  const crystal = rawScores.crystal ?? 0;
  const aesthetics = rawScores.aesthetics ?? 0;
  const provenance = rawScores.provenance ?? 0;

  if (cultural >= 30 && crystal >= 75 && aesthetics >= 75) {
    return { bonus: 10, label: "Heritage Showcase" };
  }
  if (cultural >= 30 && (crystal >= 75 || aesthetics >= 75) && provenance >= 70) {
    return { bonus: 8, label: "Heritage Showcase" };
  }
  if (cultural >= 55 && (crystal >= 80 || aesthetics >= 80)) {
    return { bonus: 6, label: "Heritage Showcase" };
  }
  return { bonus: 0, label: null };
}

/**
 * Shared context score: nonlinear dim transforms → weighted sum → optional synergy.
 * Returns { score, baseScore, synergyBonus, synergyLabel, adjustedScores }.
 */
export function computeContextScore(ctxKey, scores) {
  const W = WEIGHTS[ctxKey];
  if (!W) {
    return { score: 0, baseScore: 0, synergyBonus: 0, synergyLabel: null, adjustedScores: {} };
  }
  const adjustedScores = Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, applyNonLinearTransform(k, v ?? 50)])
  );
  const baseScore = Math.round(
    Object.entries(W).reduce((acc, [k, w]) => acc + (adjustedScores[k] ?? 50) * w, 0)
  );
  const { bonus: synergyBonus, label: synergyLabel } = computeSynergyBonus(ctxKey, scores);
  const score = Math.min(100, baseScore + synergyBonus);
  return { score, baseScore, synergyBonus, synergyLabel, adjustedScores };
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
  const litIdx = DIMS.find(d => d.key === "scientific")?.criteria?.findIndex(c => c.key === "literature") ?? -1;
  if (Array.isArray(spec?.literatureRefs) && spec.literatureRefs.filter(r => r?.trim()).length > 0 && Array.isArray(sciCriteria) && litIdx >= 0 && !sciCriteria[litIdx]) {
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
    detail: "Scientific value is scored by five weighted criteria (points sum to 100). Type locality and literature carry the most weight; morphological/crystallographic interest (twinning, rare habit) and associations also count. Aesthetics still scores form separately.",
    criteria: [
      { key: "typeLocality",              label: "Type locality",                                points: 30, desc: "This is the described type locality for the species" },
      { key: "literature",                label: "Literature citation",                          points: 25, desc: "This specimen or the locality it is from appears in a published mineralogical study" },
      { key: "morphology",                label: "Morphological / crystallographic significance", points: 20, desc: "Documented twinning, rare habit, skeletal/hopper growth, or other crystallographic features of scientific interest (beyond ordinary aesthetics)" },
      { key: "paragenetic",               label: "Associations / paragenetic complexity",         points: 15, desc: "Two or more associated species in a meaningful paragenetic relationship" },
      { key: "compositionalOrEmerging",   label: "Compositional or emerging-science significance", points: 10, desc: "End-member or unusual composition, or documented applications in technology, medicine, or materials research" },
    ],
  },
  {
    key: "culturalSignificance",
    label: "Cultural / Historical",
    short: "Cultural",
    icon: "🏺",
    desc: "Does this specimen have documented cultural, historical, or heritage significance?",
    detail: "Cultural and historical significance reflects a specimen's place in human history beyond its mineralogy. Weighted criteria (points sum to 100) reward media/exhibition recognition, named collections, famous specimen narratives, closed-mine cultural memory, and documented human cultural use of the mineral — not cultural artifacts.",
    criteria: [
      { key: "stamp",             label: "Featured in media or public exhibition",              points: 30, desc: "Displayed in a museum exhibit, featured in a documentary, magazine, major online publication, or other widely distributed public media" },
      { key: "namedOrNotable",    label: "Named historical collection or notable ownership",    points: 25, desc: "From a documented named collection (Pinch, Vaux, Canfield, Bement, Faber, Krantz, or equivalent), or documented ownership by a notable individual or formal institutional deaccession" },
      { key: "heritageNarrative", label: "Documented heritage narrative / famous specimen story", points: 20, desc: "A verifiable specimen-specific backstory with historical documentation (famous named stones, well-published individual pieces) — not marketing fluff" },
      { key: "historicMine",      label: "Closed or exhausted historic mine / locality",        points: 15, desc: "From a closed or exhausted mine or locality with documented cultural memory — heritage of the place, distinct from locality-rarity scoring alone" },
      { key: "humanCulturalUse",  label: "Documented human cultural use (peoples past or present)", points: 10, desc: "Mineral with a verified role in human history or living culture (e.g. navigation crystal lore, historic pigment source, documented workshop use). Do not use for indigenous, archaeological, or sacred artifacts — those are not appropriate for collector scoring or trade." },
    ],
  },
];

/** Sum points for checked criteria (boolean array aligned to criteria order). Capped at 100. */
export function scoreFromCriteria(criteria, checked) {
  if (!Array.isArray(criteria) || !Array.isArray(checked)) return 0;
  const total = criteria.reduce((sum, c, i) => sum + (checked[i] ? (c.points ?? 0) : 0), 0);
  return Math.min(100, total);
}

/**
 * Best-effort reconstruct a checked[] array from a saved numeric score
 * (records historically stored only the score, not which boxes were ticked).
 * Greedily selects highest-point criteria without exceeding the target.
 */
export function criteriaCheckedFromScore(criteria, score) {
  if (!Array.isArray(criteria) || criteria.length === 0) return [];
  const target = Math.max(0, Math.min(100, Math.round(score ?? 0)));
  const checked = criteria.map(() => false);
  if (target <= 0) return checked;
  const order = criteria
    .map((c, i) => ({ i, pts: c.points ?? 0 }))
    .sort((a, b) => b.pts - a.pts);
  let remaining = target;
  for (const { i, pts } of order) {
    if (pts > 0 && pts <= remaining) {
      checked[i] = true;
      remaining -= pts;
    }
  }
  return checked;
}

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
  { key: "other",          label: "Other",                     severity: "medium",   desc: "Any other treatment, restoration, or enhancement not listed above" },
];

export const HERITAGE_FLAGS = [
  { key: "stamp",              label: "Postage Stamp",       emoji: "📮", desc: "Featured on a postage stamp (any country)" },
  { key: "named_collection",   label: "Named Collection",    emoji: "🏛️", desc: "From a significant named private or institutional collection" },
  { key: "published",          label: "Published Reference", emoji: "📖", desc: "Pictured or cited in a book, journal, or major mineralogy catalog" },
  { key: "show_award",         label: "Show Award",          emoji: "🏆", desc: "Won an award at a major show (Tucson, Denver, Munich, Sainte-Marie)" },
  { key: "auction_record",     label: "Auction Record",      emoji: "💰", desc: "Sold at a major auction house (Heritage, Bonhams, Christie's, Sotheby's)" },
  { key: "museum_deaccession", label: "Museum Deaccession",  emoji: "🏦", desc: "Formally deaccessioned from an institutional collection with documentation" },
];
