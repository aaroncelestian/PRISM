/**
 * PRISM Specimen Collecting Legality Check
 * Scope: Casual/hobbyist mineral specimen collecting on U.S. federal land.
 * Does NOT cover claim staking, commercial extraction, or state/private land detail.
 * last_reviewed: 2026-08-06
 */

export const LEGALITY_META = {
  title: "Collecting Legality",
  subtitle: "Quick check for hobby collecting on U.S. public land",
  version: "1.0",
  lastReviewed: "2026-08-06",
  scope:
    "Hobby rock and mineral collecting on U.S. federal land. Does not cover mining claims, commercial digging, or detailed state/private-land rules.",
  disclaimer:
    "This tool summarizes common agency rules for hobby collecting. It is not legal advice. There is no single nationwide weight limit for ordinary rock collecting — local BLM offices and national forests often have their own rules. Always check with the local land office before you collect.",
};

export const LAND_MANAGERS = [
  { id: "BLM", label: "BLM", desc: "Bureau of Land Management — most open public land" },
  { id: "USFS", label: "USFS", desc: "U.S. Forest Service — National Forests" },
  { id: "NPS", label: "NPS", desc: "National Parks and National Park Service sites" },
  { id: "USFWS", label: "USFWS", desc: "National Wildlife Refuges" },
  { id: "state_trust", label: "State / trust land", desc: "State parks, state forests, or school-trust lands" },
  { id: "private", label: "Private land", desc: "Land owned by a person or company" },
  { id: "unknown", label: "Unknown", desc: "Not sure who manages this land yet" },
];

export const WITHDRAWAL_STATUSES = [
  { id: "open", label: "Open for hobby collecting", desc: "No special ban on casual collecting that you know of" },
  { id: "national_monument", label: "National monument", desc: "Often has extra restrictions — check before collecting" },
  { id: "wilderness", label: "Designated wilderness", desc: "Protected wilderness area — collecting usually banned" },
  { id: "wilderness_study_area", label: "Wilderness study area", desc: "Being studied for wilderness protection — usually restricted" },
  { id: "other_withdrawal", label: "Other special area", desc: "e.g. conservation area, military land, or power-site reserve" },
  { id: "unknown", label: "Unknown / not checked", desc: "Look up the parcel before you collect" },
];

export const MATERIAL_CLASSES = [
  { id: "common_variety_mineral_rock", label: "Common rock / mineral", desc: "Ordinary hobby specimens" },
  { id: "petrified_wood", label: "Petrified wood", desc: "Often has informal daily and yearly weight limits on BLM land" },
  { id: "gemstone_locatable_grade", label: "Gem-quality / high-value", desc: "Material valuable enough that mining rules may apply" },
  { id: "invertebrate_fossil_plant_fossil", label: "Invertebrate / plant fossil", desc: "Shells, leaves, and similar fossils — usually OK in small amounts" },
  { id: "vertebrate_fossil", label: "Vertebrate fossil", desc: "Bones, teeth, or tracks from animals with backbones" },
  { id: "archaeological_cultural", label: "Artifacts / cultural items", desc: "Arrowheads, pottery, ruins — not rock collecting" },
];

export const EXTRACTION_METHODS = [
  { id: "hand_tools", label: "Hand tools only", desc: "Hammer, chisel, hand shovel, rock pick" },
  { id: "mechanized_non_explosive", label: "Power equipment", desc: "Rock saws, drills, or machine digging" },
  { id: "explosive_blasting", label: "Explosives / blasting", desc: "Any use of explosives" },
];

/** Editable informal quantity thresholds (not statutory hard caps). */
export const QUANTITY_THRESHOLDS = {
  blm_petrified_wood: {
    dailyLb: 25,
    annualLb: 250,
    note: "Common BLM guidance: about 25 lb per day (+ one piece) and 250 lb per year. Local offices can set different limits.",
  },
  personal_use_soft_cap_lb: 25,
};

