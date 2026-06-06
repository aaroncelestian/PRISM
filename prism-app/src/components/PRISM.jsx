import { useState } from "react";
import { Wand2, SlidersHorizontal, RotateCcw } from "lucide-react";
import { CONTEXTS, WEIGHTS } from "../data/prism.js";
import WizardMode from "./WizardMode.jsx";
import ExpertMode from "./ExpertMode.jsx";

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
