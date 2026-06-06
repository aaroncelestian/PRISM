import { useState, useEffect, useRef } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from "recharts";
import { GRADES, DIMS, WEIGHTS, CONTEXTS } from "../data/prism.js";

function useAnimatedScore(target) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  const raf = useRef(null);

  useEffect(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const from = prev.current;
    const to = target;
    prev.current = target;
    const t0 = performance.now();
    const run = (t) => {
      const p = Math.min((t - t0) / 360, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (p < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target]);

  return display;
}

// CONTEXTS is prestige-ordered (museum → commercial), same index as GRADES
const GRADE_FOR = Object.fromEntries(CONTEXTS.map((c, i) => [c.key, GRADES[i]]));
const THRESHOLD = 70;

function computeContextData(ctxKey, scores) {
  const W = WEIGHTS[ctxKey];
  const score = Math.round(
    Object.entries(W).reduce((acc, [k, w]) => acc + (scores[k] ?? 50) * w, 0)
  );
  const passes = score >= THRESHOLD;
  let bottleneck = null;
  if (!passes) {
    let maxShortfall = -Infinity;
    Object.entries(W).forEach(([k, w]) => {
      const shortfall = w * Math.max(0, THRESHOLD - (scores[k] ?? 50));
      if (shortfall > maxShortfall) {
        maxShortfall = shortfall;
        bottleneck = DIMS.find(d => d.key === k);
      }
    });
  }
  return { score, passes, bottleneck };
}

export default function ScorePanel({ scores, ctx, compact = false }) {
  const W = WEIGHTS[ctx]; // used only for weight bars (diagnostic context)
  const allCtxData = CONTEXTS.map(c => ({
    ...c,
    grade: GRADE_FOR[c.key],
    ...computeContextData(c.key, scores),
  }));
  // Highest-prestige context that passes THRESHOLD; fall back to first if none pass
  const primaryCtx = allCtxData.find(c => c.passes) || allCtxData[0];
  const displayScore = useAnimatedScore(primaryCtx.score);
  const radarData = DIMS.map(d => ({ dim: d.short, v: scores[d.key] }));

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      padding: compact ? "14px 12px" : "18px 16px",
      background: "var(--bg)",
    }}>

      {/* ── Score card ── */}
      <div style={{
        textAlign: "center",
        padding: "20px 14px 16px",
        background: "var(--bg-panel)",
        borderRadius: "6px",
        border: `1px solid ${primaryCtx.grade.color}20`,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${primaryCtx.grade.color}09, transparent 65%)`,
          pointerEvents: "none",
        }} />

        <div style={{ fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
          PRISM Score
        </div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: "62px", fontWeight: 600,
          lineHeight: 1, color: primaryCtx.grade.color, transition: "color 0.3s",
        }}>
          {displayScore}
        </div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "14px" }}>/ 100</div>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "5px 14px", borderRadius: "3px",
          border: `1px solid ${primaryCtx.grade.color}35`,
          background: `${primaryCtx.grade.color}0c`,
          color: primaryCtx.grade.color, fontSize: "11px", fontWeight: 600,
          letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          <span>{primaryCtx.grade.emoji}</span>
          <span>{primaryCtx.grade.label} Grade</span>
        </div>

        {/* grade description */}
        <div style={{
          fontSize: "11px", color: "var(--text-dim)", marginTop: "10px",
          lineHeight: 1.5, padding: "0 4px",
        }}>
          {primaryCtx.grade.desc}
        </div>

      </div>

      {/* ── Grade satisfaction profile ── */}
      <div>
        <div style={{
          fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)",
          textTransform: "uppercase", marginBottom: "10px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>Grade Profile</span>
          <span style={{
            letterSpacing: 0, textTransform: "none", fontStyle: "italic",
            color: "var(--text-muted)", fontSize: "9px",
          }}>
            threshold: {THRESHOLD}
          </span>
        </div>
        {allCtxData.map(c => (
          <div key={c.key} style={{
            display: "flex", alignItems: "flex-start", gap: "8px",
            padding: "7px 10px", marginBottom: "4px", borderRadius: "4px",
            background: c.passes ? `${c.grade.color}08` : "transparent",
            border: `1px solid ${c.passes ? c.grade.color + "25" : "var(--border-dim)"}`,
          }}>
            <span style={{
              fontFamily: "var(--mono)", fontSize: "11px", flexShrink: 0, marginTop: "1px",
              color: c.passes ? c.grade.color : "var(--text-muted)",
            }}>
              {c.passes ? "✓" : "✗"}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: c.passes ? 600 : 400,
                  color: c.passes ? c.grade.color : "var(--text-muted)",
                }}>
                  {c.grade.emoji} {c.label}
                </span>
                <span style={{
                  fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 600,
                  color: c.passes ? c.grade.color : "var(--text-muted)",
                  flexShrink: 0,
                }}>
                  {c.score}
                </span>
              </div>
              {!c.passes && c.bottleneck && (
                <div style={{
                  fontSize: "10px", color: "var(--text-muted)", marginTop: "3px",
                }}>
                  ↳ bottleneck: {c.bottleneck.icon} {c.bottleneck.label}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Market analysis placeholder ── */}
      <div style={{
        padding: "10px 14px",
        background: "var(--bg-panel)",
        borderRadius: "4px",
        border: "1px solid var(--border)",
        opacity: 0.6,
        cursor: "default",
        userSelect: "none",
      }}>
        <div style={{
          fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)",
          textTransform: "uppercase", marginBottom: "6px",
        }}>
          Market Analysis
        </div>
        <div style={{
          fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5,
          fontStyle: "italic",
        }}>
          Price benchmarking coming in Phase 2 — will show realized sale range for specimens at this PRISM score.
        </div>
      </div>

      {/* ── Radar chart ── */}
      <div>
        <div style={{
          fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)",
          textTransform: "uppercase", marginBottom: "6px",
        }}>
          Score Profile
        </div>
        <div style={{ height: "178px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="dim"
                tick={{ fontSize: 9, fill: "var(--text-label)", fontFamily: "'Exo 2', sans-serif" }}
              />
              <Radar
                dataKey="v" stroke="var(--cyan)" fill="var(--cyan)"
                fillOpacity={0.12} strokeWidth={1.5}
                dot={{ fill: "var(--cyan)", r: 2.5, strokeWidth: 0 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Context weight bars ── */}
      <div>
        <div style={{
          fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)",
          textTransform: "uppercase", marginBottom: "10px",
        }}>
          Active Weights
        </div>
        {DIMS.map(d => (
          <div key={d.key} style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>{d.label}</span>
              <span style={{
                fontFamily: "var(--mono)", fontSize: "10px",
                color: "rgba(0,212,255,0.6)",
              }}>
                {Math.round(W[d.key] * 100)}%
              </span>
            </div>
            <div style={{ height: "2px", background: "var(--border-dim)", borderRadius: "1px" }}>
              <div style={{
                height: "100%", borderRadius: "1px",
                width: `${Math.min(W[d.key] * 280, 100)}%`,
                background: "rgba(0,212,255,0.35)",
                transition: "width 0.35s ease",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
