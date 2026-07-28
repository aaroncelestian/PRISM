import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "prism_theme";

export function getStoredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch { /* ignore */ }
  return "light";
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    const initial = getStoredTheme();
    applyTheme(initial);
    return initial;
  });

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(t => (t === "light" ? "dark" : "light"));
  }, []);

  return { theme, setTheme: setThemeState, toggleTheme, isDark: theme === "dark" };
}
