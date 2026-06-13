import { useState, useEffect } from "react";
import { GRADES, COMPOUND_GRADES } from "../data/prism.js";

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

const DIMS_COMPACT = [
  { key: "cr", label: "Crystal Quality",  icon: "💠" },
  { key: "sr", label: "Species Rarity",   icon: "🌍" },
  { key: "lr", label: "Locality Rarity",  icon: "📍" },
  { key: "pv", label: "Provenance",       icon: "📜" },
  { key: "ae", label: "Aesthetics",       icon: "🎨" },
  { key: "si", label: "Scientific Value", icon: "🔬" },
];

const SIZE_LABELS = {
  thumbnail:  "Thumbnail (< 2.5 cm)",
  miniature:  "Miniature (2.5–4.5 cm)",
  small_cab:  "Small Cabinet (4.5–7.5 cm)",
  cabinet:    "Cabinet (7.5–12 cm)",
  large_cab:  "Large Cabinet (12–25 cm)",
  museum:     "Museum (> 25 cm)",
};

const ATTEST_LABELS = {
  in: { label: "Honest evaluation · accurate identification · genuine specimen" },
  di: { label: "All repairs and physical hazards disclosed" },
  le: { label: "Legally collected, exported, and imported · no conflict origin · no patrimony violations" },
};

function ScoreBar({ value }) {
  const color = value >= 70 ? "#1a9e60" : value >= 50 ? "#3070b0" : "#607080";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, height: "5px", background: "#e0e8f0", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: "2px" }} />
      </div>
      <span style={{ width: "28px", textAlign: "right", fontFamily: "monospace", fontSize: "11px", color: "#0d1520" }}>{value}</span>
    </div>
  );
}

