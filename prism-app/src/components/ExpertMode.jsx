import { useState, useMemo } from "react";
import { HelpCircle, X } from "lucide-react";
import { DIMS, WEIGHTS, GRADES, CONTEXTS, SIZE_CLASSES, TREATMENT_FLAGS, AESTHETICS_SUB_DIMS, computeContextScore } from "../data/prism.js";
import { WIZARD_GOALS, getWizardGoal, formatTopWeights } from "../data/wizardGoals.js";
import { useBreakpoint } from "../hooks/useWindowSize.js";
import ScorePanel from "./ScorePanel.jsx";
import TierSelector from "./TierSelector.jsx";
import CriteriaChecklist from "./CriteriaChecklist.jsx";
import SnapScoreControl from "./SnapScoreControl.jsx";

// Match PRISM spectrum bar colors exactly (same array, museum hidden so red=index 0 = exhibition)
const EXPERT_SPECTRUM = ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#9400d3"];

function AestheticsSubSliders({ subScores, onChange }) {
  const vals = AESTHETICS_SUB_DIMS.map(sub => subScores[sub.key] ?? 0);
  const computed = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  const computedColor = computed >= 75 ? "#0a7a52" : computed >= 50 ? "var(--cyan)" : "var(--text-label)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "4px" }}>
      {AESTHETICS_SUB_DIMS.map(sub => {
        const val = subScores[sub.key] ?? 0;
        const barColor = val >= 75 ? "#0a7a52" : val >= 50 ? "var(--cyan)" : "var(--text-label)";
        return (
          <div key={sub.key} style={{ paddingLeft: "8px", borderLeft: "2px solid var(--border-dim)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>{sub.label}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: barColor, minWidth: "24px", textAlign: "right" }}>{val}</span>
            </div>
            <SnapScoreControl
              anchors={sub.anchors}
              value={val}
              onChange={v => onChange({ ...subScores, [sub.key]: v })}
              compact
            />
          </div>
        );
      })}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 10px", background: "rgba(10,111,136,0.04)", border: "1px solid var(--border-dim)", borderRadius: "4px" }}>
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Computed aesthetics score</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: "14px", fontWeight: 600, color: computedColor }}>{computed}</span>
      </div>
    </div>
  );
}

function TreatmentFlagsSection({ flags, onChange }) {
  const activeFlags = TREATMENT_FLAGS.filter(tf => flags[tf.key]);
  const hasCritical = TREATMENT_FLAGS.some(tf => tf.severity === "critical" && flags[tf.key]);
  const hasHigh = TREATMENT_FLAGS.some(tf => tf.severity === "high" && flags[tf.key]);
  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{
          fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase",
          color: hasCritical ? "#ff6060" : hasHigh ? "#ffaa00" : activeFlags.length > 0 ? "#ffaa00" : "var(--text-muted)",
          fontWeight: activeFlags.length > 0 ? 600 : 400,
        }}>
          Enhancement Disclosure
        </span>
        {activeFlags.length > 0 && (
          <span style={{ fontSize: "9px", padding: "1px 7px", borderRadius: "2px", border: `1px solid ${hasCritical ? "rgba(255,80,80,0.4)" : "rgba(255,170,0,0.35)"}`, color: hasCritical ? "#ff6060" : "#ffaa00", background: hasCritical ? "rgba(255,80,80,0.06)" : "rgba(255,170,0,0.06)" }}>
            TREATED
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
        {TREATMENT_FLAGS.map(tf => {
          const checked = flags[tf.key] || false;
          const severityColor = tf.severity === "critical" ? "#ff6060" : tf.severity === "high" ? "#ffaa00" : "var(--text-dim)";
          return (
            <label key={tf.key} title={tf.desc} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "5px 8px", borderRadius: "4px", cursor: "pointer",
              border: `1px solid ${checked ? (tf.severity === "critical" ? "rgba(255,80,80,0.4)" : "rgba(255,170,0,0.35)") : "var(--border-dim)"}`,
              background: checked ? (tf.severity === "critical" ? "rgba(255,80,80,0.07)" : "rgba(255,170,0,0.06)") : "transparent",
              fontSize: "11px",
              color: checked ? severityColor : "var(--text-muted)",
            }}>
              <input
                type="checkbox" checked={checked}
                onChange={e => {
                  const on = e.target.checked;
                  if (tf.key === "other") {
                    onChange({ ...flags, other: on, ...(on ? {} : { otherNote: "" }) });
                  } else {
                    onChange({ ...flags, [tf.key]: on });
                  }
                }}
                style={{ margin: 0, accentColor: tf.severity === "critical" ? "#ff6060" : "#ffaa00" }}
              />
              {tf.label}
            </label>
          );
        })}
      </div>
      {flags.other && (
        <input
          type="text"
          value={flags.otherNote || ""}
          onChange={e => onChange({ ...flags, otherNote: e.target.value })}
          placeholder="Describe the treatment or enhancement…"
          style={{
            marginTop: "6px", width: "100%", boxSizing: "border-box",
            fontSize: "11px", padding: "6px 8px",
            border: "1px solid rgba(255,170,0,0.35)", borderRadius: "4px",
            background: "rgba(255,170,0,0.04)", color: "var(--text-dim)",
          }}
        />
      )}
    </div>
  );
}

