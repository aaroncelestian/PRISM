import { useState, useEffect, useRef } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from "recharts";
import { GRADES, DIMS, WEIGHTS, CONTEXTS, detectCompoundGrades } from "../data/prism.js";

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

function generateNarrative(scores, primaryCtx, allCtxData) {
  const W = WEIGHTS[primaryCtx.key];

  const dimContribs = DIMS.map(d => ({
    ...d,
    score: scores[d.key] ?? 50,
    weight: W[d.key],
    weighted: (scores[d.key] ?? 50) * W[d.key],
  }));

  const topDim = [...dimContribs].sort((a, b) => b.weighted - a.weighted)[0];
  const weakLink = [...dimContribs]
    .filter(d => d.weight >= 0.08)
    .sort((a, b) => a.score - b.score)[0];

  const primaryIdx = allCtxData.findIndex(c => c.key === primaryCtx.key);
  const nextCtx = primaryIdx > 0 ? allCtxData[primaryIdx - 1] : null;
  const gapToNext = nextCtx ? Math.max(0, THRESHOLD - nextCtx.score) : 0;

  const s = primaryCtx.score;
  const OPENERS = {
    Museum:     `Exceptional. At ${s}/100, this specimen qualifies for world-class museum acquisition.`,
    Exhibition: `Show-quality. At ${s}/100, this piece warrants prominent exhibition display.`,
    Collector:  `Solid collector\u2019s piece. ${s}/100 reflects genuine appeal and lasting value.`,
    Study:      `Research-grade. ${s}/100 makes this well-suited for scientific or educational use.`,
    Commercial: `Commercial grade. ${s}/100 is typical for accessible, market-common specimens.`,
  };

  const strengthAdj = topDim.score >= 80 ? "exceptional" : topDim.score >= 65 ? "strong" : "above-average";
  const showWeak = weakLink && weakLink.score < 55 && weakLink.key !== topDim.key;

  return {
    opener: OPENERS[primaryCtx.grade.label] ?? `Scored ${s}/100.`,
    topDim,
    strengthAdj,
    weakLink: showWeak ? weakLink : null,
    nextCtx,
    gapToNext,
  };
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
  // The context the user has selected in the header (may differ from primaryCtx)
  const selectedCtxData = allCtxData.find(c => c.key === ctx) || primaryCtx;
  const selectedDiffers = selectedCtxData.key !== primaryCtx.key;
  const displayScore = useAnimatedScore(primaryCtx.score);
  const radarData = DIMS.map(d => ({ dim: d.short, v: scores[d.key] }));
  const narrative = generateNarrative(scores, primaryCtx, allCtxData);

  // Compound grade detection — filter out grades subsumed by higher-tier matches
  const allCtxScores = Object.fromEntries(allCtxData.map(c => [c.key, c.score]));
  const rawCompounds = detectCompoundGrades(allCtxScores);
  const compoundGrades = rawCompounds.filter(cg => {
    const cgKeys = new Set(Object.keys(cg.contexts));
    return !rawCompounds.some(other => {
      if (other.key === cg.key) return false;
      const otherKeys = new Set(Object.keys(other.contexts));
      return [...cgKeys].every(k => otherKeys.has(k));
    });
  });

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

      {/* ── Selected context callout (shown when selected ctx ≠ awarded grade) ── */}
      {selectedDiffers && (
        <div style={{
          padding: "11px 14px",
          borderRadius: "6px",
          border: `1px solid ${selectedCtxData.passes ? selectedCtxData.grade.color + "40" : "rgba(255,160,40,0.35)"}`,
          background: selectedCtxData.passes ? `${selectedCtxData.grade.color}08` : "rgba(255,160,40,0.05)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase" }}>
              {selectedCtxData.icon} Evaluating as: {selectedCtxData.label}
            </div>
            <div style={{
              fontSize: "11px", fontWeight: 700,
              fontFamily: "var(--mono)",
              color: selectedCtxData.passes ? selectedCtxData.grade.color : "#ffa028",
            }}>
              {selectedCtxData.score}<span style={{ fontSize: "9px", opacity: 0.6 }}>/100</span>
            </div>
          </div>

          {!selectedCtxData.passes ? (
            <>
              <div style={{ fontSize: "11px", color: "#ffa028", lineHeight: 1.5, marginBottom: "5px" }}>
                <strong>+{THRESHOLD - selectedCtxData.score} pts needed</strong> to reach {selectedCtxData.grade.label} grade in this context.
              </div>
              {selectedCtxData.bottleneck && (
                <div style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.5 }}>
                  Bottleneck: <strong style={{ color: "var(--text)" }}>{selectedCtxData.bottleneck.icon} {selectedCtxData.bottleneck.label}</strong> is the
                  largest gap — raising it has the most impact here.
                </div>
              )}
              <div style={{ marginTop: "6px", fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.5, fontStyle: "italic" }}>
                PRISM awarded <strong style={{ color: primaryCtx.grade.color }}>{primaryCtx.grade.emoji} {primaryCtx.grade.label}</strong> — the highest grade this specimen actually achieves.
              </div>
            </>
          ) : (
            <div style={{ fontSize: "10px", color: selectedCtxData.grade.color, lineHeight: 1.5 }}>
              ✓ This specimen passes the {selectedCtxData.label} threshold — a higher-prestige context awarded it {primaryCtx.grade.label} grade.
            </div>
          )}
        </div>
      )}

      {/* ── Compound grades ── */}
      {compoundGrades.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>
            Combined Classification
          </div>
          {compoundGrades.map(cg => (
            <div key={cg.key} style={{ padding: "1.5px", borderRadius: "7px", background: cg.gradient,
              boxShadow: cg.key === "grand_slam" ? `0 0 18px ${cg.color}45` : `0 0 8px ${cg.color}25`,
            }}>
              <div style={{ padding: "11px 14px", borderRadius: "5.5px", background: "var(--bg-panel)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <span style={{ fontSize: cg.key === "grand_slam" ? "20px" : "16px" }}>{cg.emoji}</span>
                    <span style={{
                      fontSize: cg.key === "grand_slam" ? "14px" : "12px",
                      fontWeight: 700, color: cg.color, letterSpacing: "0.04em",
                    }}>{cg.label}</span>
                  </div>
                  <span style={{
                    fontSize: "8px", letterSpacing: "0.14em", textTransform: "uppercase",
                    padding: "2px 7px", borderRadius: "3px",
                    background: `${cg.color}18`, color: cg.color, border: `1px solid ${cg.color}35`,
                  }}>{cg.rarity}</span>
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.5 }}>{cg.shortDesc}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.5, marginTop: "4px", fontStyle: "italic" }}>{cg.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Analysis ── */}
      <div style={{
        padding: "12px 14px",
        background: "var(--bg-panel)",
        borderRadius: "6px",
        border: `1px solid ${primaryCtx.grade.color}1a`,
      }}>
        <div style={{
          fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)",
          textTransform: "uppercase", marginBottom: "8px",
        }}>
          Analysis
        </div>
        <p style={{
          fontSize: "12px", fontWeight: 500,
          color: "var(--text)", lineHeight: 1.55, marginBottom: "9px",
        }}>
          {narrative.opener}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>
            <span style={{ color: "#00c880" }}>↑</span>{" "}
            <strong style={{ color: "var(--text)" }}>{narrative.topDim.icon} {narrative.topDim.label}</strong>{" "}
            is {narrative.strengthAdj} at {narrative.topDim.score} — top driver ({Math.round(narrative.topDim.weight * 100)}% weight).
          </div>
          {narrative.weakLink && (
            <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>
              <span style={{ color: "#ff6060" }}>↓</span>{" "}
              <strong style={{ color: "var(--text)" }}>{narrative.weakLink.icon} {narrative.weakLink.label}</strong>{" "}
              ({narrative.weakLink.score}) is limiting — {Math.round(narrative.weakLink.weight * 100)}% weight in this context.
            </div>
          )}
          {narrative.nextCtx && narrative.gapToNext > 0 && (
            <div style={{ marginTop: "5px", fontSize: "10px", color: narrative.nextCtx.grade.color, opacity: 0.8 }}>
              {narrative.nextCtx.grade.emoji} +{narrative.gapToNext} pts in {narrative.nextCtx.label} context to reach {narrative.nextCtx.grade.label} grade
            </div>
          )}
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
