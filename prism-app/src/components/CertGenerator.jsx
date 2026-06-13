import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Award, Camera, Printer, Copy } from "lucide-react";
import QRCode from "qrcode";
import { GRADES, DIMS, WEIGHTS, CONTEXTS, detectCompoundGrades } from "../data/prism.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const THRESHOLD = 70;

function computeContextScore(ctxKey, scores) {
  const W = WEIGHTS[ctxKey];
  return Math.round(Object.entries(W).reduce((a, [k, w]) => a + (scores[k] ?? 50) * w, 0));
}

function getGrade(score) {
  return GRADES.find(g => score >= g.min) || GRADES[GRADES.length - 1];
}

const HMAC_SECRET = "prism-cert-integrity-v1-2024-mineral-evaluation";
async function computeHmac(message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(HMAC_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const buf = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function safeB64Encode(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return btoa(encodeURIComponent(str));
  }
}

function generateCertId() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const r = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PRISM-${d}-${r}`;
}

const SIZE_CLASSES = [
  { key: "thumbnail",  label: "Thumbnail",      range: "< 2.5 cm" },
  { key: "miniature",  label: "Miniature",      range: "2.5–4.5 cm" },
  { key: "small_cab",  label: "Small Cabinet",  range: "4.5–7.5 cm" },
  { key: "cabinet",    label: "Cabinet",        range: "7.5–12 cm" },
  { key: "large_cab",  label: "Large Cabinet",  range: "12–25 cm" },
  { key: "museum",     label: "Museum",         range: "> 25 cm" },
];

const PROV_TIERS = [
  "T0 — Self-Collected (direct field collection with date/location)",
  "T1 — Type Locality / Institutional (museum deaccession or institutional source)",
  "T2 — Named Collection (documented provenance from a known named collection)",
  "T3 — Dealer Documentation (invoice/receipt from reputable dealer)",
  "T4 — Trade / Private Acquisition (collector-to-collector, no formal docs)",
  "T5 — Auction / Secondary Market (Heritage, eBay, documented sale)",
  "T6 — Locality Known, Unverified (stated but undocumented)",
  "T7 — Unknown Origin",
];

// ── Photo capture ─────────────────────────────────────────────────────────────

function PhotoCapture({ label, value, onChange }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
      {value ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img src={value} alt={label} style={{ width: "100%", maxHeight: "110px", objectFit: "cover", borderRadius: "4px", display: "block" }} />
          <button onClick={() => { onChange(null); }} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "3px", color: "#fff", fontSize: "10px", padding: "2px 6px", cursor: "pointer" }}>✕ Remove</button>
        </div>
      ) : (
        <button onClick={() => ref.current.click()} style={{
          width: "100%", padding: "10px", border: "1px dashed var(--border)", borderRadius: "5px",
          background: "var(--bg)", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
        }}>
          <Camera size={13} /> {label}
        </button>
      )}
    </div>
  );
}

// ── Step 1: Review ────────────────────────────────────────────────────────────

function ReviewStep({ scores, spec, sizeClass, setSizeClass, allCtxData, primaryCtx, compoundGrades }) {
  const grade = primaryCtx.grade;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Review Evaluation</h3>
        <p style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Confirm these scores are accurate before certifying. Once issued, a certificate ID is permanent.
        </p>
      </div>

      {/* Grade summary */}
      <div style={{ textAlign: "center", padding: "16px", background: "var(--bg-panel)", borderRadius: "8px", border: `1px solid ${grade.color}25` }}>
        <div style={{ fontSize: "28px", fontWeight: 700, color: grade.color, fontFamily: "var(--mono)" }}>{primaryCtx.score}</div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "8px" }}>/ 100</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "3px", border: `1px solid ${grade.color}40`, background: `${grade.color}0c`, color: grade.color, fontSize: "12px", fontWeight: 700 }}>
          {grade.emoji} {grade.label} Grade
        </div>
        {compoundGrades.length > 0 && (
          <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "5px", justifyContent: "center" }}>
            {compoundGrades.map(cg => (
              <span key={cg.key} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "3px", background: `${cg.color}15`, color: cg.color, border: `1px solid ${cg.color}30` }}>
                {cg.emoji} {cg.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dimension scores */}
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {DIMS.map(d => {
          const v = scores[d.key] ?? 50;
          return (
            <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "16px", textAlign: "center", fontSize: "13px" }}>{d.icon}</span>
              <span style={{ flex: 1, fontSize: "11px", color: "var(--text-dim)" }}>{d.label}</span>
              <div style={{ width: "100px", height: "5px", background: "var(--bg)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${v}%`, background: v >= 70 ? "#00c880" : v >= 50 ? "#90c0f0" : "#7090a0", borderRadius: "2px" }} />
              </div>
              <span style={{ width: "28px", textAlign: "right", fontSize: "11px", fontFamily: "var(--mono)", color: "var(--text)" }}>{v}</span>
            </div>
          );
        })}
      </div>

      {/* Size class */}
      <div>
        <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>Physical Size Class *</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
          {SIZE_CLASSES.map(sz => (
            <button key={sz.key} onClick={() => setSizeClass(sz.key)} style={{
              padding: "8px 10px", borderRadius: "5px", textAlign: "left", cursor: "pointer",
              background: sizeClass === sz.key ? "rgba(0,212,255,0.07)" : "var(--bg-panel)",
              border: `1px solid ${sizeClass === sz.key ? "rgba(0,212,255,0.4)" : "var(--border)"}`,
              color: sizeClass === sz.key ? "var(--cyan)" : "var(--text-dim)",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 600 }}>{sz.label}</div>
              <div style={{ fontSize: "9px", opacity: 0.7 }}>{sz.range}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Documentation ─────────────────────────────────────────────────────

function DocumentationStep({ scores, spec, docData, setDocData, photos, setPhotos }) {
  const update = (field, val) => setDocData(d => ({ ...d, [field]: val }));
  const setPhoto = (key, val) => setPhotos(p => ({ ...p, [key]: val }));
  const s = scores;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Supporting Documentation</h3>
        <p style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Add photos and supplementary notes. Basic specimen info is already captured from your PRISM scoring — no need to re-enter it.
        </p>
      </div>

      {/* Already captured from PRISM */}
      <div style={{ padding: "10px 12px", background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.18)", borderRadius: "6px" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--cyan)", textTransform: "uppercase", marginBottom: "6px" }}>Captured from PRISM Scoring — already on certificate</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
          {spec.name && (
            <div>
              <div style={{ fontSize: "8px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Specimen Name</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)" }}>{spec.name}</div>
            </div>
          )}
          {spec.species && (
            <div>
              <div style={{ fontSize: "8px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Species</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)" }}>{spec.species}</div>
            </div>
          )}
          {spec.locality && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "8px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Locality</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)" }}>{spec.locality}</div>
            </div>
          )}
        </div>
      </div>

      {/* Specimen photos — always shown */}
      <div style={{ padding: "12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "var(--cyan)", textTransform: "uppercase", marginBottom: "8px" }}>Specimen Photos</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Main Display Angle</div>
            <PhotoCapture label="Add specimen photo" value={photos.specimen} onChange={v => setPhoto("specimen", v)} />
          </div>
          <div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Second Angle / Show Face</div>
            <PhotoCapture label="Add second angle" value={photos.display} onChange={v => setPhoto("display", v)} />
          </div>
        </div>
      </div>

      {/* Locality */}
      {(s.localityRarity ?? 50) >= 40 && (
        <div style={{ padding: "12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "#90c0f0", textTransform: "uppercase", marginBottom: "6px" }}>Locality Notes ({s.localityRarity ?? 50}/100)</div>
          <textarea placeholder="Additional locality context: specific mine level, GPS, collecting permit, known production history."
            value={docData.localityNote} onChange={e => update("localityNote", e.target.value)}
            rows={2} style={textareaStyle} />
        </div>
      )}

      {/* Species */}
      {(s.speciesRarity ?? 50) >= 40 && (
        <div style={{ padding: "12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "#90c0f0", textTransform: "uppercase", marginBottom: "6px" }}>Species Notes ({s.speciesRarity ?? 50}/100)</div>
          <textarea placeholder="Additional species context: IMA formula, identifying features, analytical confirmation (XRD, etc.)."
            value={docData.speciesNote} onChange={e => update("speciesNote", e.target.value)}
            rows={2} style={textareaStyle} />
        </div>
      )}

      {/* Provenance */}
      <div style={{ padding: "12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "#e8b840", textTransform: "uppercase", marginBottom: "6px" }}>📜 Provenance ({s.provenance ?? 50}/100)</div>
        <select value={docData.provTier} onChange={e => update("provTier", e.target.value)} style={{ ...textareaStyle, height: "auto", padding: "7px 10px", marginBottom: "6px" }}>
          <option value="">— Select provenance tier —</option>
          {PROV_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <textarea placeholder="Describe each hand the specimen passed through: Self-collected → traded to John Smith (2005) → purchased from dealer (2018) → your acquisition. Include dates, labels, and any documentation."
          value={docData.chainOfCustody} onChange={e => update("chainOfCustody", e.target.value)}
          rows={3} style={textareaStyle} />
        <div style={{ marginTop: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Collection Label / Tag</div>
            <PhotoCapture label="Photograph original label" value={photos.label} onChange={v => setPhoto("label", v)} />
          </div>
          <div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Provenance Document</div>
            <PhotoCapture label="Invoice, permit, or receipt" value={photos.document} onChange={v => setPhoto("document", v)} />
          </div>
        </div>
      </div>

      {/* Scientific */}
      {(s.scientific ?? 0) >= 40 && (
        <div style={{ padding: "12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "#a0c0a0", textTransform: "uppercase", marginBottom: "6px" }}>🔬 Scientific Value ({s.scientific ?? 0}/100)</div>
          <textarea placeholder="Literature citations, analytical data (XRD, SEM, EDS), type locality notes, paragenetic significance."
            value={docData.scientificNote} onChange={e => update("scientificNote", e.target.value)}
            rows={2} style={textareaStyle} />
        </div>
      )}

      {/* Condition notes */}
      <div style={{ padding: "12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>🔍 Condition / Repairs</div>
        <textarea placeholder="Describe any chips, repairs, restoration, or reconstitution. Write 'None known' if specimen is unaltered."
          value={docData.conditionNote} onChange={e => update("conditionNote", e.target.value)}
          rows={2} style={textareaStyle} />
      </div>
    </div>
  );
}

const textareaStyle = {
  width: "100%", padding: "8px 10px", background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: "4px", color: "var(--text)", fontSize: "11px", lineHeight: 1.5, resize: "vertical",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};

// ── Step 3: Attestations ──────────────────────────────────────────────────────

const ATTESTATION_ITEMS = [
  { key: "legalCollection",  label: "Legally collected or acquired with proper permit or owner permission",                                                              short: "Legally collected / acquired" },
  { key: "localityAccurate", label: "Locality information is accurate and complete to the best of my knowledge",                                                        short: "Locality is accurate" },
  { key: "repairsDisclosed", label: "All repairs, restoration, reconstitution, or enhancements have been fully disclosed above",                                         short: "All repairs / enhancements disclosed" },
  { key: "noRestrictions",   label: "No known CITES Appendix I/II restrictions apply, or appropriate export/import documentation exists",                               short: "No CITES restrictions" },
  { key: "honestEvaluation", label: "This PRISM evaluation is honest, unbiased, and represents my best objective assessment",                                           short: "Honest, unbiased evaluation" },
  { key: "noFabrication",    label: "Specimen is a genuine natural mineral — not synthetic, artificially grown, or a composite assembled from multiple specimens unless noted", short: "Genuine natural mineral (not synthetic/composite)" },
  { key: "noConflict",       label: "No known conflict-zone or sanctioned-country origin, or appropriate documentation exists",                                          short: "No conflict-zone or sanctions origin" },
  { key: "culturalPatrimony",label: "Specimen does not violate cultural heritage or national patrimony export laws of its country of origin to the best of my knowledge", short: "Cultural patrimony compliant" },
  { key: "noStolenProperty", label: "Specimen has not been reported stolen or misappropriated from any museum, institution, or private collection to the best of my knowledge", short: "Not stolen or misappropriated" },
  { key: "hazardsDisclosed", label: "Any known radiation, toxicity, or handling hazards (uranium minerals, asbestos-group, mercury, lead, etc.) are disclosed",         short: "Radiation / toxicity hazards disclosed" },
  { key: "importCompliance", label: "Specimen was legally imported into current country of possession with appropriate customs documentation, if applicable",            short: "Import / customs compliant (if applicable)" },
];

function AttestationStep({ attestations, setAttestations, evaluatorName, setEvaluatorName, evaluatorOrg, setEvaluatorOrg, customAttestations, setCustomAttestations }) {
  const [newText, setNewText] = useState("");
  const toggle = (key) => setAttestations(a => ({ ...a, [key]: !a[key] }));
  const allChecked = Object.values(attestations).every(Boolean);
  const addCustom = () => {
    const t = newText.trim();
    if (!t) return;
    setCustomAttestations(prev => [...prev, { id: Date.now(), text: t, checked: false }]);
    setNewText("");
  };
  const toggleCustom = (id) => setCustomAttestations(prev => prev.map(ca => ca.id === id ? { ...ca, checked: !ca.checked } : ca));
  const removeCustom = (id) => setCustomAttestations(prev => prev.filter(ca => ca.id !== id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Attestations</h3>
        <p style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          These attestations are embedded in the certificate and QR code. They are your formal statement of accuracy. False attestation devalues the certificate and is unethical.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {ATTESTATION_ITEMS.map(({ key, label, icon }) => {
          const checked = attestations[key];
          return (
            <button key={key} onClick={() => toggle(key)} style={{
              display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 12px",
              background: checked ? "rgba(0,200,128,0.06)" : "var(--bg-panel)",
              border: `1px solid ${checked ? "rgba(0,200,128,0.3)" : "var(--border)"}`,
              borderRadius: "5px", cursor: "pointer", textAlign: "left",
            }}>
              <div style={{
                width: "16px", height: "16px", borderRadius: "3px", flexShrink: 0, marginTop: "1px",
                border: `1px solid ${checked ? "#00c880" : "var(--border)"}`,
                background: checked ? "#00c880" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {checked && <span style={{ color: "white", fontSize: "11px", lineHeight: 1 }}>✓</span>}
              </div>
              <div style={{ fontSize: "11px", color: checked ? "var(--text)" : "var(--text-dim)", lineHeight: 1.5 }}>
                {label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom attestations */}
      <div style={{ padding: "12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.13em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Additional Attestations (optional)</div>
        {customAttestations.map(ca => (
          <div key={ca.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <button onClick={() => toggleCustom(ca.id)} style={{
              width: "16px", height: "16px", borderRadius: "3px", flexShrink: 0,
              border: `1px solid ${ca.checked ? "#00c880" : "var(--border)"}`,
              background: ca.checked ? "#00c880" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              {ca.checked && <span style={{ color: "white", fontSize: "11px", lineHeight: 1 }}>✓</span>}
            </button>
            <span style={{ flex: 1, fontSize: "11px", color: ca.checked ? "var(--text)" : "var(--text-dim)" }}>{ca.text}</span>
            <button onClick={() => removeCustom(ca.id)} style={{ background: "none", border: "none", color: "rgba(255,80,80,0.5)", cursor: "pointer", fontSize: "16px", padding: "0 4px", lineHeight: 1 }}>×</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: "6px", marginTop: customAttestations.length ? "8px" : "0" }}>
          <input value={newText} onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
            placeholder="Type a custom attestation statement…"
            style={{ ...textareaStyle, flex: 1, padding: "6px 10px", resize: "none" }} />
          <button onClick={addCustom} disabled={!newText.trim()} style={{
            padding: "6px 12px",
            background: newText.trim() ? "rgba(0,212,255,0.08)" : "transparent",
            border: `1px solid ${newText.trim() ? "rgba(0,212,255,0.35)" : "var(--border)"}`,
            borderRadius: "4px", color: newText.trim() ? "var(--cyan)" : "var(--text-muted)",
            fontSize: "11px", cursor: newText.trim() ? "pointer" : "default", whiteSpace: "nowrap",
          }}>+ Add</button>
        </div>
      </div>

      {!allChecked && (
        <div style={{ fontSize: "10px", color: "#ffa028", padding: "7px 10px", background: "rgba(255,160,40,0.06)", border: "1px solid rgba(255,160,40,0.2)", borderRadius: "4px" }}>
          All standard attestations must be confirmed to generate the certificate.
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.14em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Evaluator Name *</div>
          <input value={evaluatorName} onChange={e => setEvaluatorName(e.target.value)} placeholder="Your name"
            style={{ ...textareaStyle, padding: "8px 10px", resize: "none" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.14em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Organization (optional)</div>
          <input value={evaluatorOrg} onChange={e => setEvaluatorOrg(e.target.value)} placeholder="Institution or club"
            style={{ ...textareaStyle, padding: "8px 10px", resize: "none" }} />
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Certificate Preview ───────────────────────────────────────────────

function CertPreview({ certId, issued, scores, spec, sizeClass, docData, photos, attestations, evaluatorName, evaluatorOrg, primaryCtx, compoundGrades, customAttestations = [] }) {
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const grade = primaryCtx.grade;

  const certData = {
    v: 1, id: certId, t: issued,
    sp: { n: spec.name, s: spec.species, l: spec.locality, sz: sizeClass },
    sc: {
      cr: scores.crystal ?? 50, sr: scores.speciesRarity ?? 50,
      lr: scores.localityRarity ?? 50, pv: scores.provenance ?? 50,
      ae: scores.aesthetics ?? 50, si: scores.scientific ?? 0,
    },
    ps: primaryCtx.score,
    gr: grade.label,
    cg: compoundGrades.map(c => c.key),
    pt: docData.provTier,
    at: {
      lc: attestations.legalCollection,  la: attestations.localityAccurate,
      rd: attestations.repairsDisclosed,  nr: attestations.noRestrictions,   he: attestations.honestEvaluation,
      nf: attestations.noFabrication,     nc: attestations.noConflict,        cp: attestations.culturalPatrimony,
      ns: attestations.noStolenProperty,  hd: attestations.hazardsDisclosed,  ic: attestations.importCompliance,
    },
    ev: evaluatorName, org: evaluatorOrg,
  };
  const PRISM_BASE = "https://aaroncelestian.github.io/PRISM/";

  useEffect(() => {
    computeHmac(JSON.stringify(certData))
      .then(sig => {
        const signed = { ...certData, sig };
        const url = `${PRISM_BASE}?verify=${safeB64Encode(JSON.stringify(signed))}`;
        return QRCode.toDataURL(url, { width: 160, margin: 2, color: { dark: "#0d1520", light: "#ffffff" } });
      })
      .then(setQrUrl)
      .catch(console.error);
  }, [certId]);

  const handlePrint = () => {
    const certEl = document.getElementById("prism-cert-root");
    if (!certEl) return;
    const pw = window.open("", "_blank", "width=800,height=900");
    if (!pw) { alert("Please allow pop-ups for this site to print."); return; }
    pw.document.write(`<!DOCTYPE html><html><head><title>PRISM Certificate</title>
      <style>
        body { font-family: 'Exo 2', system-ui, sans-serif; margin: 0; padding: 24px; }
        @page { size: A4; margin: 15mm; }
        @media print { body { padding: 0; } }
      </style>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&display=swap" rel="stylesheet">
    </head><body>${certEl.innerHTML}</body></html>`);
    pw.document.close();
    pw.onload = () => { pw.print(); };
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(certId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const dateStr = new Date(issued).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const sz = SIZE_CLASSES.find(s => s.key === sizeClass);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>Certificate Preview</h3>
          <p style={{ fontSize: "11px", color: "var(--text-dim)" }}>Review before printing or saving.</p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={handleCopyId} style={btnStyle}>
            <Copy size={12} /> {copied ? "Copied!" : "Copy ID"}
          </button>
          <button onClick={handlePrint} style={{ ...btnStyle, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.35)", color: "var(--cyan)" }}>
            <Printer size={12} /> Print
          </button>
        </div>
      </div>

      {/* Certificate */}
      <div id="prism-cert-root" style={{
        background: "#ffffff", color: "#0d1520", borderRadius: "6px", padding: "24px",
        fontFamily: "'Exo 2', system-ui, sans-serif", fontSize: "11px", lineHeight: 1.5,
        border: "1px solid var(--border)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0d1520", paddingBottom: "12px", marginBottom: "12px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "0.18em", color: "#0d1520" }}>PRISM</div>
            <div style={{ fontSize: "8px", letterSpacing: "0.14em", color: "#507090", textTransform: "uppercase" }}>Precision Rating Index of Specimen Minerals</div>
            <div style={{ marginTop: "6px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", color: "#0d1520" }}>CERTIFICATE OF EVALUATION</div>
          </div>
          {qrUrl && (
            <div style={{ textAlign: "center" }}>
              <img src={qrUrl} width={80} height={80} alt="QR" style={{ display: "block" }} />
              <div style={{ fontSize: "7px", color: "#507090", marginTop: "2px", letterSpacing: "0.06em" }}>SCAN TO VERIFY</div>
            </div>
          )}
        </div>

        {/* Specimen */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #d0dce8" }}>
          {[
            ["Specimen Name", spec.name || "—"],
            ["Species", spec.species || "—"],
            ["Locality", spec.locality || "—"],
            ["Size Class", sz ? `${sz.label} (${sz.range})` : "—"],
            ["Certificate ID", certId],
            ["Issued", dateStr],
          ].map(([l, v]) => (
            <div key={l}>
              <span style={{ fontSize: "8px", letterSpacing: "0.12em", color: "#507090", textTransform: "uppercase" }}>{l}</span>
              <div style={{ fontWeight: 600, color: "#0d1520", fontSize: "11px" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Grade */}
        <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #d0dce8" }}>
          <div style={{ marginBottom: "6px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: grade.color }}>{grade.label.toUpperCase()} GRADE</div>
            <div style={{ fontSize: "11px", color: "#507090" }}>Overall Score: <strong>{primaryCtx.score}/100</strong></div>
          </div>
          {compoundGrades.length > 0 && (
            <div style={{ fontSize: "10px", color: "#507090" }}>
              Combined: {compoundGrades.map(cg => cg.label).join(" · ")}
            </div>
          )}
        </div>

        {/* Scores */}
        <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #d0dce8" }}>
          <div style={{ fontSize: "8px", letterSpacing: "0.14em", color: "#507090", textTransform: "uppercase", marginBottom: "6px" }}>Dimension Scores</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 16px" }}>
            {DIMS.map(d => {
              const v = scores[d.key] ?? 0;
              return (
                <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ flex: 1, fontSize: "10px", color: "#0d1520" }}>{d.label}</span>
                  <div style={{ width: "50px", height: "4px", background: "#e0e8f0", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${v}%`, background: v >= 70 ? "#1a9e60" : v >= 50 ? "#3070b0" : "#8090a0", borderRadius: "2px" }} />
                  </div>
                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#0d1520", width: "22px", textAlign: "right" }}>{v}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Photos */}
        {(photos.specimen || photos.display || photos.label || photos.document) && (
          <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #d0dce8" }}>
            {(photos.specimen || photos.display) && (
              <>
                <div style={{ fontSize: "8px", letterSpacing: "0.14em", color: "#507090", textTransform: "uppercase", marginBottom: "4px" }}>Specimen Photos</div>
                <div style={{ display: "flex", gap: "6px", marginBottom: (photos.label || photos.document) ? "8px" : "0" }}>
                  {photos.specimen && (
                    <div style={{ textAlign: "center" }}>
                      <img src={photos.specimen} alt="Specimen" style={{ height: "80px", objectFit: "cover", borderRadius: "3px", border: "1px solid #d0dce8", display: "block" }} />
                      <div style={{ fontSize: "7px", color: "#8090a0", marginTop: "2px" }}>Main</div>
                    </div>
                  )}
                  {photos.display && (
                    <div style={{ textAlign: "center" }}>
                      <img src={photos.display} alt="Display" style={{ height: "80px", objectFit: "cover", borderRadius: "3px", border: "1px solid #d0dce8", display: "block" }} />
                      <div style={{ fontSize: "7px", color: "#8090a0", marginTop: "2px" }}>Alt. angle</div>
                    </div>
                  )}
                </div>
              </>
            )}
            {(photos.label || photos.document) && (
              <>
                <div style={{ fontSize: "8px", letterSpacing: "0.14em", color: "#507090", textTransform: "uppercase", marginBottom: "4px" }}>Provenance Documentation</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {photos.label && (
                    <div style={{ textAlign: "center" }}>
                      <img src={photos.label} alt="Label" style={{ height: "80px", objectFit: "cover", borderRadius: "3px", border: "1px solid #d0dce8", display: "block" }} />
                      <div style={{ fontSize: "7px", color: "#8090a0", marginTop: "2px" }}>Collection label</div>
                    </div>
                  )}
                  {photos.document && (
                    <div style={{ textAlign: "center" }}>
                      <img src={photos.document} alt="Document" style={{ height: "80px", objectFit: "cover", borderRadius: "3px", border: "1px solid #d0dce8", display: "block" }} />
                      <div style={{ fontSize: "7px", color: "#8090a0", marginTop: "2px" }}>Provenance doc</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Documentation notes */}
        {(docData.provTier || docData.localityNote || docData.chainOfCustody || docData.conditionNote || docData.speciesNote || docData.scientificNote) && (
          <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #d0dce8" }}>
            <div style={{ fontSize: "8px", letterSpacing: "0.14em", color: "#507090", textTransform: "uppercase", marginBottom: "6px" }}>Documentation Notes</div>
            {docData.provTier && <div style={{ marginBottom: "3px" }}><strong>Provenance Tier:</strong> {docData.provTier}</div>}
            {docData.chainOfCustody && <div style={{ marginBottom: "3px" }}><strong>Chain of Custody:</strong> {docData.chainOfCustody}</div>}
            {docData.localityNote && <div style={{ marginBottom: "3px" }}><strong>Locality:</strong> {docData.localityNote}</div>}
            {docData.speciesNote && <div style={{ marginBottom: "3px" }}><strong>Species:</strong> {docData.speciesNote}</div>}
            {docData.conditionNote && <div style={{ marginBottom: "3px" }}><strong>Condition/Repairs:</strong> {docData.conditionNote}</div>}
            {docData.scientificNote && <div style={{ marginBottom: "3px" }}><strong>Scientific:</strong> {docData.scientificNote}</div>}
          </div>
        )}

        {/* Attestations */}
        <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #d0dce8" }}>
          <div style={{ fontSize: "8px", letterSpacing: "0.14em", color: "#507090", textTransform: "uppercase", marginBottom: "6px" }}>
            Attestations — {evaluatorName}{evaluatorOrg ? `, ${evaluatorOrg}` : ""}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 10px" }}>
            {ATTESTATION_ITEMS.map(({ key, short }) => (
              <div key={key} style={{ fontSize: "9px", color: attestations[key] ? "#0d1520" : "#a0b0c0", display: "flex", alignItems: "baseline", gap: "3px" }}>
                <span style={{ flexShrink: 0 }}>{attestations[key] ? "✓" : "✗"}</span>
                <span>{short}</span>
              </div>
            ))}
            {customAttestations?.filter(ca => ca.text).map(ca => (
              <div key={ca.id} style={{ fontSize: "9px", color: ca.checked ? "#0d1520" : "#a0b0c0", display: "flex", alignItems: "baseline", gap: "3px" }}>
                <span style={{ flexShrink: 0 }}>{ca.checked ? "✓" : "✗"}</span>
                <span>{ca.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: "8px", color: "#8090a0", lineHeight: 1.5 }}>
          Scan QR to verify at <strong>aaroncelestian.github.io/PRISM</strong> — encodes all six PRISM scores, grade, compound grades, provenance tier, and attestation flags.
          Photos and extended notes are embedded in this document only. Certificate ID: {certId}.
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px",
  background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "4px",
  color: "var(--text-muted)", fontSize: "11px", cursor: "pointer",
};

// ── Main component ────────────────────────────────────────────────────────────

const STEPS = ["Review", "Documentation", "Attestations", "Certificate"];

export default function CertGenerator({ scores, spec, onClose }) {
  const [step, setStep] = useState(0);
  const [sizeClass, setSizeClass] = useState("");
  const [docData, setDocData] = useState({
    localityNote: "", speciesNote: "", chainOfCustody: "", conditionNote: "None known.", scientificNote: "", provTier: "",
  });
  const [photos, setPhotos] = useState({ specimen: null, display: null, label: null, document: null });
  const [attestations, setAttestations] = useState({
    legalCollection: false, localityAccurate: false, repairsDisclosed: false, noRestrictions: false, honestEvaluation: false,
    noFabrication: false, noConflict: false, culturalPatrimony: false, noStolenProperty: false, hazardsDisclosed: false, importCompliance: false,
  });
  const [evaluatorName, setEvaluatorName] = useState("");
  const [evaluatorOrg, setEvaluatorOrg] = useState("");
  const [customAttestations, setCustomAttestations] = useState([]);
  const [certId] = useState(generateCertId);
  const [issued] = useState(() => new Date().toISOString());

  // Compute context data
  const allCtxData = CONTEXTS.map(c => {
    const score = computeContextScore(c.key, scores);
    return { ...c, score, grade: getGrade(score) };
  });
  const primaryCtx = allCtxData.find(c => c.score >= THRESHOLD) || allCtxData[0];
  const allCtxScores = Object.fromEntries(allCtxData.map(c => [c.key, c.score]));
  const rawCompounds = detectCompoundGrades(allCtxScores);
  const compoundGrades = rawCompounds.filter(cg => {
    const cgKeys = new Set(Object.keys(cg.contexts));
    return !rawCompounds.some(other => other.key !== cg.key && [...cgKeys].every(k => new Set(Object.keys(other.contexts)).has(k)));
  });

  const canAdvance = () => {
    if (step === 0) return !!sizeClass;
    if (step === 2) return Object.values(attestations).every(Boolean) && evaluatorName.trim().length > 0;
    return true;
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1200,
      background: "rgba(4,8,18,0.90)", backdropFilter: "blur(5px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "600px", maxHeight: "92vh",
        background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-dim)", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Award size={16} style={{ color: "var(--cyan)" }} />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>PRISM Certificate</span>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
          </div>
          {/* Step bar */}
          <div style={{ display: "flex", gap: "4px" }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: "2px", borderRadius: "1px", background: i <= step ? "var(--cyan)" : "var(--border)", marginBottom: "4px" }} />
                <div style={{ fontSize: "8px", letterSpacing: "0.1em", color: i === step ? "var(--cyan)" : i < step ? "var(--text-muted)" : "var(--border)", textTransform: "uppercase" }}>
                  {i < step ? "✓ " : ""}{s}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          {step === 0 && <ReviewStep scores={scores} spec={spec} sizeClass={sizeClass} setSizeClass={setSizeClass} allCtxData={allCtxData} primaryCtx={primaryCtx} compoundGrades={compoundGrades} />}
          {step === 1 && <DocumentationStep scores={scores} spec={spec} docData={docData} setDocData={setDocData} photos={photos} setPhotos={setPhotos} />}
          {step === 2 && <AttestationStep attestations={attestations} setAttestations={setAttestations} evaluatorName={evaluatorName} setEvaluatorName={setEvaluatorName} evaluatorOrg={evaluatorOrg} setEvaluatorOrg={setEvaluatorOrg} customAttestations={customAttestations} setCustomAttestations={setCustomAttestations} />}
          {step === 3 && <CertPreview certId={certId} issued={issued} scores={scores} spec={spec} sizeClass={sizeClass} docData={docData} photos={photos} attestations={attestations} evaluatorName={evaluatorName} evaluatorOrg={evaluatorOrg} primaryCtx={primaryCtx} compoundGrades={compoundGrades} customAttestations={customAttestations} />}
        </div>

        {/* Footer nav */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-dim)", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()} style={btnStyle}>
            <ChevronLeft size={13} /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()} style={{
              ...btnStyle,
              background: canAdvance() ? "rgba(0,212,255,0.08)" : "transparent",
              border: `1px solid ${canAdvance() ? "rgba(0,212,255,0.4)" : "var(--border)"}`,
              color: canAdvance() ? "var(--cyan)" : "var(--border)",
              cursor: canAdvance() ? "pointer" : "not-allowed",
            }}>
              Next <ChevronRight size={13} />
            </button>
          ) : (
            <button onClick={onClose} style={{ ...btnStyle, background: "rgba(0,200,128,0.08)", border: "1px solid rgba(0,200,128,0.35)", color: "#00c880" }}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
