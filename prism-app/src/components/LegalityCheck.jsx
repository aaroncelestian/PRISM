import { useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, RotateCcw, Scale } from "lucide-react";
import {
  LEGALITY_META,
  LAND_MANAGERS,
  WITHDRAWAL_STATUSES,
  MATERIAL_CLASSES,
  EXTRACTION_METHODS,
  RESULT_META,
  BLM_PERMIT_GUIDANCE,
  BLM_PERMIT_GUIDANCE_TAGS,
  evaluateLegality,
} from "../data/legalitySchema.js";

const STEPS = [
  { id: "scope", label: "About" },
  { id: "intent", label: "Purpose" },
  { id: "land", label: "Land" },
  { id: "status", label: "Restrictions" },
  { id: "material", label: "What" },
  { id: "method", label: "Tools" },
  { id: "quantity", label: "Amount" },
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

function BlmPermitGuide({ compact = false }) {
  const g = BLM_PERMIT_GUIDANCE;
  return (
    <div style={{
      padding: "12px 14px", borderRadius: "6px", marginBottom: compact ? 0 : "12px",
      background: "var(--bg-card)", border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
        {g.title}
      </div>
      <div style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.65, marginBottom: "10px" }}>
        {g.summary}
      </div>

      {!compact && (
        <>
          <div style={{ fontSize: "11px", color: "var(--text)", fontWeight: 600, marginBottom: "4px" }}>Usually no permit needed</div>
          <ul style={{ margin: "0 0 10px", padding: "0 0 0 16px" }}>
            {g.whenNoPermit.map((item) => (
              <li key={item} style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.65 }}>{item}</li>
            ))}
          </ul>
          <div style={{ fontSize: "11px", color: "var(--text)", fontWeight: 600, marginBottom: "4px" }}>When you need to ask the BLM office</div>
          <ul style={{ margin: "0 0 12px", padding: "0 0 0 16px" }}>
            {g.whenYouNeedAuthorization.map((item) => (
              <li key={item} style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.65 }}>{item}</li>
            ))}
          </ul>
        </>
      )}

      <div style={{ display: "grid", gap: "8px", marginBottom: "10px" }}>
        {g.steps.map((s) => (
          <div key={s.title} style={{ padding: "8px 10px", background: "var(--bg-panel)", borderRadius: "5px", border: "1px solid var(--border-dim)" }}>
            <div style={{ fontSize: "11px", color: "var(--text)", fontWeight: 600, marginBottom: "3px" }}>{s.title}</div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.55 }}>{s.text}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55, marginBottom: "10px" }}>
        {g.importantNote}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {g.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "11px", color: "var(--cyan)", textDecoration: "underline" }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function ScopeStep() {
  return (
    <div>
      <StepHeader title="WHAT THIS CHECKS">
        Answer a few questions about where and what you plan to collect. PRISM uses your answers to check common hobby-collecting rules on U.S. public land.
      </StepHeader>

      <div style={{
        padding: "12px 14px", borderRadius: "6px", marginBottom: "10px",
        background: "rgba(var(--accent-rgb), 0.06)", border: "1px solid rgba(var(--accent-rgb), 0.22)",
      }}>
        <div style={{ fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
          Find your local BLM office
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55, marginBottom: "8px" }}>
          Local field offices set many of the day-to-day collecting rules. Look up contact info here before you go:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <a
            href="https://www.blm.gov/locations"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "12px", color: "var(--cyan)", fontWeight: 600, textDecoration: "underline" }}
          >
            blm.gov/locations — all BLM offices
          </a>
          <a
            href="https://www.blm.gov/california"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "12px", color: "var(--cyan)", fontWeight: 600, textDecoration: "underline" }}
          >
            blm.gov/california — California
          </a>
        </div>
      </div>

      <div style={{ padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", marginBottom: "10px" }}>
        <div style={{ fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Covered</div>
        <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>Hobby collecting for your own collection</li>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>U.S. public land managed by BLM or the Forest Service</li>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>Hand tools and personal amounts</li>
        </ul>
      </div>

      <div style={{ padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", marginBottom: "10px" }}>
        <div style={{ fontSize: "11px", color: "var(--warn)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Not covered in detail</div>
        <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>Mining claims or digging to sell</li>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>State land and private property (you'll be pointed elsewhere)</li>
          <li style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>Special local rules for each forest or BLM office</li>
        </ul>
      </div>

      <BlmPermitGuide />

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
      <StepHeader title="YOUR RESULT">
        This is guidance only — confirm with the{" "}
        <a href="https://www.blm.gov/locations" target="_blank" rel="noopener noreferrer" style={{ color: "var(--cyan)" }}>
          local BLM field office
        </a>
        {" "}before collecting. Specimens collected illegally score poorly for provenance in PRISM.
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
            Rule: {result.authority}
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
          How this affects provenance score
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.65 }}>{meta.provenanceNote}</div>
      </div>

      {BLM_PERMIT_GUIDANCE_TAGS.has(result.tag) && <BlmPermitGuide />}

      <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.55 }}>
        Tool v{LEGALITY_META.version} · last reviewed {LEGALITY_META.lastReviewed}. Weight limits here are informal guidance — local offices can set different rules.
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
              <StepHeader title="WHY ARE YOU COLLECTING?">
                Hobby collecting means keeping specimens for yourself — not selling them or digging as a business.
              </StepHeader>
              <BoolChoice
                value={answers.commercial_intent}
                onChange={(v) => setField("commercial_intent", v)}
                yesLabel="Yes — for sale or business"
                yesDesc="Selling, stocking a shop, or digging for profit"
                noLabel="No — personal hobby"
                noDesc="Keeping specimens for your own collection or personal study"
              />
            </div>
          )}

          {currentMeta.id === "land" && (
            <div>
              <StepHeader title="WHO MANAGES THE LAND?">
                If you're not sure, look it up on a public land map (for example BLM's online maps) before going further.
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
              <StepHeader title="ANY SPECIAL RESTRICTIONS?">
                Some BLM and Forest Service areas ban collecting even though they're still public land. Don't assume “BLM” means open — check for wilderness, monuments, and similar.
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
              <StepHeader title="WHAT ARE YOU COLLECTING?">
                Different materials have different rules. Some — like vertebrate fossils and artifacts — are never OK for hobby collecting.
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
              <StepHeader title="HOW WILL YOU COLLECT?">
                Hobby collecting is usually limited to hand tools. Power equipment and blasting typically need agency approval.
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
              <StepHeader title="HOW MUCH?">
                Optional — helps flag large hauls and common BLM petrified-wood limits. Leave blank if you don't know.
              </StepHeader>
              <div style={{ display: "grid", gap: "12px" }}>
                <label style={{ display: "block" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-label)", marginBottom: "5px", letterSpacing: "0.06em" }}>
                    This trip (pounds)
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
                    Total this year from this area (pounds)
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
