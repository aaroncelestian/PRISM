import { useState, useCallback } from "react";

const KEY = "prism_collection_v1";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

function persist(records) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function useLocalCollection() {
  const [records, setRecords] = useState(load);

  const saveRecord = useCallback((spec, scores, ctx, grade, gradeEmoji, prismScore, compoundGrades = []) => {
    const rec = {
      id: `prism-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      savedAt: new Date().toISOString(),
      spec: { ...spec },
      scores: { ...scores },
      ctx,
      grade,
      gradeEmoji,
      prismScore,
      compoundGrades,
    };
    setRecords(prev => {
      const next = [rec, ...prev];
      persist(next);
      return next;
    });
    return rec.id;
  }, []);

  const deleteRecord = useCallback((id) => {
    setRecords(prev => {
      const next = prev.filter(r => r.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setRecords([]);
    localStorage.removeItem(KEY);
  }, []);

  return { records, saveRecord, deleteRecord, clearAll };
}
