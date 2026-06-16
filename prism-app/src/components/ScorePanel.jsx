import { useState, useEffect, useRef } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from "recharts";
import { GRADES, DIMS, WEIGHTS, CONTEXTS, THRESHOLD, detectCompoundGrades, detectInconsistencies, applyNonLinearTransform } from "../data/prism.js";
import { useBreakpoint } from "../hooks/useWindowSize.js";

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

// Map each context to its display grade via gradeLabel property
const GRADE_FOR = Object.fromEntries(
  CONTEXTS.map(c => [c.key, GRADES.find(g => g.label === c.gradeLabel) || GRADES[GRADES.length - 1]])
);

// Spectrum bar colors — one per visible context (6 visible contexts)
const SPECTRUM_COLORS = ["#ff5555", "#ffaa00", "#d4a840", "#40c880", "#5090ff", "#8090a8"];
// Grade lookup by raw score (used when no context passes threshold)
function gradeFromScore(score) {
  return GRADES.find(g => score >= g.min) ?? GRADES[GRADES.length - 1];
}


function computeContextData(ctxKey, scores) {
  const W = WEIGHTS[ctxKey];
  
  // Apply universal non-linear transformations to all dimensions
  const adjustedScores = Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, applyNonLinearTransform(k, v ?? 50)])
  );
  
  const score = Math.round(
    Object.entries(W).reduce((acc, [k, w]) => acc + (adjustedScores[k] ?? 50) * w, 0)
  );
  const passes = score >= THRESHOLD;
  let bottleneck = null;
  if (!passes) {
    let maxShortfall = -Infinity;
    Object.entries(W).forEach(([k, w]) => {
      const shortfall = w * Math.max(0, THRESHOLD - (adjustedScores[k] ?? 50));
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
    General:    `General grade. At ${s}/100, this is accessible and appropriate for educational or introductory use.`,
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

export default function ScorePanel({ scores, ctx, spec, sciCriteria, culturalCriteria, compact = false }) {
  const [tab, setTab] = useState("grade");
  const [openCtxTip, setOpenCtxTip] = useState(null);
  const { isMobile } = useBreakpoint();
  const W = WEIGHTS[ctx]; // used only for weight bars (diagnostic context)
  const allCtxData = CONTEXTS.map(c => ({
    ...c,
    grade: GRADE_FOR[c.key],
    ...computeContextData(c.key, scores),
  }));
  const visibleCtxData = allCtxData.filter(c => !c.hidden);
  // Primary context is always the user-selected context (never hidden)
  const selectedCtxData = visibleCtxData.find(c => c.key === ctx) || visibleCtxData[0];
  const ctxGrade = GRADES.find(g => selectedCtxData.score >= g.min) || GRADES[GRADES.length - 1];
  const primaryCtx = {
    ...selectedCtxData,
    grade: selectedCtxData.passes
      ? ctxGrade
      : { ...ctxGrade, color: "var(--text-muted)" },
  };
  // Best passing context across all (for reference in callout when selected doesn't pass)
  const bestPassingCtx = allCtxData.find(c => c.passes);
  const inconsistencies = detectInconsistencies(scores, spec, sciCriteria, culturalCriteria);
  const displayScore = useAnimatedScore(primaryCtx.score);
  const radarData = DIMS.map(d => ({ dim: d.short, v: scores[d.key] }));
  const narrative = generateNarrative(scores, primaryCtx, allCtxData);

  // Compound grade detection — returns single best match
  const allCtxScores = Object.fromEntries(allCtxData.map(c => [c.key, c.score]));
  const compoundGrades = detectCompoundGrades(allCtxScores);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: isMobile ? "auto" : "100%", background: "var(--bg)", overflow: "hidden" }}>

      {/* ── Sticky header: score card + callout + warnings + tab bar ── */}
      <div style={{ flexShrink: 0, borderBottom: "1px solid var(--border-dim)" }}>

        {/* Score card — horizontal 2-column layout */}
        <div style={{
          display: "flex", alignItems: "center", gap: "16px", padding: "14px 18px 12px",
          background: `radial-gradient(ellipse at 30% 0%, ${compoundGrades.length > 0 ? compoundGrades[0].color : primaryCtx.grade.color}09, transparent 60%)`,
        }}>
          {/* Left: PRISM spectrum bar */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: "7px", letterSpacing: "0.22em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "7px" }}>PRISM</div>
            <div style={{ display: "flex", gap: "3px", alignItems: "flex-end" }}>
              {visibleCtxData.map((c, i) => (
                <div
                  key={c.key}
                  title={`${c.label}: ${c.score}`}
                  style={{
                    width: "11px",
                    height: "44px",
                    borderRadius: "2px",
                    background: `linear-gradient(to bottom, ${SPECTRUM_COLORS[i]}cc, ${SPECTRUM_COLORS[i]})`,
                    opacity: c.passes ? 1 : 0.1,
                    boxShadow: c.passes ? `0 0 10px ${SPECTRUM_COLORS[i]}90, 0 0 4px ${SPECTRUM_COLORS[i]}60` : "none",
                    transition: "all 0.4s ease",
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: "8px", color: "var(--text-muted)", marginTop: "5px", letterSpacing: "0.04em" }}>
              {visibleCtxData.filter(c => c.passes).length}/{visibleCtxData.length}
            </div>
          </div>
          {/* Divider */}
          <div style={{ width: "1px", alignSelf: "stretch", background: "var(--border-dim)", margin: "4px 0" }} />
          {/* Right: compound grade hero OR context grade */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {compoundGrades.length > 0 ? (
              <>
                {/* Compound grade is the headline */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "6px",
                  padding: "4px 13px", borderRadius: "3px",
                  border: `1px solid ${compoundGrades[0].color}45`,
                  background: `${compoundGrades[0].color}12`,
                  color: compoundGrades[0].color, fontSize: "12px", fontWeight: 700,
                  letterSpacing: "0.09em", textTransform: "uppercase",
                }}>
                  <span>{compoundGrades[0].label}</span>
                  <span style={{ fontSize: "7px", padding: "1px 5px", borderRadius: "2px", background: `${compoundGrades[0].color}20`, border: `1px solid ${compoundGrades[0].color}30`, marginLeft: "2px" }}>{compoundGrades[0].rarity}</span>
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.4, marginBottom: "6px" }}>
                  {compoundGrades[0].shortDesc}
                </div>
                {/* Context grade demoted to secondary */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 8px",
                  borderRadius: "2px", border: `1px solid ${primaryCtx.grade.color}30`,
                  color: primaryCtx.grade.color, fontSize: "9px", fontWeight: 500,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  <span>{primaryCtx.grade.label}{primaryCtx.passes ? " ✓" : ` · +${THRESHOLD - primaryCtx.score} pts`}</span>
                </div>
              </>
            ) : (
              <>
                {/* No compound grade — context grade is the headline */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "7px",
                  padding: "4px 13px", borderRadius: "3px",
                  border: `1px solid ${primaryCtx.grade.color}35`,
                  background: `${primaryCtx.grade.color}0c`,
                  color: primaryCtx.grade.color, fontSize: "11px", fontWeight: 600,
                  letterSpacing: "0.11em", textTransform: "uppercase",
                }}>
                  <span>{primaryCtx.grade.label} Grade</span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.45 }}>
                  {primaryCtx.grade.desc}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Context status callout — shown when selected context is below threshold */}
        {!primaryCtx.passes && (
          <div style={{
            margin: "0 14px 10px", padding: "10px 13px", borderRadius: "5px",
            border: "1px solid rgba(255,160,40,0.35)",
            background: "rgba(255,160,40,0.05)",
          }}>
            <div style={{ fontSize: "11px", color: "#ffa028", lineHeight: 1.5, marginBottom: "4px" }}>
              <strong>+{THRESHOLD - primaryCtx.score} pts needed</strong> to reach {GRADE_FOR[primaryCtx.key].label} grade.
            </div>
            {primaryCtx.bottleneck && (
              <div style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.5 }}>
                Bottleneck: <strong style={{ color: "var(--text)" }}>{primaryCtx.bottleneck.label}</strong> is the largest gap.
              </div>
            )}
            {bestPassingCtx && (
              <div style={{ marginTop: "4px", fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.5, fontStyle: "italic" }}>
                Highest grade achieved: <strong style={{ color: bestPassingCtx.grade.color }}>{bestPassingCtx.grade.label}</strong> — {bestPassingCtx.label}.
              </div>
            )}
          </div>
        )}

        {/* Consistency warnings */}
        {inconsistencies.length > 0 && (
          <div style={{ margin: "0 14px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {inconsistencies.map(w => (
              <div key={w.key} style={{
                padding: "8px 11px", borderRadius: "4px",
                border: `1px solid ${w.level === "warn" ? "rgba(255,160,40,0.4)" : "rgba(120,180,255,0.3)"}`,
                background: w.level === "warn" ? "rgba(255,160,40,0.06)" : "rgba(120,180,255,0.05)",
                display: "flex", alignItems: "flex-start", gap: "7px",
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: w.level === "warn" ? "#ffa028" : "#6090c8", flexShrink: 0, marginTop: "4px", display: "inline-block" }} />
                <span style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.5 }}>{w.msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab bar */}
        <div style={{ display: "flex", padding: "0 14px", borderTop: "1px solid var(--border-dim)" }}>
          {[
            { key: "grade",    label: "Grade Profile" },
            { key: "analysis", label: "Analysis" },
            { key: "charts",   label: "Charts" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "8px 14px", background: "none", border: "none", cursor: "pointer",
              borderBottom: `2px solid ${tab === t.key ? "var(--cyan)" : "transparent"}`,
              color: tab === t.key ? "var(--cyan)" : "var(--text-muted)",
              fontSize: "10px", fontWeight: tab === t.key ? 600 : 400,
              letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.15s",
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content (scrollable) ── */}
      <div style={{ flex: isMobile ? "none" : 1, overflowY: isMobile ? "visible" : "auto", padding: "16px 16px 20px" }}>

        {/* ─── Grade Profile tab ─── */}
        {tab === "grade" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* All-context grade profile */}
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                <span>All Contexts</span>
                <span style={{ letterSpacing: 0, textTransform: "none", fontStyle: "italic" }}>threshold: {THRESHOLD}</span>
              </div>
              {visibleCtxData.map(c => {
                const isSelected = c.key === ctx;
                return (
                <div key={c.key} style={{
                  display: "flex", alignItems: "flex-start", gap: "9px",
                  padding: "9px 12px", marginBottom: "5px", borderRadius: "5px",
                  background: c.passes ? `${c.grade.color}1e` : isSelected ? "rgba(0,212,255,0.04)" : "transparent",
                  border: `1px solid ${c.passes ? c.grade.color + "55" : isSelected ? "rgba(0,212,255,0.30)" : "var(--border-dim)"}`,
                  boxShadow: c.passes ? `inset 3px 0 0 ${c.grade.color}` : isSelected ? "inset 3px 0 0 rgba(0,212,255,0.4)" : "none",
                  transition: "background 0.25s, border-color 0.25s",
                }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "11px", flexShrink: 0, marginTop: "2px", color: c.passes ? c.grade.color : "var(--text-muted)" }}>
                    {c.passes ? "✓" : "✗"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                        <span style={{ fontSize: "12px", fontWeight: c.passes ? 600 : 400, color: c.passes ? c.grade.color : isSelected ? "var(--text)" : "var(--text-muted)" }}>
                          {c.label}
                        </span>
                        <button
                          onClick={() => setOpenCtxTip(openCtxTip === c.key ? null : c.key)}
                          style={{ background: "none", border: "none", padding: "1px 2px", cursor: "pointer", color: openCtxTip === c.key ? "var(--cyan)" : "var(--text-muted)", flexShrink: 0, display: "flex", alignItems: "center" }}
                        >
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm0 3.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm-.75 1.5h1.5v3.5h-1.5V7.25z"/></svg>
                        </button>
                      </div>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "13px", fontWeight: 600, color: c.passes ? c.grade.color : isSelected ? "var(--text)" : "var(--text-muted)", flexShrink: 0 }}>
                        {c.score}
                      </span>
                    </div>
                    <div style={{ height: "4px", background: "var(--border-dim)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "2px", transition: "width 0.35s", background: c.passes ? c.grade.color : isSelected ? "rgba(0,212,255,0.35)" : "var(--border)", width: `${c.score}%` }} />
                    </div>
                    {openCtxTip === c.key && (
                      <div style={{ marginTop: "7px", padding: "8px 10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.55 }}>
                        <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>{c.label}</div>
                        <div style={{ marginBottom: "5px" }}>{c.desc}</div>
                        {c.detail && <div style={{ color: "var(--text-muted)", fontSize: "9.5px", lineHeight: 1.6, borderTop: "1px solid var(--border-dim)", paddingTop: "5px" }}>{c.detail}</div>}
                      </div>
                    )}
                    {!c.passes && c.bottleneck && (
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "5px" }}>
                        ↳ bottleneck: {c.bottleneck.label}
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Analysis tab ─── */}
        {tab === "analysis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div style={{ padding: "16px", background: "var(--bg-panel)", borderRadius: "6px", border: `1px solid ${primaryCtx.grade.color}1a` }}>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", lineHeight: 1.6, marginBottom: "12px" }}>
                {narrative.opener}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.5 }}>
                  <span style={{ color: "#00c880" }}>↑</span>{" "}
                  <strong style={{ color: "var(--text)" }}>{narrative.topDim.label}</strong>{" "}
                  is {narrative.strengthAdj} at {narrative.topDim.score} — top driver ({Math.round(narrative.topDim.weight * 100)}% weight).
                </div>
                {narrative.weakLink && (
                  <div style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.5 }}>
                    <span style={{ color: "#ff6060" }}>↓</span>{" "}
                    <strong style={{ color: "var(--text)" }}>{narrative.weakLink.label}</strong>{" "}
                    ({narrative.weakLink.score}) is limiting — {Math.round(narrative.weakLink.weight * 100)}% weight in this context.
                  </div>
                )}
                {narrative.nextCtx && narrative.gapToNext > 0 && (
                  <div style={{ marginTop: "4px", fontSize: "11px", color: narrative.nextCtx.grade.color, padding: "7px 11px", background: `${narrative.nextCtx.grade.color}0c`, borderRadius: "4px", border: `1px solid ${narrative.nextCtx.grade.color}25` }}>
                    +{narrative.gapToNext} pts in <strong>{narrative.nextCtx.label}</strong> context to reach {narrative.nextCtx.grade.label} grade
                  </div>
                )}
              </div>
            </div>

            {/* Dimension breakdown: score × weight = contribution */}
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>Dimension Breakdown</div>
              {DIMS.map(d => {
                const v = scores[d.key] ?? 50;
                const w = W[d.key];
                return (
                  <div key={d.key} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "5px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{d.label}</span>
                      <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--text)" }}>
                        {v} <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>×{Math.round(w * 100)}%</span>{" "}
                        <span style={{ color: "rgba(0,212,255,0.8)", fontWeight: 600 }}>= {Math.round(v * w)}</span>
                      </span>
                    </div>
                    <div style={{ height: "4px", background: "var(--border-dim)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "2px", transition: "width 0.35s", background: v >= 70 ? "#00c880" : v >= 50 ? "#3070b0" : "rgba(0,212,255,0.3)", width: `${v}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Charts tab ─── */}
        {tab === "charts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Radar */}
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Score Profile</div>
              <div style={{ height: "230px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 12, right: 18, bottom: 12, left: 18 }}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: "var(--text-label)", fontFamily: "'Exo 2', sans-serif" }} />
                    <Radar dataKey="v" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.14} strokeWidth={1.5} dot={{ fill: "var(--cyan)", r: 3, strokeWidth: 0 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active weights */}
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "0.22em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>
                Active Weights — {CONTEXTS.find(c => c.key === ctx)?.label || ctx}
              </div>
              {DIMS.map(d => (
                <div key={d.key} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{d.label}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "rgba(0,212,255,0.7)" }}>{Math.round(W[d.key] * 100)}%</span>
                  </div>
                  <div style={{ height: "3px", background: "var(--border-dim)", borderRadius: "2px" }}>
                    <div style={{ height: "100%", borderRadius: "2px", width: `${Math.round(W[d.key] * 100)}%`, background: "rgba(0,212,255,0.4)", transition: "width 0.35s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
