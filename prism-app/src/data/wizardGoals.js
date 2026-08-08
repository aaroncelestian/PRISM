import { WEIGHTS, DIMS, THRESHOLD, CONTEXTS } from "./prism.js";

/**
 * Guided-tour goals: hope-oriented labels mapped to PRISM scoring contexts.
 * topDims are derived from WEIGHTS so they stay aligned with the scoring model.
 */

const DIM_BY_KEY = Object.fromEntries(DIMS.map((d) => [d.key, d]));

export function weightPct(ctx, dimKey) {
  const w = WEIGHTS[ctx]?.[dimKey] ?? 0;
  return Math.round(w * 100);
}

export function getTopDims(ctx, n = 3) {
  const W = WEIGHTS[ctx] || {};
  return Object.entries(W)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, w]) => ({
      key,
      weight: w,
      pct: Math.round(w * 100),
      label: DIM_BY_KEY[key]?.label || key,
      short: DIM_BY_KEY[key]?.short || key,
      icon: DIM_BY_KEY[key]?.icon || "",
    }));
}

/** True if this dimension is among the top weighted for the goal (high coaching impact). */
export function isHighImpactDim(ctx, dimKey, topN = 3) {
  return getTopDims(ctx, topN).some((d) => d.key === dimKey);
}

/**
 * Among the goal's highest-weighted dims, return the weakest scored ones
 * as levers to improve toward the context threshold.
 */
export function getCoachingLevers(scores, ctx, topN = 3) {
  return getTopDims(ctx, topN)
    .map((d) => ({ ...d, score: scores[d.key] ?? 0 }))
    .sort((a, b) => a.score - b.score);
}

export function contextPasses(scores, ctx) {
  const W = WEIGHTS[ctx];
  if (!W) return false;
  const score = Math.round(
    Object.entries(W).reduce((a, [k, w]) => a + (scores[k] ?? 0) * w, 0)
  );
  return { score, passes: score >= THRESHOLD };
}

export const WIZARD_GOALS = [
  {
    key: "collector",
    hope: "Personal collection piece",
    pitch: "A strong specimen for your own cabinet — rarity and quality matter most.",
    tips: [
      "Prioritize locality prestige and crystal quality — together they carry nearly half the weight.",
      "Species and variety rarity also move the needle; common minerals need exceptional form or locality.",
      "Provenance helps but is secondary for a personal piece.",
    ],
  },
  {
    key: "exhibition",
    hope: "Display / show specimen",
    pitch: "Something that stops people at a showcase, gem show, or exhibition case.",
    tips: [
      "Crystal perfection is the dominant driver (~41%). Sharp faces and complete terminations win.",
      "Aesthetics (~29%) — color, form, presentation, and luster — are nearly as important.",
      "A famous locality adds show-floor prestige; paperwork matters less here than visual impact.",
    ],
  },
  {
    key: "museum",
    hope: "Museum donation / institutional quality",
    pitch: "Evaluating against museum accession standards — documentation over beauty.",
    tips: [
      "Locality rarity and a verified provenance chain dominate museum scoring.",
      "Keep a paper trail: legal collection, labels, and chain of custody. Illegal finds cap provenance low.",
      "Scientific significance helps asymmetrically; aesthetics barely move the museum score (~4%). A true showstopper can still interest a display curator — score the Display / show specimen goal too — but legality and a paper trail stay non-negotiable. Beauty is not an exception to provenance. Use Donate to Museum when ready.",
    ],
  },
  {
    key: "cultural",
    hope: "Cultural or historical significance",
    pitch: "Value from history, named collections, or heritage — not just mineralogy.",
    tips: [
      "Cultural / Historical checklist (~34% weight) is the main lever — media/exhibition, named collections, and documented specimen narratives score highest.",
      "Provenance (~22%) still matters; closed-mine cultural memory and verified human use of the mineral (not artifacts) add further points.",
      "Beauty alone will not carry this context — heritage must be documented.",
    ],
  },
  {
    key: "study",
    hope: "Research / scientific study",
    pitch: "A reference or research specimen where documentation and science outweigh looks.",
    tips: [
      "Scientific Value (~40%) dominates — type locality and literature are the heaviest checks; morphology/twinning and associations also count.",
      "Provenance (~26%) must support research use; undocumented material scores poorly.",
      "A visually plain but well-documented piece can outscore a beautiful undocumented one.",
    ],
  },
  {
    key: "systematic",
    hope: "Systematic or type reference",
    pitch: "Holotype, paratype, or systematic series material for completeness and research.",
    tips: [
      "Scientific significance and provenance together are nearly two thirds of this score.",
      "Locality matters when it is a type locality or well-documented reference source.",
      "Crystal quality and aesthetics are secondary — documentation is the specimen.",
    ],
  },
  {
    key: "commercial",
    hope: "Teaching / educational use",
    pitch: "A clear classroom or outreach example that engages students and illustrates concepts.",
    tips: [
      "Aesthetics and crystal quality keep attention — students need a clear visual example.",
      "Species character and scientific relevance reward specimens that teach a concept well.",
      "Provenance matters less than practical educational value for this goal.",
    ],
  },
];

export function getWizardGoal(ctx) {
  return WIZARD_GOALS.find((g) => g.key === ctx) || WIZARD_GOALS.find((g) => g.key === "collector");
}

/**
 * Soft “display curator exception” signal for museum-goal tours.
 * High visual impact with non-catastrophic provenance — does not boost museum score.
 */
export function getDisplayCuratorNote(scores, ctx) {
  if (ctx !== "museum") return null;
  const crystal = scores.crystal ?? 0;
  const aesthetics = scores.aesthetics ?? 0;
  const provenance = scores.provenance ?? 0;
  if (crystal < 85 || aesthetics < 85) return null;
  if (provenance < 40) {
    return {
      tone: "caution",
      text: "This piece looks visually exceptional, but weak provenance still blocks institutional interest. Beauty does not waive a paper trail or legal origin — score Display / show separately if you want the showstopper case documented.",
    };
  }
  return {
    tone: "info",
    text: "Possible display-curator interest: crystal and aesthetics are exceptional. That does not raise the museum score — pair with the Display / show specimen goal. Legality and documentation remain required for accession.",
  };
}

export function getContextMeta(ctx) {
  return CONTEXTS.find((c) => c.key === ctx);
}

/** Human-readable weight summary, e.g. "Locality 24% · Crystal 22% · Species 13%" */
export function formatTopWeights(ctx, n = 3) {
  return getTopDims(ctx, n)
    .map((d) => `${d.short} ${d.pct}%`)
    .join(" · ");
}