/**
 * Plain-English guidance for BLM hobby collecting authorization.
 * Most personal rockhounding needs no permit; this covers when it does.
 */
export const BLM_PERMIT_GUIDANCE = {
  title: "How BLM collecting authorization works",
  summary:
    "For ordinary hobby collecting on open BLM land, you usually do not need a permit — stay within personal-use amounts, use hand tools, and do not sell what you collect. A permit or contract is only needed when you go beyond those hobby rules.",
  whenNoPermit: [
    "Common rocks and minerals for personal use, with hand tools and only minor ground disturbance",
    "Petrified wood: up to about 25 lb + one piece per day, and 250 lb per year (unless the local office sets different limits)",
    "Common invertebrate or plant fossils in a reasonable personal amount (often described as about 25 lb/day)",
  ],
  whenYouNeedAuthorization: [
    "You want more material than hobby limits allow",
    "You plan to sell or commercially dig",
    "You need power equipment or blasting",
    "You want a museum-size petrified-wood specimen over 250 lb",
    "You want vertebrate fossils (bones, teeth, tracks) — research permit only; not hobby collecting",
  ],
  steps: [
    {
      title: "1. Confirm the land is open BLM",
      text: "Use BLM’s public land maps (or ask the field office) to confirm the parcel is BLM-managed and not wilderness, a monument with collecting bans, a recreation site, or an active mining claim.",
    },
    {
      title: "2. Call the local BLM field office before you dig",
      text: "Find your state and field office at blm.gov/locations (official BLM office directory). Ask what is allowed there, local quantity limits, closed areas, and whether you need a sale contract or other paperwork.",
    },
    {
      title: "3. Ask which authorization fits your plan",
      text: "Hobby amounts: often none. Larger personal or commercial mineral materials: usually a mineral-materials sale contract. Museum-display petrified wood over 250 lb: special free-use process with a public-display certification. Vertebrate fossils: paleontology research permit (specimens stay public property).",
    },
    {
      title: "4. Apply through that field office",
      text: "There is no nationwide “self-collecting permit” website for individual rockhounds. The local office tells you the form (if any), fees, maps, and conditions. Do not remove material until authorization is in hand when one is required.",
    },
    {
      title: "5. Keep your paperwork with the specimens",
      text: "Save the permit/contract, dates, locality, and land-office contact. That paper trail supports legal collection and stronger provenance scoring in PRISM.",
    },
  ],
  links: [
    { label: "Find a BLM field office", href: "https://www.blm.gov/locations" },
    { label: "BLM California offices", href: "https://www.blm.gov/california" },
    { label: "BLM — Can I keep this?", href: "https://www.blm.gov/Learn/Can-I-Keep-This" },
    { label: "BLM — Collecting fossils", href: "https://www.blm.gov/programs/paleontology/collecting-fossils" },
  ],
  importantNote:
    "“Free-use permits” for mineral materials (Form 3604) are mainly for government agencies and nonprofits — not a general hobbyist self-collecting permit. Individual collectors who need more than casual amounts usually buy material under a sale contract from the local BLM office.",
};

/** Result tags that should show BLM permit how-to guidance. */
export const BLM_PERMIT_GUIDANCE_TAGS = new Set([
  "EXCEEDS_CASUAL_THRESHOLD",
  "PROHIBITED_CASUAL_PERMIT_REQUIRED",
  "CONDITIONAL_REVIEW_REQUIRED",
  "PERMITTED_CASUAL",
]);

