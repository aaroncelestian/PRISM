import { useState, useCallback } from "react";
import { migrateComp } from "../utils/dbMigrations.js";

const KEY      = "prism_comps_v1";
const HIST_KEY = "prism_research_history_v1";

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return (Array.isArray(raw) ? raw : []).map(migrateComp).filter(Boolean);
  } catch { return []; }
};
const loadHistory = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
    return (Array.isArray(raw) ? raw : []).map(migrateComp).filter(Boolean);
  } catch { return []; }
};
const persist      = (data) => localStorage.setItem(KEY,      JSON.stringify(data));
const persistHist  = (data) => localStorage.setItem(HIST_KEY, JSON.stringify(data));

export function useComparables() {
  const [comps,   setComps]   = useState(load);
  const [history, setHistory] = useState(loadHistory);

  const addComp = useCallback((data) => {
    const comp = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      addedAt: new Date().toISOString(),
      soldPrice: null, sourceUrl: "", notes: "",
      scores: null, grade: null, gradeEmoji: null, prismScore: null, ctx: null,
      ...data,
    };
    setComps(prev => { const next = [comp, ...prev]; persist(next); return next; });
    setHistory(prev => {
      if (prev.some(c => c.id === comp.id)) return prev;
      const next = [comp, ...prev]; persistHist(next); return next;
    });
    return comp.id;
  }, []);

  const updateComp = useCallback((id, updates) => {
    setComps(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      persist(next);
      return next;
    });
  }, []);

  const deleteComp = useCallback((id) => {
    setComps(prev => { const next = prev.filter(c => c.id !== id); persist(next); return next; });
  }, []);

  const clearAll = useCallback(() => { setComps([]); localStorage.removeItem(KEY); }, []);

  const importComps = useCallback((entries) => {
    setComps(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newEntries = entries.filter(e => e.id && !existingIds.has(e.id));
      const next = [...newEntries, ...prev];
      persist(next);
      return next;
    });
    setHistory(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newEntries = entries.filter(e => e.id && !existingIds.has(e.id));
      if (!newEntries.length) return prev;
      const next = [...newEntries, ...prev]; persistHist(next); return next;
    });
  }, []);

  const deleteFromHistory = useCallback((id) => {
    setHistory(prev => { const next = prev.filter(c => c.id !== id); persistHist(next); return next; });
  }, []);

  const clearHistory = useCallback(() => { setHistory([]); localStorage.removeItem(HIST_KEY); }, []);

  return { comps, addComp, updateComp, deleteComp, clearAll, importComps, history, deleteFromHistory, clearHistory };
}
