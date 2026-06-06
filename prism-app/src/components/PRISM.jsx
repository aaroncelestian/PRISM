import { useState, useEffect } from "react";
import { Wand2, SlidersHorizontal, RotateCcw } from "lucide-react";
import { CONTEXTS, WEIGHTS } from "../data/prism.js";
import WizardMode from "./WizardMode.jsx";
import ExpertMode from "./ExpertMode.jsx";
import DonationEval from "./DonationEval.jsx";
import PricingTool from "./PricingTool.jsx";
import BuyerGuide from "./BuyerGuide.jsx";
import CertGenerator from "./CertGenerator.jsx";
import QuickExport from "./QuickExport.jsx";

const DEFAULT_SCORES = {
  crystal: 50, speciesRarity: 50, localityRarity: 50,
  provenance: 55, aesthetics: 50, scientific: 0,
};

export default function PRISM() {
  const [mode, setMode] = useState("wizard"); // "wizard" | "expert"
  const [ctx, setCtx] = useState("collector");
  const [scores, setScores] = useState(DEFAULT_SCORES);
  const [spec, setSpec] = useState({ name: "", species: "", locality: "" });
  const [sciCriteria, setSciCriteria] = useState([false, false, false, false, false]);
  const [showDonation,   setShowDonation]   = useState(false);
  const [showPricing,    setShowPricing]    = useState(false);
  const [showBuyerGuide, setShowBuyerGuide] = useState(false);
  const [showCert,       setShowCert]       = useState(false);
  const [showExport,     setShowExport]     = useState(false);
  const [spSource,       setSpSource]       = useState(null); // SpecimenPro integration

  // ── Read URL params (SpecimenPro deep-link) ───────────────────────────────
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("source") === "specimenPro") {
      const name     = p.get("name")     || "";
      const species  = p.get("species")  || "";
      const locality = p.get("locality") || "";
      const ctxParam = p.get("ctx");
      const provenance = parseInt(p.get("provenance") || "0", 10);
      const objectId = p.get("objectId") || "";

      if (name || species || locality) setSpec({ name, species, locality });
      if (ctxParam && CONTEXTS.some(c => c.key === ctxParam)) setCtx(ctxParam);
      if (provenance > 0) setScores(s => ({ ...s, provenance: Math.min(provenance, 100) }));
      setSpSource({ objectId, name });
      setMode("wizard");
      // Jump to step 2 (first dimension) since specimen info is pre-filled
      // This is handled via a ref in WizardMode; for now start at wizard beginning
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSciCriteria = (newCriteria) => {
    setSciCriteria(newCriteria);
    setScores(s => ({ ...s, scientific: newCriteria.filter(Boolean).length * 20 }));
  };

  const reset = () => {
    setScores(DEFAULT_SCORES);
    setSpec({ name: "", species: "", locality: "" });
    setCtx("collector");
    setMode("wizard");
    setSciCriteria([false, false, false, false, false]);
  };

  return (
    <div style={{
      fontFamily: "var(--sans)",
      background: "var(--bg)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── Header ── */}
      <div style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 22px",
        background: "var(--bg-panel)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "48px",
        flexShrink: 0,
      }}>

        {/* Logo + tagline */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <span style={{
            fontFamily: "var(--mono)", fontWeight: 600, fontSize: "15px",
            color: "var(--cyan)", letterSpacing: "0.1em",
          }}>
            PRISM
          </span>
          <span style={{
            fontSize: "10px", color: "var(--text-muted)",
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}>
            Precision Rating Index · Specimen Minerals
          </span>
          {spSource && (
            <span style={{
              fontSize: "9px", padding: "2px 8px", borderRadius: "3px",
              background: "rgba(0,200,128,0.1)", border: "1px solid rgba(0,200,128,0.3)",
              color: "#00c880", letterSpacing: "0.1em",
            }}>
              ↳ SpecimenPro{spSource.name ? `: ${spSource.name}` : ""}
            </span>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

          {/* Context switcher — diagnostic mode, highlights weight profile only */}
          {mode === "expert" && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "8px" }}>
              <span style={{
                fontSize: "9px", color: "var(--text-muted)",
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}>
                Diagnostic:
              </span>
              <div style={{ display: "flex", gap: "3px" }}>
              {CONTEXTS.map(c => (
                <button
                  key={c.key}
                  onClick={() => setCtx(c.key)}
                  title={c.desc}
                  style={{
                    padding: "4px 11px", borderRadius: "3px",
                    border: ctx === c.key
                      ? "1px solid rgba(0,212,255,0.45)"
                      : "1px solid var(--border)",
                    background: ctx === c.key ? "rgba(0,212,255,0.08)" : "transparent",
                    color: ctx === c.key ? "var(--cyan)" : "var(--text-muted)",
                    fontSize: "10px", fontWeight: ctx === c.key ? 600 : 400,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    transition: "all 0.15s",
                  }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
              </div>
            </div>
          )}

          {/* Mode toggle */}
          <div style={{
            display: "flex",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "5px",
            overflow: "hidden",
          }}>
            {[
              { key: "wizard", label: "Guided", Icon: Wand2 },
              { key: "expert", label: "Expert", Icon: SlidersHorizontal },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 12px",
                  background: mode === key ? "rgba(0,212,255,0.1)" : "transparent",
                  border: "none",
                  borderRight: key === "wizard" ? "1px solid var(--border)" : "none",
                  color: mode === key ? "var(--cyan)" : "var(--text-muted)",
                  fontSize: "11px", fontWeight: mode === key ? 600 : 400,
                  letterSpacing: "0.06em",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            onClick={() => setShowExport(true)}
            title="Export a quick specimen record with optional photo"
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 12px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "5px",
              color: "var(--text-muted)",
              fontSize: "11px",
              letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}
          >
            📤 Export
          </button>

          {/* Certificate */}
          <button
            onClick={() => setShowCert(true)}
            title="Generate a PRISM certificate with QR code"
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 12px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "5px",
              color: "var(--text-muted)",
              fontSize: "11px",
              letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}
          >
            🏅 Certificate
          </button>

          {/* Buyer Guide */}
          <button
            onClick={() => setShowBuyerGuide(true)}
            title="Buyer's reference guide — crystal quality, localities, provenance"
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 12px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "5px",
              color: "var(--text-muted)",
              fontSize: "11px",
              letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}
          >
            🎓 Buyer Guide
          </button>

          {/* Sell / Trade */}
          <button
            onClick={() => setShowPricing(true)}
            title="Get a selling/trading price estimate"
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 12px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "5px",
              color: "var(--text-muted)",
              fontSize: "11px",
              letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}
          >
            💰 Sell / Trade
          </button>

          {/* Museum Donation Eval */}
          <button
            onClick={() => setShowDonation(true)}
            title="Evaluate this specimen for museum donation"
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 12px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "5px",
              color: "var(--text-muted)",
              fontSize: "11px",
              letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}
          >
            🏛️ Donate to Museum
          </button>

          {/* Reset */}
          <button
            onClick={reset}
            title="Reset everything"
            style={{
              display: "flex", alignItems: "center",
              padding: "5px 10px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "5px",
              color: "var(--text-muted)",
              fontSize: "11px",
              transition: "all 0.15s",
            }}
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {showDonation && (
        <DonationEval scores={scores} spec={spec} onClose={() => setShowDonation(false)} />
      )}
      {showPricing && (
        <PricingTool scores={scores} spec={spec} onClose={() => setShowPricing(false)} />
      )}
      {showBuyerGuide && (
        <BuyerGuide onClose={() => setShowBuyerGuide(false)} />
      )}
      {showCert && (
        <CertGenerator scores={scores} spec={spec} onClose={() => setShowCert(false)} />
      )}
      {showExport && (
        <QuickExport scores={scores} spec={spec} spSource={spSource} onClose={() => setShowExport(false)} />
      )}
        {mode === "wizard" ? (
          <WizardMode
            scores={scores}
            setScores={setScores}
            ctx={ctx}
            setCtx={setCtx}
            spec={spec}
            setSpec={setSpec}
            sciCriteria={sciCriteria}
            onSciCriteriaChange={handleSciCriteria}
            onReset={reset}
            onExport={() => setShowExport(true)}
          />
        ) : (
          <ExpertMode
            scores={scores}
            setScores={setScores}
            ctx={ctx}
            spec={spec}
            setSpec={setSpec}
            sciCriteria={sciCriteria}
            onSciCriteriaChange={handleSciCriteria}
          />
        )}
      </div>
    </div>
  );
}
