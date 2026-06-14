import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, HelpCircle, X } from "lucide-react";
import { DIMS, CONTEXTS, WEIGHTS, GRADES } from "../data/prism.js";
import { useBreakpoint } from "../hooks/useWindowSize.js";
import ScorePanel from "./ScorePanel.jsx";
import TierSelector from "./TierSelector.jsx";
import CriteriaChecklist from "./CriteriaChecklist.jsx";

const TOTAL_STEPS = 2 + DIMS.length + 1; // intro (context + specimen) + 6 dims + done

function Tooltip({ text, onClose }) {
  return (
    <div style={{
      position: "absolute", zIndex: 50,
      top: "calc(100% + 8px)", left: 0, right: 0,
      background: "#0f1a2e",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      padding: "12px 14px",
      fontSize: "12px",
      color: "var(--text-dim)",
      lineHeight: 1.6,
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    }}>
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 8, right: 8,
          background: "none", border: "none", color: "var(--text-muted)",
          padding: "2px",
        }}
      >
        <X size={13} />
      </button>
      {text}
    </div>
  );
}

function AnchorButton({ anchor, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 14px",
        background: selected ? "rgba(0,212,255,0.08)" : "var(--bg-card)",
        border: `1px solid ${selected ? "rgba(0,212,255,0.45)" : "var(--border)"}`,
        borderRadius: "6px",
        color: selected ? "var(--cyan)" : "var(--text-dim)",
        textAlign: "left",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
      }}
    >
      <div>
        <div style={{ fontSize: "13px", fontWeight: selected ? 600 : 400, marginBottom: "2px" }}>
          {anchor.label}
        </div>
        <div style={{ fontSize: "11px", color: selected ? "rgba(0,212,255,0.6)" : "var(--text-muted)", lineHeight: 1.4 }}>
          {anchor.hint}
        </div>
      </div>
      <div style={{
        fontFamily: "var(--mono)", fontSize: "18px", fontWeight: 600,
        color: selected ? "var(--cyan)" : "var(--text-muted)",
        flexShrink: 0,
        opacity: selected ? 1 : 0.35,
      }}>
        {anchor.value}
      </div>
    </button>
  );
}

function ContextCard({ ctx, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "14px 16px",
        background: selected ? "rgba(0,212,255,0.07)" : "var(--bg-card)",
        border: `1px solid ${selected ? "rgba(0,212,255,0.4)" : "var(--border)"}`,
        borderRadius: "7px",
        color: selected ? "var(--cyan)" : "var(--text-dim)",
        textAlign: "left",
        transition: "all 0.15s",
        cursor: "pointer",
        width: "100%",
      }}
    >
      <div style={{ fontSize: "20px", marginBottom: "6px" }}>{ctx.icon}</div>
      <div style={{ fontSize: "13px", fontWeight: selected ? 600 : 500, marginBottom: "4px" }}>
        {ctx.label}
      </div>
      <div style={{ fontSize: "11px", lineHeight: 1.5, color: selected ? "rgba(0,212,255,0.65)" : "var(--text-muted)" }}>
        {ctx.desc}
      </div>
    </button>
  );
}

