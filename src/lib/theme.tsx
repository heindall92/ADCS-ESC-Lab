import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { ACCENT_IDS, applyAccentTokens, isAccentId, type AccentId } from "@/lib/accent-palette";

export type Theme = "light" | "dark";
export type Accent = AccentId;

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "adcs-lab-theme";
const ACCENT_KEY = "adcs-lab-accent";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [accent, setAccentState] = useState<Accent>("green");

  useEffect(() => {
    let initialTheme: Theme = "dark";
    let initialAccent: Accent = "green";
    try {
      const storedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (storedTheme === "light" || storedTheme === "dark") {
        initialTheme = storedTheme;
      } else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
        initialTheme = "light";
      }

      const storedAccent = localStorage.getItem(ACCENT_KEY);
      if (storedAccent && isAccentId(storedAccent)) {
        initialAccent = storedAccent;
      }
    } catch {
      /* ignore */
    }
    setThemeState(initialTheme);
    setAccentState(initialAccent);
    applyTheme(initialTheme);
    applyAccentTokens(initialAccent, initialTheme);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    applyAccentTokens(accent, t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  };

  const setAccent = (a: Accent) => {
    setAccentState(a);
    applyAccentTokens(a, theme);
    try {
      localStorage.setItem(ACCENT_KEY, a);
    } catch {
      /* ignore */
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
        accent,
        setAccent,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export { ACCENT_IDS };
