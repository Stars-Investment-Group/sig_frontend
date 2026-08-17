import { useEffect, useState } from "react";

/**
 * Gestion du thème clair / sombre (sans dépendance).
 * Ajoute la classe `dark` sur <html> et persiste dans localStorage.
 */
const STORAGE_KEY = "sig-theme";

export type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  // Détection du système d'exploitation
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, setTheme, toggleTheme };
}
