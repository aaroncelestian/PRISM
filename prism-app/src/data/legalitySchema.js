/**
 * PRISM Specimen Collecting Legality Check
 * Scope: Casual/hobbyist mineral specimen collecting on U.S. federal land.
 * Does NOT cover claim staking, commercial extraction, or state/private land detail.
 * last_reviewed: 2026-08-06
 */

export const LEGALITY_META = {
  title: "Collecting Legality",
  subtitle: "Casual-use check for U.S. federal land",
  version: "1.0",
  lastReviewed: "2026-08-06",
  scope:
    "Casual/hobbyist mineral specimen collecting on U.S. federal land. Does not cover claim staking, commercial extraction, or detailed state/private-land rules.",
  disclaimer:
    "This tool encodes agency casual-use policy and informal guidance thresholds — not codified statutory quantity limits. No federal statute sets a numeric weight cap for common-variety casual collecting. BLM state offices and individual national forests issue supplemental guidance that can change independently of federal statute. Always verify with the local land manager before collecting.",
};

export const LAND_MANAGERS = [
  { id: "BLM", label: "BLM", desc: "Bureau of Land Management public lands" },
  { id: "USFS", label: "USFS", desc: "National Forest System lands" },
  { id: "NPS", label: "NPS", desc: "National Park Service units" },
  { id: "USFWS", label: "USFWS", desc: "National Wildlife Refuge System" },
  { id: "state_trust", label: "State / trust land", desc: "State parks, forests, or trust lands" },
  { id: "private", label: "Private land", desc: "Privately owned surface / mineral estate" },
  { id: "unknown", label: "Unknown", desc: "Land manager not yet identified" },
];

export const WITHDRAWAL_STATUSES = [
  { id: "open", label: "Open to mineral entry", desc: "No known withdrawal from casual collecting" },
  { id: "national_monument", label: "National monument", desc: "Proclamation / management-plan restrictions often apply" },
  { id: "wilderness", label: "Designated wilderness", desc: "Wilderness Act lands" },
  { id: "wilderness_study_area", label: "Wilderness study area (WSA)", desc: "Managed under non-impairment standard" },
  { id: "other_withdrawal", label: "Other withdrawal", desc: "ACEC, military, power-site, or similar" },
  { id: "unknown", label: "Unknown / unchecked", desc: "Verify via BLM MLRS or agency GIS before collecting" },
];

export const MATERIAL_CLASSES = [
  { id: "common_variety_mineral_rock", label: "Common rock / mineral", desc: "Hobby specimens, common-variety material" },
  { id: "petrified_wood", label: "Petrified wood", desc: "Subject to informal BLM daily/annual caps" },
  { id: "gemstone_locatable_grade", label: "Gem / locatable-grade", desc: "Marketable quality may trigger locatable-mineral rules" },
  { id: "invertebrate_fossil_plant_fossil", label: "Invertebrate / plant fossil", desc: "Generally casual-use eligible in limited quantity" },
  { id: "vertebrate_fossil", label: "Vertebrate fossil", desc: "Bones, teeth, tracks of vertebrates" },
  { id: "archaeological_cultural", label: "Archaeological / cultural", desc: "Artifacts, cultural materials — out of mineralogical scope" },
];

export const EXTRACTION_METHODS = [
  { id: "hand_tools", label: "Hand tools only", desc: "Hammer, chisel, hand shovel, rock pick" },
  { id: "mechanized_non_explosive", label: "Mechanized (non-explosive)", desc: "Rock saws, power equipment, mechanized digging" },
  { id: "explosive_blasting", label: "Explosives / blasting", desc: "Any explosive method" },
];

/** Editable informal quantity thresholds (not statutory hard caps). */
export const QUANTITY_THRESHOLDS = {
  blm_petrified_wood: {
    dailyLb: 25,
    annualLb: 250,
    note: "Informal BLM Instruction Memorandum guidance; +1 piece exception may apply. Varies by state office.",
  },
  personal_use_soft_cap_lb: 25,
};

