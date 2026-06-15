import { useState, useEffect, useRef } from "react";
import { Wand2, SlidersHorizontal, RotateCcw, Search } from "lucide-react";
import { CONTEXTS, WEIGHTS, GRADES, THRESHOLD, detectCompoundGrades } from "../data/prism.js";
import { useBreakpoint } from "../hooks/useWindowSize.js";
import WizardMode from "./WizardMode.jsx";
import ExpertMode from "./ExpertMode.jsx";
import DonationEval from "./DonationEval.jsx";
import PricingTool from "./PricingTool.jsx";
import BuyerGuide from "./BuyerGuide.jsx";
import CertGenerator from "./CertGenerator.jsx";
import QuickExport from "./QuickExport.jsx";
import CollectionHistory from "./CollectionHistory.jsx";
import HelpGuide from "./HelpGuide.jsx";
import MeteoriteID from "./MeteoriteID.jsx";
import VerifyView from "./VerifyView.jsx";
import { useLocalCollection } from "../hooks/useLocalCollection.js";
import { APP_VERSION } from "../version.js";
import { useComparables } from "../hooks/useComparables.js";
import ResearchMode from "./ResearchMode.jsx";

function computePrimary(scores) {
  const all = CONTEXTS.map(c => {
    const W = WEIGHTS[c.key];
    const score = Math.round(Object.entries(W).reduce((a,[k,w]) => a + (scores[k]??50)*w, 0));
    return { ...c, score };
  });
  const passing = all.find(c => c.score >= THRESHOLD) || all[0];
  const grade = GRADES.find(g => passing.score >= g.min) || GRADES[GRADES.length-1];
  const allCtxScores = Object.fromEntries(all.map(c => [c.key, c.score]));
  return { score: passing.score, grade, compoundGrades: detectCompoundGrades(allCtxScores) };
}

const DEFAULT_SCORES = {
  crystal: 0, speciesRarity: 0, localityRarity: 0,
  provenance: 0, aesthetics: 0, scientific: 0,
};

