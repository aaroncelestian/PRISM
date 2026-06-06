import { useState } from "react";
import { X, Trash2, Upload, Search } from "lucide-react";
import { GRADES } from "../data/prism.js";

const GRADE_COLOR = Object.fromEntries(GRADES.map(g => [g.label, g.color]));

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

export default function CollectionHistory({ records, onLoad, onDelete, onClearAll, onClose }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

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
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>📚 Collection History</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "10px" }}>
              {records.length} specimen{records.length !== 1 ? "s" : ""} saved
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>

        {/* Summary stats */}
        {gradeCounts.length > 0 && (
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
              placeholder="Search by name, species, locality, grade…"
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
          {filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              {records.length === 0 ? (
                <>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>📭</div>
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
                  {/* Row */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : rec.id)}
                    style={{
                      padding: "11px 18px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "10px",
                      background: isOpen ? "var(--bg-panel)" : "transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Grade badge */}
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "5px", flexShrink: 0,
                      background: `${color}12`, border: `1px solid ${color}30`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: "14px" }}>{rec.gradeEmoji}</span>
                      <span style={{ fontSize: "8px", color, fontFamily: "var(--mono)", fontWeight: 700 }}>{rec.prismScore}</span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {rec.spec?.name || rec.spec?.species || "Unnamed specimen"}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {[rec.spec?.species, rec.spec?.locality].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </div>

                    {/* Grade + date */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "10px", color, fontWeight: 600 }}>{rec.grade} Grade</div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{formatDate(rec.savedAt)}</div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { onLoad(rec); onClose(); }}
                        title="Load this evaluation"
                        style={{
                          padding: "5px 10px", fontSize: "10px", fontWeight: 600,
                          background: `${color}10`, border: `1px solid ${color}30`,
                          borderRadius: "4px", color, cursor: "pointer",
                        }}
                      >
                        <Upload size={11} style={{ display: "inline", marginRight: "3px" }} />Load
                      </button>
                      <button
                        onClick={() => onDelete(rec.id)}
                        title="Delete"
                        style={{
                          padding: "5px 7px", background: "transparent",
                          border: "1px solid var(--border)", borderRadius: "4px",
                          color: "var(--text-muted)", cursor: "pointer",
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ padding: "0 18px 14px 18px", background: "var(--bg-panel)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px", paddingTop: "4px" }}>
                        {[
                          { label: "💠 Crystal", key: "crystal" },
                          { label: "🌍 Species", key: "speciesRarity" },
                          { label: "📍 Locality", key: "localityRarity" },
                          { label: "📜 Provenance", key: "provenance" },
                          { label: "🎨 Aesthetics", key: "aesthetics" },
                          { label: "🔬 Scientific", key: "scientific" },
                        ].map(d => (
                          <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "10px", color: "var(--text-dim)", width: "90px", flexShrink: 0 }}>{d.label}</span>
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
          )}
        </div>

        {/* Footer */}
        {records.length > 0 && (
          <div style={{
            padding: "10px 18px", borderTop: "1px solid var(--border-dim)",
            display: "flex", justifyContent: "flex-end", flexShrink: 0,
          }}>
            {confirmClear ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Delete all {records.length} records?</span>
                <button onClick={() => { onClearAll(); setConfirmClear(false); }} style={{ padding: "4px 12px", background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.4)", borderRadius: "4px", color: "#ff6060", fontSize: "11px", cursor: "pointer" }}>Yes, clear all</button>
                <button onClick={() => setConfirmClear(false)} style={{ padding: "4px 10px", background: "transparent", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmClear(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", background: "transparent", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}>
                <Trash2 size={11} /> Clear all
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
