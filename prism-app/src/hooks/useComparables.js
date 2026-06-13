import { useState, useCallback } from "react";

const KEY = "prism_comps_v1";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const persist = (data) => localStorage.setItem(KEY, JSON.stringify(data));

export function useComparables() {
  const [comps, setComps] = useState(load);

  const addComp = useCallback((data) => {
    const comp = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      addedAt: new Date().toISOString(),
      soldPrice: null, sourceUrl: "", notes: "",
      scores: null, grade: null, gradeEmoji: null, prismScore: null, ctx: null,
      ...data,
    };
    setComps(prev => { const next = [comp, ...prev]; persist(next); return next; });
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
  }, []);

  return { comps, addComp, updateComp, deleteComp, clearAll, importComps };
}
