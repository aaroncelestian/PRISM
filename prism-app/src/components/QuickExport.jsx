import { useState, useRef } from "react";
import { X, Camera, Printer, Download } from "lucide-react";
import { GRADES, DIMS, CONTEXTS, THRESHOLD, detectCompoundGrades, computeContextScore } from "../data/prism.js";

const GRADE_FOR = Object.fromEntries(
  CONTEXTS.map(c => [c.key, GRADES.find(g => g.label === c.gradeLabel) || GRADES[GRADES.length - 1]])
);

function buildContextScores(scores) {
  return CONTEXTS.filter(c => !c.hidden).map(c => {
    const { score } = computeContextScore(c.key, scores);
    const band = GRADES.find(g => score >= g.min) || GRADES[GRADES.length - 1];
    return {
      ...c,
      score,
      passes: score >= THRESHOLD,
      grade: GRADE_FOR[c.key],
      band,
    };
  });
}

/** Export summary: active rating context + full profile (not just highest score). */
function buildExportSummary(scores, ctx) {
  const ctxScores = buildContextScores(scores);
  const allCtxScores = Object.fromEntries(
    CONTEXTS.map(c => [c.key, computeContextScore(c.key, scores).score])
  );
  const compoundGrades = detectCompoundGrades(allCtxScores);
  const active = ctxScores.find(c => c.key === ctx) || ctxScores[0];
  const bestPassing = ctxScores.filter(c => c.passes).sort((a, b) => b.score - a.score)[0] || null;
  return {
    active,
    ctxScores,
    compoundGrades,
    bestPassing,
    score: active?.score ?? 0,
    grade: active?.band || GRADES[GRADES.length - 1],
  };
}

function ContextScoreChips({ ctxScores, activeKey, dense = false }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: dense ? "4px" : "5px",
      marginTop: dense ? "6px" : "0",
    }}>
      {ctxScores.map(c => {
        const isActive = c.key === activeKey;
        const color = c.passes ? c.band.color : "#8090a0";
        return (
          <span
            key={c.key}
            title={`${c.label}: ${c.score}${c.passes ? " (pass)" : ""}`}
            style={{
              fontSize: dense ? "8px" : "9px",
              fontFamily: "var(--mono)",
              fontWeight: isActive || c.passes ? 600 : 400,
              padding: dense ? "2px 5px" : "2px 6px",
              borderRadius: "3px",
              border: `1px solid ${isActive ? "rgba(10,111,136,0.55)" : `${color}40`}`,
              background: isActive ? "rgba(10,111,136,0.10)" : c.passes ? `${color}14` : "transparent",
              color: isActive ? "var(--cyan)" : color,
              letterSpacing: "0.02em",
            }}
          >
            {c.label.replace(/'s Piece/, "").replace(/ \/ .*/, "").replace(/Scientific /, "Sci ").slice(0, 12)} {c.score}
          </span>
        );
      })}
    </div>
  );
}

