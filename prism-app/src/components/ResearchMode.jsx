import { useState, useMemo, useRef } from "react";
import { Plus, X, Search, Edit2, Trash2, Award, Camera, Download, FolderOpen, ExternalLink, Upload } from "lucide-react";
import { GRADES, WEIGHTS, CONTEXTS } from "../data/prism.js";
import { useBreakpoint } from "../hooks/useWindowSize.js";
import { COMPS_SCHEMA } from "../version.js";
import { migrateComp, wrapForSave, unwrapFromFile } from "../utils/dbMigrations.js";
import ResearchAnalysis from "./ResearchAnalysis.jsx";

// ── Constants ─────────────────────────────────────────────────────────────────

const THRESHOLD = 70;

const SIZE_CLASSES = [
  { key: "thumbnail",  label: "Thumbnail",     range: "< 2.5 cm" },
  { key: "miniature",  label: "Miniature",     range: "2.5–4.5 cm" },
  { key: "small_cab",  label: "Small Cabinet", range: "4.5–7.5 cm" },
  { key: "cabinet",    label: "Cabinet",       range: "7.5–12 cm" },
  { key: "large_cab",  label: "Large Cabinet", range: "12–25 cm" },
  { key: "museum",     label: "Museum",        range: "> 25 cm" },
];

const CONDITIONS = [
  { key: "pristine",  label: "Pristine",       icon: "💎" },
  { key: "excellent", label: "Display Quality", icon: "✨" },
  { key: "good",      label: "Minor Chips",     icon: "🔶" },
  { key: "repaired",  label: "Repaired",        icon: "🔧" },
  { key: "damaged",   label: "Damaged",         icon: "⚠️" },
];

const COMMON_SOURCES = ["iRocks", "eBay", "Mindat Market", "Tucson Show", "Denver Show", "Dealer", "Heritage Auctions", "Catawiki", "Show Table"];

const DOMAIN_TO_SOURCE = {
  "irocks.com": "iRocks", "weinrichminerals.com": "Weinrich Minerals",
  "arkenstone.com": "The Arkenstone", "dakotamatrix.com": "Dakota Matrix",
  "mindat.org": "Mindat Market", "minfind.com": "Minfind",
  "ebay.com": "eBay", "ebay.com.au": "eBay",
  "heritage-auctions.com": "Heritage Auctions", "ha.com": "Heritage Auctions",
  "catawiki.com": "Catawiki", "invaluable.com": "Invaluable",
  "liveauctioneers.com": "LiveAuctioneers", "mineralauctions.com": "Mineral Auctions",
  "collector.com": "Collector.com", "rubylane.com": "Ruby Lane",
  "bidspirit.com": "BidSpirit", "crystalauctions.com": "Crystal Auctions",
};

const DIM_DISPLAY = [
  { key: "localityRarity", label: "Locality",   icon: "📍" },
  { key: "speciesRarity",  label: "Species",    icon: "🌍" },
  { key: "crystal",        label: "Crystal",    icon: "💠" },
  { key: "aesthetics",     label: "Aesthetics", icon: "🎨" },
  { key: "provenance",     label: "Provenance", icon: "📜" },
  { key: "scientific",     label: "Scientific", icon: "🔬" },
];

const EMPTY_FORM = { species: "", locality: "", sourceUrl: "", sizeClass: "miniature", condition: "excellent", askingPrice: "", source: "", notes: "", photo: null };

// ── Helpers ───────────────────────────────────────────────────────────────────

function compressImage(dataUrl, maxPx = 800, quality = 0.75) {
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = dataUrl;
  });
}

function computePrimary(scores) {
  const all = CONTEXTS.map(c => {
    const W = WEIGHTS[c.key];
    const score = Math.round(Object.entries(W).reduce((a, [k, w]) => a + (scores[k] ?? 50) * w, 0));
    return { ...c, score };
  });
  const passing = all.find(c => c.score >= THRESHOLD) || all[0];
  const grade = GRADES.find(g => passing.score >= g.min) || GRADES[GRADES.length - 1];
  return { score: passing.score, grade };
}