function ToolMenuItems({ items, isMobile }) {
  return (
    <>
      {items.map((item, idx) =>
        item.type === "header" ? (
          <div key={idx} style={{ padding: isMobile ? "8px 16px 3px" : "7px 16px 3px", fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase", borderTop: idx > 0 ? "1px solid var(--border-dim)" : "none", marginTop: idx > 0 ? "2px" : "0" }}>
            {item.label}
          </div>
        ) : (
          <button key={item.label} onClick={item.action} style={{ display: "block", width: "100%", textAlign: "left", padding: isMobile ? "12px 16px" : "9px 16px", background: "none", border: "none", color: "var(--text-dim)", fontSize: isMobile ? "13px" : "12px", cursor: "pointer", transition: "background 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,212,255,0.06)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}>
            {item.label}
          </button>
        )
      )}
    </>
  );
}

export default function PRISM() {
  const [mode, setMode] = useState("wizard"); // "wizard" | "expert" | "research"
  const [ctx, setCtx] = useState("collector");
  const [scores, setScores] = useState(DEFAULT_SCORES);
  const [spec, setSpec] = useState({ name: "", species: "", locality: "" });
  const [sciCriteria, setSciCriteria] = useState([false, false, false, false, false]);
  const [showDonation,   setShowDonation]   = useState(false);
  const [showPricing,    setShowPricing]    = useState(false);
  const [showBuyerGuide, setShowBuyerGuide] = useState(false);
  const [showCert,       setShowCert]       = useState(false);
  const [showExport,     setShowExport]     = useState(false);
  const [showHistory,    setShowHistory]    = useState(false);
  const [showHelp,       setShowHelp]       = useState(false);
  const [showMeteoriteID, setShowMeteoriteID] = useState(false);
  const [lastSavedKey,   setLastSavedKey]   = useState(null);
  const [spSource,       setSpSource]       = useState(null); // SpecimenPro integration
  const [scoringCompId,  setScoringCompId]  = useState(null); // Research mode comp being scored
  const [wizardKey,      setWizardKey]      = useState(0);     // increment to reset WizardMode step
  const [confirmReset,   setConfirmReset]   = useState(false);
  const resetTimerRef = useRef(null);
  const [savedFlash, setSavedFlash] = useState(null);
  const savedFlashTimerRef = useRef(null);
  const { records, saveRecord, deleteRecord, clearAll, importRecords } = useLocalCollection();
  const { comps, addComp, updateComp, deleteComp, clearAll: clearComps, importComps } = useComparables();
  const [verifyPayload, setVerifyPayload] = useState(null);
  const [showTools, setShowTools] = useState(false);
  const { isMobile } = useBreakpoint();

  const toolMenuItems = [
    { type: "header", label: "Reference" },
    { label: "❓ Help / Guide",        action: () => { setShowHelp(true);        setShowTools(false); } },
    { label: "🎓 Buyer Guide",         action: () => { setShowBuyerGuide(true);  setShowTools(false); } },
    { label: "☄️ Meteorite ID",        action: () => { setShowMeteoriteID(true); setShowTools(false); } },
    { type: "header", label: "Valuation" },
    { label: "📤 Quick Summary",       action: () => { setShowExport(true);      setShowTools(false); } },
    { label: "📜 Formal Certificate",  action: () => { setShowCert(true);        setShowTools(false); } },
    { label: "💰 Sell / Trade",        action: () => { setShowPricing(true);     setShowTools(false); } },
    { label: "🏛️ Donate to Museum",   action: () => { setShowDonation(true);    setShowTools(false); } },
  ];

  useEffect(() => {
    if (!showTools) return;
    const close = (e) => { if (!e.target.closest('[data-tools-menu]')) setShowTools(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showTools]);

  // ── Read URL params ───────────────────────────────────────────────────
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);

    // QR certificate verification
    const verifyParam = p.get("verify");
    if (verifyParam) {
      try {
        const data = JSON.parse(decodeURIComponent(escape(atob(verifyParam))));
        setVerifyPayload(data);
        return; // Don't parse other params when verifying
      } catch {
        console.warn("Invalid verify payload");
      }
    }

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
    setScoringCompId(null);
    setLastSavedKey(null);
  };

  const handleSaveToCollection = () => {
    const key = JSON.stringify({ scores, spec, ctx });
    if (savedFlashTimerRef.current) clearTimeout(savedFlashTimerRef.current);
    if (key === lastSavedKey) {
      setSavedFlash("already");
      savedFlashTimerRef.current = setTimeout(() => setSavedFlash(null), 1800);
      return;
    }
    const { score, grade, compoundGrades } = computePrimary(scores);
    saveRecord(spec, scores, ctx, grade.label, grade.emoji, score, compoundGrades);
    setLastSavedKey(key);
    setSavedFlash("saved");
    savedFlashTimerRef.current = setTimeout(() => setSavedFlash(null), 1800);
  };

  const handleScoreComp = (comp) => {
    setScoringCompId(comp.id);
    setSpec({ name: comp.species, species: comp.species, locality: comp.locality || "" });
    setScores(comp.scores ? { ...DEFAULT_SCORES, ...comp.scores } : DEFAULT_SCORES);
    setSciCriteria([false, false, false, false, false]);
    if (comp.ctx) setCtx(comp.ctx);
    setMode("wizard");
  };

  const handleSaveToComp = () => {
    if (!scoringCompId) return;
    const { score, grade } = computePrimary(scores);
    updateComp(scoringCompId, {
      scores: { ...scores },
      grade: grade.label,
      gradeEmoji: grade.emoji,
      prismScore: score,
      ctx,
    });
    setScoringCompId(null);
    setMode("research");
  };

  // QR verification mode — render standalone page instead of app
  if (verifyPayload) return <VerifyView payload={verifyPayload} />;

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
        background: "var(--bg-panel)",
        flexShrink: 0,
      }}>

        {/* Primary row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "0 14px" : "0 22px",
          height: "48px",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", minWidth: 0 }}>
            <span style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: "15px", color: "var(--cyan)", letterSpacing: "0.1em", flexShrink: 0 }}>PRISM</span>
            <span style={{ fontSize: "9px", fontFamily: "var(--mono)", color: "var(--text-muted)", opacity: 0.55, flexShrink: 0 }}>v{APP_VERSION}</span>
            {!isMobile && (
              <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Precision Rating Index · Specimen Minerals
              </span>
            )}
            {spSource && (
              <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "3px", background: "rgba(0,200,128,0.1)", border: "1px solid rgba(0,200,128,0.3)", color: "#00c880", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                ↳ {isMobile ? "SP" : `SpecimenPro${spSource.name ? ": " + spSource.name : ""}`}
              </span>
            )}
          </div>

          {/* Primary controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>


            {/* Mode toggle */}
            <div style={{ display: "flex", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "5px", overflow: "hidden" }}>
              {[
                { key: "wizard",   label: "Guided",   Icon: Wand2 },
                { key: "expert",   label: "Expert",   Icon: SlidersHorizontal },
                { key: "research", label: "Research", Icon: Search },
              ].map(({ key, label, Icon }, i, arr) => (
                <button key={key} onClick={() => { if (key !== "wizard") setScoringCompId(null); setMode(key); }} style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: isMobile ? "5px 10px" : "5px 12px",
                  background: mode === key ? "rgba(0,212,255,0.1)" : "transparent", border: "none",
                  borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  color: mode === key ? "var(--cyan)" : "var(--text-muted)",
                  fontSize: "11px", fontWeight: mode === key ? 600 : 400, letterSpacing: "0.06em", transition: "all 0.15s",
                }}>
                  <Icon size={12} />
                  {!isMobile && <span style={{ marginLeft: "3px" }}>{label}</span>}
                  {key === "research" && comps.length > 0 && (
                    <span style={{ marginLeft: "3px", fontSize: "9px", fontFamily: "var(--mono)", opacity: 0.75 }}>{comps.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Action buttons — desktop only in primary row */}
            {!isMobile && (
              <>
{mode !== "research" && (
                <button onClick={() => setShowHistory(true)} title="Collection history"
                  style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", background: records.length > 0 ? "rgba(0,212,255,0.06)" : "transparent", border: `1px solid ${records.length > 0 ? "rgba(0,212,255,0.25)" : "var(--border)"}`, borderRadius: "5px", color: records.length > 0 ? "var(--cyan)" : "var(--text-muted)", fontSize: "11px", letterSpacing: "0.06em", transition: "all 0.2s" }}>
                  📚{records.length > 0 ? ` ${records.length}` : ""} History
                </button>
              )}
                {/* Tools dropdown */}
                <div data-tools-menu style={{ position: "relative" }}>
                  <button onClick={() => setShowTools(t => !t)}
                    style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", background: showTools ? "rgba(0,212,255,0.08)" : "transparent", border: `1px solid ${showTools ? "rgba(0,212,255,0.35)" : "var(--border)"}`, borderRadius: "5px", color: showTools ? "var(--cyan)" : "var(--text-muted)", fontSize: "11px", letterSpacing: "0.06em", transition: "all 0.15s" }}>
                    🛠️ Tools ▾
                  </button>
                  {showTools && (
                    <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 200, minWidth: "180px", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 8px 24px rgba(0,0,0,0.45)", overflow: "hidden" }}>
                      <ToolMenuItems items={toolMenuItems} isMobile={false} />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Reset */}
            <button
              onClick={() => {
                if (!confirmReset) {
                  setConfirmReset(true);
                  resetTimerRef.current = setTimeout(() => setConfirmReset(false), 3000);
                } else {
                  clearTimeout(resetTimerRef.current);
                  setConfirmReset(false);
                  reset();
                }
              }}
              onBlur={() => { clearTimeout(resetTimerRef.current); setConfirmReset(false); }}
              title={confirmReset ? "Tap again to confirm reset" : "Reset everything"}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "5px 10px", borderRadius: "5px", fontSize: "11px",
                cursor: "pointer", transition: "all 0.2s",
                background: confirmReset ? "rgba(255,60,60,0.12)" : "transparent",
                border: confirmReset ? "1px solid rgba(255,80,80,0.5)" : "1px solid var(--border)",
                color: confirmReset ? "#ff6060" : "var(--text-muted)",
                fontWeight: confirmReset ? 600 : 400,
              }}
            >
              <RotateCcw size={12} />
              {confirmReset && <span>Reset?</span>}
            </button>
          </div>
        </div>


        {/* Mobile action row — horizontally scrollable */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px 8px", overflowX: "auto", borderTop: "1px solid var(--border-dim)", scrollbarWidth: "none" }}>
            <button onClick={handleSaveToCollection}
              style={{ flexShrink: 0, padding: "5px 11px", borderRadius: "4px", whiteSpace: "nowrap", fontSize: "12px",
                background: savedFlash === "saved" ? "rgba(0,200,128,0.15)" : savedFlash === "already" ? "rgba(170,170,170,0.07)" : "transparent",
                border: `1px solid ${savedFlash === "saved" ? "rgba(0,200,128,0.5)" : savedFlash === "already" ? "rgba(170,170,170,0.3)" : "var(--border)"}`,
                color: savedFlash === "saved" ? "#00c880" : "var(--text-muted)" }}>
              {savedFlash === "saved" ? "✓" : savedFlash === "already" ? "↩" : "💾"} Save
            </button>
{mode !== "research" && (
            <button onClick={() => setShowHistory(true)}
              style={{ flexShrink: 0, padding: "5px 11px", borderRadius: "4px", background: records.length > 0 ? "rgba(0,212,255,0.06)" : "transparent", border: `1px solid ${records.length > 0 ? "rgba(0,212,255,0.25)" : "var(--border)"}`, color: records.length > 0 ? "var(--cyan)" : "var(--text-muted)", fontSize: "12px", whiteSpace: "nowrap" }}>
              📚{records.length > 0 ? ` ${records.length}` : ""} History
            </button>
            )}
            <button onClick={() => setShowTools(t => !t)}
              style={{ flexShrink: 0, padding: "5px 11px", borderRadius: "4px", background: showTools ? "rgba(0,212,255,0.08)" : "transparent", border: `1px solid ${showTools ? "rgba(0,212,255,0.35)" : "var(--border)"}`, color: showTools ? "var(--cyan)" : "var(--text-muted)", fontSize: "12px", whiteSpace: "nowrap" }}>
              🛠️ Tools ▾
            </button>
          </div>
        )}

        {/* Tools dropdown (shared desktop + mobile) — positioned fixed on mobile */}
        {showTools && isMobile && (
          <>
            <div onClick={() => setShowTools(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
            <div style={{ position: "fixed", top: "96px", right: "14px", zIndex: 200, minWidth: "200px", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", overflow: "hidden" }}>
              <ToolMenuItems items={toolMenuItems} isMobile={true} />
            </div>
          </>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: isMobile ? "auto" : "hidden" }}>

      {showHelp && (
        <HelpGuide onClose={() => setShowHelp(false)} />
      )}
      {showMeteoriteID && (
        <MeteoriteID onClose={() => setShowMeteoriteID(false)} />
      )}
      {showDonation && (
        <DonationEval scores={scores} spec={spec} records={records} onClose={() => setShowDonation(false)} />
      )}
      {showPricing && (
        <PricingTool scores={scores} spec={spec} records={records} onClose={() => setShowPricing(false)} />
      )}
      {showBuyerGuide && (
        <BuyerGuide onClose={() => setShowBuyerGuide(false)} />
      )}
      {showCert && (
        <CertGenerator scores={scores} spec={spec} records={records} onClose={() => setShowCert(false)} />
      )}
      {showExport && (
        <QuickExport scores={scores} spec={spec} spSource={spSource} records={records} onClose={() => setShowExport(false)} />
      )}
      {showHistory && (
        <CollectionHistory
          records={records}
          onLoad={rec => {
            const loadedScores = { ...DEFAULT_SCORES, ...(rec.scores || {}) };
            setScores(loadedScores);
            setSpec(rec.spec || {});
            setCtx(rec.ctx || "collector");
            setLastSavedKey(JSON.stringify({ scores: loadedScores, spec: rec.spec, ctx: rec.ctx }));
            const sciCount = Math.round((loadedScores.scientific ?? 0) / 20);
            setSciCriteria(Array(5).fill(false).map((_, i) => i < sciCount));
            setScoringCompId(null);
            setSpSource(null);
            setMode("expert");
          }}
          onDelete={deleteRecord}
          onClearAll={clearAll}
          onClose={() => setShowHistory(false)}
          onImport={importRecords}
        />
      )}
        {mode === "wizard" ? (
          <WizardMode
            key={wizardKey}
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
            initialStep={spSource || scoringCompId ? 1 : 0}
            scoringComp={scoringCompId ? comps.find(c => c.id === scoringCompId) : null}
            onSaveToComp={scoringCompId ? handleSaveToComp : null}
            onSaveToCollection={handleSaveToCollection}
          />
        ) : mode === "expert" ? (
          <ExpertMode
            scores={scores}
            setScores={setScores}
            ctx={ctx}
            spec={spec}
            setSpec={setSpec}
            sciCriteria={sciCriteria}
            onSciCriteriaChange={handleSciCriteria}
            onExport={() => setShowExport(true)}
            onSaveToCollection={handleSaveToCollection}
          />
        ) : (
          <ResearchMode
            comps={comps}
            onAdd={addComp}
            onUpdate={updateComp}
            onDelete={deleteComp}
            onScoreComp={handleScoreComp}
            onImport={importComps}
            onClearAll={clearComps}
          />
        )}
      </div>
    </div>
  );
}