function _PickerScreen({ initScores, initSpec, records, onSelect, onClose, ctx }) {
  const summary = buildExportSummary(initScores, ctx);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(4,8,18,0.88)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "600px", maxHeight: "92vh", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-dim)", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>Quick Summary</div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>Select the specimen to summarize</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Current Evaluation</div>
            <button onClick={() => onSelect(initScores, initSpec)}
              style={{ width: "100%", textAlign: "left", padding: "12px 14px", background: "rgba(10,111,136,0.04)", border: "1px solid rgba(10,111,136,0.25)", borderRadius: "7px", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(10,111,136,0.5)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(10,111,136,0.25)"}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>{initSpec.name || initSpec.species || "Unnamed Specimen"}</div>
                  {(initSpec.species || initSpec.locality) && <div style={{ fontSize: "10px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{[initSpec.species, initSpec.locality].filter(Boolean).join(" \u00b7 ")}</div>}
                  <div style={{ marginTop: "4px", fontSize: "9px", color: "var(--cyan)", letterSpacing: "0.06em" }}>
                    Rating for: {summary.active?.label || ctx}
                    {summary.active?.passes ? " ✓" : ` · ${summary.active?.score ?? "—"}/${THRESHOLD}`}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--mono)", color: summary.active?.band?.color || "var(--text)", lineHeight: 1 }}>{summary.active?.score ?? "—"}</div>
                  <div style={{ marginTop: "3px", fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: `${summary.active?.band?.color || "#607090"}15`, color: summary.active?.band?.color || "var(--text-muted)", border: `1px solid ${summary.active?.band?.color || "#607090"}30`, fontWeight: 600, letterSpacing: "0.06em", display: "inline-block" }}>
                    {summary.active?.label?.replace(/'s Piece/, "") || "—"}
                  </div>
                </div>
              </div>
              <ContextScoreChips ctxScores={summary.ctxScores} activeKey={ctx} dense />
            </button>
          </div>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Saved Collection {records.length > 0 ? `(${records.length})` : ""}</div>
            {records.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)", lineHeight: 1.6 }}>No specimens saved to history yet.<br />Save a PRISM evaluation first using the Save button.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {records.map(rec => {
                  const recSummary = buildExportSummary(rec.scores || {}, rec.ctx || "collector");
                  const g = GRADES.find(gr => gr.label === rec.grade) || recSummary.grade;
                  const d = new Date(rec.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  return (
                    <button key={rec.id} onClick={() => onSelect(rec.scores, rec.spec, rec.ctx)}
                      style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(10,111,136,0.3)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>{rec.spec?.name || rec.spec?.species || "Unnamed Specimen"}</div>
                          <div style={{ fontSize: "10px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{[rec.spec?.species, rec.spec?.locality].filter(Boolean).join(" \u00b7 ")}</div>
                          <div style={{ marginTop: "3px", fontSize: "9px", color: "var(--text-muted)" }}>
                            Saved {d}
                            {rec.ctx ? ` · Rated as ${CONTEXTS.find(c => c.key === rec.ctx)?.label || rec.ctx}` : ""}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--mono)", color: g.color, lineHeight: 1 }}>{recSummary.active?.score ?? rec.prismScore}</div>
                          <div style={{ marginTop: "3px", fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: `${g.color}15`, color: g.color, border: `1px solid ${g.color}30`, fontWeight: 600, letterSpacing: "0.06em", display: "inline-block" }}>{rec.gradeEmoji} {rec.grade}</div>
                        </div>
                      </div>
                      <ContextScoreChips ctxScores={recSummary.ctxScores} activeKey={rec.ctx || "collector"} dense />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-dim)", flexShrink: 0 }}>
          <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}><X size={13} /> Cancel</button>
        </div>
      </div>
    </div>
  );
}

function PhotoCapture({ value, onChange }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ marginBottom: "16px" }}>
      <input ref={ref} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
      {value ? (
        <div style={{ position: "relative" }}>
          <img src={value} alt="Specimen" style={{ display: "block", width: "auto", maxWidth: "100%", maxHeight: "200px", borderRadius: "6px", margin: "0 auto" }} />
          <button
            onClick={() => onChange(null)}
            style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "4px", color: "#fff", fontSize: "11px", padding: "3px 8px", cursor: "pointer" }}
          >
            ✕ Remove
          </button>
        </div>
      ) : (
        <button onClick={() => ref.current.click()} style={{
          width: "100%", padding: "20px", border: "2px dashed var(--border)", borderRadius: "6px",
          background: "var(--bg-panel)", color: "var(--text-muted)", cursor: "pointer",
          fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}>
          <Camera size={16} /> Add specimen photo (optional)
        </button>
      )}
    </div>
  );
}

export default function QuickExport({ scores: initScores, spec: initSpec, ctx: initCtx = "collector", spSource, records = [], onClose }) {
  const [showPicker, setShowPicker] = useState(true);
  const [scores, setScores]         = useState(initScores);
  const [spec, setSpec]             = useState(initSpec);
  const [exportCtx, setExportCtx]   = useState(initCtx);
  const [photo, setPhoto] = useState(null);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const summary = buildExportSummary(scores, exportCtx);
  const heroColor = summary.compoundGrades?.length > 0
    ? summary.compoundGrades[0].color
    : summary.grade.color;

  if (showPicker) {
    return (
      <_PickerScreen
        initScores={initScores} initSpec={initSpec} records={records} ctx={initCtx}
        onSelect={(s, sp, selectedCtx) => {
          setScores(s);
          setSpec(sp);
          setExportCtx(selectedCtx || initCtx);
          setShowPicker(false);
        }}
        onClose={onClose}
      />
    );
  }

  const handlePrint = () => {
    const cardEl = document.getElementById("qe-card-root");
    if (!cardEl) return;
    const win = window.open("", "_blank", "width=680,height=960");
    if (!win) return;
    win.document.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>PRISM Specimen Record</title>` +
      `<link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">` +
      `<style>body{margin:0;padding:24px;background:#fff;font-family:'Exo 2',system-ui,sans-serif;}@media print{body{margin:0;padding:12px;}}</style>` +
      `</head><body>${cardEl.outerHTML}<script>window.onload=function(){window.print();}<\/script></body></html>`
    );
    win.document.close();
  };

  const contextScoresPayload = Object.fromEntries(
    summary.ctxScores.map(c => [c.key, { label: c.label, score: c.score, passes: c.passes }])
  );

  const handleDownloadJSON = () => {
    const data = {
      generated: new Date().toISOString(),
      specimen: spec,
      ratingContext: exportCtx,
      ratingContextLabel: summary.active?.label,
      prismScore: summary.score,
      grade: summary.grade.label,
      contextScores: contextScoresPayload,
      compoundGrades: summary.compoundGrades?.map(g => g.label) || [],
      scores,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `PRISM-${(spec.name || "specimen").replace(/\s+/g, "_")}-${Date.now()}.json`;
    a.click();
  };

  const handleExportToSpecimenPro = () => {
    const certId = `PRISM-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.random().toString(36).substring(2,8).toUpperCase()}`;
    const evaluated = new Date().toISOString().slice(0, 10);
    const data = {
      _format: "PRISM-SpecimenPro-Integration",
      _version: "1.0",
      _instructions: "Import via SpecimenPro → Object Detail → Import PRISM Score. Merge specimenProMetadata into Object.metadata.",
      specimen: { name: spec?.name, species: spec?.species, variety: spec?.variety, locality: spec?.locality, size: spec?.size },
      evaluation: {
        ratingContext: exportCtx,
        ratingContextLabel: summary.active?.label,
        prismScore: summary.score,
        prismGrade: summary.grade.label,
        contextScores: contextScoresPayload,
        crystal: scores.crystal ?? 0,
        speciesRarity: scores.speciesRarity ?? 0,
        varietyRarity: scores.varietyRarity ?? 0,
        localityRarity: scores.localityRarity ?? 0,
        provenance: scores.provenance ?? 0,
        aesthetics: scores.aesthetics ?? 0,
        scientific: scores.scientific ?? 0,
        culturalSignificance: scores.culturalSignificance ?? 0,
        certId,
        evaluated,
      },
      specimenProObjectId: spSource?.objectId || null,
      specimenProMetadata: {
        prism_score:            String(summary.score),
        prism_grade:            summary.grade.label,
        prism_context:          exportCtx,
        prism_context_label:    summary.active?.label || exportCtx,
        prism_crystal:          String(scores.crystal ?? 0),
        prism_species_rarity:   String(scores.speciesRarity ?? 0),
        prism_variety_rarity:   String(scores.varietyRarity ?? 0),
        prism_locality_rarity:  String(scores.localityRarity ?? 0),
        prism_provenance:       String(scores.provenance ?? 0),
        prism_aesthetics:       String(scores.aesthetics ?? 0),
        prism_scientific:           String(scores.scientific ?? 0),
        prism_cultural_significance: String(scores.culturalSignificance ?? 0),
        prism_cert_id:               certId,
        prism_evaluated:        evaluated,
        ...Object.fromEntries(
          summary.ctxScores.map(c => [`prism_ctx_${c.key}`, String(c.score)])
        ),
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(spec?.name || "specimen").replace(/\s+/g,"_")}.prism.json`;
    a.click();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1100,
      background: "rgba(4,8,18,0.90)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "480px", maxHeight: "92vh",
        background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>

        {/* Modal header */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-dim)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>Export Specimen Record</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 18px" }}>

          {/* Photo capture — screen only */}
          <div className="no-print">
            <PhotoCapture value={photo} onChange={setPhoto} />
          </div>

          {/* ── Printable card ── */}
          <div id="qe-card-root" style={{
            background: "#ffffff", color: "#0d1520",
            borderRadius: "8px", padding: "20px",
            fontFamily: "'Exo 2', system-ui, sans-serif",
            border: "1px solid #d0dce8",
          }}>

            {/* Photo (shown in card when provided) */}
            {photo && (
              <img src={photo} alt="Specimen" style={{ display: "block", width: "auto", maxWidth: "100%", maxHeight: "180px", borderRadius: "4px", marginBottom: "14px", margin: "0 auto 14px" }} />
            )}

            {/* Header — score is for active rating context */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", borderBottom: "2px solid #0d1520", paddingBottom: "10px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.2em", color: "#0d1520" }}>PRISM</div>
                <div style={{ fontSize: "8px", letterSpacing: "0.12em", color: "#507090", textTransform: "uppercase" }}>Specimen Record</div>
                <div style={{ marginTop: "4px", fontSize: "9px", color: "#0a6f88", fontWeight: 600, letterSpacing: "0.04em" }}>
                  Rating for: {summary.active?.label || exportCtx}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "22px", fontWeight: 700, color: heroColor, fontFamily: "monospace", lineHeight: 1 }}>{summary.score}</div>
                <div style={{ fontSize: "8px", color: "#507090" }}>/ 100</div>
              </div>
            </div>

            {/* Classification — compound grade hero when present, else active context band */}
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              {summary.compoundGrades?.length > 0 ? (
                <>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "5px 16px", borderRadius: "3px", border: `1px solid ${summary.compoundGrades[0].color}70`, background: `${summary.compoundGrades[0].color}14`, color: summary.compoundGrades[0].color, fontSize: "12px", fontWeight: 700, letterSpacing: "0.09em", marginBottom: "5px" }}>
                    <span>{summary.compoundGrades[0].label}</span>
                    <span style={{ fontSize: "7px", padding: "1px 5px", borderRadius: "2px", background: `${summary.compoundGrades[0].color}20`, border: `1px solid ${summary.compoundGrades[0].color}40` }}>{summary.compoundGrades[0].rarity}</span>
                  </div>
                  <div style={{ fontSize: "9px", color: "#507090", marginBottom: "4px", lineHeight: 1.4 }}>{summary.compoundGrades[0].shortDesc}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 10px", borderRadius: "2px", border: `1px solid ${summary.grade.color}40`, color: summary.grade.color, fontSize: "9px", fontWeight: 600, letterSpacing: "0.09em" }}>
                    {summary.grade.label} · {summary.active?.label}
                  </div>
                </>
              ) : (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "3px", border: `1px solid ${summary.grade.color}60`, background: `${summary.grade.color}12`, color: summary.grade.color, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em" }}>
                  {summary.grade.label} · {summary.active?.label}
                </div>
              )}
            </div>

            {/* Specimen info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 14px", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #d0dce8" }}>
              {[
                ["Name", spec?.name],
                ["Species", spec?.species],
                ["Variety", spec?.variety],
                ["Locality", spec?.locality],
                ["Size", spec?.size ? spec.size.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : null],
                ["Date", today],
              ].map(([l, v]) => v ? (
                <div key={l}>
                  <div style={{ fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#507090" }}>{l}</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#0d1520" }}>{v}</div>
                </div>
              ) : null)}
            </div>

            {/* All context scores */}
            <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #d0dce8" }}>
              <div style={{ fontSize: "8px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#507090", marginBottom: "6px" }}>
                All Contexts · threshold {THRESHOLD}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {summary.ctxScores.map(c => {
                  const isActive = c.key === exportCtx;
                  const barColor = c.passes ? c.band.color : "#a0a8b0";
                  return (
                    <div key={c.key} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: isActive ? "3px 6px" : "1px 6px",
                      margin: isActive ? "0 -6px" : 0,
                      borderRadius: "3px",
                      background: isActive ? "rgba(10,111,136,0.08)" : "transparent",
                      border: isActive ? "1px solid rgba(10,111,136,0.25)" : "1px solid transparent",
                    }}>
                      <span style={{
                        flex: 1, fontSize: "10px",
                        color: isActive ? "#0a6f88" : "#0d1520",
                        fontWeight: isActive ? 700 : 400,
                      }}>
                        {c.label}{isActive ? " · rating for" : ""}
                      </span>
                      <div style={{ width: "72px", height: "5px", background: "#e0e8f0", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${c.score}%`, background: barColor, borderRadius: "2px" }} />
                      </div>
                      <span style={{
                        width: "24px", textAlign: "right", fontSize: "10px", fontFamily: "monospace",
                        color: barColor, fontWeight: c.passes || isActive ? 700 : 400,
                      }}>{c.score}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dimension scores */}
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "8px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#507090", marginBottom: "6px" }}>Dimension Scores</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {DIMS.map(d => {
                  const v = scores[d.key] ?? 0;
                  const barColor = v >= 70 ? "#1a9e60" : v >= 50 ? "#3070b0" : "#8090a0";
                  return (
                    <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ flex: 1, fontSize: "10px", color: "#0d1520" }}>{d.label}</span>
                      <div style={{ width: "80px", height: "5px", background: "#e0e8f0", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${v}%`, background: barColor, borderRadius: "2px" }} />
                      </div>
                      <span style={{ width: "24px", textAlign: "right", fontSize: "10px", fontFamily: "monospace", color: "#0d1520" }}>{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: "1px solid #d0dce8", paddingTop: "8px", fontSize: "8px", color: "#8090a0" }}>
              Generated by PRISM · Precision Rating Index of Specimen Minerals · {today}
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border-dim)", display: "flex", flexDirection: "column", gap: "7px", flexShrink: 0 }}>
          {/* SpecimenPro export — always available, highlighted when launched from SP */}
          <button onClick={handleExportToSpecimenPro} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
            padding: "10px", borderRadius: "5px", cursor: "pointer", fontSize: "12px", fontWeight: 600,
            background: spSource ? "rgba(10,122,82,0.1)" : "var(--bg-panel)",
            border: `1px solid ${spSource ? "rgba(10,122,82,0.45)" : "var(--border)"}`,
            color: spSource ? "#0a7a52" : "var(--text-muted)",
          }}>
            Export to SpecimenPro (.prism.json)
          </button>

          <div style={{ display: "flex", gap: "7px" }}>
            <button onClick={handleDownloadJSON} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              padding: "8px", background: "var(--bg-panel)", border: "1px solid var(--border)",
              borderRadius: "5px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer",
            }}>
              <Download size={12} /> JSON
            </button>
            <button onClick={handlePrint} style={{
              flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              padding: "8px", background: "rgba(10,111,136,0.08)", border: "1px solid rgba(10,111,136,0.35)",
              borderRadius: "5px", color: "var(--cyan)", fontSize: "11px", fontWeight: 600, cursor: "pointer",
            }}>
              <Printer size={12} /> Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
