import { useState, useRef } from "react";
import { X, Trash2, Upload, Search, Download, FolderOpen } from "lucide-react";
import { GRADES } from "../data/prism.js";
import { COLLECTION_SCHEMA } from "../version.js";
import { migrateCollectionRecord, wrapForSave, unwrapFromFile } from "../utils/dbMigrations.js";

const GRADE_COLOR = Object.fromEntries(GRADES.map(g => [g.label, g.color]));

const SIZE_LABEL = { thumbnail: "Thumb", miniature: "Mini", small_cab: "Sm. Cab", cabinet: "Cabinet", large_cab: "Lg. Cab", museum: "Museum" };
const COND_LABEL = { pristine: "Pristine", excellent: "Display", good: "Minor Chips", repaired: "Repaired", damaged: "Damaged" };
const DIM_DISPLAY = [
  { key: "crystal",        label: "Crystal",    icon: "💠" },
  { key: "speciesRarity",  label: "Species",    icon: "🌍" },
  { key: "localityRarity", label: "Locality",   icon: "📍" },
  { key: "provenance",     label: "Provenance", icon: "📜" },
  { key: "aesthetics",     label: "Aesthetics", icon: "🎨" },
  { key: "scientific",     label: "Scientific", icon: "🔬" },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ScoreBar({ value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
      <div style={{ flex: 1, height: "4px", background: "var(--border-dim)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: "2px", transition: "width 0.3s" }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-dim)", width: "28px", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function saveToFile(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function CollectionHistory({ records, onLoad, onDelete, onClearAll, onClose, onImport, comps = [], onDeleteComp, onClearComps, onOpenResearch }) {
  const [tab, setTab]               = useState("collection");
  const [query, setQuery]           = useState("");
  const [expanded, setExpanded]     = useState(null);
  const [confirmClear, setConfirmClear]           = useState(false);
  const [confirmClearComps, setConfirmClearComps] = useState(false);
  const openInputRef = useRef();

  const handleSave = () => {
    const raw = window.prompt("Save as:", "prism-collection");
    if (raw === null) return;
    const name = raw.trim() || "prism-collection";
    const filename = name.endsWith(".json") ? name : `${name}.json`;
    saveToFile(wrapForSave(records, "prism-collection", COLLECTION_SCHEMA), filename);
  };

  const handleOpen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const { data, error, warning } = unwrapFromFile(parsed, "prism-collection", COLLECTION_SCHEMA);
        if (error) { alert(error); return; }
        if (warning && !window.confirm(warning + "\n\nOpen anyway?")) return;
        onImport(data.map(migrateCollectionRecord).filter(Boolean));
      } catch { alert("Could not read file — make sure it is a valid PRISM Collection JSON."); }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const filtered = records.filter(r => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.spec?.name?.toLowerCase().includes(q) ||
      r.spec?.species?.toLowerCase().includes(q) ||
      r.spec?.locality?.toLowerCase().includes(q) ||
      r.grade?.toLowerCase().includes(q)
    );
  });

  const filteredComps = comps.filter(c => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (c.species || "").toLowerCase().includes(q) ||
      (c.locality || "").toLowerCase().includes(q) ||
      (c.source   || "").toLowerCase().includes(q) ||
      (c.notes    || "").toLowerCase().includes(q)
    );
  });

  // Grade distribution for summary
  const gradeCounts = GRADES.map(g => ({
    label: g.label, color: g.color, emoji: g.emoji,
    count: records.filter(r => r.grade === g.label).length,
  })).filter(g => g.count > 0);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1200,
      background: "rgba(4,8,18,0.90)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "560px", maxHeight: "90vh",
        background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          padding: "14px 18px", borderBottom: "1px solid var(--border-dim)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
        }}>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>📚 History</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {tab === "collection" && records.length > 0 && (
              <button onClick={handleSave} title="Save collection to device"
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "10px", cursor: "pointer" }}>
                <Download size={11} /> Save
              </button>
            )}
            {tab === "collection" && (
              <button onClick={() => openInputRef.current?.click()} title="Open a saved collection file"
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "10px", cursor: "pointer" }}>
                <FolderOpen size={11} /> Open
              </button>
            )}
            <input ref={openInputRef} type="file" accept=".json,application/json" onChange={handleOpen} style={{ display: "none" }} />
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", marginLeft: "4px" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab toggle */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-dim)", flexShrink: 0 }}>
          {[
            { key: "collection", label: "Specimens", count: records.length },
            { key: "research",   label: "Research",  count: comps.length },
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => { setTab(key); setExpanded(null); setQuery(""); }}
              style={{
                flex: 1, padding: "9px 12px", background: "none", border: "none",
                borderBottom: `2px solid ${tab === key ? "var(--cyan)" : "transparent"}`,
                color: tab === key ? "var(--cyan)" : "var(--text-muted)",
                fontSize: "11px", fontWeight: tab === key ? 600 : 400,
                cursor: "pointer", transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {label}
              {count > 0 && <span style={{ marginLeft: "5px", fontSize: "9px", fontFamily: "var(--mono)", opacity: 0.8 }}>{count}</span>}
            </button>
          ))}
        </div>

        {/* Summary stats — collection only */}
        {tab === "collection" && gradeCounts.length > 0 && (
          <div style={{
            padding: "10px 18px", borderBottom: "1px solid var(--border-dim)",
            display: "flex", gap: "8px", flexWrap: "wrap", flexShrink: 0,
          }}>
            {gradeCounts.map(g => (
              <div key={g.label} style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "3px 10px", borderRadius: "3px",
                background: `${g.color}10`, border: `1px solid ${g.color}30`,
                fontSize: "11px", color: g.color,
              }}>
                {g.emoji} {g.label} <strong>×{g.count}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div style={{ padding: "10px 18px", borderBottom: "1px solid var(--border-dim)", flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder={tab === "collection" ? "Search by name, species, locality, grade…" : "Search species, locality, source…"}
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: "100%", padding: "7px 10px 7px 30px", boxSizing: "border-box",
                background: "var(--bg-panel)", border: "1px solid var(--border)",
                borderRadius: "5px", color: "var(--text)", fontSize: "12px", outline: "none",
              }}
            />
          </div>
        </div>

        {/* Records list */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* ── Collection tab ── */}
          {tab === "collection" && (filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              {records.length === 0 ? (
                <>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>�</div>
                  No specimens saved yet. Score a specimen and click <strong>💾 Save</strong> in the header.
                </>
              ) : (
                "No matches for that search."
              )}
            </div>
          ) : (
            filtered.map(rec => {
              const isOpen = expanded === rec.id;
              const color = GRADE_COLOR[rec.grade] || "var(--text-muted)";
              return (
                <div key={rec.id} style={{ borderBottom: "1px solid var(--border-dim)" }}>
                  <div
                    onClick={() => setExpanded(isOpen ? null : rec.id)}
                    style={{ padding: "11px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", background: isOpen ? "var(--bg-panel)" : "transparent", transition: "background 0.15s" }}
                  >
                    <div style={{ width: "38px", height: "38px", borderRadius: "5px", flexShrink: 0, background: `${color}12`, border: `1px solid ${color}30`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "14px" }}>{rec.gradeEmoji}</span>
                      <span style={{ fontSize: "8px", color, fontFamily: "var(--mono)", fontWeight: 700 }}>{rec.prismScore}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {rec.spec?.name || rec.spec?.species || "Unnamed specimen"}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {[rec.spec?.species, rec.spec?.locality].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "10px", color, fontWeight: 600 }}>{rec.grade} Grade</div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{formatDate(rec.savedAt)}</div>
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => { onLoad(rec); onClose(); }} title="Load this evaluation"
                        style={{ padding: "5px 10px", fontSize: "10px", fontWeight: 600, background: `${color}10`, border: `1px solid ${color}30`, borderRadius: "4px", color, cursor: "pointer" }}>
                        <Upload size={11} style={{ display: "inline", marginRight: "3px" }} />Load
                      </button>
                      <button onClick={() => onDelete(rec.id)} title="Delete"
                        style={{ padding: "5px 7px", background: "transparent", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", cursor: "pointer" }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ padding: "0 18px 14px 18px", background: "var(--bg-panel)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px", paddingTop: "4px" }}>
                        {DIM_DISPLAY.map(d => (
                          <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "10px", color: "var(--text-dim)", width: "90px", flexShrink: 0 }}>{d.icon} {d.label}</span>
                            <ScoreBar value={rec.scores[d.key] ?? 0} color={color} />
                          </div>
                        ))}
                      </div>
                      {rec.compoundGrades?.length > 0 && (
                        <div style={{ marginTop: "8px", fontSize: "10px", color: "var(--text-muted)" }}>
                          {rec.compoundGrades.map(cg => <span key={cg.key} style={{ marginRight: "6px" }}>{cg.emoji} {cg.label}</span>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ))}

          {/* ── Research tab ── */}
          {tab === "research" && (filteredComps.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              {comps.length === 0 ? (
                <>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
                  No research listings yet. Use the <strong>Research</strong> mode to add comparable listings.
                </>
              ) : (
                "No matches for that search."
              )}
            </div>
          ) : (
            filteredComps.map(comp => {
              const isOpen = expanded === comp.id;
              const isScored = comp.prismScore != null;
              const gradeColor = isScored ? (GRADE_COLOR[comp.grade] || "var(--cyan)") : "rgba(0,212,255,0.5)";
              const price = comp.askingPrice;
              const priceStr = price
                ? (price >= 10000 ? `$${(price / 1000).toFixed(0)}k` : price >= 1000 ? `$${(price / 1000).toFixed(1)}k` : `$${price}`)
                : "—";
              return (
                <div key={comp.id} style={{ borderBottom: "1px solid var(--border-dim)" }}>
                  <div
                    onClick={() => setExpanded(isOpen ? null : comp.id)}
                    style={{ padding: "11px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", background: isOpen ? "var(--bg-panel)" : "transparent", transition: "background 0.15s" }}
                  >
                    {/* Price badge */}
                    <div style={{ width: "42px", height: "38px", borderRadius: "5px", flexShrink: 0, background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "7px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>ask</span>
                      <span style={{ fontSize: priceStr.length > 5 ? "8px" : "10px", color: "var(--cyan)", fontFamily: "var(--mono)", fontWeight: 700, lineHeight: 1.1 }}>{priceStr}</span>
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {comp.species || <span style={{ color: "var(--text-muted)" }}>Unknown species</span>}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {[comp.locality, comp.source].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </div>
                    {/* Score + date */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {isScored
                        ? <div style={{ fontSize: "10px", color: gradeColor, fontWeight: 600 }}>{comp.grade} Grade</div>
                        : <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>Not scored</div>
                      }
                      <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{formatDate(comp.addedAt)}</div>
                    </div>
                    {/* Actions */}
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => onDeleteComp?.(comp.id)} title="Delete"
                        style={{ padding: "5px 7px", background: "transparent", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", cursor: "pointer" }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ padding: "0 18px 14px 18px", background: "var(--bg-panel)" }}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                        {comp.sizeClass && SIZE_LABEL[comp.sizeClass] && (
                          <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                            {SIZE_LABEL[comp.sizeClass]}
                          </span>
                        )}
                        {comp.condition && COND_LABEL[comp.condition] && (
                          <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                            {COND_LABEL[comp.condition]}
                          </span>
                        )}
                        {comp.soldPrice && (
                          <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: "rgba(0,200,128,0.08)", border: "1px solid rgba(0,200,128,0.25)", color: "#00c880" }}>
                            Sold: ${comp.soldPrice}
                          </span>
                        )}
                      </div>
                      {comp.notes && (
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px", lineHeight: 1.5 }}>{comp.notes}</div>
                      )}
                      {isScored && comp.scores && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "4px" }}>
                          {DIM_DISPLAY.map(d => (
                            <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "10px", color: "var(--text-dim)", width: "90px", flexShrink: 0 }}>{d.icon} {d.label}</span>
                              <ScoreBar value={comp.scores[d.key] ?? 0} color={gradeColor} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ))}

        </div>

        {/* Footer — collection */}
        {tab === "collection" && records.length > 0 && (
          <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border-dim)", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
            {confirmClear ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Delete all {records.length} records?</span>
                <button onClick={() => { onClearAll(); setConfirmClear(false); }} style={{ padding: "4px 12px", background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.4)", borderRadius: "4px", color: "#ff6060", fontSize: "11px", cursor: "pointer" }}>Yes, clear all</button>
                <button onClick={() => setConfirmClear(false)} style={{ padding: "4px 10px", background: "transparent", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}>Cancel</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", opacity: 0.7, marginRight: "auto" }}>
                  💡 Save to iCloud, Google Drive, or Dropbox to access anywhere
                </div>
                <button onClick={() => setConfirmClear(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", background: "transparent", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}>
                  <Trash2 size={11} /> Clear all
                </button>
              </>
            )}
          </div>
        )}

        {/* Footer — research */}
        {tab === "research" && comps.length > 0 && (
          <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border-dim)", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
            {confirmClearComps ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Delete all {comps.length} listings?</span>
                <button onClick={() => { onClearComps?.(); setConfirmClearComps(false); }} style={{ padding: "4px 12px", background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.4)", borderRadius: "4px", color: "#ff6060", fontSize: "11px", cursor: "pointer" }}>Yes, clear all</button>
                <button onClick={() => setConfirmClearComps(false)} style={{ padding: "4px 10px", background: "transparent", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}>Cancel</button>
              </div>
            ) : (
              <>
                <button onClick={() => setConfirmClearComps(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", background: "transparent", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer", marginRight: "auto" }}>
                  <Trash2 size={11} /> Clear all
                </button>
                {onOpenResearch && (
                  <button onClick={onOpenResearch} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 16px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.35)", borderRadius: "4px", color: "var(--cyan)", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                    Open in Research
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
