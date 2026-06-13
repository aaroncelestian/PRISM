import { APP_VERSION, COLLECTION_SCHEMA, COMPS_SCHEMA } from "../version.js";

// ── Research comp migrations ───────────────────────────────────────────────
//
// migrateComp normalises any comp record to the current schema.
// Add new fields here with safe defaults when COMPS_SCHEMA is bumped.

export function migrateComp(raw) {
  if (!raw || typeof raw !== "object") return null;
  const result = {
    id:          raw.id          || `comp-imported-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    addedAt:     raw.addedAt     || new Date().toISOString(),
    species:     raw.species     || "",
    locality:    raw.locality    || "",
    sizeClass:   raw.sizeClass   || "miniature",
    condition:   raw.condition   || "excellent",
    askingPrice: raw.askingPrice ?? 0,
    source:      raw.source      || "",
    notes:       raw.notes       || "",
    photo:       raw.photo       || null,
    soldPrice:   raw.soldPrice   ?? null,
    sourceUrl:   raw.sourceUrl   || "",
    scores:      raw.scores      || null,
    grade:       raw.grade       || null,
    gradeEmoji:  raw.gradeEmoji  || null,
    prismScore:  raw.prismScore  ?? null,
    ctx:         raw.ctx         || null,
    _sv: COMPS_SCHEMA,
  };
  // v1 → v2 example (uncomment and extend when bumping schema):
  // if ((raw._sv ?? 0) < 2) { result.newField = raw.newField ?? defaultValue; }
  return result;
}

// ── Collection record migrations ───────────────────────────────────────────

export function migrateCollectionRecord(raw) {
  if (!raw || typeof raw !== "object") return null;
  const result = {
    id:             raw.id             || `rec-imported-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    savedAt:        raw.savedAt        || new Date().toISOString(),
    spec:           raw.spec           || {},
    scores:         raw.scores         || {},
    ctx:            raw.ctx            || "collector",
    grade:          raw.grade          || null,
    gradeEmoji:     raw.gradeEmoji     || null,
    prismScore:     raw.prismScore     ?? null,
    compoundGrades: raw.compoundGrades || [],
    _sv: COLLECTION_SCHEMA,
  };
  // v1 → v2 example:
  // if ((raw._sv ?? 0) < 2) { result.newField = raw.newField ?? defaultValue; }
  return result;
}

// ── File format helpers ────────────────────────────────────────────────────

/**
 * Wraps a data array in a versioned envelope for saving to a file.
 * @param {Array}  data   - The array of records to save.
 * @param {string} type   - "prism-research" | "prism-collection"
 * @param {number} schema - Current schema version constant.
 */
export function wrapForSave(data, type, schema) {
  return {
    _prism:      type,
    _appVersion: APP_VERSION,
    _schema:     schema,
    _savedAt:    new Date().toISOString(),
    _count:      data.length,
    data,
  };
}

/**
 * Validates and unwraps a parsed JSON file.
 * Supports both the old plain-array format and the current versioned envelope.
 *
 * Returns: { data, schema, appVersion, warning } on success
 *          { data: null, error }                  on failure
 */
export function unwrapFromFile(parsed, expectedType, currentSchema) {
  const typeLabels = { "prism-research": "Research", "prism-collection": "Collection" };

  // Legacy: plain array saved before versioning was added
  if (Array.isArray(parsed)) {
    return { data: parsed, schema: 0, appVersion: null, warning: null };
  }

  if (!parsed._prism || !Array.isArray(parsed.data)) {
    return { data: null, error: "This doesn't appear to be a valid PRISM file." };
  }

  if (parsed._prism !== expectedType) {
    const got  = typeLabels[parsed._prism]  || parsed._prism;
    const want = typeLabels[expectedType]   || expectedType;
    return { data: null, error: `This is a PRISM ${got} file — you need a ${want} file here.` };
  }

  let warning = null;
  if ((parsed._schema || 1) > currentSchema) {
    warning = `This file was saved with a newer version of PRISM (schema v${parsed._schema}, app v${parsed._appVersion || "?"}). Some entries may not display correctly.`;
  }

  return {
    data:       parsed.data,
    schema:     parsed._schema     || 0,
    appVersion: parsed._appVersion || null,
    warning,
  };
}
