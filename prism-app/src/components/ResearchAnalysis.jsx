import { useMemo, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { HERITAGE_FLAGS } from "../data/prism.js";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  ScatterChart, Scatter, CartesianGrid,
} from "recharts";

// ── Maths helpers ─────────────────────────────────────────────────────────────

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function mean(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function linearRegression(points) {
  const n = points.length;
  if (n < 2) return null;
  const sx  = points.reduce((s, p) => s + p.x, 0);
  const sy  = points.reduce((s, p) => s + p.y, 0);
  const sxy = points.reduce((s, p) => s + p.x * p.y, 0);
  const sx2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sx2 - sx * sx;
  if (!denom) return null;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return { slope, intercept };
}

function logLinearRegression(points) {
  const valid = points.filter(p => p.y > 0);
  if (valid.length < 2) return null;
  return linearRegression(valid.map(p => ({ x: p.x, y: Math.log(p.y) })));
}

// ── Formatting ─────────────────────────────────────────────────────────────────

const fmt  = (n) => n != null ? "$" + Number(n).toLocaleString() : "—";
const fmtK = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n)}`;
const normKey  = s => (s || "Unknown").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const capFirst = s => { const t = (s || "Unknown").trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Unknown"; };

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = "var(--cyan)" }) {
  return (
    <div style={{
      background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "8px",
      padding: "14px 16px", display: "flex", flexDirection: "column", gap: "4px",
    }}>
      <div style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--mono)", color }}>{value}</div>
      {sub && <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "10px", marginTop: "8px" }}>
      {children}
    </div>
  );
}

function EmptyHint({ children }) {
  return (
    <div style={{ padding: "20px", textAlign: "center", fontSize: "11px", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "6px" }}>
      {children}
    </div>
  );
}

// ── Bubble scatter constants ──────────────────────────────────────────────────

const SIZE_NUM   = { thumbnail: 1, miniature: 2, small_cab: 3, cabinet: 4, large_cab: 5, museum: 6 };
const SIZE_SHORT = { 1: "Thumb", 2: "Mini", 3: "S.Cab", 4: "Cabinet", 5: "L.Cab", 6: "Museum" };
const COND_RANK  = { pristine: 5, excellent: 4, good: 3, repaired: 2, damaged: 1 };
const COND_LABEL = { pristine: "Pristine", excellent: "Display", good: "Minor chips", repaired: "Repaired", damaged: "Damaged" };
const BUBBLE_PALETTE = ["#00d4ff", "#7c5cfc", "#00c880", "#ffb347", "#ff8060", "#a0c4ff", "#f472b6"];
const SPECIES_CURVE_COLORS = ["#00d4ff", "#ff6b9d", "#a78bfa", "#fbbf24", "#22d3ee", "#e879f9", "#f97316"];

function BubbleDot({ cx, cy, r, color }) {
  if (cx == null || cy == null) return null;
  return (
    <circle cx={cx} cy={cy} r={r || 6}
      fill={color || "#00d4ff"} fillOpacity={0.78}
      stroke={color || "#00d4ff"} strokeWidth={1} strokeOpacity={0.35} />
  );
}

const CUSTOM_TOOLTIP_STYLE = {
  background: "#0d1625", border: "1px solid #2a3a50", borderRadius: "6px",
  padding: "8px 12px", fontSize: "11px", color: "#cdd6e0",
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function ResearchAnalysis({ comps }) {
  const [driversSpecies, setDriversSpecies] = useState("all");
  const [colorBy, setColorBy] = useState("auto");
  const [priceScale, setPriceScale] = useState("log");
  const [selectedComp, setSelectedComp] = useState(null);
  const analysis = useMemo(() => {
    const priced  = comps.filter(c => Number(c.askingPrice) > 0);
    const scored  = comps.filter(c => c.prismScore != null);
    const pricedAndScored = scored.filter(c => Number(c.askingPrice) > 0);
    const prices  = priced.map(c => Number(c.askingPrice));

    // ── Price stats ──────────────────────────────────────────────────────────
    const avgPrice  = prices.length ? mean(prices) : null;
    const medPrice  = prices.length ? median(prices) : null;
    const minPrice  = prices.length ? Math.min(...prices) : null;
    const maxPrice  = prices.length ? Math.max(...prices) : null;

    // ── By species ───────────────────────────────────────────────────────────
    const speciesMap = {};
    priced.forEach(c => {
      const key = normKey(c.species);
      if (!speciesMap[key]) speciesMap[key] = { display: capFirst(c.species), prices: [] };
      speciesMap[key].prices.push(Number(c.askingPrice));
    });
    const bySpecies = Object.values(speciesMap)
      .map(({ display, prices: ps }) => ({ species: display, avg: Math.round(mean(ps)), median: Math.round(median(ps)), count: ps.length }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);

    // ── By size class ─────────────────────────────────────────────────────────
    const sizeMap = {};
    priced.forEach(c => {
      const sz = c.sizeClass || "unknown";
      if (!sizeMap[sz]) sizeMap[sz] = [];
      sizeMap[sz].push(Number(c.askingPrice));
    });
    const SIZE_ORDER = ["thumbnail","miniature","small_cab","cabinet","large_cab","museum"];
    const SIZE_LABELS = { thumbnail:"Thumb", miniature:"Mini", small_cab:"SmCab", cabinet:"Cabinet", large_cab:"LgCab", museum:"Museum" };
    const bySize = SIZE_ORDER
      .filter(k => sizeMap[k]?.length)
      .map(k => ({ size: SIZE_LABELS[k] || k, avg: Math.round(mean(sizeMap[k])), count: sizeMap[k].length }));

    // ── By locality (avg price) ──────────────────────────────────────────────
    const shortLocality = (str) => {
      if (!str) return "";
      const parts = str.split(",").map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return str;
      const label = parts[0] || (parts.length > 2 ? parts[parts.length - 2] : parts[parts.length - 1]);
      return label.replace(/\s+mine\b.*/i, "").trim();
    };
    const localityAvgMap = {};
    priced.forEach(c => {
      const short = shortLocality(c.locality);
      const key = normKey(short);
      if (!key || key === "unknown") return;
      if (!localityAvgMap[key]) localityAvgMap[key] = { display: short, prices: [] };
      localityAvgMap[key].prices.push(Number(c.askingPrice));
    });
    const byLocalityAvg = Object.values(localityAvgMap)
      .map(({ display, prices: ps }) => ({ locality: display, short: display, avg: Math.round(mean(ps)), median: Math.round(median(ps)), count: ps.length }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);

    // ── By source ─────────────────────────────────────────────────────────────
    const sourceMap = {};
    priced.forEach(c => {
      const src = c.source?.trim() || "Unknown";
      if (!sourceMap[src]) sourceMap[src] = [];
      sourceMap[src].push(Number(c.askingPrice));
    });
    const bySource = Object.entries(sourceMap)
      .map(([src, ps]) => ({ source: src, avg: Math.round(mean(ps)), count: ps.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // ── Score stats ───────────────────────────────────────────────────────────
    const scoredScores = scored.map(c => c.prismScore);
    const avgScore = scoredScores.length ? Math.round(mean(scoredScores)) : null;

    // ── Regression + market position ─────────────────────────────────────────
    const regPoints = pricedAndScored.map(c => ({ x: c.prismScore, y: Number(c.askingPrice), label: c.species || "?" }));
    const reg = logLinearRegression(regPoints);
    const regCurve = reg && regPoints.length >= 2 ? (() => {
      const xs = regPoints.map(p => p.x);
      const x0 = Math.min(...xs), x1 = Math.max(...xs);
      return Array.from({ length: 40 }, (_, i) => {
        const x = x0 + (i / 39) * (x1 - x0);
        return { x: Math.round(x * 10) / 10, y: Math.round(Math.exp(reg.slope * x + reg.intercept)), _curve: true };
      });
    })() : null;

    // Per-species regressions
    const speciesGroups = {};
    pricedAndScored.forEach(c => {
      const key = normKey(c.species);
      if (!speciesGroups[key]) speciesGroups[key] = { display: capFirst(c.species), pts: [] };
      speciesGroups[key].pts.push({ x: c.prismScore, y: Number(c.askingPrice) });
    });
    let colorIdx = 0;
    const speciesRegs = {};
    Object.entries(speciesGroups).forEach(([key, { display, pts }]) => {
      if (pts.length < 3) return;
      const r = logLinearRegression(pts);
      if (!r) return;
      const xs = pts.map(p => p.x);
      const x0 = Math.min(...xs), x1 = Math.max(...xs);
      const curve = Array.from({ length: 40 }, (_, i) => {
        const x = x0 + (i / 39) * (x1 - x0);
        return { x: Math.round(x * 10) / 10, y: Math.round(Math.exp(r.slope * x + r.intercept)), _curve: true };
      });
      speciesRegs[key] = { reg: r, color: SPECIES_CURVE_COLORS[colorIdx++ % SPECIES_CURVE_COLORS.length], curve, display };
    });
    const hasSpeciesCurves = Object.keys(speciesRegs).length >= 2;

    const marketPosition = pricedAndScored.map(c => {
      const key = normKey(c.species);
      const activeReg = speciesRegs[key]?.reg || reg;
      const expectedPrice = activeReg ? Math.max(0, Math.round(Math.exp(activeReg.slope * c.prismScore + activeReg.intercept))) : null;
      const delta = expectedPrice != null ? Number(c.askingPrice) - expectedPrice : null;
      const pct   = expectedPrice ? Math.round((delta / expectedPrice) * 100) : null;
      return { ...c, expectedPrice, delta, pct };
    }).sort((a, b) => (a.pct ?? 999) - (b.pct ?? 999));

    // Locality premium analysis (score-adjusted)
    const localityMap = {};
    pricedAndScored.forEach(c => {
      const key = normKey(c.locality);
      if (!localityMap[key]) localityMap[key] = { display: capFirst(c.locality), items: [] };
      localityMap[key].items.push(c);
    });
    const byLocality = Object.values(localityMap)
      .map(({ display, items }) => {
        const avgActual = Math.round(mean(items.map(c => Number(c.askingPrice))));
        const avgScore  = Math.round(mean(items.map(c => c.prismScore)));
        const species   = [...new Set(items.map(c => capFirst(c.species)).filter(Boolean))];
        const premiums  = items.map(c => {
          const key = normKey(c.species);
          const activeReg = speciesRegs[key]?.reg || reg;
          if (!activeReg) return null;
          const expected = Math.exp(activeReg.slope * c.prismScore + activeReg.intercept);
          return (Number(c.askingPrice) - expected) / expected * 100;
        }).filter(x => x != null);
        const avgPremium = premiums.length ? Math.round(mean(premiums)) : null;
        return { loc: display, count: items.length, avgActual, avgScore, avgPremium, species };
      })
      .filter(x => x.avgPremium != null && x.count >= 2)
      .sort((a, b) => a.avgPremium - b.avgPremium);

    // ── Condition premium (score-adjusted) ───────────────────────────────────
    const COND_ORDER = ["pristine", "excellent", "good", "repaired", "damaged"];
    const byCondition = COND_ORDER.map(cond => {
      const items = pricedAndScored.filter(c => c.condition === cond);
      if (!items.length) return null;
      const premiums = items.map(c => {
        const key = normKey(c.species);
        const activeReg = speciesRegs[key]?.reg || reg;
        if (!activeReg) return null;
        const expected = Math.exp(activeReg.slope * c.prismScore + activeReg.intercept);
        return (Number(c.askingPrice) - expected) / expected * 100;
      }).filter(x => x != null);
      if (!premiums.length) return null;
      return { cond, count: items.length, avgPremium: Math.round(mean(premiums)), avgActual: Math.round(mean(items.map(c => Number(c.askingPrice)))) };
    }).filter(Boolean);

    // ── Heritage / cultural premium (score-adjusted) ─────────────────────────
    const byHeritage = HERITAGE_FLAGS.map(f => {
      const items = pricedAndScored.filter(c => c.heritageFlags?.includes(f.key));
      if (!items.length) return null;
      const premiums = items.map(c => {
        const key = normKey(c.species);
        const activeReg = speciesRegs[key]?.reg || reg;
        if (!activeReg) return null;
        const expected = Math.exp(activeReg.slope * c.prismScore + activeReg.intercept);
        return (Number(c.askingPrice) - expected) / expected * 100;
      }).filter(x => x != null);
      if (!premiums.length) return null;
      return { ...f, count: items.length, avgPremium: Math.round(mean(premiums)), avgActual: Math.round(mean(items.map(c => Number(c.askingPrice)))) };
    }).filter(Boolean);

    return { priced, scored, pricedAndScored, avgPrice, medPrice, minPrice, maxPrice,
             bySpecies, byLocalityAvg, bySize, bySource, avgScore, regPoints, regCurve, marketPosition, reg,
             speciesRegs, hasSpeciesCurves, byLocality, byCondition, byHeritage };
  }, [comps]);

  const speciesList = useMemo(() => {
    const seen = new Map();
    comps.forEach(c => {
      if (c.species) {
        const key = c.species.trim().toLowerCase();
        if (!seen.has(key)) seen.set(key, capFirst(c.species));
      }
    });
    return [...seen.values()].sort();
  }, [comps]);

  const { bubbleData, colorDimLabel, topColorValues } = useMemo(() => {
    const base = comps.filter(c => Number(c.askingPrice) > 0);
    const filtered = driversSpecies === "all" ? base : base.filter(c => normKey(c.species) === normKey(driversSpecies));
    const colorDim = colorBy === "source" ? "source"
      : driversSpecies === "all" ? "species" : "locality";
    const colorDimLabel = colorBy === "source" ? "vendor"
      : driversSpecies === "all" ? "species" : "locality";

    const colorDisplayMap = {};
    const counts = {};
    filtered.forEach(c => {
      const raw = (c[colorDim] || "Unknown").trim() || "Unknown";
      const key = raw.toLowerCase();
      if (!colorDisplayMap[key]) colorDisplayMap[key] = capFirst(raw);
      counts[key] = (counts[key] || 0) + 1;
    });
    const topColorKeys = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k]) => k);
    const topColorValues = topColorKeys.map(k => colorDisplayMap[k] || k);

    const bubbleData = filtered.map((c, i) => {
      const raw = (c[colorDim] || "Unknown").trim() || "Unknown";
      const colorKey = raw.toLowerCase();
      const colorLabel = colorDisplayMap[colorKey] || capFirst(raw);
      const colorIdx = topColorKeys.indexOf(colorKey);
      const color = colorIdx >= 0 ? BUBBLE_PALETTE[colorIdx] : "#3d4f60";
      const sizeNum = SIZE_NUM[c.sizeClass] || 2;
      const jitter = ((i * 0.6180339887) % 1 - 0.5) * 0.38;
      const condRank = COND_RANK[c.condition] || 3;
      return {
        id: c.id, x: sizeNum + jitter, y: Number(c.askingPrice),
        color, colorLabel,
        species: c.species || "Unknown", locality: c.locality || "Unknown",
        source: c.source || "Unknown",
        sizeLabel: SIZE_SHORT[sizeNum] || c.sizeClass,
        condition: c.condition || "unknown",
        r: 5 + condRank * 2,
        prismScore: c.prismScore ?? null,
      };
    });

    return { bubbleData, colorDimLabel, topColorValues };
  }, [comps, driversSpecies, colorBy]);

  const { priced, scored, pricedAndScored, avgPrice, medPrice, minPrice, maxPrice,
          bySpecies, byLocalityAvg, bySize, bySource, avgScore, regPoints, regCurve, marketPosition, reg,
          speciesRegs, hasSpeciesCurves, byLocality, byCondition, byHeritage } = analysis;

  const insights = useMemo(() => {
    const tips = [];

    // Entry count
    if (comps.length < 40) {
      tips.push({ level: "info",
        text: `${comps.length} listing${comps.length !== 1 ? "s" : ""} total — aim for 40+ to make averages statistically meaningful.` });
    }

    // Unscored priced listings
    const unscoredPriced = comps.filter(c => c.prismScore == null && Number(c.askingPrice) > 0).length;
    if (unscoredPriced > 0) {
      tips.push({ level: "warn",
        text: `${unscoredPriced} priced listing${unscoredPriced !== 1 ? "s are" : " is"} unscored — score ${unscoredPriced !== 1 ? "them" : "it"} with PRISM to include in regression and market position analysis.` });
    }

    // Species depth for regression curves
    const spCounts = {};
    pricedAndScored.forEach(c => {
      const k = normKey(c.species); spCounts[k] = (spCounts[k] || 0) + 1;
    });
    const thinKeys = Object.entries(spCounts).filter(([, n]) => n < 3).map(([k]) => k);
    if (thinKeys.length > 0 && Object.keys(spCounts).length > 1) {
      const names = thinKeys.slice(0, 2).map(k => pricedAndScored.find(c => normKey(c.species) === k)?.species || k);
      const tail = thinKeys.length > 2 ? ` +${thinKeys.length - 2} more` : "";
      tips.push({ level: "warn",
        text: `${names.join(", ")}${tail} ${thinKeys.length === 1 ? "has" : "have"} fewer than 3 scored entries — each species needs 3+ for its own price curve.` });
    }

    // Score ceiling — regression extrapolation warning
    if (pricedAndScored.length >= 5) {
      const maxScore = Math.max(...pricedAndScored.map(c => c.prismScore));
      if (maxScore < 78) {
        tips.push({ level: "warn",
          text: `Highest scored listing is ${maxScore}/100 — regression is extrapolating above that. Add high-end dealer listings (Collector's Edge, Kristalle, Crystal Classics) to anchor the 80–95 range.` });
      }
    }

    // Heritage flags unused
    const flagged = comps.filter(c => c.heritageFlags?.length > 0).length;
    if (flagged === 0 && comps.length >= 8) {
      tips.push({ level: "tip",
        text: "No heritage flags set. Tag named-collection, postage-stamp, or show-award specimens to measure the real premium those provenance markers carry." });
    }

    // Condition variety
    if (pricedAndScored.length >= 10) {
      const conds = new Set(pricedAndScored.map(c => c.condition).filter(Boolean));
      if (conds.size < 3) {
        tips.push({ level: "tip",
          text: "Most listings share the same condition rating — mix in pristine through damaged examples of the same species to unlock meaningful condition premium data." });
      }
    }

    // Locality depth
    if (byLocality.length === 0 && pricedAndScored.length >= 8) {
      tips.push({ level: "tip",
        text: "Locality Premium needs 2+ scored listings per locality. Add multiple specimens from the same mine (Tsumeb, Broken Hill, Herja) to compare locality premiums directly." });
    }

    // Sort: warn first, then tip, then info
    const order = { warn: 0, tip: 1, info: 2 };
    return tips.sort((a, b) => order[a.level] - order[b.level]).slice(0, 5);
  }, [comps, pricedAndScored, byLocality]);

  if (!comps.length) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "14px" }}>Add some listings first, then come back here for analysis.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Smart Insights ─────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <div>
          <SectionTitle>Smart Insights</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {insights.map((tip, i) => {
              const borderColor = tip.level === "warn" ? "rgba(255,160,40,0.35)" : tip.level === "tip" ? "rgba(167,139,250,0.3)" : "rgba(0,212,255,0.2)";
              const bgColor    = tip.level === "warn" ? "rgba(255,160,40,0.04)"  : tip.level === "tip" ? "rgba(167,139,250,0.05)" : "rgba(0,212,255,0.04)";
              const dotColor   = tip.level === "warn" ? "#ffa028"               : tip.level === "tip" ? "#a78bfa"               : "var(--cyan)";
              return (
                <div key={i} style={{
                  display: "flex", gap: "10px", padding: "9px 12px",
                  background: bgColor, border: `1px solid ${borderColor}`, borderRadius: "5px",
                  borderLeft: `3px solid ${dotColor}`,
                }}>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.55 }}>{tip.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Price summary ──────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Price Summary — {priced.length} priced listing{priced.length !== 1 ? "s" : ""}</SectionTitle>
        {!priced.length ? (
          <EmptyHint>No listings have prices yet. Add asking prices to see analysis.</EmptyHint>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
            <StatCard label="Avg Price"   value={fmtK(avgPrice)}                                color="var(--cyan)" />
            <StatCard label="Median"      value={fmtK(medPrice)}                                color="var(--cyan)" />
            <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Range</div>
              <div style={{ fontSize: "15px", fontWeight: 700, fontFamily: "var(--mono)", color: "#a0b4cc" }}>{fmtK(minPrice)}</div>
              {maxPrice > minPrice ? (
                <>
                  <div style={{ height: "4px", background: "var(--border-dim)", borderRadius: "2px", position: "relative", margin: "2px 0" }}>
                    <div style={{ position: "absolute", inset: 0, background: "rgba(160,180,204,0.15)", borderRadius: "2px" }} />
                    {avgPrice != null && <div style={{ position: "absolute", left: `${((avgPrice - minPrice) / (maxPrice - minPrice)) * 100}%`, top: "-2px", transform: "translateX(-50%)", width: "2px", height: "8px", background: "var(--cyan)", borderRadius: "1px" }} />}
                    {medPrice != null && <div style={{ position: "absolute", left: `${((medPrice - minPrice) / (maxPrice - minPrice)) * 100}%`, top: "-2px", transform: "translateX(-50%)", width: "2px", height: "8px", background: "#a0b4cc", borderRadius: "1px" }} />}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>to {fmtK(maxPrice)}</div>
                </>
              ) : (
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>single price</div>
              )}
            </div>
            <StatCard label="Scored"      value={scored.length}   sub={`of ${comps.length} total`} color={scored.length ? "#00c880" : "var(--text-muted)"} />
            {avgScore != null && <StatCard label="Avg PRISM" value={avgScore} sub="out of 100" color="#7c5cfc" />}
          </div>
        )}
      </div>

      {/* ── By species ─────────────────────────────────────────────────── */}
      {bySpecies.length >= 2 && (
        <div>
          <SectionTitle>Avg Price by Species (top {bySpecies.length})</SectionTitle>
          <ResponsiveContainer width="100%" height={Math.max(140, bySpecies.length * 34)}>
            <BarChart data={bySpecies} layout="vertical" margin={{ left: 8, right: 40, top: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#1e2d3d" />
              <XAxis type="number" dataKey="avg" tickFormatter={fmtK} tick={{ fill: "#6a7f94", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="species" width={110} tick={{ fill: "#8899aa", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(0,212,255,0.04)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={CUSTOM_TOOLTIP_STYLE}>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{d.species}</div>
                      <div>Avg: <strong>{fmt(d.avg)}</strong></div>
                      <div>Median: {fmt(d.median)}</div>
                      <div style={{ color: "#6a7f94" }}>{d.count} listing{d.count !== 1 ? "s" : ""}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="avg" radius={[0, 3, 3, 0]}>
                {bySpecies.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#00d4ff" : `rgba(0,212,255,${0.65 - i * 0.05})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── By locality (avg price) ───────────────────────────────────── */}
      {byLocalityAvg.length >= 2 && (
        <div>
          <SectionTitle>Avg Price by Locality (top {byLocalityAvg.length})</SectionTitle>
          <ResponsiveContainer width="100%" height={Math.max(140, byLocalityAvg.length * 34)}>
            <BarChart data={byLocalityAvg} layout="vertical" margin={{ left: 8, right: 40, top: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#1e2d3d" />
              <XAxis type="number" dataKey="avg" tickFormatter={fmtK} tick={{ fill: "#6a7f94", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="short" width={110} tick={{ fill: "#8899aa", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(0,212,255,0.04)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={CUSTOM_TOOLTIP_STYLE}>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{d.locality}</div>
                      <div>Avg: <strong>{fmt(d.avg)}</strong></div>
                      <div>Median: {fmt(d.median)}</div>
                      <div style={{ color: "#6a7f94" }}>{d.count} listing{d.count !== 1 ? "s" : ""}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="avg" radius={[0, 3, 3, 0]}>
                {byLocalityAvg.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#7c5cfc" : `rgba(124,92,252,${0.75 - i * 0.05})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── By size class ──────────────────────────────────────────────── */}
      {bySize.length >= 2 && (
        <div>
          <SectionTitle>Avg Price by Size Class</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={bySize} margin={{ left: 0, right: 20, top: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#1e2d3d" />
              <XAxis dataKey="size" tick={{ fill: "#8899aa", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fill: "#6a7f94", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(0,212,255,0.04)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={CUSTOM_TOOLTIP_STYLE}>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{d.size}</div>
                      <div>Avg: <strong>{fmt(d.avg)}</strong></div>
                      <div style={{ color: "#6a7f94" }}>{d.count} listing{d.count !== 1 ? "s" : ""}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="avg" fill="rgba(124,92,252,0.8)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Price vs PRISM score scatter ───────────────────────────────── */}
      {regPoints.length >= 3 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px", marginTop: "8px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Price vs PRISM Score — {regPoints.length} scored listings
            </div>
            <div style={{ display: "flex", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border)" }}>
              {[["log", "Log"], ["linear", "Linear"]].map(([val, label]) => (
                <button key={val} onClick={() => setPriceScale(val)} style={{
                  padding: "2px 9px", fontSize: "10px", border: "none",
                  background: priceScale === val ? "rgba(0,212,255,0.12)" : "transparent",
                  color: priceScale === val ? "var(--cyan)" : "var(--text-muted)",
                  fontWeight: priceScale === val ? 600 : 400,
                  borderRight: val === "log" ? "1px solid var(--border)" : "none",
                  cursor: "pointer", transition: "all 0.15s",
                }}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px" }}>
            {priceScale === "log"
              ? <><em>Log scale</em>: straight lines per species confirm exponential growth. <span style={{ color: "#00c880" }}>Below</span> = underpriced · <span style={{ color: "#ff8060" }}>Above</span> = premium.</>
              : <><em>Linear scale</em>: each curve shows exponential price growth for that species. <span style={{ color: "#00c880" }}>Below</span> = underpriced · <span style={{ color: "#ff8060" }}>Above</span> = premium.</>
            }
          </div>
          {hasSpeciesCurves && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
              {Object.entries(speciesRegs).map(([key, { color, display }]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "var(--text-muted)" }}>
                  <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke={color} strokeWidth="1.5" strokeDasharray="4 2" /></svg>
                  {display}
                </div>
              ))}
            </div>
          )}
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ left: 0, right: 20, top: 8, bottom: 18 }}>
              <CartesianGrid stroke="#1e2d3d" />
              <XAxis type="number" dataKey="x" name="PRISM Score" domain={["auto", "auto"]}
                tick={{ fill: "#8899aa", fontSize: 10 }} axisLine={false} tickLine={false}
                label={{ value: "PRISM Score", position: "insideBottom", offset: -8, fill: "#6a7f94", fontSize: 9 }} />
              <YAxis type="number" dataKey="y" name="Price" tickFormatter={fmtK}
                scale={priceScale === "log" ? "log" : "auto"}
                domain={priceScale === "log" ? ["auto", "auto"] : [0, "auto"]}
                tick={{ fill: "#6a7f94", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3", stroke: "#2a3a50" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  if (d._curve) return null;
                  const key = normKey(d.label);
                  const activeReg = speciesRegs[key]?.reg || reg;
                  const expected = activeReg ? Math.round(Math.exp(activeReg.slope * d.x + activeReg.intercept)) : null;
                  return (
                    <div style={CUSTOM_TOOLTIP_STYLE}>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{d.label}</div>
                      <div>Score: <strong>{d.x}</strong></div>
                      <div>Price: <strong>{fmt(d.y)}</strong></div>
                      {expected && <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Expected: {fmt(expected)}</div>}
                    </div>
                  );
                }}
              />
              {hasSpeciesCurves
                ? Object.entries(speciesRegs).map(([key, { curve, color }]) => (
                    <Scatter key={key} data={curve} fill="transparent"
                      line={{ stroke: color, strokeWidth: 1.5, strokeDasharray: "5 3" }}
                      shape={() => <g />} isAnimationActive={false}
                    />
                  ))
                : regCurve && (
                    <Scatter data={regCurve} fill="transparent"
                      line={{ stroke: "rgba(0,212,255,0.4)", strokeWidth: 1.5, strokeDasharray: "5 3" }}
                      shape={() => <g />} isAnimationActive={false}
                    />
                  )
              }
              <Scatter data={regPoints} fill="#00d4ff">
                {regPoints.map((p, i) => {
                  const key = normKey(p.label);
                  const spEntry = speciesRegs[key];
                  const activeReg = spEntry?.reg || reg;
                  const neutralColor = spEntry?.color || "#00d4ff";
                  const expected = activeReg ? Math.exp(activeReg.slope * p.x + activeReg.intercept) : p.y;
                  const color = p.y < expected * 0.9 ? "#00c880" : p.y > expected * 1.1 ? "#ff8060" : neutralColor;
                  return <Cell key={i} fill={color} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
      {regPoints.length > 0 && regPoints.length < 3 && (
        <EmptyHint>Score {3 - regPoints.length} more listing{3 - regPoints.length !== 1 ? "s" : ""} with PRISM to unlock the Price vs Score chart.</EmptyHint>
      )}

      {/* ── Market position table ──────────────────────────────────────── */}
      {marketPosition.length >= 2 && (
        <div>
          <SectionTitle>Market Position — scored listings vs expected price</SectionTitle>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "8px" }}>
            Expected price is estimated from a log-linear regression — price grows exponentially with score.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {marketPosition.map(c => (
              <div key={c.id} onClick={() => setSelectedComp(c)} style={{
                display: "grid", gridTemplateColumns: "1fr 72px 72px 72px 80px", gap: "8px",
                alignItems: "center", padding: "8px 12px",
                background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "6px",
                fontSize: "11px", cursor: "pointer", transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.35)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--text)", fontWeight: 600 }}>{c.species || "Unknown"}</span>
                  {c.locality && <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>{c.locality}</span>}
                </div>
                <div style={{ fontFamily: "var(--mono)", color: "var(--text-dim)", textAlign: "right" }}>{fmt(c.askingPrice)}</div>
                <div style={{ fontFamily: "var(--mono)", color: "#7c5cfc", textAlign: "right" }}>{c.prismScore}</div>
                <div style={{ fontFamily: "var(--mono)", color: "var(--text-muted)", textAlign: "right" }}>{fmt(c.expectedPrice)}</div>
                <div style={{ textAlign: "right" }}>
                  {c.pct != null && (
                    <span style={{
                      padding: "2px 7px", borderRadius: "3px", fontFamily: "var(--mono)", fontWeight: 600,
                      fontSize: "10px",
                      background: c.pct < -10 ? "rgba(0,200,128,0.12)" : c.pct > 10 ? "rgba(255,128,96,0.12)" : "rgba(170,170,170,0.08)",
                      color:      c.pct < -10 ? "#00c880"              : c.pct > 10 ? "#ff8060"              : "#8899aa",
                      border:     `1px solid ${c.pct < -10 ? "rgba(0,200,128,0.3)" : c.pct > 10 ? "rgba(255,128,96,0.3)" : "var(--border)"}`,
                    }}>
                      {c.pct > 0 ? "+" : ""}{c.pct}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "10px", color: "var(--text-muted)" }}>
            <span><span style={{ color: "#00c880" }}>●</span> &gt;10% below expected — potentially underpriced</span>
            <span><span style={{ color: "#ff8060" }}>●</span> &gt;10% above — priced at a premium</span>
          </div>
        </div>
      )}

      {/* ── Locality premium ────────────────────────────────────────────── */}
      {byLocality.length >= 2 && (() => {
        const maxAbs = Math.max(...byLocality.map(l => Math.abs(l.avgPremium ?? 0)), 10);
        return (
          <div>
            <SectionTitle>Locality Premium — Score-Adjusted</SectionTitle>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "10px", lineHeight: 1.6 }}>
              Each specimen's actual price is compared to what the <em>species-specific</em> regression
              predicts for that PRISM score — so Tsumeb Wulfenite is always benchmarked against other
              Wulfenite, never mixed with Rhodochrosite. The % shown is the average deviation across
              all scored specimens from that locality (min. 2 required).
              <span style={{ color: "#00c880" }}> Green</span> = priced below species expectation ·
              <span style={{ color: "#ff8060" }}> Orange</span> = locality commands a premium.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {byLocality.map(l => {
                const pct = l.avgPremium ?? 0;
                const color = pct > 10 ? "#ff8060" : pct < -10 ? "#00c880" : "#8899aa";
                const cappedPct = Math.max(-maxAbs, Math.min(maxAbs, pct));
                const halfW = (Math.abs(cappedPct) / maxAbs) * 48;
                const barStyle = cappedPct >= 0
                  ? { left: "50%", width: `${halfW}%` }
                  : { left: `${50 - halfW}%`, width: `${halfW}%` };
                return (
                  <div key={l.loc} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "145px", flexShrink: 0 }}>
                      <div style={{ fontSize: "11px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={l.loc}>{l.loc}</div>
                      <div style={{ display: "flex", gap: "3px", marginTop: "2px", flexWrap: "wrap" }}>
                        {l.species.map(sp => (
                          <span key={sp} style={{ fontSize: "8px", padding: "0px 4px", background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.18)", borderRadius: "2px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{sp}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ flex: 1, height: "8px", background: "var(--border-dim)", borderRadius: "4px", position: "relative" }}>
                      <div style={{ position: "absolute", left: "50%", top: 0, width: "1px", height: "100%", background: "var(--border)", zIndex: 1 }} />
                      <div style={{ position: "absolute", ...barStyle, top: 0, height: "100%", background: color, borderRadius: "2px", opacity: 0.7 }} />
                    </div>
                    <div style={{ width: "38px", textAlign: "right", fontSize: "10px", fontFamily: "var(--mono)", fontWeight: 600, color }}>
                      {pct > 0 ? "+" : ""}{pct}%
                    </div>
                    <div style={{ width: "48px", textAlign: "right", fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--mono)" }}>
                      {fmtK(l.avgActual)}
                    </div>
                    <div style={{ width: "22px", textAlign: "right", fontSize: "9px", color: "var(--border)", fontFamily: "var(--mono)" }}>
                      ×{l.count}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "9px", color: "var(--text-muted)", opacity: 0.7 }}>
              <span>Score used: avg {Math.round(mean(byLocality.map(l => l.avgScore)))} across localities</span>
              <span>Bars scaled to ±{maxAbs}%</span>
            </div>
          </div>
        );
      })()}

      {/* ── By source ──────────────────────────────────────────────────── */}
      {bySource.length >= 2 && (() => {
        const maxAvg = Math.max(...bySource.map(x => x.avg));
        const sorted = [...bySource].sort((a, b) => b.avg - a.avg);
        return (
          <div>
            <SectionTitle>By Source</SectionTitle>
            <div style={{ display: "flex", gap: "14px", marginBottom: "8px", fontSize: "10px", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "18px", height: "8px", background: "rgba(0,212,255,0.5)", borderRadius: "2px" }} />
                <span>Avg price (relative)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "18px", height: "4px", background: "rgba(0,212,255,0.2)", borderRadius: "2px" }} />
                <span>Listing share</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
              <div style={{ width: "110px", flexShrink: 0 }} />
              <div style={{ flex: 1 }} />
              <div style={{ width: "28px", textAlign: "right" }}>n</div>
              <div style={{ width: "56px", textAlign: "right" }}>avg</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {sorted.map(s => {
                const avgPct = Math.round((s.avg / maxAvg) * 100);
                const countPct = Math.round((s.count / priced.length) * 100);
                return (
                  <div key={s.source} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px" }}>
                    <div style={{ width: "110px", flexShrink: 0, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.source}</div>
                    <div style={{ flex: 1, height: "8px", background: "var(--border-dim)", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
                      <div style={{ height: "100%", width: `${avgPct}%`, background: "rgba(0,212,255,0.5)", borderRadius: "4px" }} />
                      <div style={{ position: "absolute", top: "2px", left: 0, height: "4px", width: `${countPct}%`, background: "rgba(0,212,255,0.2)", borderRadius: "2px" }} />
                    </div>
                    <div style={{ width: "28px", textAlign: "right", color: "var(--text-muted)", fontSize: "10px", fontFamily: "var(--mono)" }}>{s.count}</div>
                    <div style={{ width: "56px", textAlign: "right", color: "var(--text-muted)", fontSize: "10px", fontFamily: "var(--mono)" }}>{fmtK(s.avg)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Condition Premium ────────────────────────────────────────────── */}
      {byCondition.length >= 2 && (() => {
        const maxAbs = Math.max(...byCondition.map(c => Math.abs(c.avgPremium ?? 0)), 10);
        return (
          <div>
            <SectionTitle>Condition Premium — Score-Adjusted</SectionTitle>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "10px", lineHeight: 1.6 }}>
              Actual price vs the species-specific regression expectation, grouped by condition.
              Answers whether "pristine" listings truly command more beyond what their PRISM score already predicts.
              <span style={{ color: "#00c880" }}> Green</span> = priced below expectation ·
              <span style={{ color: "#ff8060" }}> Orange</span> = condition carries a real premium.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {byCondition.map(item => {
                const pct = item.avgPremium ?? 0;
                const color = pct > 10 ? "#ff8060" : pct < -10 ? "#00c880" : "#8899aa";
                const cappedPct = Math.max(-maxAbs, Math.min(maxAbs, pct));
                const halfW = (Math.abs(cappedPct) / maxAbs) * 48;
                const barStyle = cappedPct >= 0
                  ? { left: "50%", width: `${halfW}%` }
                  : { left: `${50 - halfW}%`, width: `${halfW}%` };
                return (
                  <div key={item.cond} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "145px", flexShrink: 0 }}>
                      <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{COND_LABEL[item.cond] || item.cond}</div>
                    </div>
                    <div style={{ flex: 1, height: "8px", background: "var(--border-dim)", borderRadius: "4px", position: "relative" }}>
                      <div style={{ position: "absolute", left: "50%", top: 0, width: "1px", height: "100%", background: "var(--border)", zIndex: 1 }} />
                      <div style={{ position: "absolute", ...barStyle, top: 0, height: "100%", background: color, borderRadius: "2px", opacity: 0.7 }} />
                    </div>
                    <div style={{ width: "38px", textAlign: "right", fontSize: "10px", fontFamily: "var(--mono)", fontWeight: 600, color }}>
                      {pct > 0 ? "+" : ""}{pct}%
                    </div>
                    <div style={{ width: "48px", textAlign: "right", fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--mono)" }}>
                      {fmtK(item.avgActual)}
                    </div>
                    <div style={{ width: "22px", textAlign: "right", fontSize: "9px", color: "var(--border)", fontFamily: "var(--mono)" }}>
                      ×{item.count}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", opacity: 0.7, marginTop: "8px" }}>
              Bars scaled to ±{maxAbs}% · Requires scored + priced listings per condition level
            </div>
          </div>
        );
      })()}

      {/* ── Heritage / Cultural Premium ──────────────────────────────────── */}
      {byHeritage.length >= 1 && (() => {
        const maxAbs = Math.max(...byHeritage.map(h => Math.abs(h.avgPremium ?? 0)), 10);
        return (
          <div>
            <SectionTitle>Heritage &amp; Cultural Premium — Score-Adjusted</SectionTitle>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "10px", lineHeight: 1.6 }}>
              Price premium for specimens with documented cultural or historical significance, controlling for PRISM score.
              A postage stamp feature or named-collection provenance that adds +60% above a score-equivalent specimen
              represents real, quantifiable collector value.
              <span style={{ color: "#ff8060" }}> Orange</span> = flag carries a measurable market premium.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {byHeritage.map(item => {
                const pct = item.avgPremium ?? 0;
                const color = pct > 10 ? "#ff8060" : pct < -10 ? "#00c880" : "#8899aa";
                const cappedPct = Math.max(-maxAbs, Math.min(maxAbs, pct));
                const halfW = (Math.abs(cappedPct) / maxAbs) * 48;
                const barStyle = cappedPct >= 0
                  ? { left: "50%", width: `${halfW}%` }
                  : { left: `${50 - halfW}%`, width: `${halfW}%` };
                return (
                  <div key={item.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "145px", flexShrink: 0 }}>
                      <div style={{ fontSize: "11px", color: "#a78bfa" }}>{item.label}</div>
                    </div>
                    <div style={{ flex: 1, height: "8px", background: "var(--border-dim)", borderRadius: "4px", position: "relative" }}>
                      <div style={{ position: "absolute", left: "50%", top: 0, width: "1px", height: "100%", background: "var(--border)", zIndex: 1 }} />
                      <div style={{ position: "absolute", ...barStyle, top: 0, height: "100%", background: color, borderRadius: "2px", opacity: 0.7 }} />
                    </div>
                    <div style={{ width: "38px", textAlign: "right", fontSize: "10px", fontFamily: "var(--mono)", fontWeight: 600, color }}>
                      {pct > 0 ? "+" : ""}{pct}%
                    </div>
                    <div style={{ width: "48px", textAlign: "right", fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--mono)" }}>
                      {fmtK(item.avgActual)}
                    </div>
                    <div style={{ width: "22px", textAlign: "right", fontSize: "9px", color: "var(--border)", fontFamily: "var(--mono)" }}>
                      ×{item.count}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", opacity: 0.7, marginTop: "8px" }}>
              Bars scaled to ±{maxAbs}% · Requires scored + priced listings with heritage flags set
            </div>
          </div>
        );
      })()}
      {byHeritage.length === 0 && pricedAndScored.length >= 3 && (
        <EmptyHint>Tag scored listings with Heritage / Cultural flags (in the listing form) to unlock the Heritage Premium chart.</EmptyHint>
      )}

      {/* ── Listing card modal ─────────────────────────────────────────── */}
      {selectedComp && (
        <>
          <div onClick={() => setSelectedComp(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            zIndex: 201, width: "min(480px, 92vw)",
            background: "var(--bg-panel)", border: "1px solid var(--border)",
            borderRadius: "10px", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          }}>
            {(selectedComp.photo || selectedComp.photoUrl) && (
              <div style={{ position: "relative", height: "200px", background: "#0a111c" }}>
                <img src={selectedComp.photo || selectedComp.photoUrl} alt="specimen"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={e => { e.currentTarget.parentElement.style.display = "none"; }} />
                {selectedComp.photoUrl && !selectedComp.photo && (
                  <div style={{ position: "absolute", bottom: "6px", right: "8px", fontSize: "8px", background: "rgba(0,0,0,0.55)", color: "#aac", padding: "2px 5px", borderRadius: "3px" }}>web photo</div>
                )}
              </div>
            )}
            <div style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>{selectedComp.species || "Unknown"}</div>
                  {selectedComp.locality && <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{selectedComp.locality}</div>}
                </div>
                <button onClick={() => setSelectedComp(null)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px", flexShrink: 0 }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
                {[
                  ["Asking Price", fmt(selectedComp.askingPrice), "var(--cyan)"],
                  ["PRISM Score",  selectedComp.prismScore != null ? `${selectedComp.prismScore} / 100` : "—", "#7c5cfc"],
                  ["Expected",     selectedComp.expectedPrice ? fmt(selectedComp.expectedPrice) : "—",
                    selectedComp.pct < -10 ? "#00c880" : selectedComp.pct > 10 ? "#ff8060" : "var(--text-dim)"],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 10px" }}>
                    <div style={{ fontSize: "8px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>{label}</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: "var(--mono)", color }}>{value}</div>
                  </div>
                ))}
              </div>

              {selectedComp.pct != null && (
                <div style={{ marginBottom: "10px" }}>
                  <span style={{
                    padding: "3px 9px", borderRadius: "4px", fontSize: "10px", fontFamily: "var(--mono)", fontWeight: 600,
                    background: selectedComp.pct < -10 ? "rgba(0,200,128,0.12)" : selectedComp.pct > 10 ? "rgba(255,128,96,0.12)" : "rgba(170,170,170,0.08)",
                    color:      selectedComp.pct < -10 ? "#00c880"              : selectedComp.pct > 10 ? "#ff8060"              : "#8899aa",
                    border:     `1px solid ${selectedComp.pct < -10 ? "rgba(0,200,128,0.3)" : selectedComp.pct > 10 ? "rgba(255,128,96,0.3)" : "var(--border)"}`,
                  }}>
                    {selectedComp.pct > 0 ? "+" : ""}{selectedComp.pct}% vs expected
                  </span>
                </div>
              )}

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                {selectedComp.sizeClass && <span style={{ fontSize: "10px", padding: "2px 7px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--text-muted)" }}>{selectedComp.sizeClass.replace("_"," ")}</span>}
                {selectedComp.condition  && <span style={{ fontSize: "10px", padding: "2px 7px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--text-muted)" }}>{selectedComp.condition}</span>}
                {selectedComp.source     && <span style={{ fontSize: "10px", padding: "2px 7px", background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "3px", color: "var(--cyan)" }}>{selectedComp.source}</span>}
                {selectedComp.grade && <span style={{ fontSize: "10px", padding: "2px 7px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--text-muted)" }}>{selectedComp.grade}</span>}
              </div>

              {selectedComp.notes && (
                <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "10px" }}>{selectedComp.notes}</div>
              )}

              {selectedComp.sourceUrl && (
                <a href={selectedComp.sourceUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "rgba(0,212,255,0.7)", textDecoration: "none" }}>
                  <ExternalLink size={11} /> View original listing
                </a>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