export const RESULT_META = {
  PERMITTED_CASUAL: {
    label: "Looks OK for hobby collecting",
    color: "var(--success)",
    tone: "success",
    provenanceNote: "Write down where and when you collected, and keep any permits or permissions. That helps support a stronger provenance score.",
  },
  CONDITIONAL_REVIEW_REQUIRED: {
    label: "Check with the local office first",
    color: "var(--warn)",
    tone: "warn",
    provenanceNote: "Don't assume this is allowed. Call the local land office before collecting or giving the specimen a high provenance score.",
  },
  PROHIBITED: {
    label: "Not allowed",
    color: "var(--danger)",
    tone: "danger",
    provenanceNote: "Illegal collecting hurts provenance. PRISM should not score these specimens above T4/T5, no matter how nice they look.",
  },
  PROHIBITED_CASUAL_PERMIT_REQUIRED: {
    label: "Needs a permit — not hobby collecting",
    color: "var(--danger)",
    tone: "danger",
    provenanceNote: "Without a valid permit, treat this as a provenance problem (cap at T4/T5).",
  },
  OUT_OF_SCOPE_ROUTE_ELSEWHERE: {
    label: "Outside this tool's scope",
    color: "var(--cyan)",
    tone: "info",
    provenanceNote: "This hobby-collecting check doesn't cover your situation. Use the right rules for state land, private land, or commercial work.",
  },
  INSUFFICIENT_DATA: {
    label: "Need more information",
    color: "var(--text-muted)",
    tone: "muted",
    provenanceNote: "Figure out who manages the land before collecting. Until then, treat provenance claims carefully (default T4/T5).",
  },
  EXCEEDS_CASUAL_THRESHOLD: {
    label: "Too much for casual hobby collecting",
    color: "var(--warn)",
    tone: "warn",
    provenanceNote: "You may need written authorization from the local BLM office (often a mineral-materials sale contract). Get that before scoring provenance highly.",
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
        "This tool is only for personal hobby collecting. Selling or commercial digging needs different rules (mining claims or sale permits).",
      notes,
    };
  }

  // node_1 — land manager
  if (land_manager === "NPS") {
    return {
      tag: "PROHIBITED",
      authority: "36 CFR 2.1",
      message:
        "Collecting rocks, minerals, or fossils is not allowed in National Parks unless you have a research permit. There is no hobby exception.",
      notes,
    };
  }
  if (land_manager === "USFWS") {
    return {
      tag: "PROHIBITED",
      authority: "50 CFR 27.51",
      message:
        "Collecting is usually not allowed on National Wildlife Refuges. Check with that specific refuge before going.",
      notes,
    };
  }
  if (land_manager === "state_trust") {
    return {
      tag: "OUT_OF_SCOPE_ROUTE_ELSEWHERE",
      message:
        "Federal hobby-collecting rules don't apply here. Check your state's laws and the agency that manages the land.",
      notes,
    };
  }
  if (land_manager === "private") {
    return {
      tag: "OUT_OF_SCOPE_ROUTE_ELSEWHERE",
      message:
        "Federal public-land rules don't apply. You need the landowner's permission, and you should confirm who owns the mineral rights.",
      notes,
    };
  }
  if (land_manager === "unknown" || !land_manager) {
    return {
      tag: "INSUFFICIENT_DATA",
      message:
        "Figure out who manages the land first (for example with BLM's online map tools or a land-status map). We can't assess legality without that.",
      notes,
    };
  }

  // node_2 — withdrawal (BLM / USFS)
  if (withdrawal_status === "wilderness") {
    return {
      tag: "PROHIBITED",
      authority: "Wilderness Act of 1964, 16 U.S.C. § 1133(c)",
      message:
        "Collecting is generally not allowed in designated wilderness. Power tools and vehicles for collecting are also banned.",
      notes,
    };
  }
  if (withdrawal_status === "national_monument") {
    return {
      tag: "CONDITIONAL_REVIEW_REQUIRED",
      message:
        "Many national monuments ban or limit rock collecting. Rules differ by monument — check that monument's proclamation and management plan before you go.",
      notes,
    };
  }
  if (withdrawal_status === "wilderness_study_area") {
    return {
      tag: "CONDITIONAL_REVIEW_REQUIRED",
      message:
        "Wilderness study areas are managed to stay wild until Congress decides. Hobby collecting is usually not allowed — confirm with the local BLM office.",
      notes,
    };
  }
  if (withdrawal_status === "other_withdrawal") {
    return {
      tag: "INSUFFICIENT_DATA",
      message:
        "This is a special restricted area. Rules vary — look up the specific restriction (conservation area, military land, etc.) before collecting.",
      notes,
    };
  }
  if (withdrawal_status === "unknown" || !withdrawal_status) {
    return {
      tag: "INSUFFICIENT_DATA",
      message:
        "Check whether this parcel has special restrictions before you collect. Status can change even when the land is still labeled BLM or Forest Service.",
      notes,
    };
  }

  // node_3 — material class
  if (material_class === "vertebrate_fossil") {
    return {
      tag: "PROHIBITED_CASUAL_PERMIT_REQUIRED",
      authority: "Paleontological Resources Preservation Act, 16 U.S.C. § 470aaa",
      message:
        "Bones, teeth, and other vertebrate fossils cannot be collected as a hobby on federal land. You need a permit — amount doesn't matter.",
      notes,
    };
  }
  if (material_class === "archaeological_cultural") {
    return {
      tag: "PROHIBITED",
      authority: "Archaeological Resources Protection Act, 16 U.S.C. § 470aa et seq.",
      message:
        "Artifacts and cultural materials are protected by law and are outside rock-and-mineral collecting. Do not collect them.",
      notes,
    };
  }
  if (material_class === "gemstone_locatable_grade") {
    notes.push(
      "If the material is valuable enough to sell in quantity, it may fall under mining rules instead of hobby collecting. Get a second opinion if you're taking a lot or high-value pieces."
    );
  }
  if (material_class === "invertebrate_fossil_plant_fossil") {
    notes.push("Shells, leaves, and similar fossils are often allowed for hobby collecting in small amounts.");
  }

  // node_4 — extraction method
  if (extraction_method === "explosive_blasting") {
    return {
      tag: "PROHIBITED_CASUAL_PERMIT_REQUIRED",
      message:
        "Blasting always needs formal agency approval — it is never hobby collecting.",
      notes,
    };
  }
  if (extraction_method === "mechanized_non_explosive") {
    return {
      tag: "CONDITIONAL_REVIEW_REQUIRED",
      message:
        "Power tools (rock saws, machine digging, and similar) usually go beyond hobby collecting and may require filing paperwork with BLM or the Forest Service. Ask the local office what they allow.",
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
        message: `This amount of petrified wood looks above common BLM hobby limits (about ${dailyLb} lb + one piece per day, ${annualLb} lb per year). Contact the local BLM office — you may need a sale contract, or a special museum free-use authorization for a single piece over 250 lb.`,
        notes,
      };
    }
    if (!hasTrip && !hasAnnual) {
      notes.push(`Keep track of weight: commonly ≤${dailyLb} lb + one piece/day and ≤${annualLb} lb/year. Local offices may set different limits.`);
    }
  } else if (land_manager === "BLM" || land_manager === "USFS") {
    notes.push(
      "There is no single federal weight limit for ordinary rock and mineral hobby collecting. Stay within a reasonable personal amount. National forests often have their own local rules."
    );
    const soft = QUANTITY_THRESHOLDS.personal_use_soft_cap_lb;
    if (hasTrip && trip > soft * 4) {
      return {
        tag: "CONDITIONAL_REVIEW_REQUIRED",
        message:
          "This quantity looks larger than typical personal hobby collecting. Ask the local land office whether you need a mineral-materials sale contract or other written authorization.",
        notes,
      };
    }
  }

  return {
    tag: "PERMITTED_CASUAL",
    message:
      "Based on your answers, this looks like normal hobby collecting for this land manager — but local offices can add their own rules. Check posted signs and call the field office if you're unsure.",
    notes,
  };
}
