import { useState, useMemo } from "react";
import { HelpCircle, X } from "lucide-react";
import { DIMS, WEIGHTS, GRADES, CONTEXTS, SIZE_CLASSES } from "../data/prism.js";
import { useBreakpoint } from "../hooks/useWindowSize.js";
import ScorePanel from "./ScorePanel.jsx";
import TierSelector from "./TierSelector.jsx";
import CriteriaChecklist from "./CriteriaChecklist.jsx";

const EXPERT_SPECTRUM = ["#ff5555", "#ffaa00", "#00dd88", "#0088ff", "#aa55ff"];

function DimRow({ dim, score, weight, onChange, sciCriteria, onSciCriteriaChange }) {
  const [open, setOpen] = useState(false);
  const contrib = (score * weight).toFixed(1);
  const barColor = score >= 75 ? "#00c880" : score >= 50 ? "var(--cyan)" : "var(--text-label)";

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
              {dim.icon} {dim.label}
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
            {CONTEXTS.map((c, i) => {
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
          <span style={{
            fontFamily: "var(--mono)", fontSize: "10px",
            color: "var(--text-muted)", minWidth: "36px", textAlign: "right",
          }}>
            +{contrib}
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
            {CONTEXTS.map((c, i) => {
              const w = WEIGHTS[c.key][dim.key];
              return (
                <div key={c.key} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "10px", color: "var(--text-dim)", width: "120px", flexShrink: 0 }}>{c.icon} {c.label}</span>
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

      {/* Criteria checklist, tier selector, or slider */}
      {dim.criteria ? (
        <CriteriaChecklist criteria={dim.criteria} checked={sciCriteria} onChange={onSciCriteriaChange} />
      ) : dim.tiers ? (
        <TierSelector tiers={dim.tiers} value={score} onChange={onChange} />
      ) : (
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative", height: "3px", background: "var(--border-dim)", borderRadius: "2px", marginBottom: "2px" }}>
            <div style={{
              position: "absolute", height: "100%", width: `${score}%`,
              borderRadius: "2px", background: barColor, opacity: 0.65,
              transition: "width 0.05s, background 0.2s",
            }} />
            {/* weight marker */}
            <div style={{
              position: "absolute", width: "1px", height: "7px",
              background: "rgba(0,212,255,0.4)", top: "-2px",
              left: `${Math.round(weight * 100)}%`,
            }} />
          </div>
          <input
            type="range" min={0} max={100} value={score}
            onChange={e => onChange(+e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

export default function ExpertMode({ scores, setScores, ctx, spec, setSpec, sciCriteria, onSciCriteriaChange, onExport = null, onSaveToCollection = null, scoringComp = null, onSaveToComp = null }) {
  const W = WEIGHTS[ctx];
  const { isMobile } = useBreakpoint();
  const [showScorePanel, setShowScorePanel] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const quickScore = useMemo(() =>
    Math.round(Object.entries(W).reduce((a, [k, w]) => a + (scores[k] ?? 50) * w, 0)),
  [scores, ctx]); // eslint-disable-line react-hooks/exhaustive-deps
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
                {quickGrade.emoji} {quickGrade.label}
              </span>
            </div>
            <span style={{ fontSize: "10px", color: "rgba(0,212,255,0.55)", letterSpacing: "0.06em" }}>View Score ›</span>
          </button>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

        {/* Comp scoring banner */}
        {scoringComp && (
          <div style={{
            padding: "8px 12px", marginBottom: "12px",
            background: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: "5px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(0,212,255,0.8)" }}>
              Scoring comp: <strong>{scoringComp.species}</strong>
              {scoringComp.locality && <span style={{ color: "var(--text-muted)" }}> — {scoringComp.locality}</span>}
            </div>
            <button
              onClick={onSaveToComp}
              style={{
                padding: "4px 12px", background: "rgba(0,212,255,0.1)",
                border: "1px solid rgba(0,212,255,0.45)", borderRadius: "4px",
                color: "var(--cyan)", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.06em", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              Save to Research
            </button>
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
              <option value="">Size class (optional)</option>
              {SIZE_CLASSES.map(sc => (
                <option key={sc.key} value={sc.key}>{sc.label} — {sc.range}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-score sliders */}
        <div style={{
          fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)",
          textTransform: "uppercase", marginBottom: "14px",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          Sub-score Inputs
          <span style={{ color: "rgba(0,212,255,0.45)", fontWeight: 400 }}>
            · hover <span style={{ fontSize: "8px" }}>?</span> for context weights
          </span>
        </div>

        {DIMS.map(d => (
          <DimRow
            key={d.key}
            dim={d}
            score={scores[d.key]}
            weight={W[d.key]}
            onChange={v => setScores(s => ({ ...s, [d.key]: v }))}
            sciCriteria={d.key === "scientific" ? sciCriteria : undefined}
            onSciCriteriaChange={d.key === "scientific" ? onSciCriteriaChange : undefined}
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
              background: "rgba(0,212,255,0.07)",
              border: "1px solid rgba(0,212,255,0.35)",
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
            📤 Export Record
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
              background: saveFlash ? "rgba(0,200,128,0.12)" : "rgba(0,212,255,0.04)",
              border: `1px solid ${saveFlash ? "rgba(0,200,128,0.5)" : "var(--border)"}`,
              borderRadius: "5px",
              color: saveFlash ? "#00c880" : "var(--text-muted)",
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
            {saveFlash ? "✓ Saved to History" : "💾 Save to History"}
          </button>
        </div>
      </div>

      {/* ── Right: score panel (desktop only) ── */}
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
