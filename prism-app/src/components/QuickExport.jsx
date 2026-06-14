import { useState, useRef } from "react";
import { X, Camera, Printer, Download } from "lucide-react";
import { GRADES, DIMS, WEIGHTS, CONTEXTS, THRESHOLD } from "../data/prism.js";

function computeContextScore(ctxKey, scores) {
  const W = WEIGHTS[ctxKey];
  return Math.round(Object.entries(W).reduce((a, [k, w]) => a + (scores[k] ?? 50) * w, 0));
}

function getPrimaryGrade(scores) {
  const ctxScores = CONTEXTS.map(c => {
    const score = computeContextScore(c.key, scores);
    return { ...c, score, grade: GRADES.find(g => score >= g.min) || GRADES[GRADES.length - 1] };
  });
  return ctxScores.find(c => c.score >= THRESHOLD) || ctxScores[0];
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
          <img src={value} alt="Specimen" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "6px", display: "block" }} />
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

export default function QuickExport({ scores, spec, spSource, onClose }) {
  const [photo, setPhoto] = useState(null);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const primary = getPrimaryGrade(scores);

  const handlePrint = () => {
    const style = document.createElement("style");
    style.id = "qe-print-style";
    style.textContent = `@media print { body > * { display:none!important; } #qe-card-root { display:block!important; } }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.getElementById("qe-print-style")?.remove(), 500);
  };

  const handleDownloadJSON = () => {
    const data = {
      generated: new Date().toISOString(),
      specimen: spec,
      prismScore: primary.score,
      grade: primary.grade.label,
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
      specimen: { name: spec?.name, species: spec?.species, locality: spec?.locality },
      evaluation: {
        prismScore: primary.score,
        prismGrade: primary.grade.label,
        prismGradeEmoji: primary.grade.emoji,
        crystal: scores.crystal ?? 50,
        speciesRarity: scores.speciesRarity ?? 50,
        localityRarity: scores.localityRarity ?? 50,
        provenance: scores.provenance ?? 50,
        aesthetics: scores.aesthetics ?? 50,
        scientific: scores.scientific ?? 0,
        certId,
        evaluated,
      },
      specimenProObjectId: spSource?.objectId || null,
      specimenProMetadata: {
        prism_score:            String(primary.score),
        prism_grade:            primary.grade.label,
        prism_crystal:          String(scores.crystal ?? 50),
        prism_species_rarity:   String(scores.speciesRarity ?? 50),
        prism_locality_rarity:  String(scores.localityRarity ?? 50),
        prism_provenance:       String(scores.provenance ?? 50),
        prism_aesthetics:       String(scores.aesthetics ?? 50),
        prism_scientific:       String(scores.scientific ?? 0),
        prism_cert_id:          certId,
        prism_evaluated:        evaluated,
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
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>📤 Export Specimen Record</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>

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
              <img src={photo} alt="Specimen" style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "4px", marginBottom: "14px", display: "block" }} />
            )}

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", borderBottom: "2px solid #0d1520", paddingBottom: "10px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.2em", color: "#0d1520" }}>PRISM</div>
                <div style={{ fontSize: "8px", letterSpacing: "0.12em", color: "#507090", textTransform: "uppercase" }}>Specimen Record</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "22px", fontWeight: 700, color: primary.grade.color, fontFamily: "monospace", lineHeight: 1 }}>{primary.score}</div>
                <div style={{ fontSize: "8px", color: "#507090" }}>/ 100</div>
              </div>
            </div>

            {/* Grade badge */}
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "3px", border: `1px solid ${primary.grade.color}60`, background: `${primary.grade.color}12`, color: primary.grade.color, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em" }}>
                {primary.grade.emoji} {primary.grade.label} Grade
              </div>
            </div>

            {/* Specimen info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 14px", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #d0dce8" }}>
              {[
                ["Name", spec?.name],
                ["Species", spec?.species],
                ["Locality", spec?.locality],
                ["Date", today],
              ].map(([l, v]) => v ? (
                <div key={l}>
                  <div style={{ fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#507090" }}>{l}</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#0d1520" }}>{v}</div>
                </div>
              ) : null)}
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
                      <span style={{ fontSize: "12px", width: "18px" }}>{d.icon}</span>
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
            background: spSource ? "rgba(0,200,128,0.1)" : "var(--bg-panel)",
            border: `1px solid ${spSource ? "rgba(0,200,128,0.45)" : "var(--border)"}`,
            color: spSource ? "#00c880" : "var(--text-muted)",
          }}>
            📲 Export to SpecimenPro (.prism.json)
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
              padding: "8px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.35)",
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