function fmtPrice(n) {
  if (!n && n !== 0) return "—";
  return "$" + Number(n).toLocaleString();
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function detectSourceFromUrl(url) {
  if (!url) return "";
  try {
    const host = new URL(url.includes("://") ? url : "https://" + url).hostname.replace(/^www\./, "");
    for (const [domain, name] of Object.entries(DOMAIN_TO_SOURCE)) {
      if (host === domain || host.endsWith("." + domain)) return name;
    }
  } catch {}
  return "";
}

function splitCSVLine(line) {
  const result = []; let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === "," && !inQ) { result.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  result.push(cur.trim());
  return result;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_-]+/g, "").replace(/[^a-z]/g, ""));
  const col = (...aliases) => { for (const a of aliases) { const i = headers.indexOf(a); if (i >= 0) return i; } return -1; };
  const idx = {
    species:     col("species", "mineral", "name"),
    locality:    col("locality", "location", "mine"),
    sizeClass:   col("sizeclass", "size", "sizecat"),
    condition:   col("condition", "cond", "quality"),
    askingPrice: col("askingprice", "price", "asking", "cost", "listprice"),
    soldPrice:   col("soldprice", "sold", "saleprice"),
    source:      col("source", "vendor", "seller", "from", "site", "dealer"),
    sourceUrl:   col("sourceurl", "url", "link", "href", "listingurl"),
    notes:       col("notes", "note", "description", "desc", "comment"),
  };
  const SIZE_MAP = {
    thumbnail: ["thumbnail","thumb","thb","thmb"],
    miniature: ["miniature","mini","min","minis"],
    small_cab: ["smallcabinet","smallcab","smcab","scab"],
    cabinet:   ["cabinet","cab"],
    large_cab: ["largecabinet","largecab","lgcab","lcab"],
    museum:    ["museum","mus"],
  };
  const COND_MAP = {
    pristine:  ["pristine","gem","perfect","flawless","mint"],
    excellent: ["excellent","veryfine","vf","displayquality","display"],
    good:      ["good","minorchip","chip","minordamage"],
    repaired:  ["repaired","restored","repair","glued"],
    damaged:   ["damaged","damage","broken","cracked"],
  };
  const normSize = v => { const lv=(v||"").toLowerCase().replace(/[\s_-]+/g,""); for(const[k,a]of Object.entries(SIZE_MAP)){if(a.some(x=>lv===x||lv.startsWith(x)))return k;} return"miniature"; };
  const normCond = v => { const lv=(v||"").toLowerCase().replace(/[\s_-]+/g,""); for(const[k,a]of Object.entries(COND_MAP)){if(a.some(x=>lv===x||lv.startsWith(x)))return k;} return"excellent"; };
  const get = (cells, i) => i >= 0 && i < cells.length ? cells[i] : "";
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i]);
    const species = get(cells, idx.species);
    if (!species) continue;
    const priceRaw = get(cells, idx.askingPrice).replace(/[$,\s]/g, "");
    results.push({
      species, locality: get(cells, idx.locality),
      sizeClass: normSize(get(cells, idx.sizeClass)),
      condition: normCond(get(cells, idx.condition)),
      askingPrice: parseFloat(priceRaw) || 0, soldPrice: "",
      source: get(cells, idx.source), sourceUrl: get(cells, idx.sourceUrl),
      notes: get(cells, idx.notes), photo: null,
    });
  }
  return results;
}

// ── PhotoCapture ─────────────────────────────────────────────────────────────

