import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { DIMS, WEIGHTS } from "../data/prism.js";
import { useBreakpoint } from "../hooks/useWindowSize.js";
import ScorePanel from "./ScorePanel.jsx";
import TierSelector from "./TierSelector.jsx";
import CriteriaChecklist from "./CriteriaChecklist.jsx";

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
          <span style={{
            fontSize: "9px", color: "rgba(0,212,255,0.5)",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            wt {Math.round(weight * 100)}%
          </span>
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

export default function ExpertMode({ scores, setScores, ctx, spec, setSpec, sciCriteria, onSciCriteriaChange }) {
  const W = WEIGHTS[ctx];
  const { isMobile } = useBreakpoint();

  return (
    <div style={{
      display: isMobile ? "flex" : "grid",
      flexDirection: isMobile ? "column" : undefined,
      gridTemplateColumns: isMobile ? undefined : "1fr 380px",
      flex: 1,
      minHeight: 0,
      overflow: isMobile ? "auto" : "hidden",
    }}>

      {/* ── Left: inputs ── */}
      <div style={{
        padding: "20px 24px",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
      }}>

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
              { k: "locality", ph: "Locality" },
            ].map(f => (
              <input
                key={f.k}
                type="text"
                value={spec[f.k]}
                onChange={e => setSpec(s => ({ ...s, [f.k]: e.target.value }))}
                placeholder={f.ph}
                style={{ gridColumn: f.col || "auto" }}
              />
            ))}
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
            · {ctx} weights active
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

      {/* ── Right: score panel ── */}
      <div style={isMobile
        ? { borderTop: "1px solid var(--border)" }
        : { overflow: "hidden", display: "flex", flexDirection: "column" }
      }>
        <ScorePanel scores={scores} ctx={ctx} spec={spec} sciCriteria={sciCriteria} />
      </div>
    </div>
  );
}
