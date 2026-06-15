import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Award, Camera, Printer, Copy, FileDown, AlertTriangle } from "lucide-react";
import QRCode from "qrcode";
import { GRADES, DIMS, WEIGHTS, CONTEXTS, THRESHOLD, detectCompoundGrades } from "../data/prism.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function computeDisplayScore(scores) {
  const all = CONTEXTS.map(c => {
    const score = computeContextScore(c.key, scores);
    return { key: c.key, score };
  });
  const best = all.find(c => c.score >= THRESHOLD) || all[0];
  return { score: best.score, grade: getGrade(best.score) };
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
  "T0a — Self-Collected with Permit (personally extracted; valid collecting permit or claim held)",
  "T0b — Self-Collected, Owner/Claim Permission (personally extracted; verbal or written landowner/claim permission, no formal permit)",
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

  const loadAndCompress = (file) => {
    const blobUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const MAX = 1400;
      const iw = img.naturalWidth || img.width || MAX;
      const ih = img.naturalHeight || img.height || MAX;
      const scale = Math.min(1, MAX / Math.max(iw, ih));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(iw * scale);
      canvas.height = Math.round(ih * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(blobUrl);
      onChange(canvas.toDataURL("image/jpeg", 0.85));
      if (ref.current) ref.current.value = "";
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      const reader = new FileReader();
      reader.onload = () => { onChange(reader.result); if (ref.current) ref.current.value = ""; };
      reader.readAsDataURL(file);
    };
    img.src = blobUrl;
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) loadAndCompress(file);
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} style={{ display: "none" }} />
      {value ? (
        <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
          <img src={value} alt={label} style={{ width: "100%", maxHeight: "110px", objectFit: "cover", borderRadius: "4px", display: "block" }} />
          <button onClick={() => { onChange(null); if (ref.current) ref.current.value = ""; }} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "3px", color: "#fff", fontSize: "10px", padding: "2px 6px", cursor: "pointer" }}>✕ Remove</button>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()} style={{
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

function DocumentationStep({ scores, spec, docData: initDocData, setDocData, photos, setPhotos }) {
  const [localDoc, setLocalDoc] = useState(initDocData);
  const localDocRef = useRef(localDoc);
  const update = (field, val) => {
    const next = { ...localDocRef.current, [field]: val };
    localDocRef.current = next;
    setLocalDoc(next);
  };
  useEffect(() => () => setDocData(localDocRef.current), []);
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
            value={localDoc.localityNote} onChange={e => update("localityNote", e.target.value)}
            rows={2} style={textareaStyle} />
        </div>
      )}

      {/* Species */}
      {(s.speciesRarity ?? 50) >= 40 && (
        <div style={{ padding: "12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "#90c0f0", textTransform: "uppercase", marginBottom: "6px" }}>Species Notes ({s.speciesRarity ?? 50}/100)</div>
          <textarea placeholder="Additional species context: IMA formula, identifying features, analytical confirmation (XRD, etc.)."
            value={localDoc.speciesNote} onChange={e => update("speciesNote", e.target.value)}
            rows={2} style={textareaStyle} />
        </div>
      )}

      {/* Provenance */}
      <div style={{ padding: "12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "#e8b840", textTransform: "uppercase", marginBottom: "6px" }}>📜 Provenance ({s.provenance ?? 50}/100)</div>
        <select value={localDoc.provTier} onChange={e => update("provTier", e.target.value)} style={{ ...textareaStyle, height: "auto", padding: "7px 10px", marginBottom: "6px" }}>
          <option value="">— Select provenance tier —</option>
          {PROV_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {localDoc.provTier?.startsWith("T0") && (
          <div style={{ marginBottom: "6px", padding: "8px 10px", background: "rgba(232,184,64,0.07)", border: "1px solid rgba(232,184,64,0.25)", borderRadius: "4px", fontSize: "11px", color: "#c8a030", lineHeight: 1.5 }}>
            ✋ Self-collected — include: mine/pit name, collecting date, GPS or section/township/range, permit or claim number (if held), and landowner/claim contact if applicable.
          </div>
        )}
        <textarea
          placeholder={localDoc.provTier?.startsWith("T0")
            ? "Mine: [name & location]. Date collected: [date]. GPS / coordinates: [coords]. Permit or claim #: [number]. Landowner / claim holder: [name]. Notes: [any additional context]."
            : "Describe each hand the specimen passed through: Self-collected → traded to John Smith (2005) → purchased from dealer (2018) → your acquisition. Include dates, labels, and any documentation."}
          value={localDoc.chainOfCustody} onChange={e => update("chainOfCustody", e.target.value)}
          rows={3} style={textareaStyle} />
        <div style={{ marginTop: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Collection Label / Tag</div>
            <PhotoCapture label="Photograph original label" value={photos.label} onChange={v => setPhoto("label", v)} />
          </div>
          <div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
              {localDoc.provTier?.startsWith("T0") ? "Collecting Permit / Field Photo" : "Provenance Document"}
            </div>
            <PhotoCapture
              label={localDoc.provTier?.startsWith("T0") ? "Permit, claim doc, or field photo" : "Invoice, permit, or receipt"}
              value={photos.document} onChange={v => setPhoto("document", v)} />
          </div>
        </div>
      </div>

      {/* Scientific */}
      {(s.scientific ?? 0) >= 40 && (
        <div style={{ padding: "12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "#a0c0a0", textTransform: "uppercase", marginBottom: "6px" }}>🔬 Scientific Value ({s.scientific ?? 0}/100)</div>
          <textarea placeholder="Literature citations, analytical data (XRD, SEM, EDS), type locality notes, paragenetic significance."
            value={localDoc.scientificNote} onChange={e => update("scientificNote", e.target.value)}
            rows={2} style={textareaStyle} />
        </div>
      )}

      {/* Condition notes */}
      <div style={{ padding: "12px", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>🔍 Condition / Repairs</div>
        <textarea placeholder="Describe any chips, repairs, restoration, or reconstitution. Write 'None known' if specimen is unaltered."
          value={localDoc.conditionNote} onChange={e => update("conditionNote", e.target.value)}
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
  {
    key: "integrity",
    label: "This PRISM evaluation is honest and unbiased. Species identification and locality are accurate to the best of my knowledge. The specimen is a genuine natural mineral — not synthetic, artificially grown, or an undisclosed composite.",
    short: "Honest evaluation · accurate identification · genuine specimen",
  },
  {
    key: "disclosure",
    label: "All repairs, restoration, reconstitution, or enhancements are fully disclosed. Any known radiation, toxicity, or handling hazards (uranium minerals, asbestos-group, mercury, lead, etc.) are disclosed.",
    short: "All repairs and physical hazards disclosed",
  },
  {
    key: "legal",
    label: "To the best of my knowledge, this specimen was legally collected or acquired, legally exported from its country of origin, and legally imported into its current country of possession. It has no known conflict-zone or sanctioned-country origin, does not violate cultural heritage or patrimony laws, has not been reported stolen or misappropriated, and carries no CITES Appendix I/II restrictions without documentation.",
    short: "Legally collected, exported, and imported · no conflict origin · no patrimony violations",
  },
];

function AttestationStep({ attestations, setAttestations, evaluatorName, setEvaluatorName, evaluatorOrg, setEvaluatorOrg, customAttestations, setCustomAttestations }) {
  const [newText, setNewText] = useState("");
  const [showWhy, setShowWhy] = useState(false);
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", margin: 0 }}>Attestations</h3>
          <button
            onClick={() => setShowWhy(w => !w)}
            title="Why do I have to attest to these?"
            style={{
              width: "18px", height: "18px", borderRadius: "50%",
              background: showWhy ? "rgba(0,212,255,0.15)" : "rgba(0,212,255,0.06)",
              border: "1px solid rgba(0,212,255,0.35)",
              color: "var(--cyan)", fontSize: "11px", fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, lineHeight: 1,
            }}
          >?</button>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic" }}>Why do I have to attest to these?</span>
        </div>
        <p style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.55, margin: 0 }}>
          These attestations are embedded in the certificate and QR code. They are your formal statement of accuracy. False attestation devalues the certificate and is unethical.
        </p>
      </div>

      {showWhy && (
        <div style={{
          padding: "14px 16px", background: "rgba(0,212,255,0.04)",
          border: "1px solid rgba(0,212,255,0.2)", borderRadius: "6px",
          fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.7,
          display: "flex", flexDirection: "column", gap: "8px",
        }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>Why attestations matter</div>
          <p style={{ margin: 0 }}>
            A PRISM certificate is a public document tied to a verifiable QR code. Anyone who scans it — a buyer, a museum, an auction house, or a future owner — is relying on the statements you make here to be true. The attestations are not bureaucratic formality; they are the backbone of what makes the certificate meaningful.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: "var(--text)" }}>Legal collection</strong> protects you and the buyer from unknowingly handling stolen or illegally collected material. <strong style={{ color: "var(--text)" }}>Locality accuracy</strong> and <strong style={{ color: "var(--text)" }}>species authenticity</strong> are core to scientific and collector value — misrepresenting these is fraud. <strong style={{ color: "var(--text)" }}>Repair disclosure</strong> is an industry standard; undisclosed repairs are grounds for reversal of sale in most jurisdictions.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: "var(--text)" }}>Cultural patrimony, conflict origin, and import compliance</strong> are legal obligations in many countries, not just ethical preferences. Specimens removed from countries like Morocco, China, or Peru without proper export documentation can be seized and repatriated — this affects every subsequent owner. <strong style={{ color: "var(--text)" }}>Hazard disclosure</strong> protects the health of anyone who handles the specimen.
          </p>
          <p style={{ margin: 0 }}>
            The <strong style={{ color: "var(--text)" }}>honest evaluation</strong> attestation means you are not inflating scores for insurance, sale, or donation tax purposes — doing so carries civil and criminal liability.
          </p>
          <div style={{
            marginTop: "4px", padding: "10px 12px",
            background: "rgba(255,100,60,0.06)", border: "1px solid rgba(255,100,60,0.25)",
            borderRadius: "5px", fontSize: "11px", color: "#e08060", fontWeight: 500,
          }}>
            If you cannot honestly confirm these statements, do not generate this certificate. A certificate you cannot stand behind does more harm than no certificate at all.
          </div>
        </div>
      )}

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

function CertPreview({ certId, issued, scores, spec, sizeClass, docData, photos, attestations, evaluatorName, evaluatorOrg, primaryCtx, compoundGrades, customAttestations = [], onSaved }) {
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
    pt: (docData.provTier || "").replace(/\s*\(.*$/, "").trim(),
    at: {
      in: attestations.integrity,
      di: attestations.disclosure,
      le: attestations.legal,
    },
    ev: evaluatorName, org: evaluatorOrg,
  };
  const PRISM_BASE = "https://aaroncelestian.github.io/PRISM/";

  useEffect(() => {
    computeHmac(JSON.stringify(certData))
      .then(sig => {
        const signed = { ...certData, sig: sig.slice(0, 20) };
        const url = `${PRISM_BASE}?verify=${safeB64Encode(JSON.stringify(signed))}`;
        return QRCode.toDataURL(url, { width: 300, margin: 2, errorCorrectionLevel: "L", color: { dark: "#0d1520", light: "#ffffff" } });
      })
      .then(setQrUrl)
      .catch(console.error);
  }, [certId]);

  const handlePrint = () => {
    const certEl = document.getElementById("prism-cert-root");
    if (!certEl) return;
    const pw = window.open("", "_blank", "width=800,height=900");
    if (!pw) { alert("Please allow pop-ups for this site to print."); return; }
    pw.document.write(`<!DOCTYPE html><html><head><title>PRISM Certificate — ${certId}</title>
      <style>
        body { font-family: 'Exo 2', system-ui, sans-serif; margin: 0; padding: 24px; }
        @page { size: A4; margin: 15mm; }
        @media print { body { padding: 0; } }
      </style>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&display=swap" rel="stylesheet">
    </head><body>${certEl.innerHTML}</body></html>`);
    pw.document.close();
    pw.onload = () => { pw.focus(); pw.print(); onSaved?.(); };
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
          <button onClick={handlePrint} style={{ ...btnStyle, background: "rgba(0,200,128,0.1)", border: "1px solid rgba(0,200,128,0.4)", color: "#00c880" }}>
            <FileDown size={12} /> Save as PDF
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
              <img src={qrUrl} width={110} height={110} alt="QR" style={{ display: "block" }} />
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
        <div style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px solid #d0dce8" }}>
          <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: grade.color }}>{grade.label.toUpperCase()} GRADE</div>
            <div style={{ fontSize: "11px", color: "#507090" }}>Score: <strong style={{ color: grade.color }}>{primaryCtx.score}/100</strong></div>
            {compoundGrades.length > 0 && (
              <div style={{ fontSize: "9px", color: "#8090a0", letterSpacing: "0.04em" }}>{compoundGrades.map(cg => cg.label).join(" · ")}</div>
            )}
          </div>
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
          <div style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px solid #d0dce8" }}>
            <div style={{ fontSize: "8px", letterSpacing: "0.14em", color: "#507090", textTransform: "uppercase", marginBottom: "4px" }}>Documentation Photos</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {photos.specimen && (
                <div style={{ textAlign: "center" }}>
                  <img src={photos.specimen} alt="Specimen" style={{ height: "70px", objectFit: "cover", borderRadius: "3px", border: "1px solid #d0dce8", display: "block" }} />
                  <div style={{ fontSize: "7px", color: "#8090a0", marginTop: "2px" }}>Specimen</div>
                </div>
              )}
              {photos.display && (
                <div style={{ textAlign: "center" }}>
                  <img src={photos.display} alt="Display" style={{ height: "70px", objectFit: "cover", borderRadius: "3px", border: "1px solid #d0dce8", display: "block" }} />
                  <div style={{ fontSize: "7px", color: "#8090a0", marginTop: "2px" }}>Alt. angle</div>
                </div>
              )}
              {photos.label && (
                <div style={{ textAlign: "center" }}>
                  <img src={photos.label} alt="Label" style={{ height: "70px", objectFit: "cover", borderRadius: "3px", border: "1px solid #d0dce8", display: "block" }} />
                  <div style={{ fontSize: "7px", color: "#8090a0", marginTop: "2px" }}>Collection label</div>
                </div>
              )}
              {photos.document && (
                <div style={{ textAlign: "center" }}>
                  <img src={photos.document} alt="Document" style={{ height: "70px", objectFit: "cover", borderRadius: "3px", border: "1px solid #d0dce8", display: "block" }} />
                  <div style={{ fontSize: "7px", color: "#8090a0", marginTop: "2px" }}>Provenance doc</div>
                </div>
              )}
            </div>
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
          Scan QR to verify at <strong>aaroncelestian.github.io/PRISM</strong>
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

// ── Specimen Picker ───────────────────────────────────────────────────────────

function SpecimenPickerScreen({ initScores, initSpec, records, onSelect, onClose }) {
  const { score: curScore, grade: curGrade } = computeDisplayScore(initScores);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(4,8,18,0.90)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "600px", maxHeight: "92vh", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-dim)", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Award size={16} style={{ color: "var(--cyan)" }} />
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>PRISM Certificate</div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "1px" }}>Select the specimen to certify</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Current evaluation */}
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Current Evaluation</div>
            <button
              onClick={() => onSelect(initScores, initSpec)}
              style={{ width: "100%", textAlign: "left", padding: "12px 14px", background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.25)", borderRadius: "7px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.5)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.25)"}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>
                  {initSpec.name || initSpec.species || "Unnamed Specimen"}
                </div>
                {(initSpec.species || initSpec.locality) && (
                  <div style={{ fontSize: "10px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {[initSpec.species, initSpec.locality].filter(Boolean).join(" \u00b7 ")}
                  </div>
                )}
                <div style={{ marginTop: "4px", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>Active session — not yet saved to history</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--mono)", color: curGrade.color, lineHeight: 1 }}>{curScore}</div>
                <div style={{ marginTop: "3px", fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: `${curGrade.color}15`, color: curGrade.color, border: `1px solid ${curGrade.color}30`, fontWeight: 600, letterSpacing: "0.06em", display: "inline-block" }}>{curGrade.emoji} {curGrade.label}</div>
              </div>
            </button>
          </div>

          {/* Saved collection */}
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
              Saved Collection {records.length > 0 ? `(${records.length})` : ""}
            </div>
            {records.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)", lineHeight: 1.6 }}>
                No specimens saved to history yet.<br />Save a PRISM evaluation first using the Save button.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {records.map(rec => {
                  const gradeObj = GRADES.find(g => g.label === rec.grade) || GRADES[GRADES.length - 1];
                  const dateStr = new Date(rec.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  return (
                    <button
                      key={rec.id}
                      onClick={() => onSelect(rec.scores, rec.spec)}
                      style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.3)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>
                          {rec.spec?.name || rec.spec?.species || "Unnamed Specimen"}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {[rec.spec?.species, rec.spec?.locality].filter(Boolean).join(" \u00b7 ")}
                        </div>
                        <div style={{ marginTop: "3px", fontSize: "9px", color: "var(--text-muted)" }}>Saved {dateStr}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--mono)", color: gradeObj.color, lineHeight: 1 }}>{rec.prismScore}</div>
                        <div style={{ marginTop: "3px", fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: `${gradeObj.color}15`, color: gradeObj.color, border: `1px solid ${gradeObj.color}30`, fontWeight: 600, letterSpacing: "0.06em", display: "inline-block" }}>{rec.gradeEmoji} {rec.grade}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-dim)", flexShrink: 0 }}>
          <button onClick={onClose} style={btnStyle}>
            <X size={13} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const STEPS = ["Review", "Documentation", "Attestations", "Certificate"];

export default function CertGenerator({ scores: initScores, spec: initSpec, records = [], onClose }) {
  const [step, setStep] = useState(0);
  const [showPicker, setShowPicker] = useState(true);
  const [workingScores, setWorkingScores] = useState(initScores);
  const [workingSpec, setWorkingSpec] = useState(initSpec);
  const [sizeClass, setSizeClass] = useState("");
  const [docData, setDocData] = useState({
    localityNote: "", speciesNote: "", chainOfCustody: "", conditionNote: "None known.", scientificNote: "", provTier: "",
  });
  const [photos, setPhotos] = useState({ specimen: null, display: null, label: null, document: null });
  const [attestations, setAttestations] = useState({
    integrity: false, disclosure: false, legal: false,
  });
  const [evaluatorName, setEvaluatorName] = useState("");
  const [evaluatorOrg, setEvaluatorOrg] = useState("");
  const [customAttestations, setCustomAttestations] = useState([]);
  const [certId] = useState(generateCertId);
  const [issued] = useState(() => new Date().toISOString());
  const [certSaved, setCertSaved] = useState(false);
  const [showDoneWarn, setShowDoneWarn] = useState(false);

  // Compute context data
  const allCtxData = CONTEXTS.map(c => {
    const score = computeContextScore(c.key, workingScores);
    return { ...c, score, grade: getGrade(score) };
  });
  const primaryCtx = allCtxData.find(c => c.score >= THRESHOLD) || allCtxData[0];
  const allCtxScores = Object.fromEntries(allCtxData.map(c => [c.key, c.score]));
  const rawCompounds = detectCompoundGrades(allCtxScores);
  const compoundGrades = rawCompounds.filter(cg => {
    const cgKeys = new Set(Object.keys(cg.contexts));
    return !rawCompounds.some(other => other.key !== cg.key && [...cgKeys].every(k => new Set(Object.keys(other.contexts)).has(k)));
  });

  const handleSelectSource = (scores, spec) => {
    setWorkingScores(scores);
    setWorkingSpec(spec);
    setShowPicker(false);
  };

  const canAdvance = () => {
    if (step === 0) return !!sizeClass;
    if (step === 2) return Object.values(attestations).every(Boolean) && evaluatorName.trim().length > 0;
    return true;
  };

  if (showPicker) {
    return (
      <SpecimenPickerScreen
        initScores={initScores}
        initSpec={initSpec}
        records={records}
        onSelect={handleSelectSource}
        onClose={onClose}
      />
    );
  }

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
              <Award size={16} style={{ color: "var(--cyan)", flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>PRISM Certificate</span>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {workingSpec.name || workingSpec.species || "Unnamed Specimen"}
                  {workingSpec.locality ? ` · ${workingSpec.locality}` : ""}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", flexShrink: 0 }}><X size={16} /></button>
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
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 20px" }}>
          {step === 0 && <ReviewStep scores={workingScores} spec={workingSpec} sizeClass={sizeClass} setSizeClass={setSizeClass} allCtxData={allCtxData} primaryCtx={primaryCtx} compoundGrades={compoundGrades} />}
          {step === 1 && <DocumentationStep scores={workingScores} spec={workingSpec} docData={docData} setDocData={setDocData} photos={photos} setPhotos={setPhotos} />}
          {step === 2 && <AttestationStep attestations={attestations} setAttestations={setAttestations} evaluatorName={evaluatorName} setEvaluatorName={setEvaluatorName} evaluatorOrg={evaluatorOrg} setEvaluatorOrg={setEvaluatorOrg} customAttestations={customAttestations} setCustomAttestations={setCustomAttestations} />}
          {step === 3 && <CertPreview certId={certId} issued={issued} scores={workingScores} spec={workingSpec} sizeClass={sizeClass} docData={docData} photos={photos} attestations={attestations} evaluatorName={evaluatorName} evaluatorOrg={evaluatorOrg} primaryCtx={primaryCtx} compoundGrades={compoundGrades} customAttestations={customAttestations} onSaved={() => setCertSaved(true)} />}
        </div>

        {/* Footer nav */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-dim)", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : setShowPicker(true)} style={btnStyle}>
            <ChevronLeft size={13} /> {step === 0 ? "Change Specimen" : "Back"}
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              {showDoneWarn && !certSaved && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#ffa028", background: "rgba(255,160,40,0.07)", border: "1px solid rgba(255,160,40,0.28)", borderRadius: "5px", padding: "6px 10px" }}>
                  <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                  <span>Save as PDF before closing — this certificate cannot be recovered.</span>
                  <button onClick={onClose} style={{ background: "none", border: "none", color: "#ffa028", textDecoration: "underline", cursor: "pointer", fontSize: "11px", whiteSpace: "nowrap", padding: 0 }}>Close anyway</button>
                </div>
              )}
              <button
                onClick={() => { if (!certSaved) { setShowDoneWarn(true); } else { onClose(); } }}
                style={{ ...btnStyle, background: certSaved ? "rgba(0,200,128,0.08)" : "var(--bg-panel)", border: `1px solid ${certSaved ? "rgba(0,200,128,0.35)" : "var(--border)"}`, color: certSaved ? "#00c880" : "var(--text-muted)" }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