function PhotoCapture({ value, onChange }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const compressed = await compressImage(ev.target.result);
      onChange(compressed);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
      {value ? (
        <div style={{ position: "relative", borderRadius: "5px", overflow: "hidden" }}>
          <img src={value} alt="specimen" style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} />
          <button onClick={() => onChange(null)}
            style={{ position: "absolute", top: "6px", right: "6px", display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", cursor: "pointer" }}>
            <X size={12} />
          </button>
        </div>
      ) : (
        <div onClick={() => ref.current?.click()}
          style={{ height: "72px", border: "1px dashed var(--border)", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", color: "var(--text-muted)", fontSize: "11px", transition: "border-color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.35)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
        >
          <Camera size={15} /> Add photo
        </div>
      )}
    </div>
  );
}

// ── MiniBar ───────────────────────────────────────────────────────────────────

function MiniBar({ label, icon, value }) {
  const color = value >= 70 ? "#1a9e60" : value >= 50 ? "#3878c8" : "#506070";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
      <span style={{ fontSize: "9px", width: "64px", color: "var(--text-muted)", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {icon} {label}
      </span>
      <div style={{ flex: 1, height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: "2px" }} />
      </div>
      <span style={{ width: "22px", textAlign: "right", fontSize: "9px", fontFamily: "var(--mono)", color: "var(--text-dim)" }}>{value}</span>
    </div>
  );
}

// ── CompForm ──────────────────────────────────────────────────────────────────

function CompForm({ initial = EMPTY_FORM, onSave, onCancel }) {
  const { isMobile } = useBreakpoint();
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSave = form.species.trim().length > 0 && form.askingPrice !== "" && form.sizeClass;
  const detectedSource = detectSourceFromUrl(form.sourceUrl || "");
  const handleUrlChange = (e) => {
    const url = e.target.value;
    set("sourceUrl", url);
    if (!form.source) {
      const detected = detectSourceFromUrl(url);
      if (detected) set("source", detected);
    }
  };

  return (
    <div style={{
      background: "var(--bg-panel)", border: "1px solid rgba(0,212,255,0.25)",
      borderRadius: "8px", padding: "20px 22px", marginBottom: "20px",
    }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--cyan)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
        {initial.species ? "Edit Listing" : "Add Listing"}
      </div>

      {/* Row 1: Species + Locality */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>
            Species <span style={{ color: "rgba(255,80,80,0.7)" }}>*</span>
          </label>
          <input type="text" value={form.species} onChange={e => set("species", e.target.value)}
            placeholder='e.g. "Wulfenite"' autoFocus />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Locality</label>
          <input type="text" value={form.locality} onChange={e => set("locality", e.target.value)}
            placeholder='e.g. "Red Cloud Mine, Arizona"' />
        </div>
      </div>

      {/* Row 1b: Listing URL */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Listing URL (optional)</label>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input type="text" value={form.sourceUrl || ""} onChange={handleUrlChange}
            placeholder="https://irocks.com/minerals/specimen/…" style={{ flex: 1 }} />
          {detectedSource && (
            <span style={{ fontSize: "10px", color: "var(--cyan)", padding: "3px 9px", borderRadius: "3px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.3)", whiteSpace: "nowrap", flexShrink: 0 }}>
              ✓ {detectedSource}
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Size + Condition + Price + Source */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Size Class</label>
          <select value={form.sizeClass} onChange={e => set("sizeClass", e.target.value)}
            style={{ width: "100%", padding: "7px 10px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text)", fontSize: "12px" }}>
            {SIZE_CLASSES.map(s => <option key={s.key} value={s.key}>{s.label} ({s.range})</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Condition</label>
          <select value={form.condition} onChange={e => set("condition", e.target.value)}
            style={{ width: "100%", padding: "7px 10px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text)", fontSize: "12px" }}>
            {CONDITIONS.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>
            Price <span style={{ color: "rgba(255,80,80,0.7)" }}>*</span>
          </label>
          <div style={{ position: "relative", minWidth: 0 }}>
            <span style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "var(--text-muted)", zIndex: 1 }}>$</span>
            <input type="number" min="0" step="1" value={form.askingPrice} onChange={e => set("askingPrice", e.target.value)}
              placeholder="0" style={{ paddingLeft: "20px", width: "100%" }} />
          </div>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Source</label>
          <input type="text" value={form.source} onChange={e => set("source", e.target.value)}
            list="comp-sources" placeholder='e.g. "iRocks"' />
          <datalist id="comp-sources">
            {COMMON_SOURCES.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>
      </div>

      {/* Row 3: Notes + Photo */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 200px", gap: "12px", marginBottom: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Notes (optional)</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
            placeholder="Anything notable about this listing…"
            rows={isMobile ? 2 : 3}
            style={{ width: "100%", padding: "8px 10px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text)", fontSize: "12px", resize: "vertical", fontFamily: "var(--sans)" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Photo (optional)</label>
          <PhotoCapture value={form.photo} onChange={v => set("photo", v)} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <button onClick={onCancel}
          style={{ padding: "7px 16px", background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={() => canSave && onSave(form)} disabled={!canSave}
          style={{ padding: "7px 20px", background: canSave ? "rgba(0,212,255,0.09)" : "transparent", border: `1px solid ${canSave ? "rgba(0,212,255,0.4)" : "var(--border)"}`, borderRadius: "4px", color: canSave ? "var(--cyan)" : "var(--text-muted)", fontSize: "11px", fontWeight: 600, cursor: canSave ? "pointer" : "default" }}>
          {initial.species ? "Save Changes" : "Add Listing"}
        </button>
      </div>
    </div>
  );
}

// ── CompCard ──────────────────────────────────────────────────────────────────

function CompCard({ comp, onScore, onEdit, onDelete }) {
  const sz = SIZE_CLASSES.find(s => s.key === comp.sizeClass);
  const cond = CONDITIONS.find(c => c.key === comp.condition);
  const isScored = comp.scores != null && comp.prismScore != null;
  const grade = isScored ? (GRADES.find(g => g.label === comp.grade) || GRADES[GRADES.length - 1]) : null;

  return (
    <div style={{
      background: "var(--bg-panel)", border: `1px solid ${isScored ? (grade?.color + "30") : "var(--border)"}`,
      borderRadius: "8px", overflow: "hidden", padding: "16px 18px",
      display: "flex", flexDirection: "column", gap: "10px",
      transition: "border-color 0.2s",
    }}>

      {comp.photo && (
        <div style={{ margin: "-16px -18px 4px" }}>
          <img src={comp.photo} alt={comp.species} style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} />
        </div>
      )}

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {comp.species || <span style={{ color: "var(--text-muted)" }}>Unknown species</span>}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {comp.locality || <span style={{ color: "var(--text-muted)" }}>Locality unknown</span>}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--cyan)", fontFamily: "var(--mono)", lineHeight: 1 }}>
            {fmtPrice(comp.askingPrice)}
          </div>
          {comp.soldPrice && (
            <div style={{ fontSize: "9px", color: "#00c880", marginTop: "2px" }}>Sold: {fmtPrice(comp.soldPrice)}</div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
        {sz && <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)", letterSpacing: "0.08em" }}>{sz.label} · {sz.range}</span>}
        {cond && <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>{cond.icon} {cond.label}</span>}
        {comp.source && (
          comp.sourceUrl
            ? <a href={comp.sourceUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: "var(--bg-card)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--cyan)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px", cursor: "pointer" }}>
                {comp.source} <ExternalLink size={7} />
              </a>
            : <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>{comp.source}</span>
        )}
      </div>

      {/* PRISM score section */}
      {isScored ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "22px", fontWeight: 800, color: grade.color, fontFamily: "var(--mono)", lineHeight: 1 }}>{comp.prismScore}</span>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: grade.color }}>{grade.emoji} {grade.label}</div>
              <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>PRISM Score</div>
            </div>
          </div>
          <div>
            {DIM_DISPLAY.map(d => (
              <MiniBar key={d.key} label={d.label} icon={d.icon} value={comp.scores[d.key] ?? 50} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: "10px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px dashed var(--border)", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>Not yet scored with PRISM</div>
          <button onClick={() => onScore(comp)} style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "5px 14px", background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.3)",
            borderRadius: "4px", color: "var(--cyan)", fontSize: "11px", fontWeight: 600, cursor: "pointer",
          }}>
            <Award size={11} /> Score with PRISM
          </button>
        </div>
      )}

      {/* Footer row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px", borderTop: "1px solid var(--border-dim)" }}>
        <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{fmtDate(comp.addedAt)}</span>
        <div style={{ display: "flex", gap: "4px" }}>
          {isScored && (
            <button onClick={() => onScore(comp)} title="Re-score"
              style={{ display: "flex", alignItems: "center", gap: "3px", padding: "6px 10px", background: "none", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--text-muted)", fontSize: "10px", cursor: "pointer" }}>
              <Award size={11} /> Rescore
            </button>
          )}
          <button onClick={() => onEdit(comp)} title="Edit"
            style={{ display: "flex", alignItems: "center", padding: "6px 10px", background: "none", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--text-muted)", cursor: "pointer" }}>
            <Edit2 size={11} />
          </button>
          <button onClick={() => onDelete(comp.id)} title="Delete"
            style={{ display: "flex", alignItems: "center", padding: "6px 10px", background: "none", border: "1px solid rgba(255,80,80,0.2)", borderRadius: "3px", color: "rgba(255,80,80,0.5)", cursor: "pointer" }}>
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ResearchMode ──────────────────────────────────────────────────────────────

function saveToFile(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ResearchMode({ comps, onAdd, onUpdate, onDelete, onScoreComp, onImport, onClearAll }) {
  const { isMobile } = useBreakpoint();
  const [view, setView]             = useState("listings");  // "listings" | "analysis"
  const [search, setSearch]         = useState("");
  const [filterSpecies, setFilter]  = useState("all");
  const [showForm, setShowForm]     = useState(false);
  const [editingComp, setEditing]   = useState(null);

  const speciesList = useMemo(() =>
    [...new Set(comps.map(c => c.species).filter(Boolean))].sort(), [comps]);

  const filtered = useMemo(() => {
    let list = comps;
    if (filterSpecies !== "all") list = list.filter(c => c.species === filterSpecies);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.species || "").toLowerCase().includes(q) ||
        (c.locality || "").toLowerCase().includes(q) ||
        (c.source || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [comps, filterSpecies, search]);

  const scoredCount = comps.filter(c => c.prismScore != null).length;

  const handleFormSave = (form) => {
    const data = { ...form, askingPrice: Number(form.askingPrice) || 0 };
    if (editingComp) {
      onUpdate(editingComp.id, data);
      setEditing(null);
    } else {
      onAdd(data);
      setShowForm(false);
    }
  };

  const openInputRef = useRef();
  const csvImportRef = useRef();

  const handleEdit = (comp) => { setEditing(comp); setShowForm(false); };
  const handleCancel = () => { setShowForm(false); setEditing(null); };

  const handleSave = () => {
    const raw = window.prompt("Save as:", "prism-research");
    if (raw === null) return;
    const name = raw.trim() || "prism-research";
    const filename = name.endsWith(".json") ? name : `${name}.json`;
    saveToFile(wrapForSave(comps, "prism-research", COMPS_SCHEMA), filename);
  };

  const handleClearAll = () => {
    if (!window.confirm(`Clear all ${comps.length} listing${comps.length !== 1 ? "s" : ""}?\n\nThis cannot be undone. Save a backup first if you want to keep this data.`)) return;
    onClearAll();
  };

  const handleOpen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const { data, error, warning } = unwrapFromFile(parsed, "prism-research", COMPS_SCHEMA);
        if (error) { alert(error); return; }
        if (warning && !window.confirm(warning + "\n\nOpen anyway?")) return;
        onImport(data.map(migrateComp).filter(Boolean));
      } catch { alert("Could not read file — make sure it is a valid PRISM Research JSON."); }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target.result);
        if (!parsed.length) {
          alert("No valid rows found.\n\nMake sure your CSV has a header row. Supported columns:\nspecies, locality, size, condition, price, source, url, notes");
          return;
        }
        if (!window.confirm(`Import ${parsed.length} listing${parsed.length !== 1 ? "s" : ""} from CSV?`)) return;
        const withIds = parsed.map(c => ({
          ...c,
          id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          addedAt: new Date().toISOString(),
          scores: null, grade: null, gradeEmoji: null, prismScore: null, ctx: null,
        }));
        onImport(withIds);
      } catch {
        alert("Could not parse CSV.\n\nMake sure it has a valid header row with columns like:\nspecies, locality, price, size, condition, source, url, notes");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "12px 14px" : "20px 24px" }}>

      {/* View toggle */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {[
          { key: "listings", label: "📋 Listings" },
          { key: "analysis", label: "📊 Analysis", disabled: comps.length < 2 },
        ].map(({ key, label, disabled }) => (
          <button key={key} onClick={() => !disabled && setView(key)}
            title={disabled ? "Add at least 2 listings to see analysis" : undefined}
            style={{
              padding: "5px 14px", borderRadius: "4px", fontSize: "11px", fontWeight: view === key ? 600 : 400,
              cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
              background: view === key ? "rgba(0,212,255,0.1)" : "transparent",
              border: view === key ? "1px solid rgba(0,212,255,0.45)" : "1px solid var(--border)",
              color: view === key ? "var(--cyan)" : "var(--text-muted)",
              transition: "all 0.15s",
            }}>{label}</button>
        ))}
      </div>

      {/* Analysis panel */}
      {view === "analysis" && (
        <ResearchAnalysis comps={filtered.length < comps.length ? filtered : comps} />
      )}

      {/* Listings view */}
      {view === "listings" && (<>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search species, locality, source…"
            style={{ paddingLeft: "30px", width: "100%" }} />
        </div>
        {speciesList.length > 1 && (
          <select value={filterSpecies} onChange={e => setFilter(e.target.value)}
            style={{ padding: "7px 10px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "4px", color: filterSpecies !== "all" ? "var(--cyan)" : "var(--text-dim)", fontSize: "11px" }}>
            <option value="all">All species</option>
            {speciesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <button onClick={() => { setShowForm(true); setEditing(null); }}
          style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 16px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.35)", borderRadius: "4px", color: "var(--cyan)", fontSize: "11px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
          <Plus size={13} /> Add Listing
        </button>
        {comps.length > 0 && (
          <>
            <button onClick={handleSave} title="Save database to device"
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap" }}>
              <Download size={13} /> Save
            </button>
            <button onClick={handleClearAll} title="Clear all listings"
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", background: "none", border: "1px solid rgba(255,100,100,0.3)", borderRadius: "4px", color: "rgba(255,100,100,0.7)", fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,100,100,0.08)"; e.currentTarget.style.borderColor = "rgba(255,100,100,0.55)"; e.currentTarget.style.color = "#ff6464"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "rgba(255,100,100,0.3)"; e.currentTarget.style.color = "rgba(255,100,100,0.7)"; }}>
              🗑 Clear All
            </button>
          </>
        )}
        <button onClick={() => openInputRef.current?.click()} title="Open a saved database file"
          style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap" }}>
          <FolderOpen size={13} /> Open
        </button>
        <input ref={openInputRef} type="file" accept=".json,application/json" onChange={handleOpen} style={{ display: "none" }} />
        <button onClick={() => csvImportRef.current?.click()} title="Import listings from a CSV spreadsheet"
          style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap" }}>
          <Upload size={13} /> CSV
        </button>
        <input ref={csvImportRef} type="file" accept=".csv,text/csv" onChange={handleCSVImport} style={{ display: "none" }} />
      </div>
      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "8px", opacity: 0.7 }}>
        💡 Saves to this device only — store the file in iCloud Drive, Google Drive, or Dropbox to access on any device
      </div>

      {/* Stats row */}
      {comps.length > 0 && (
        <div style={{ display: "flex", gap: "16px", marginBottom: "18px", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <span><strong style={{ color: "var(--text-dim)", fontFamily: "var(--mono)" }}>{comps.length}</strong> listings</span>
          <span><strong style={{ color: "var(--text-dim)", fontFamily: "var(--mono)" }}>{scoredCount}</strong> scored</span>
          <span><strong style={{ color: "var(--text-dim)", fontFamily: "var(--mono)" }}>{speciesList.length}</strong> species</span>
          {filtered.length !== comps.length && (
            <span style={{ color: "var(--cyan)" }}>{filtered.length} shown</span>
          )}
        </div>
      )}

      {/* Add form */}
      {showForm && <CompForm onSave={handleFormSave} onCancel={handleCancel} />}

      {/* Edit form */}
      {editingComp && (
        <CompForm
          initial={{ species: editingComp.species, locality: editingComp.locality, sourceUrl: editingComp.sourceUrl || "", sizeClass: editingComp.sizeClass, condition: editingComp.condition, askingPrice: editingComp.askingPrice, source: editingComp.source, notes: editingComp.notes, photo: editingComp.photo }}
          onSave={handleFormSave}
          onCancel={handleCancel}
        />
      )}

      {/* Empty state */}
      {comps.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-dim)", marginBottom: "8px" }}>Build your market research database</div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 24px" }}>
            Shopping for wulfenite? Add listings you find — from eBay, iRocks, Tucson show, or anywhere else.
            Score each one with PRISM and instantly see <em>why</em> a Red Cloud specimen costs more than an Old Yuma Mine piece.
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 22px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.35)", borderRadius: "5px", color: "var(--cyan)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            <Plus size={15} /> Add your first listing
          </button>
        </div>
      )}

      {/* No results */}
      {comps.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: "13px" }}>
          No listings match your search.{" "}
          <button onClick={() => { setSearch(""); setFilter("all"); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", fontSize: "13px" }}>Clear filters</button>
        </div>
      )}

      {/* Cards grid */}
      {filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
          {filtered.map(comp => (
            <CompCard
              key={comp.id}
              comp={comp}
              onScore={onScoreComp}
              onEdit={handleEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
      </>)}
    </div>
  );
}