export const RESULT_META = {
  PERMITTED_CASUAL: {
    label: "Permitted (casual use)",
    color: "var(--success)",
    tone: "success",
    provenanceNote: "Document locality, date, and land status for provenance. Eligible for higher provenance tiers if paperwork is retained.",
  },
  CONDITIONAL_REVIEW_REQUIRED: {
    label: "Conditional — review required",
    color: "var(--warn)",
    tone: "warn",
    provenanceNote: "Do not assume legality. Confirm with the local field office before collecting or assigning a high provenance score.",
  },
  PROHIBITED: {
    label: "Prohibited",
    color: "var(--danger)",
    tone: "danger",
    provenanceNote: "Illegal collection is a provenance defect. Cap at T4/T5 regardless of specimen quality.",
  },
  PROHIBITED_CASUAL_PERMIT_REQUIRED: {
    label: "Not casual — permit required",
    color: "var(--danger)",
    tone: "danger",
    provenanceNote: "Without a valid permit, treat as provenance-defective (T4/T5 cap).",
  },
  OUT_OF_SCOPE_ROUTE_ELSEWHERE: {
    label: "Out of scope",
    color: "var(--cyan)",
    tone: "info",
    provenanceNote: "This federal casual-use tree does not apply. Use the appropriate state, private, or commercial pathway.",
  },
  INSUFFICIENT_DATA: {
    label: "Insufficient data",
    color: "var(--text-muted)",
    tone: "muted",
    provenanceNote: "Resolve land status before collecting. Until then, treat provenance claims cautiously (default T4/T5).",
  },
  EXCEEDS_CASUAL_THRESHOLD: {
    label: "Exceeds casual threshold",
    color: "var(--warn)",
    tone: "warn",
    provenanceNote: "Free-use permit or sale contract may be required. Document authorization before scoring provenance highly.",
  },
};

/**
 * Walk the casual-use decision tree. Returns { tag, message, authority?, notes[] }.
 */
