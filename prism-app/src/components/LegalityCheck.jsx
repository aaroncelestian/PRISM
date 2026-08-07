import { useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, RotateCcw, Scale } from "lucide-react";
import {
  LEGALITY_META,
  LAND_MANAGERS,
  WITHDRAWAL_STATUSES,
  MATERIAL_CLASSES,
  EXTRACTION_METHODS,
  RESULT_META,
  evaluateLegality,
} from "../data/legalitySchema.js";

const STEPS = [
  { id: "scope", label: "Scope" },
  { id: "intent", label: "Intent" },
  { id: "land", label: "Land" },
  { id: "status", label: "Status" },
  { id: "material", label: "Material" },
  { id: "method", label: "Method" },
  { id: "quantity", label: "Quantity" },
  { id: "result", label: "Result" },
];

const EMPTY = {
  commercial_intent: null,
  land_manager: null,
  withdrawal_status: null,
  material_class: null,
  extraction_method: null,
  quantity_this_trip_lb: "",
  quantity_annual_running_total_lb: "",
};

function OptionGrid({ options, value, onChange }) {
  return (
    <div style={{ display: "grid", gap: "8px" }}>
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            style={{
              textAlign: "left",
              padding: "12px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.15s",
              background: selected ? "rgba(var(--accent-rgb), 0.08)" : "var(--bg-card)",
              border: `1px solid ${selected ? "rgba(var(--accent-rgb), 0.45)" : "var(--border)"}`,
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: selected ? 600 : 500, color: selected ? "var(--cyan)" : "var(--text)", marginBottom: "3px" }}>
              {o.label}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>{o.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

function BoolChoice({ value, onChange, yesLabel, noLabel, yesDesc, noDesc }) {
  const opts = [
    { id: true, label: yesLabel, desc: yesDesc },
    { id: false, label: noLabel, desc: noDesc },
  ];
  return (
    <div style={{ display: "grid", gap: "8px" }}>
      {opts.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={String(o.id)}
            type="button"
            onClick={() => onChange(o.id)}
            style={{
              textAlign: "left",
              padding: "12px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.15s",
              background: selected ? "rgba(var(--accent-rgb), 0.08)" : "var(--bg-card)",
              border: `1px solid ${selected ? "rgba(var(--accent-rgb), 0.45)" : "var(--border)"}`,
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: selected ? 600 : 500, color: selected ? "var(--cyan)" : "var(--text)", marginBottom: "3px" }}>
              {o.label}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>{o.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

function StepHeader({ title, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "13px", color: "var(--cyan)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "4px" }}>
        {title}
      </div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function StepBar({ step, visibleSteps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: "2px", borderBottom: "1px solid var(--border-dim)", background: "var(--bg-card)", overflowX: "auto" }}>
      {visibleSteps.map((s, i) => {
        const active = s.index === step;
        const done = s.index < step;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < visibleSteps.length - 1 ? "1 1 auto" : "0 0 auto", minWidth: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "3px 6px", borderRadius: "3px", flexShrink: 0,
              background: active ? "rgba(var(--accent-rgb), 0.1)" : "transparent",
            }}>
              <div style={{
                width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "rgba(10,122,82,0.2)" : active ? "rgba(var(--accent-rgb), 0.2)" : "transparent",
                border: `1px solid ${done ? "rgba(10,122,82,0.4)" : active ? "rgba(var(--accent-rgb), 0.45)" : "var(--border)"}`,
                fontSize: "8px", color: done ? "var(--success)" : active ? "var(--cyan)" : "var(--text-muted)",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: "9px", letterSpacing: "0.06em",
                color: active ? "var(--cyan)" : done ? "var(--success)" : "var(--text-muted)",
                fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
              }}>
                {s.label}
              </span>
            </div>
            {i < visibleSteps.length - 1 && (
              <div style={{ flex: 1, height: "1px", minWidth: "6px", background: done ? "rgba(10,122,82,0.25)" : "var(--border-dim)", margin: "0 2px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function needsWithdrawal(answers) {
  return answers.land_manager === "BLM" || answers.land_manager === "USFS";
}

function needsQuantity(answers) {
  if (answers.commercial_intent === true) return false;
  if (!["BLM", "USFS"].includes(answers.land_manager)) return false;
  if (["NPS", "USFWS", "state_trust", "private", "unknown"].includes(answers.land_manager)) return false;
  if (["wilderness", "national_monument", "wilderness_study_area", "other_withdrawal", "unknown"].includes(answers.withdrawal_status)) {
    // still show quantity only if open path — for early-exit statuses we skip to result
    if (answers.withdrawal_status !== "open") return false;
  }
  if (["vertebrate_fossil", "archaeological_cultural"].includes(answers.material_class)) return false;
  if (["explosive_blasting", "mechanized_non_explosive"].includes(answers.extraction_method)) return false;
  return true;
}

function canAdvance(stepId, answers) {
  switch (stepId) {
    case "scope": return true;
    case "intent": return answers.commercial_intent !== null;
    case "land": return !!answers.land_manager;
    case "status": return !!answers.withdrawal_status;
    case "material": return !!answers.material_class;
    case "method": return !!answers.extraction_method;
    case "quantity": return true; // optional numbers
    case "result": return true;
    default: return false;
  }
}

function buildVisibleSteps(answers) {
  const all = STEPS.map((s, index) => ({ ...s, index }));
  return all.filter((s) => {
    if (s.id === "status") return needsWithdrawal(answers);
    if (s.id === "quantity") return needsQuantity(answers);
    // After commercial / non-federal land, jump toward result by hiding middle steps once answered
    if (answers.commercial_intent === true && ["land", "status", "material", "method", "quantity"].includes(s.id)) {
      return false;
    }
    if (answers.land_manager && !["BLM", "USFS"].includes(answers.land_manager) && ["status", "material", "method", "quantity"].includes(s.id)) {
      return false;
    }
    if (answers.withdrawal_status && answers.withdrawal_status !== "open" && ["material", "method", "quantity"].includes(s.id) && needsWithdrawal(answers)) {
      return false;
    }
    if (["vertebrate_fossil", "archaeological_cultural"].includes(answers.material_class) && ["method", "quantity"].includes(s.id)) {
      return false;
    }
    if (["explosive_blasting", "mechanized_non_explosive"].includes(answers.extraction_method) && s.id === "quantity") {
      return false;
    }
    return true;
  });
}

function nextVisibleIndex(visible, currentStep) {
  const pos = visible.findIndex((s) => s.index === currentStep);
  if (pos < 0 || pos >= visible.length - 1) return currentStep;
  return visible[pos + 1].index;
}

function prevVisibleIndex(visible, currentStep) {
  const pos = visible.findIndex((s) => s.index === currentStep);
  if (pos <= 0) return currentStep;
  return visible[pos - 1].index;
}

function ScopeStep() {
  return (
    <div>
      <StepHeader title="WHAT THIS CHECKS">
        Answer a few questions about where and what you plan to collect. PRISM maps those answers to casual-use federal policy for hobby mineral collecting.
      </StepHeader>

      <div style={{ padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", marginBottom: "10px" }}>
        <div style={{ fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>In scope</div>
        <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>Casual / hobby specimen collecting</li>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>U.S. federal land managed by BLM or USFS (primary path)</li>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>Hand tools and personal-use quantities</li>
        </ul>
      </div>

      <div style={{ padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", marginBottom: "10px" }}>
        <div style={{ fontSize: "11px", color: "var(--warn)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Not covered in detail</div>
        <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>Claim staking or commercial extraction</li>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>State trust land and private mineral rights (routed out)</li>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>Per-forest or BLM state-office override tables</li>
        </ul>
      </div>

      <div style={{
        display: "flex", gap: "10px", padding: "10px 14px", borderRadius: "6px",
        background: "rgba(var(--accent-rgb), 0.06)", border: "1px solid rgba(var(--accent-rgb), 0.22)",
      }}>
        <Scale size={16} style={{ color: "var(--cyan)", flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.65 }}>
          {LEGALITY_META.disclaimer}
        </div>
      </div>
    </div>
  );
}

function ResultPanel({ result }) {
  const meta = RESULT_META[result.tag] || RESULT_META.INSUFFICIENT_DATA;
  return (
    <div>
      <StepHeader title="LEGALITY RESULT">
        Guidance only — confirm with the local land manager before collecting. Illegal collection is a provenance defect in PRISM.
      </StepHeader>

      <div style={{
        padding: "16px 18px", borderRadius: "8px", marginBottom: "14px",
        background: "var(--bg-card)",
        border: `1px solid ${meta.color}`,
      }}>
        <div style={{
          display: "inline-block", fontSize: "10px", fontFamily: "var(--mono)", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "3px",
          marginBottom: "10px",
          color: meta.color,
          background: "var(--bg-panel)",
          border: `1px solid ${meta.color}`,
        }}>
          {meta.label}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.65, marginBottom: result.authority ? "10px" : 0 }}>
          {result.message}
        </div>
        {result.authority && (
          <div style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--cyan)", letterSpacing: "0.02em" }}>
            Authority: {result.authority}
          </div>
        )}
      </div>

      {result.notes?.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Notes
          </div>
          {result.notes.map((n, i) => (
            <div key={i} style={{ padding: "10px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "5px", marginBottom: "6px", fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.55 }}>
              {n}
            </div>
          ))}
        </div>
      )}

      <div style={{
        padding: "12px 14px", borderRadius: "6px",
        background: "rgba(var(--accent-rgb), 0.06)", border: "1px solid rgba(var(--accent-rgb), 0.22)",
        marginBottom: "12px",
      }}>
        <div style={{ fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>
          Provenance impact (T1–T5)
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.65 }}>{meta.provenanceNote}</div>
      </div>

      <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.55 }}>
        Schema v{LEGALITY_META.version} · last reviewed {LEGALITY_META.lastReviewed}. Thresholds are informal guidance and may be overridden by local offices.
      </div>
    </div>
  );
}

export default function LegalityCheck({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(EMPTY);

  const visibleSteps = useMemo(() => buildVisibleSteps(answers), [answers]);
  const currentMeta = STEPS[step];

  const result = useMemo(() => {
    if (step !== STEPS.length - 1) return null;
    const trip = answers.quantity_this_trip_lb === "" ? undefined : Number(answers.quantity_this_trip_lb);
    const annual = answers.quantity_annual_running_total_lb === "" ? undefined : Number(answers.quantity_annual_running_total_lb);
    return evaluateLegality({
      ...answers,
      quantity_this_trip_lb: trip,
      quantity_annual_running_total_lb: annual,
    });
  }, [step, answers]);

  const setField = (key, value) => setAnswers((a) => ({ ...a, [key]: value }));

  const reset = () => {
    setAnswers(EMPTY);
    setStep(0);
  };

  const goNext = () => {
    if (!canAdvance(currentMeta.id, answers)) return;
    const vis = buildVisibleSteps(answers);
    setStep(nextVisibleIndex(vis, step));
  };

  const goBack = () => {
    const vis = buildVisibleSteps(answers);
    setStep(prevVisibleIndex(vis, step));
  };

  const atResult = step === STEPS.length - 1;
  const canGoNext = canAdvance(currentMeta.id, answers);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        width: "100%", maxWidth: "680px", maxHeight: "92vh",
        background: "var(--bg-panel)", border: "1px solid var(--border)",
        borderRadius: "10px", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ fontSize: "14px", fontFamily: "var(--mono)", color: "var(--cyan)", fontWeight: 700, letterSpacing: "0.1em" }}>
              COLLECTING LEGALITY
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
              {LEGALITY_META.subtitle}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <StepBar step={step} visibleSteps={visibleSteps} />

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 20px" }}>
          {currentMeta.id === "scope" && <ScopeStep />}

          {currentMeta.id === "intent" && (
            <div>
              <StepHeader title="COMMERCIAL INTENT">
                Casual-use collecting is for personal hobby specimens — not sale, barter, or commercial extraction.
              </StepHeader>
              <BoolChoice
                value={answers.commercial_intent}
                onChange={(v) => setField("commercial_intent", v)}
                yesLabel="Yes — commercial / for sale"
                yesDesc="Selling, trading as business inventory, or extracting for commercial gain"
                noLabel="No — personal / hobby use"
                noDesc="Keeping specimens for a personal collection or non-commercial study"
              />
            </div>
          )}

          {currentMeta.id === "land" && (
            <div>
              <StepHeader title="LAND MANAGER">
                Who manages the collecting site? Resolve unknown parcels with BLM MLRS or a land-status GIS layer before going further.
              </StepHeader>
              <OptionGrid
                options={LAND_MANAGERS}
                value={answers.land_manager}
                onChange={(v) => setField("land_manager", v)}
              />
            </div>
          )}

          {currentMeta.id === "status" && (
            <div>
              <StepHeader title="WITHDRAWAL STATUS">
                Mineral-entry withdrawals change independently of the land-manager label. Check current status — do not assume “BLM” means open.
              </StepHeader>
              <OptionGrid
                options={WITHDRAWAL_STATUSES}
                value={answers.withdrawal_status}
                onChange={(v) => setField("withdrawal_status", v)}
              />
            </div>
          )}

          {currentMeta.id === "material" && (
            <div>
              <StepHeader title="MATERIAL CLASS">
                Classification determines which statute applies and whether collection is categorically barred.
              </StepHeader>
              <OptionGrid
                options={MATERIAL_CLASSES}
                value={answers.material_class}
                onChange={(v) => setField("material_class", v)}
              />
            </div>
          )}

          {currentMeta.id === "method" && (
            <div>
              <StepHeader title="EXTRACTION METHOD">
                Casual use is generally limited to hand tools. Mechanized methods and blasting typically require notices or plans of operations.
              </StepHeader>
              <OptionGrid
                options={EXTRACTION_METHODS}
                value={answers.extraction_method}
                onChange={(v) => setField("extraction_method", v)}
              />
            </div>
          )}

          {currentMeta.id === "quantity" && (
            <div>
              <StepHeader title="QUANTITY">
                Optional — used for informal BLM petrified-wood caps and to flag outsized personal-use hauls. Leave blank if unknown.
              </StepHeader>
              <div style={{ display: "grid", gap: "12px" }}>
                <label style={{ display: "block" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-label)", marginBottom: "5px", letterSpacing: "0.06em" }}>
                    This trip (lb)
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={answers.quantity_this_trip_lb}
                    onChange={(e) => setField("quantity_this_trip_lb", e.target.value)}
                    placeholder="e.g. 10"
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: "5px",
                      border: "1px solid var(--border-input)", background: "var(--bg-input)",
                      color: "var(--text)", fontFamily: "var(--mono)", fontSize: "12px",
                    }}
                  />
                </label>
                <label style={{ display: "block" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-label)", marginBottom: "5px", letterSpacing: "0.06em" }}>
                    Annual running total at this jurisdiction (lb)
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={answers.quantity_annual_running_total_lb}
                    onChange={(e) => setField("quantity_annual_running_total_lb", e.target.value)}
                    placeholder="e.g. 40"
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: "5px",
                      border: "1px solid var(--border-input)", background: "var(--bg-input)",
                      color: "var(--text)", fontFamily: "var(--mono)", fontSize: "12px",
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          {currentMeta.id === "result" && result && <ResultPanel result={result} />}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-panel)", gap: "8px" }}>
          <button
            onClick={goBack}
            disabled={step === 0}
            style={{
              display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px",
              background: "transparent", border: "1px solid var(--border)", borderRadius: "5px",
              color: step === 0 ? "var(--border)" : "var(--text-muted)", fontSize: "11px",
              cursor: step === 0 ? "default" : "pointer", letterSpacing: "0.06em",
            }}
          >
            <ChevronLeft size={13} /> Back
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {atResult && (
              <button
                onClick={reset}
                style={{
                  display: "flex", alignItems: "center", gap: "5px", padding: "6px 10px",
                  background: "transparent", border: "1px solid var(--border)", borderRadius: "5px",
                  color: "var(--text-muted)", fontSize: "11px", cursor: "pointer", letterSpacing: "0.06em",
                }}
              >
                <RotateCcw size={12} /> Restart
              </button>
            )}
            <span style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
              {visibleSteps.findIndex((s) => s.index === step) + 1} / {visibleSteps.length}
            </span>
          </div>

          {!atResult ? (
            <button
              onClick={goNext}
              disabled={!canGoNext}
              style={{
                display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px",
                background: canGoNext ? "rgba(var(--accent-rgb), 0.08)" : "transparent",
                border: `1px solid ${canGoNext ? "rgba(var(--accent-rgb), 0.35)" : "var(--border)"}`,
                borderRadius: "5px",
                color: canGoNext ? "var(--cyan)" : "var(--border)",
                fontSize: "11px", cursor: canGoNext ? "pointer" : "default", letterSpacing: "0.06em",
              }}
            >
              Next <ChevronRight size={13} />
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px",
                background: "rgba(10,122,82,0.1)", border: "1px solid rgba(10,122,82,0.35)", borderRadius: "5px",
                color: "var(--success)", fontSize: "11px", cursor: "pointer", letterSpacing: "0.06em",
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
