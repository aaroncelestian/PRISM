import { useState, useMemo, useEffect } from "react";
import { ChevronRight, ChevronLeft, HelpCircle, X } from "lucide-react";
import { DIMS, WEIGHTS, GRADES, THRESHOLD } from "../data/prism.js";
import {
  WIZARD_GOALS,
  getWizardGoal,
  getTopDims,
  isHighImpactDim,
  getCoachingLevers,
  contextPasses,
  formatTopWeights,
  weightPct,
} from "../data/wizardGoals.js";
import { useBreakpoint } from "../hooks/useWindowSize.js";
import ScorePanel from "./ScorePanel.jsx";
import TierSelector from "./TierSelector.jsx";
import CriteriaChecklist from "./CriteriaChecklist.jsx";
import { nearestAnchor } from "./SnapScoreControl.jsx";

const TOTAL_STEPS = 2 + DIMS.length + 1; // goal + specimen info + 8 dims + done
const SPECIMEN_STEP = 1;
const FIRST_DIM_STEP = 2;
const DONE_STEP = TOTAL_STEPS - 1;

function Tooltip({ text, onClose }) {
  return (
    <div style={{
      position: "absolute", zIndex: 50,
      top: "calc(100% + 8px)", left: 0, right: 0,
      background: "var(--bg-panel)",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      padding: "12px 14px",
      fontSize: "12px",
      color: "var(--text-dim)",
      lineHeight: 1.6,
      boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
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
        background: selected ? "rgba(10,111,136,0.08)" : "var(--bg-card)",
        border: `1px solid ${selected ? "rgba(10,111,136,0.45)" : "var(--border)"}`,
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
        <div style={{ fontSize: "11px", color: selected ? "rgba(10,111,136,0.6)" : "var(--text-muted)", lineHeight: 1.4 }}>
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


export default function WizardMode({ scores, setScores, ctx, setCtx, spec, setSpec, sciCriteria, onSciCriteriaChange, culturalCriteria, onCulturalCriteriaChange, onReset, onExport, initialStep = 0, scoringComp = null, onSaveToComp = null, onSaveToCollection = null, onSwitchToExpert = null }) {
  const [step, setStep] = useState(initialStep);
  const [showTip, setShowTip] = useState(null);
  const [saveFlash, setSaveFlash] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(() => localStorage.getItem('prism_autoAdvance') === 'true');
  const [goalPicked, setGoalPicked] = useState(false);

  // step 0 = goal / why
  // step 1 = specimen info
  // steps 2..(1+DIMS.length) = DIMS[0..]
  // last step = done
  const dimIndex = step - FIRST_DIM_STEP;
  const currentDim = dimIndex >= 0 && dimIndex < DIMS.length ? DIMS[dimIndex] : null;
  const progress = Math.round((step / (TOTAL_STEPS - 1)) * 100);
  const goal = getWizardGoal(ctx);
  const goalTopDims = useMemo(() => getTopDims(ctx, 3), [ctx]);

  const canAdvance =
    step === 0 ? goalPicked
    : step === SPECIMEN_STEP ? (spec.name.trim().length > 0 || spec.species.trim().length > 0)
    : true;

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
  };
  const back = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const pickGoal = (key) => {
    setCtx(key);
    setGoalPicked(true);
  };

  const pickAnchor = (dimKey, value) => {
    setScores(s => ({ ...s, [dimKey]: value }));
    if (autoAdvance && step < TOTAL_STEPS - 1) {
      setTimeout(() => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)), 380);
    }
  };

  const isLastStep = step === DONE_STEP;
  const { isMobile } = useBreakpoint();
  const [showScorePanel, setShowScorePanel] = useState(false);
  const quickScore = useMemo(() => {
    const W = WEIGHTS[ctx];
    return Math.round(Object.entries(W).reduce((a, [k, w]) => a + (scores[k] ?? 50) * w, 0));
  }, [scores, ctx]);
  const quickGrade = GRADES.find(g => quickScore >= g.min) || GRADES[GRADES.length - 1];
  const goalStatus = useMemo(() => contextPasses(scores, ctx), [scores, ctx]);
  const coachingLevers = useMemo(() => getCoachingLevers(scores, ctx, 3), [scores, ctx]);
  const highImpact = currentDim ? isHighImpactDim(ctx, currentDim.key) : false;

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (!isLastStep && canAdvance) { e.preventDefault(); setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)); }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); setStep(s => Math.max(s - 1, 0));
      } else if (currentDim?.anchors) {
        const idx = parseInt(e.key) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < currentDim.anchors.length) {
          e.preventDefault();
          setScores(s => ({ ...s, [currentDim.key]: currentDim.anchors[idx].value }));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLastStep, canAdvance, currentDim, setScores]);

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
            background: "rgba(10,111,136,0.05)",
            borderBottom: "1px solid rgba(10,111,136,0.15)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(10,111,136,0.8)" }}>
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
            {goalPicked && (
              <span style={{
                fontSize: "10px", color: "var(--cyan)", letterSpacing: "0.06em",
                padding: "2px 8px", borderRadius: "3px",
                background: "rgba(var(--accent-rgb), 0.08)",
                border: "1px solid rgba(var(--accent-rgb), 0.28)",
              }}>
                {goal.hope}
              </span>
            )}
            {currentDim && (
              <span style={{ fontSize: "10px", color: "rgba(10,111,136,0.5)", letterSpacing: "0.08em" }}>
                {currentDim.icon} {currentDim.label}
              </span>
            )}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px 20px" }}>

          {/* Step 0: Goal / why */}
          {step === 0 && (
            <div>
              <h2 style={{
                fontFamily: "var(--sans)", fontSize: "22px", fontWeight: 600,
                color: "var(--text)", marginBottom: "6px",
              }}>
                Why are you rating this?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "18px" }}>
                Pick what you are hoping for. PRISM will weight the score for that goal and highlight which dimensions matter most.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: goalPicked ? "16px" : 0 }}>
                {WIZARD_GOALS.map((g) => {
                  const selected = goalPicked && ctx === g.key;
                  return (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => pickGoal(g.key)}
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
                      <div style={{
                        fontSize: "13px", fontWeight: selected ? 600 : 500,
                        color: selected ? "var(--cyan)" : "var(--text)", marginBottom: "3px",
                      }}>
                        {g.hope}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                        {g.pitch}
                      </div>
                    </button>
                  );
                })}
              </div>

              {goalPicked && (
                <div style={{
                  padding: "14px 16px", borderRadius: "6px",
                  background: "rgba(var(--accent-rgb), 0.06)",
                  border: "1px solid rgba(var(--accent-rgb), 0.22)",
                }}>
                  <div style={{
                    fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.08em",
                    textTransform: "uppercase", marginBottom: "6px", fontWeight: 600,
                  }}>
                    How to reach this level
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "10px", lineHeight: 1.55 }}>
                    For <strong style={{ color: "var(--text)" }}>{goal.hope}</strong>, the highest weights are{" "}
                    <span style={{ fontFamily: "var(--mono)", color: "var(--cyan)" }}>{formatTopWeights(ctx, 3)}</span>.
                  </div>
                  <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                    {goal.tips.map((t, i) => (
                      <li key={i} style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.65, marginBottom: "4px" }}>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Specimen info */}
          {step === SPECIMEN_STEP && (
            <div>
              <h2 style={{
                fontFamily: "var(--sans)", fontSize: "22px", fontWeight: 600,
                color: "var(--text)", marginBottom: "6px",
              }}>
                About the specimen
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

              {highImpact && (
                <div style={{
                  marginBottom: "14px", padding: "10px 12px", borderRadius: "6px",
                  background: "rgba(var(--accent-rgb), 0.06)",
                  border: "1px solid rgba(var(--accent-rgb), 0.22)",
                  fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55,
                }}>
                  <span style={{ color: "var(--cyan)", fontWeight: 600 }}>High impact for {goal.hope}</span>
                  {" — "}{currentDim.label.toLowerCase()} is ~{weightPct(ctx, currentDim.key)}% of this score.
                </div>
              )}

              {/* Learn more toggle */}
              <div style={{ position: "relative", marginBottom: "22px", display: "inline-block" }}>
                <button
                  onClick={() => setShowTip(showTip === currentDim.key ? null : currentDim.key)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    background: "none", border: "none",
                    color: "rgba(10,111,136,0.6)", fontSize: "11px", padding: 0,
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
                  checked={currentDim.key === "culturalSignificance" ? culturalCriteria : sciCriteria}
                  onChange={currentDim.key === "culturalSignificance" ? onCulturalCriteriaChange : onSciCriteriaChange}
                />
              ) : currentDim.tiers ? (
                <TierSelector
                  tiers={currentDim.tiers}
                  value={scores[currentDim.key]}
                  onChange={v => pickAnchor(currentDim.key, v)}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {currentDim.anchors.map(anchor => (
                    <AnchorButton
                      key={anchor.value}
                      anchor={anchor}
                      selected={nearestAnchor(currentDim.anchors, scores[currentDim.key])?.value === anchor.value}
                      onClick={() => pickAnchor(currentDim.key, anchor.value)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Done state (last step) */}
          {isLastStep && !currentDim && (
            <div style={{ textAlign: "center", paddingTop: "24px" }}>
              <div style={{ fontSize: "48px", marginBottom: "14px" }}>✅</div>
              <h2 style={{
                fontFamily: "var(--sans)", fontSize: "22px", fontWeight: 600,
                color: "var(--text)", marginBottom: "8px",
              }}>
                Your PRISM score is ready!
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "16px" }}>
                {isMobile
                  ? "Tap the score bar below to see your full grade and profile."
                  : "Check the panel on the right to see your score, grade, and profile."
                }{" "}
                Switch to Expert Mode anytime to fine-tune individual values.
              </p>

              <div style={{
                textAlign: "left", maxWidth: "420px", margin: "0 auto 22px",
                padding: "14px 16px", borderRadius: "6px",
                background: "var(--bg-card)", border: "1px solid var(--border)",
              }}>
                <div style={{
                  fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.08em",
                  textTransform: "uppercase", marginBottom: "8px", fontWeight: 600,
                }}>
                  Goal: {goal.hope}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55, marginBottom: "10px" }}>
                  Weighted score for this goal:{" "}
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 600, color: goalStatus.passes ? "var(--success)" : "var(--text)" }}>
                    {goalStatus.score}
                  </span>
                  {" / 100"}
                  {goalStatus.passes
                    ? ` — clears the ${THRESHOLD}-point context threshold.`
                    : ` — below the ${THRESHOLD}-point context threshold.`}
                </div>
                {!goalStatus.passes && coachingLevers.length > 0 && (
                  <>
                    <div style={{
                      fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em",
                      textTransform: "uppercase", marginBottom: "6px",
                    }}>
                      Next levers to improve
                    </div>
                    <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                      {coachingLevers.slice(0, 2).map((d) => (
                        <li key={d.key} style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "3px" }}>
                          {d.icon} {d.label} ({d.pct}% weight) — currently {d.score}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {goalStatus.passes && (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.55 }}>
                    Strongest weighted areas: {goalTopDims.map((d) => d.short).join(", ")}. Fine-tune in Expert Mode if you want to push further.
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                {onSwitchToExpert && (
                  <button
                    onClick={onSwitchToExpert}
                    style={{
                      width: "220px", padding: "11px 20px",
                      background: "rgba(10,111,136,0.12)",
                      border: "1px solid rgba(10,111,136,0.5)",
                      borderRadius: "6px", color: "var(--cyan)",
                      fontSize: "12px", fontWeight: 700,
                      letterSpacing: "0.08em", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    }}
                  >
                    🎛 Open in Expert Mode
                  </button>
                )}
                {scoringComp && onSaveToComp && (
                  <button
                    onClick={onSaveToComp}
                    style={{
                      width: "220px", padding: "11px 20px",
                      background: "rgba(10,111,136,0.12)",
                      border: "1px solid rgba(10,111,136,0.5)",
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
                    background: "rgba(10,111,136,0.08)",
                    border: "1px solid rgba(10,111,136,0.4)",
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
                    background: saveFlash ? "rgba(10,122,82,0.12)" : "rgba(10,111,136,0.04)",
                    border: `1px solid ${saveFlash ? "rgba(10,122,82,0.5)" : "var(--border)"}`,
                    borderRadius: "6px",
                    color: saveFlash ? "#0a7a52" : "var(--text-muted)",
                    fontSize: "12px", fontWeight: 600,
                    letterSpacing: "0.08em", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  {saveFlash ? "✓ Saved to History" : "💾 Save to History"}
                </button>
                <button
                  onClick={() => { setGoalPicked(false); setStep(0); onReset?.(); }}
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
            <span style={{ fontSize: "10px", color: "rgba(10,111,136,0.55)", letterSpacing: "0.06em" }}>View Score ›</span>
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

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px" }}>
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
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={e => { const v = e.target.checked; setAutoAdvance(v); localStorage.setItem('prism_autoAdvance', v); }}
                style={{ cursor: "pointer", accentColor: "var(--cyan)", width: "11px", height: "11px" }}
              />
              <span style={{ fontSize: "9px", color: autoAdvance ? "var(--cyan)" : "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase" }}>Auto-advance</span>
            </label>
          </div>

          {!isLastStep ? (
            <button
              onClick={next}
              disabled={!canAdvance}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "8px 20px",
                background: canAdvance ? "rgba(10,111,136,0.09)" : "transparent",
                border: `1px solid ${canAdvance ? "rgba(10,111,136,0.4)" : "var(--border)"}`,
                borderRadius: "4px",
                color: canAdvance ? "var(--cyan)" : "var(--text-muted)",
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
          <ScorePanel scores={scores} ctx={ctx} spec={spec} sciCriteria={sciCriteria} culturalCriteria={culturalCriteria} />
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
            <ScorePanel scores={scores} ctx={ctx} spec={spec} sciCriteria={sciCriteria} culturalCriteria={culturalCriteria} />
          </div>
        </div>
      )}
    </div>
  );
}