export function evaluateLegality(input) {
  const notes = [];
  const {
    land_manager,
    withdrawal_status,
    material_class,
    quantity_this_trip_lb,
    quantity_annual_running_total_lb,
    extraction_method,
    commercial_intent,
  } = input;

  // node_0 — commercial
  if (commercial_intent === true) {
    return {
      tag: "OUT_OF_SCOPE_ROUTE_ELSEWHERE",
      message:
        "Commercial intent detected. Route to claim-location / Materials Act sale-permit rules. This casual-use check does not apply.",
      notes,
    };
  }

  // node_1 — land manager
  if (land_manager === "NPS") {
    return {
      tag: "PROHIBITED",
      authority: "36 CFR 2.1",
      message:
        "All rock, mineral, and fossil collecting is prohibited in NPS units absent a research permit. No casual-use exception exists.",
      notes,
    };
  }
  if (land_manager === "USFWS") {
    return {
      tag: "PROHIBITED",
      authority: "50 CFR 27.51",
      message:
        "Collecting is prohibited by default on refuge lands absent refuge-specific authorization. Check the individual refuge compatibility determination before proceeding.",
      notes,
    };
  }
  if (land_manager === "state_trust") {
    return {
      tag: "OUT_OF_SCOPE_ROUTE_ELSEWHERE",
      message:
        "Federal framework does not apply. Check state statutes and the managing agency for that parcel.",
      notes,
    };
  }
  if (land_manager === "private") {
    return {
      tag: "OUT_OF_SCOPE_ROUTE_ELSEWHERE",
      message:
        "Federal public-land framework does not apply. Requires landowner permission and mineral-rights verification.",
      notes,
    };
  }
  if (land_manager === "unknown" || !land_manager) {
    return {
      tag: "INSUFFICIENT_DATA",
      message:
        "Land manager must be resolved (e.g., via BLM MLRS or a GIS land-status layer) before legality can be assessed.",
      notes,
    };
  }

  // node_2 — withdrawal (BLM / USFS)
  if (withdrawal_status === "wilderness") {
    return {
      tag: "PROHIBITED",
      authority: "Wilderness Act of 1964, 16 U.S.C. § 1133(c)",
      message:
        "Mechanized equipment and generally all mineral entry/collecting are prohibited in designated wilderness.",
      notes,
    };
  }
  if (withdrawal_status === "national_monument") {
    return {
      tag: "CONDITIONAL_REVIEW_REQUIRED",
      message:
        "Most national monument proclamations withdraw the area from mineral entry and often restrict casual collecting. Check the specific proclamation and monument management plan — restrictions vary by monument.",
      notes,
    };
  }
  if (withdrawal_status === "wilderness_study_area") {
    return {
      tag: "CONDITIONAL_REVIEW_REQUIRED",
      message:
        "WSAs are managed to preserve wilderness character (non-impairment) pending congressional action. Casual collecting is generally not compatible; confirm with the local BLM office.",
      notes,
    };
  }
  if (withdrawal_status === "other_withdrawal") {
    return {
      tag: "INSUFFICIENT_DATA",
      message:
        "Withdrawal instrument must be checked individually — scope of mineral-entry restriction varies (e.g., ACEC, military withdrawal, power-site reserve).",
      notes,
    };
  }
  if (withdrawal_status === "unknown" || !withdrawal_status) {
    return {
      tag: "INSUFFICIENT_DATA",
      message:
        "Verify current withdrawal status via BLM MLRS (Mineral & Land Records System) before proceeding — status changes independently of general land-manager designation.",
      notes,
    };
  }

  // node_3 — material class
  if (material_class === "vertebrate_fossil") {
    return {
      tag: "PROHIBITED_CASUAL_PERMIT_REQUIRED",
      authority: "Paleontological Resources Preservation Act, 16 U.S.C. § 470aaa",
      message:
        "Vertebrate fossils are categorically excluded from casual collection on all federal land regardless of quantity or agency. Permit required.",
      notes,
    };
  }
  if (material_class === "archaeological_cultural") {
    return {
      tag: "PROHIBITED",
      authority: "Archaeological Resources Protection Act, 16 U.S.C. § 470aa et seq.",
      message:
        "Archaeological and cultural materials are outside PRISM’s mineralogical scope and are categorically protected. Do not collect.",
      notes,
    };
  }
  if (material_class === "gemstone_locatable_grade") {
    notes.push(
      "If specimen quality/quantity suggests marketability (Coleman test), this may constitute locatable-mineral activity outside casual-use scope. Flag for manual review if value/quantity is high."
    );
  }
  if (material_class === "invertebrate_fossil_plant_fossil") {
    notes.push("Invertebrate and plant fossils are generally permitted under casual-use policy; reasonable quantity limits still apply.");
  }

  // node_4 — extraction method
  if (extraction_method === "explosive_blasting") {
    return {
      tag: "PROHIBITED_CASUAL_PERMIT_REQUIRED",
      message:
        "Requires Notice of Intent or Plan of Operations regardless of material class or quantity.",
      notes,
    };
  }
  if (extraction_method === "mechanized_non_explosive") {
    return {
      tag: "CONDITIONAL_REVIEW_REQUIRED",
      message:
        "Power equipment (e.g., rock saws, mechanized digging) typically exceeds the casual-use threshold and may trigger Notice of Intent under 43 CFR 3809 (BLM) or 36 CFR 228 (USFS). Verify the local agency threshold.",
      notes,
    };
  }

  // node_5 — quantity
  const trip = Number(quantity_this_trip_lb);
  const annual = Number(quantity_annual_running_total_lb);
  const hasTrip = Number.isFinite(trip) && trip >= 0;
  const hasAnnual = Number.isFinite(annual) && annual >= 0;

  if (land_manager === "BLM" && material_class === "petrified_wood") {
    const { dailyLb, annualLb, note } = QUANTITY_THRESHOLDS.blm_petrified_wood;
    notes.push(note);
    if ((hasTrip && trip > dailyLb) || (hasAnnual && annual > annualLb)) {
      return {
        tag: "EXCEEDS_CASUAL_THRESHOLD",
        message: `Petrified wood appears to exceed informal BLM casual caps (≈${dailyLb} lb/day, ${annualLb} lb/year). A free-use permit is typically required.`,
        notes,
      };
    }
    if (!hasTrip && !hasAnnual) {
      notes.push(`Track weight against informal caps: ≤${dailyLb} lb/day and ≤${annualLb} lb/year (state-office overrides possible).`);
    }
  } else if (land_manager === "BLM" || land_manager === "USFS") {
    notes.push(
      "No fixed federal statutory weight limit for general common-variety rock/mineral. Stay within reasonable personal/hobby use. USFS supplements vary by forest."
    );
    const soft = QUANTITY_THRESHOLDS.personal_use_soft_cap_lb;
    if (hasTrip && trip > soft * 4) {
      return {
        tag: "CONDITIONAL_REVIEW_REQUIRED",
        message:
          "Quantity suggests scale beyond typical personal/hobby use and may require a Materials Act free-use permit or sale contract. Confirm with the local office.",
        notes,
      };
    }
  }

  return {
    tag: "PERMITTED_CASUAL",
    message:
      "Under the answers provided, this outing appears within casual-use collecting policy for the selected land manager — subject to local supplemental rules. Verify on-site postings and contact the local field office if unsure.",
    notes,
  };
}