function DocumentationSection({ spec, setSpec }) {
  const [open, setOpen] = useState(false);
  const exhibitions = spec.exhibitions || [];
  const literatureRefs = spec.literatureRefs || [];
  const count = exhibitions.filter(e => e.venue?.trim()).length + literatureRefs.filter(r => r?.trim()).length;

  const addExhibition = () => setSpec(s => ({ ...s, exhibitions: [...(s.exhibitions || []), { venue: "", year: "" }] }));
  const removeExhibition = (i) => setSpec(s => ({ ...s, exhibitions: (s.exhibitions || []).filter((_, idx) => idx !== i) }));
  const updateExhibition = (i, field, val) => setSpec(s => {
    const arr = [...(s.exhibitions || [])];
    arr[i] = { ...arr[i], [field]: val };
    return { ...s, exhibitions: arr };
  });
  const addLit = () => setSpec(s => ({ ...s, literatureRefs: [...(s.literatureRefs || []), ""] }));
  const removeLit = (i) => setSpec(s => ({ ...s, literatureRefs: (s.literatureRefs || []).filter((_, idx) => idx !== i) }));
  const updateLit = (i, val) => setSpec(s => {
    const arr = [...(s.literatureRefs || [])];
    arr[i] = val;
    return { ...s, literatureRefs: arr };
  });

  return (
    <div style={{ marginTop: "10px", borderTop: "1px solid var(--border-dim)", paddingTop: "10px" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "0 0 2px" }}
      >
        <span style={{
          fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase",
          color: count > 0 ? "var(--cyan)" : "var(--text-muted)",
          fontWeight: count > 0 ? 600 : 400,
        }}>
          Documentation History {count > 0 ? `(${count})` : ""}
        </span>
        <span style={{ fontSize: "10px", color: "rgba(10,111,136,0.45)" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Exhibition History</span>
              <button onClick={addExhibition} style={{ fontSize: "10px", padding: "2px 8px", background: "rgba(10,111,136,0.06)", border: "1px solid rgba(10,111,136,0.25)", borderRadius: "3px", color: "var(--cyan)", cursor: "pointer" }}>+ Add</button>
            </div>
            {exhibitions.length === 0 && (
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic", padding: "4px 0" }}>No exhibition history — add shows, museum displays, or competitive events.</div>
            )}
            {exhibitions.map((ex, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 72px 22px", gap: "4px", marginBottom: "4px", alignItems: "center" }}>
                <input type="text" value={ex.venue} onChange={e => updateExhibition(i, "venue", e.target.value)} placeholder="Venue / Show / Museum" style={{ fontSize: "11px" }} />
                <input type="text" value={ex.year} onChange={e => updateExhibition(i, "year", e.target.value)} placeholder="Year" style={{ fontSize: "11px" }} />
                <button onClick={() => removeExhibition(i)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            ))}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Literature Citations</span>
              <button onClick={addLit} style={{ fontSize: "10px", padding: "2px 8px", background: "rgba(10,111,136,0.06)", border: "1px solid rgba(10,111,136,0.25)", borderRadius: "3px", color: "var(--cyan)", cursor: "pointer" }}>+ Add</button>
            </div>
            {literatureRefs.length === 0 && (
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic", padding: "4px 0" }}>No citations — add published references featuring this specimen or its locality.</div>
            )}
            {literatureRefs.map((ref, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 22px", gap: "4px", marginBottom: "4px", alignItems: "center" }}>
                <input type="text" value={ref} onChange={e => updateLit(i, e.target.value)} placeholder="Author, Journal, Vol., Year — or DOI/URL" style={{ fontSize: "11px" }} />
                <button onClick={() => removeLit(i)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DimRow({ dim, score, onChange, criteriaValues, onCriteriaChange, subScores, onSubScoresChange }) {
  const [open, setOpen] = useState(false);
  const barColor = score >= 75 ? "#0a7a52" : score >= 50 ? "var(--cyan)" : "var(--text-label)";

  return (
    <div style={{
      marginBottom: "12px", paddingBottom: "12px",
      borderBottom: "1px solid var(--border-dim)",
    }}>
      {/* Row header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "6px", gap: "8px",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>
              {dim.label}
            </span>
            <button
              onClick={() => setOpen(o => !o)}
              style={{
                background: "none", border: "none",
                color: open ? "var(--cyan)" : "var(--text-muted)",
                padding: "1px", display: "flex",
              }}
            >
              <HelpCircle size={12} />
            </button>
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>
            {dim.desc}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "18px" }} title="Context weights">
            {CONTEXTS.filter(c => !c.hidden).map((c, i) => {
              const w = WEIGHTS[c.key][dim.key];
              return (
                <div key={c.key} style={{
                  width: "5px",
                  height: `${Math.max(3, Math.round((w / 0.45) * 16))}px`,
                  borderRadius: "1px",
                  background: EXPERT_SPECTRUM[i],
                  opacity: 0.7,
                }} />
              );
            })}
          </div>
          <span style={{
            fontFamily: "var(--mono)", fontSize: "19px", fontWeight: 600,
            color: barColor, minWidth: "28px", textAlign: "right",
            transition: "color 0.2s",
          }}>
            {score}
          </span>
        </div>
      </div>

      {/* Detail tooltip */}
      {open && (
        <div style={{
          padding: "10px 12px", marginBottom: "8px",
          background: "var(--bg-panel)", borderRadius: "4px",
          border: "1px solid var(--border)",
          fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6,
        }}>
          {dim.detail}
          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--border-dim)" }}>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Context Weights</div>
            {CONTEXTS.filter(c => !c.hidden).map((c, i) => {
              const w = WEIGHTS[c.key][dim.key];
              return (
                <div key={c.key} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "10px", color: "var(--text-dim)", width: "120px", flexShrink: 0 }}>{c.label}</span>
                  <div style={{ flex: 1, height: "3px", background: "var(--border-dim)", borderRadius: "2px" }}>
                    <div style={{ height: "100%", width: `${Math.round(w * 100)}%`, background: EXPERT_SPECTRUM[i], borderRadius: "2px" }} />
                  </div>
                  <span style={{ fontSize: "9px", fontFamily: "var(--mono)", color: EXPERT_SPECTRUM[i], width: "28px", textAlign: "right" }}>{Math.round(w * 100)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Criteria checklist, tier selector, sub-sliders, or snap bands */}
      {dim.criteria ? (
        <CriteriaChecklist criteria={dim.criteria} checked={criteriaValues} onChange={onCriteriaChange} />
      ) : dim.tiers ? (
        <TierSelector tiers={dim.tiers} value={score} onChange={onChange} />
      ) : subScores ? (
        <AestheticsSubSliders subScores={subScores} onChange={onSubScoresChange} />
      ) : dim.anchors ? (
        <SnapScoreControl anchors={dim.anchors} value={score} onChange={onChange} />
      ) : null}
    </div>
  );
}

export default function ExpertMode({ scores, setScores, ctx, setCtx, spec, setSpec, sciCriteria, onSciCriteriaChange, culturalCriteria, onCulturalCriteriaChange, aestheticsSubScores, onAestheticsSubScoresChange, treatmentFlags, onTreatmentFlagsChange, onExport = null, onSaveToCollection = null, scoringComp = null, onSaveToComp = null }) {
  const goal = getWizardGoal(ctx);
  const { isMobile } = useBreakpoint();
  const [showScorePanel, setShowScorePanel] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const quickScore = useMemo(() => computeContextScore(ctx, scores).score, [scores, ctx]);
  const quickGrade = GRADES.find(g => quickScore >= g.min) || GRADES[GRADES.length - 1];
  const ctxMeta = CONTEXTS.find(c => c.key === ctx);

  return (
    <div style={{
      display: isMobile ? "flex" : "grid",
      flexDirection: isMobile ? "column" : undefined,
      gridTemplateColumns: isMobile ? undefined : "1fr 380px",
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
    }}>

      {/* ── Left: inputs ── */}
      <div style={{
        flex: isMobile ? 1 : undefined,
        minHeight: 0,
        borderRight: isMobile ? "none" : "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
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
              borderBottom: "1px solid var(--border-dim)",
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
                {quickGrade.label}
              </span>
              <span style={{
                padding: "3px 8px", borderRadius: "3px",
                background: "rgba(10,111,136,0.08)",
                border: "1px solid rgba(10,111,136,0.30)",
                color: "var(--cyan)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.06em",
              }}>
                {ctxMeta?.label || ctx}
              </span>
            </div>
            <span style={{ fontSize: "10px", color: "rgba(10,111,136,0.55)", letterSpacing: "0.06em" }}>View Score ›</span>
          </button>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

        {/* Comp scoring banner */}
        {scoringComp && (
          <div style={{
            padding: "8px 12px", marginBottom: "12px",
            background: "rgba(10,111,136,0.05)",
            border: "1px solid rgba(10,111,136,0.2)",
            borderRadius: "5px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(10,111,136,0.8)" }}>
              Scoring comp: <strong>{scoringComp.species}</strong>
              {scoringComp.locality && <span style={{ color: "var(--text-muted)" }}> — {scoringComp.locality}</span>}
            </div>
            <button
              onClick={onSaveToComp}
              style={{
                padding: "4px 12px", background: "rgba(10,111,136,0.1)",
                border: "1px solid rgba(10,111,136,0.45)", borderRadius: "4px",
                color: "var(--cyan)", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.06em", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              Save to Research
            </button>
          </div>
        )}

        {/* Rating goal — selects WEIGHTS[ctx] for Analysis / Grade Profile */}
        {setCtx && (
          <div style={{ marginBottom: "18px" }}>
            <div style={{
              fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)",
              textTransform: "uppercase", marginBottom: "8px",
            }}>
              Why are you rating this?
            </div>
            <select
              value={ctx}
              onChange={e => setCtx(e.target.value)}
              style={{
                width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "5px", color: "var(--text)", padding: "8px 10px", fontSize: "12px",
                marginBottom: "8px",
              }}
            >
              {WIZARD_GOALS.map(g => {
                const meta = CONTEXTS.find(c => c.key === g.key);
                return (
                  <option key={g.key} value={g.key}>
                    {meta?.label || g.hope}
                  </option>
                );
              })}
            </select>
            <div style={{
              padding: "9px 11px", borderRadius: "5px",
              background: "rgba(10,111,136,0.05)", border: "1px solid rgba(10,111,136,0.22)",
              fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5,
            }}>
              <strong style={{ color: "var(--cyan)" }}>{ctxMeta?.label || goal.hope}</strong>
              {" — "}{goal.pitch}
              <div style={{ marginTop: "4px", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--cyan)" }}>
                Top weights: {formatTopWeights(ctx, 3)}
              </div>
            </div>
          </div>
        )}

        {/* Specimen fields */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{
            fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)",
            textTransform: "uppercase", marginBottom: "10px",
          }}>
            Specimen Data
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              { k: "name",     ph: "Catalog no. / label name", col: "1 / -1" },
              { k: "species",  ph: "Mineral species" },
              { k: "variety",  ph: "Variety / form (optional)" },
              { k: "locality", ph: "Locality", col: "1 / -1" },
            ].map(f => (
              <input
                key={f.k}
                type="text"
                value={spec[f.k] || ""}
                onChange={e => setSpec(s => ({ ...s, [f.k]: e.target.value }))}
                placeholder={f.ph}
                style={{ gridColumn: f.col || "auto" }}
              />
            ))}
            <select
              value={spec.size || ""}
              onChange={e => setSpec(s => ({ ...s, size: e.target.value }))}
              style={{ gridColumn: "1 / -1", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px", color: spec.size ? "var(--text)" : "var(--text-muted)", padding: "6px 10px", fontSize: "12px" }}
            >
              <option value="">Size class (optional — pricing metadata)</option>
              {SIZE_CLASSES.map(sc => (
                <option key={sc.key} value={sc.key}>{sc.label} — {sc.range}</option>
              ))}
            </select>
            <div style={{
              gridColumn: "1 / -1", fontSize: "10px", color: "var(--text-muted)",
              lineHeight: 1.5, marginTop: "-2px",
            }}>
              Size is a pricing variable, not a quality variable. PRISM scores quality — size class is recorded for market comparison only and never enters the score.
            </div>
          </div>
          {treatmentFlags && onTreatmentFlagsChange && (
            <TreatmentFlagsSection flags={treatmentFlags} onChange={onTreatmentFlagsChange} />
          )}
          <DocumentationSection spec={spec} setSpec={setSpec} />
        </div>

        {/* Sub-score sliders */}
        <div style={{
          fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)",
          textTransform: "uppercase", marginBottom: "14px",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          Sub-score Inputs
          <span style={{ color: "rgba(10,111,136,0.45)", fontWeight: 400 }}>
            · hover <span style={{ fontSize: "8px" }}>?</span> for context weights
          </span>
        </div>

        {DIMS.map(d => (
          <DimRow
            key={d.key}
            dim={d}
            score={scores[d.key]}
            onChange={v => setScores(s => ({ ...s, [d.key]: v }))}
            criteriaValues={
              d.key === "scientific" ? sciCriteria
              : d.key === "culturalSignificance" ? culturalCriteria
              : undefined
            }
            onCriteriaChange={
              d.key === "scientific" ? onSciCriteriaChange
              : d.key === "culturalSignificance" ? onCulturalCriteriaChange
              : undefined
            }
            subScores={d.key === "aesthetics" ? aestheticsSubScores : undefined}
            onSubScoresChange={d.key === "aesthetics" ? onAestheticsSubScoresChange : undefined}
          />
        ))}
        </div>

        {/* ── Action buttons ── */}
        <div style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--border-dim)",
          display: "flex",
          gap: "8px",
          flexShrink: 0,
        }}>
          <button
            onClick={() => onExport?.()}
            style={{
              flex: 1,
              padding: "8px 14px",
              background: "rgba(10,111,136,0.07)",
              border: "1px solid rgba(10,111,136,0.35)",
              borderRadius: "5px",
              color: "var(--cyan)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.07em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            Export Record
          </button>
          <button
            onClick={() => {
              onSaveToCollection?.();
              setSaveFlash(true);
              setTimeout(() => setSaveFlash(false), 1800);
            }}
            style={{
              flex: 1,
              padding: "8px 14px",
              background: saveFlash ? "rgba(10,122,82,0.12)" : "rgba(10,111,136,0.04)",
              border: `1px solid ${saveFlash ? "rgba(10,122,82,0.5)" : "var(--border)"}`,
              borderRadius: "5px",
              color: saveFlash ? "#0a7a52" : "var(--text-muted)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.07em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            {saveFlash ? "✓ Saved to History" : "Save to History"}
          </button>
        </div>
      </div>

      {/* ── Right: score panel (desktop only) ── */}
      {!isMobile && (
        <div style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <ScorePanel scores={scores} ctx={ctx} spec={spec} sciCriteria={sciCriteria} culturalCriteria={culturalCriteria} onCtxChange={setCtx} />
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
            <ScorePanel scores={scores} ctx={ctx} spec={spec} sciCriteria={sciCriteria} culturalCriteria={culturalCriteria} onCtxChange={setCtx} />
          </div>
        </div>
      )}
    </div>
  );
}