export default function WizardMode({ scores, setScores, ctx, setCtx, spec, setSpec, sciCriteria, onSciCriteriaChange, onReset, onExport, initialStep = 0, scoringComp = null, onSaveToComp = null, onSaveToCollection = null }) {
  const [step, setStep] = useState(initialStep);
  const [showTip, setShowTip] = useState(null);
  const [saveFlash, setSaveFlash] = useState(false);

  // step 0 = choose context
  // step 1 = specimen info
  // steps 2..7 = DIMS[0..5]
  const dimIndex = step - 2;
  const currentDim = dimIndex >= 0 ? DIMS[dimIndex] : null;
  const progress = Math.round((step / (TOTAL_STEPS - 1)) * 100);

  const canAdvance = () => {
    if (step === 0) return true; // context always selected
    if (step === 1) return spec.name.trim().length > 0 || spec.species.trim().length > 0;
    return true;
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
  };
  const back = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const pickAnchor = (dimKey, value) => {
    setScores(s => ({ ...s, [dimKey]: value }));
  };

  const isLastStep = step === TOTAL_STEPS - 1;
  const { isMobile } = useBreakpoint();
  const [showScorePanel, setShowScorePanel] = useState(false);
  const quickScore = useMemo(() => {
    const W = WEIGHTS[ctx];
    return Math.round(Object.entries(W).reduce((a, [k, w]) => a + (scores[k] ?? 50) * w, 0));
  }, [scores, ctx]);
  const quickGrade = GRADES.find(g => quickScore >= g.min) || GRADES[GRADES.length - 1];

  return (
    <div style={{
      display: isMobile ? "flex" : "grid",
      flexDirection: isMobile ? "column" : undefined,
      gridTemplateColumns: isMobile ? undefined : "1fr 380px",
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
    }}>

      {/* ── Left: wizard content ── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: isMobile ? 1 : undefined,
        minHeight: 0,
        borderRight: isMobile ? "none" : "1px solid var(--border)",
        overflow: "hidden",
      }}>

        {/* Progress bar */}
        <div style={{ height: "3px", background: "var(--border-dim)", flexShrink: 0 }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "var(--cyan)",
            transition: "width 0.35s ease",
            borderRadius: "0 2px 2px 0",
          }} />
        </div>

        {/* Scoring comp banner */}
        {scoringComp && (
          <div style={{
            padding: "8px 22px", flexShrink: 0,
            background: "rgba(0,212,255,0.05)",
            borderBottom: "1px solid rgba(0,212,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(0,212,255,0.8)" }}>
              🔬 Scoring comp: <strong>{scoringComp.species}</strong>
              {scoringComp.locality && <span style={{ color: "var(--text-muted)" }}> — {scoringComp.locality}</span>}
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Save when done ↓</div>
          </div>
        )}

        {/* Step counter + context badge */}
        <div style={{
          padding: "10px 22px",
          borderBottom: "1px solid var(--border-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Step {step + 1} of {TOTAL_STEPS}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {step > 0 && (() => { const c = CONTEXTS.find(c => c.key === ctx); return c ? (
              <button
                onClick={() => setStep(0)}
                title="Change evaluation context"
                style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "3px", padding: "2px 8px", cursor: "pointer", fontSize: "10px", color: "rgba(0,212,255,0.65)", letterSpacing: "0.06em" }}
              >
                {c.icon} {c.label}
              </button>
            ) : null; })()}
            {currentDim && (
              <span style={{ fontSize: "10px", color: "rgba(0,212,255,0.5)", letterSpacing: "0.08em" }}>
                {currentDim.icon} {currentDim.label}
              </span>
            )}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px 20px" }}>

          {/* Step 0: Choose context */}
          {step === 0 && (
            <div>
              <h2 style={{
                fontFamily: "var(--sans)", fontSize: "22px", fontWeight: 600,
                color: "var(--text)", marginBottom: "6px",
              }}>
                Why are you evaluating this specimen?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "22px" }}>
                PRISM weighs the same six qualities differently depending on your goal.
                Choose the context that best fits your purpose.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {CONTEXTS.map(c => (
                  <ContextCard
                    key={c.key}
                    ctx={c}
                    selected={ctx === c.key}
                    onClick={() => setCtx(c.key)}
                  />
                ))}
              </div>
              {ctx && (
                <div style={{
                  marginTop: "16px", padding: "12px 14px",
                  background: "var(--bg-card)", borderRadius: "5px",
                  border: "1px solid var(--border)",
                  fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.5,
                }}>
                  💡 {CONTEXTS.find(c => c.key === ctx)?.detail}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Specimen info */}
          {step === 1 && (
            <div>
              <h2 style={{
                fontFamily: "var(--sans)", fontSize: "22px", fontWeight: 600,
                color: "var(--text)", marginBottom: "6px",
              }}>
                Tell us about the specimen
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "22px" }}>
                Even a rough description helps. You can fill in more detail later.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { k: "name",     label: "Name or catalog number",  ph: 'e.g. "Amethyst geode — lot 42"' },
                  { k: "species",  label: "Mineral species",          ph: 'e.g. "Amethyst (Quartz var.)"' },
                  { k: "locality", label: "Where was it found?",      ph: 'e.g. "Vera Cruz, Veracruz, Mexico"' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{
                      display: "block", fontSize: "11px", color: "var(--text-dim)",
                      letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px",
                    }}>
                      {f.label}
                    </label>
                    <input
                      type="text"
                      value={spec[f.k]}
                      onChange={e => setSpec(s => ({ ...s, [f.k]: e.target.value }))}
                      placeholder={f.ph}
                    />
                  </div>
                ))}
              </div>
              <p style={{
                marginTop: "16px", fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5,
              }}>
                ℹ️ Don't know the species or locality? That's fine — you can skip fields and come back.
              </p>
            </div>
          )}

          {/* Steps 2–7: Dimension scoring */}
          {currentDim && (
            <div>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{currentDim.icon}</div>
              <h2 style={{
                fontFamily: "var(--sans)", fontSize: "22px", fontWeight: 600,
                color: "var(--text)", marginBottom: "6px",
              }}>
                {currentDim.label}
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "6px" }}>
                {currentDim.desc}
              </p>

              {/* Learn more toggle */}
              <div style={{ position: "relative", marginBottom: "22px", display: "inline-block" }}>
                <button
                  onClick={() => setShowTip(showTip === currentDim.key ? null : currentDim.key)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    background: "none", border: "none",
                    color: "rgba(0,212,255,0.6)", fontSize: "11px", padding: 0,
                  }}
                >
                  <HelpCircle size={13} />
                  Learn more about scoring this
                </button>
                {showTip === currentDim.key && (
                  <Tooltip text={currentDim.detail} onClose={() => setShowTip(null)} />
                )}
              </div>

              {/* Criteria checklist, tier selector, or anchor buttons */}
              {currentDim.criteria ? (
                <CriteriaChecklist
                  criteria={currentDim.criteria}
                  checked={sciCriteria}
                  onChange={onSciCriteriaChange}
                />
              ) : currentDim.tiers ? (
                <TierSelector
                  tiers={currentDim.tiers}
                  value={scores[currentDim.key]}
                  onChange={v => pickAnchor(currentDim.key, v)}
                />
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {currentDim.anchors.map(anchor => (
                      <AnchorButton
                        key={anchor.value}
                        anchor={anchor}
                        selected={scores[currentDim.key] === anchor.value}
                        onClick={() => pickAnchor(currentDim.key, anchor.value)}
                      />
                    ))}
                  </div>

                  {/* Fine-tune slider */}
                  <div style={{
                    marginTop: "20px",
                    padding: "14px 16px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                  }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: "10px",
                    }}>
                      <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Fine-tune:</span>
                      <span style={{
                        fontFamily: "var(--mono)", fontSize: "20px", fontWeight: 600,
                        color: scores[currentDim.key] >= 75 ? "#00c880" : scores[currentDim.key] >= 50 ? "var(--cyan)" : "var(--text-muted)",
                        transition: "color 0.2s",
                      }}>
                        {scores[currentDim.key]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0} max={100}
                      value={scores[currentDim.key]}
                      onChange={e => setScores(s => ({ ...s, [currentDim.key]: +e.target.value }))}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>0</span>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>100</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Done state (last step) */}
          {isLastStep && !currentDim && (
            <div style={{ textAlign: "center", paddingTop: "32px" }}>
              <div style={{ fontSize: "48px", marginBottom: "14px" }}>✅</div>
              <h2 style={{
                fontFamily: "var(--sans)", fontSize: "22px", fontWeight: 600,
                color: "var(--text)", marginBottom: "8px",
              }}>
                Your PRISM score is ready!
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "28px" }}>
                {isMobile
                  ? "Tap the score bar below to see your full grade and profile."
                  : "Check the panel on the right to see your score, grade, and profile."
                }{" "}
                Switch to Expert Mode anytime to fine-tune individual values.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                {scoringComp && onSaveToComp && (
                  <button
                    onClick={onSaveToComp}
                    style={{
                      width: "220px", padding: "11px 20px",
                      background: "rgba(0,212,255,0.12)",
                      border: "1px solid rgba(0,212,255,0.5)",
                      borderRadius: "6px", color: "var(--cyan)",
                      fontSize: "12px", fontWeight: 700,
                      letterSpacing: "0.08em", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    }}
                  >
                    💾 Save Score to Research
                  </button>
                )}
                <button
                  onClick={() => onExport?.()}
                  style={{
                    width: "220px", padding: "11px 20px",
                    background: "rgba(0,212,255,0.08)",
                    border: "1px solid rgba(0,212,255,0.4)",
                    borderRadius: "6px", color: "var(--cyan)",
                    fontSize: "12px", fontWeight: 600,
                    letterSpacing: "0.08em", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}
                >
                  📤 Export Record
                </button>
                <button
                  onClick={() => {
                    onSaveToCollection?.();
                    setSaveFlash(true);
                    setTimeout(() => setSaveFlash(false), 1800);
                  }}
                  style={{
                    width: "220px", padding: "11px 20px",
                    background: saveFlash ? "rgba(0,200,128,0.12)" : "rgba(0,212,255,0.04)",
                    border: `1px solid ${saveFlash ? "rgba(0,200,128,0.5)" : "var(--border)"}`,
                    borderRadius: "6px",
                    color: saveFlash ? "#00c880" : "var(--text-muted)",
                    fontSize: "12px", fontWeight: 600,
                    letterSpacing: "0.08em", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  {saveFlash ? "✓ Saved to History" : "💾 Save to History"}
                </button>
                <button
                  onClick={() => { setStep(0); onReset?.(); }}
                  style={{
                    width: "220px", padding: "11px 20px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: "6px", color: "var(--text-dim)",
                    fontSize: "12px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}
                >
                  ↺ Start Over — New Specimen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile score mini bar ── */}
        {isMobile && (
          <button
            onClick={() => setShowScorePanel(true)}
            style={{
              padding: "9px 18px",
              background: `${quickGrade.color}06`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              cursor: "pointer",
              border: "none",
              borderTop: "1px solid var(--border-dim)",
              width: "100%",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "22px", fontWeight: 600, color: quickGrade.color, lineHeight: 1 }}>
                {quickScore}
              </span>
              <span style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "2px" }}>/100</span>
              <span style={{
                padding: "3px 9px", borderRadius: "3px",
                background: `${quickGrade.color}12`,
                border: `1px solid ${quickGrade.color}30`,
                color: quickGrade.color, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em",
              }}>
                {quickGrade.emoji} {quickGrade.label}
              </span>
            </div>
            <span style={{ fontSize: "10px", color: "rgba(0,212,255,0.55)", letterSpacing: "0.06em" }}>View Score ›</span>
          </button>
        )}

        {/* ── Navigation ── */}
        <div style={{
          padding: "14px 22px",
          borderTop: "1px solid var(--border-dim)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}>
          <button
            onClick={back}
            disabled={step === 0}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "8px 16px",
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: step === 0 ? "var(--text-muted)" : "var(--text-dim)",
              fontSize: "12px",
              opacity: step === 0 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={14} /> Back
          </button>

          <div style={{ display: "flex", gap: "5px" }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? "16px" : "5px",
                  height: "5px",
                  borderRadius: "3px",
                  background: i <= step ? "var(--cyan)" : "var(--border)",
                  transition: "all 0.25s",
                }}
              />
            ))}
          </div>

          {!isLastStep ? (
            <button
              onClick={next}
              disabled={!canAdvance()}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "8px 20px",
                background: canAdvance() ? "rgba(0,212,255,0.09)" : "transparent",
                border: `1px solid ${canAdvance() ? "rgba(0,212,255,0.4)" : "var(--border)"}`,
                borderRadius: "4px",
                color: canAdvance() ? "var(--cyan)" : "var(--text-muted)",
                fontSize: "12px", fontWeight: 600,
                letterSpacing: "0.08em",
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <div style={{ width: "80px" }} />
          )}
        </div>
      </div>

      {/* ── Right: live score panel (desktop only) ── */}
      {!isMobile && (
        <div style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <ScorePanel scores={scores} ctx={ctx} spec={spec} sciCriteria={sciCriteria} />
        </div>
      )}

      {/* ── Mobile: score panel modal overlay ── */}
      {isMobile && showScorePanel && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "var(--bg)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "10px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0, background: "var(--bg-panel)",
          }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>PRISM Score</span>
            <button
              onClick={() => setShowScorePanel(false)}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", padding: "4px 10px", cursor: "pointer" }}
            >
              <X size={13} /> Close
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <ScorePanel scores={scores} ctx={ctx} spec={spec} sciCriteria={sciCriteria} />
          </div>
        </div>
      )}
    </div>
  );
}