export default function VerifyView({ payload }) {
  const [sigStatus, setSigStatus] = useState("checking"); // "checking" | "valid" | "invalid" | "unsigned"

  useEffect(() => {
    const { sig, ...dataToVerify } = payload;
    if (!sig) { setSigStatus("unsigned"); return; }
    computeHmac(JSON.stringify(dataToVerify))
      .then(computed => setSigStatus(computed === sig ? "valid" : "invalid"))
      .catch(() => setSigStatus("invalid"));
  }, []);

  // payload is the parsed certData object from the QR URL
  const { id, t, sp = {}, sc = {}, ps, gr, cg = [], pt, at = {}, ev, org } = payload;
  const displayScore = ps ?? Math.round((sc.cr + sc.sr + sc.lr + sc.pv + sc.ae + sc.si) / 6);
  const isEstimate = ps == null;

  const grade = GRADES.find(g => g.label === gr) || GRADES[GRADES.length - 1];
  const compounds = COMPOUND_GRADES.filter(c => cg.includes(c.key));
  const allAttestPass = Object.values(at).every(Boolean);
  const dateStr = t ? new Date(t).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Unknown";

  return (
    <div style={{
      minHeight: "100vh", background: "#f0f4f8",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "40px 20px", fontFamily: "'Exo 2', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>

        {/* Verification banner */}
        {sigStatus === "checking" && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", background: "#1a1e26", border: "1px solid #3a4060", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>⏳</span>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#90a0c0", letterSpacing: "0.1em" }}>VERIFYING SIGNATURE…</div>
          </div>
        )}
        {sigStatus === "valid" && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", background: "#0f1e10", border: "1px solid #2a6040", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>✅</span>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#40e080", letterSpacing: "0.1em" }}>VALID PRISM CERTIFICATE — SIGNATURE VERIFIED</div>
              <div style={{ fontSize: "10px", color: "#70b090" }}>Certificate ID: <strong style={{ fontFamily: "monospace", color: "#90d0b0" }}>{id}</strong> · Data has not been tampered with</div>
            </div>
          </div>
        )}
        {sigStatus === "invalid" && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", background: "#1e0f0f", border: "1px solid #602020", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>⛔</span>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#e04040", letterSpacing: "0.1em" }}>SIGNATURE INVALID — DATA MAY BE TAMPERED</div>
              <div style={{ fontSize: "10px", color: "#b07070" }}>The certificate data does not match its signature. Do not trust this certificate.</div>
            </div>
          </div>
        )}
        {sigStatus === "unsigned" && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", background: "#1a1608", border: "1px solid #604020", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#d0a040", letterSpacing: "0.1em" }}>LEGACY CERTIFICATE — NO SIGNATURE</div>
              <div style={{ fontSize: "10px", color: "#a08050" }}>Certificate ID: <strong style={{ fontFamily: "monospace", color: "#c0a060" }}>{id}</strong> · Generated before tamper-evident signing was added</div>
            </div>
          </div>
        )}

        {/* Main card */}
        <div style={{
          background: "#ffffff", borderRadius: "10px", overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          border: `2px solid ${grade.color}40`,
        }}>

          {/* Certificate header */}
          <div style={{
            padding: "20px 24px 16px",
            borderBottom: "2px solid #e0e8f0",
            background: `linear-gradient(135deg, ${grade.color}08, transparent)`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "0.18em", color: "#0d1520" }}>PRISM</div>
                <div style={{ fontSize: "9px", letterSpacing: "0.12em", color: "#507090", textTransform: "uppercase" }}>
                  Precision Rating Index of Specimen Minerals
                </div>
                <div style={{ marginTop: "8px", fontSize: "13px", fontWeight: 700, color: "#0d1520" }}>
                  CERTIFICATE OF EVALUATION
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "36px", fontWeight: 800, color: grade.color, fontFamily: "monospace", lineHeight: 1 }}>
                  {displayScore}
                </div>
                <div style={{ fontSize: "9px", color: "#507090" }}>{isEstimate ? "est. avg" : "/ 100"}</div>
              </div>
            </div>
          </div>

          {/* Grade badge */}
          <div style={{ padding: "14px 24px", borderBottom: "1px solid #e8f0f8", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "6px 16px", borderRadius: "4px",
              background: `${grade.color}14`, border: `1px solid ${grade.color}50`,
              color: grade.color, fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em",
            }}>
              {grade.emoji} {grade.label.toUpperCase()} GRADE
            </div>
            {compounds.length > 0 && (
              <div style={{ fontSize: "10px", color: "#507090" }}>
                {compounds.map(c => <span key={c.key} style={{ marginRight: "6px" }}>{c.emoji} {c.label}</span>)}
              </div>
            )}
          </div>

          {/* Specimen info */}
          <div style={{ padding: "14px 24px", borderBottom: "1px solid #e8f0f8" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.14em", color: "#507090", textTransform: "uppercase", marginBottom: "8px" }}>
              Specimen Information
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
              {[
                ["Name",       sp.n],
                ["Species",    sp.s],
                ["Locality",   sp.l],
                ["Size Class", SIZE_LABELS[sp.sz] || sp.sz],
                ["Issued",     dateStr],
                ["Evaluator",  ev ? [ev, org].filter(Boolean).join(", ") : null],
              ].filter(([,v]) => v).map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: "8px", color: "#507090", letterSpacing: "0.1em", textTransform: "uppercase" }}>{l}</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#0d1520" }}>{v}</div>
                </div>
              ))}
            </div>
            {pt && (
              <div style={{ marginTop: "8px", fontSize: "11px", color: "#0d1520" }}>
                <span style={{ fontSize: "8px", color: "#507090", textTransform: "uppercase", letterSpacing: "0.1em" }}>Provenance Tier </span>
                <strong>{pt}</strong>
              </div>
            )}
          </div>

          {/* Scores */}
          <div style={{ padding: "14px 24px", borderBottom: "1px solid #e8f0f8" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.14em", color: "#507090", textTransform: "uppercase", marginBottom: "8px" }}>
              Dimension Scores
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {DIMS_COMPACT.map(d => (
                <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", width: "20px" }}>{d.icon}</span>
                  <span style={{ flex: 1, fontSize: "11px", color: "#0d1520" }}>{d.label}</span>
                  <ScoreBar value={sc[d.key] ?? 0} />
                </div>
              ))}
            </div>
          </div>

          {/* Attestations */}
          <div style={{ padding: "14px 24px", borderBottom: "1px solid #e8f0f8" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.14em", color: "#507090", textTransform: "uppercase", marginBottom: "8px" }}>
              Evaluator Attestations
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px" }}>
              {Object.entries(ATTEST_LABELS).map(([k, { label }]) => {
                const passed = at[k] === true;
                return (
                  <div key={k} style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
                    <span style={{ fontSize: "11px", flexShrink: 0 }}>{passed ? "✅" : "❌"}</span>
                    <span style={{ fontSize: "10px", color: passed ? "#0d1520" : "#a0b0c0" }}>{label}</span>
                  </div>
                );
              })}
            </div>
            {!allAttestPass && (
              <div style={{ marginTop: "6px", fontSize: "10px", color: "#c04040", padding: "6px 10px", background: "#fff0f0", borderRadius: "4px" }}>
                ⚠️ One or more attestations were not confirmed by the evaluator.
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 24px", background: "#f8fafc", fontSize: "9px", color: "#8090a0", lineHeight: 1.5 }}>
            This certificate was generated by PRISM — Precision Rating Index of Specimen Minerals.
            The QR code encodes the complete verifiable data payload including all scores, grade, compound grades, provenance tier, and attestation flags.
            Photos and extended documentation notes are embedded in the original printed certificate only.
            <br /><br />
            Certificate ID: <strong style={{ fontFamily: "monospace" }}>{id}</strong>
            <br />
            <a href={window.location.href.split("?")[0]} style={{ color: "#3070b0" }}>← Return to PRISM evaluator</a>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "10px", color: "#8090a0" }}>
          PRISM · Precision Rating Index of Specimen Minerals
        </div>
      </div>
    </div>
  );
}
