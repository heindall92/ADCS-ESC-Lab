export const ACCENT_IDS = [
  "blue",
  "green",
  "yellow",
  "orange",
  "red",
  "pink",
  "purple",
  "teal",
  "coral",
] as const;

export type AccentId = (typeof ACCENT_IDS)[number];

interface AccentThemeTokens {
  primary: string;
  primaryForeground: string;
  ring: string;
  accent: string;
  accentForeground: string;
  electric: string;
  glow: string;
  swatch: string;
}

export const ACCENT_PALETTE: Record<AccentId, { dark: AccentThemeTokens; light: AccentThemeTokens }> = {
  blue: {
    dark: {
      swatch: "oklch(0.68 0.2 250)",
      primary: "oklch(0.7 0.2 250)",
      primaryForeground: "oklch(0.08 0.02 250)",
      ring: "oklch(0.7 0.2 250)",
      accent: "oklch(0.65 0.18 220)",
      accentForeground: "oklch(0.08 0.02 220)",
      electric: "oklch(0.7 0.2 270)",
      glow: "oklch(0.7 0.2 250 / 0.45)",
    },
    light: {
      swatch: "oklch(0.5 0.2 250)",
      primary: "oklch(0.5 0.2 250)",
      primaryForeground: "oklch(0.99 0.01 250)",
      ring: "oklch(0.5 0.2 250)",
      accent: "oklch(0.52 0.18 220)",
      accentForeground: "oklch(0.99 0.01 220)",
      electric: "oklch(0.55 0.22 270)",
      glow: "oklch(0.5 0.2 250 / 0.35)",
    },
  },
  green: {
    dark: {
      swatch: "oklch(0.65 0.18 145)",
      primary: "oklch(0.62 0.14 145)",
      primaryForeground: "oklch(0.12 0.02 145)",
      ring: "oklch(0.62 0.14 145)",
      accent: "oklch(0.62 0.12 55)",
      accentForeground: "oklch(0.12 0.02 55)",
      electric: "oklch(0.7 0.2 250)",
      glow: "oklch(0.62 0.14 145 / 0.45)",
    },
    light: {
      swatch: "oklch(0.52 0.17 145)",
      primary: "oklch(0.52 0.17 145)",
      primaryForeground: "oklch(0.99 0.01 145)",
      ring: "oklch(0.52 0.17 145)",
      accent: "oklch(0.6 0.17 55)",
      accentForeground: "oklch(0.99 0.01 55)",
      electric: "oklch(0.55 0.22 250)",
      glow: "oklch(0.52 0.17 145 / 0.35)",
    },
  },
  yellow: {
    dark: {
      swatch: "oklch(0.82 0.16 95)",
      primary: "oklch(0.82 0.16 95)",
      primaryForeground: "oklch(0.18 0.04 95)",
      ring: "oklch(0.82 0.16 95)",
      accent: "oklch(0.78 0.14 85)",
      accentForeground: "oklch(0.18 0.04 85)",
      electric: "oklch(0.82 0.16 95)",
      glow: "oklch(0.82 0.16 95 / 0.4)",
    },
    light: {
      swatch: "oklch(0.72 0.15 95)",
      primary: "oklch(0.72 0.15 95)",
      primaryForeground: "oklch(0.2 0.04 95)",
      ring: "oklch(0.72 0.15 95)",
      accent: "oklch(0.68 0.14 85)",
      accentForeground: "oklch(0.2 0.04 85)",
      electric: "oklch(0.72 0.15 95)",
      glow: "oklch(0.72 0.15 95 / 0.32)",
    },
  },
  orange: {
    dark: {
      swatch: "oklch(0.72 0.18 55)",
      primary: "oklch(0.72 0.18 55)",
      primaryForeground: "oklch(0.15 0.03 55)",
      ring: "oklch(0.72 0.18 55)",
      accent: "oklch(0.68 0.16 45)",
      accentForeground: "oklch(0.15 0.03 45)",
      electric: "oklch(0.72 0.18 55)",
      glow: "oklch(0.72 0.18 55 / 0.42)",
    },
    light: {
      swatch: "oklch(0.62 0.17 55)",
      primary: "oklch(0.62 0.17 55)",
      primaryForeground: "oklch(0.99 0.01 55)",
      ring: "oklch(0.62 0.17 55)",
      accent: "oklch(0.58 0.16 45)",
      accentForeground: "oklch(0.99 0.01 45)",
      electric: "oklch(0.62 0.17 55)",
      glow: "oklch(0.62 0.17 55 / 0.34)",
    },
  },
  red: {
    dark: {
      swatch: "oklch(0.62 0.22 25)",
      primary: "oklch(0.62 0.22 25)",
      primaryForeground: "oklch(0.98 0.01 25)",
      ring: "oklch(0.62 0.22 25)",
      accent: "oklch(0.58 0.2 20)",
      accentForeground: "oklch(0.98 0.01 20)",
      electric: "oklch(0.62 0.22 25)",
      glow: "oklch(0.62 0.22 25 / 0.42)",
    },
    light: {
      swatch: "oklch(0.55 0.22 25)",
      primary: "oklch(0.55 0.22 25)",
      primaryForeground: "oklch(0.99 0.005 25)",
      ring: "oklch(0.55 0.22 25)",
      accent: "oklch(0.52 0.2 20)",
      accentForeground: "oklch(0.99 0.005 20)",
      electric: "oklch(0.55 0.22 25)",
      glow: "oklch(0.55 0.22 25 / 0.34)",
    },
  },
  pink: {
    dark: {
      swatch: "oklch(0.68 0.2 350)",
      primary: "oklch(0.68 0.2 350)",
      primaryForeground: "oklch(0.98 0.01 350)",
      ring: "oklch(0.68 0.2 350)",
      accent: "oklch(0.64 0.18 340)",
      accentForeground: "oklch(0.98 0.01 340)",
      electric: "oklch(0.68 0.2 350)",
      glow: "oklch(0.68 0.2 350 / 0.42)",
    },
    light: {
      swatch: "oklch(0.58 0.2 350)",
      primary: "oklch(0.58 0.2 350)",
      primaryForeground: "oklch(0.99 0.01 350)",
      ring: "oklch(0.58 0.2 350)",
      accent: "oklch(0.55 0.18 340)",
      accentForeground: "oklch(0.99 0.01 340)",
      electric: "oklch(0.58 0.2 350)",
      glow: "oklch(0.58 0.2 350 / 0.34)",
    },
  },
  purple: {
    dark: {
      swatch: "oklch(0.62 0.22 300)",
      primary: "oklch(0.62 0.22 300)",
      primaryForeground: "oklch(0.98 0.01 300)",
      ring: "oklch(0.62 0.22 300)",
      accent: "oklch(0.58 0.2 290)",
      accentForeground: "oklch(0.98 0.01 290)",
      electric: "oklch(0.62 0.22 300)",
      glow: "oklch(0.62 0.22 300 / 0.42)",
    },
    light: {
      swatch: "oklch(0.5 0.18 300)",
      primary: "oklch(0.5 0.18 300)",
      primaryForeground: "oklch(0.99 0.01 300)",
      ring: "oklch(0.5 0.18 300)",
      accent: "oklch(0.48 0.16 290)",
      accentForeground: "oklch(0.99 0.01 290)",
      electric: "oklch(0.5 0.18 300)",
      glow: "oklch(0.5 0.18 300 / 0.34)",
    },
  },
  teal: {
    dark: {
      swatch: "oklch(0.68 0.14 195)",
      primary: "oklch(0.68 0.14 195)",
      primaryForeground: "oklch(0.12 0.02 195)",
      ring: "oklch(0.68 0.14 195)",
      accent: "oklch(0.64 0.13 185)",
      accentForeground: "oklch(0.12 0.02 185)",
      electric: "oklch(0.68 0.14 195)",
      glow: "oklch(0.68 0.14 195 / 0.4)",
    },
    light: {
      swatch: "oklch(0.55 0.13 195)",
      primary: "oklch(0.55 0.13 195)",
      primaryForeground: "oklch(0.99 0.01 195)",
      ring: "oklch(0.55 0.13 195)",
      accent: "oklch(0.52 0.12 185)",
      accentForeground: "oklch(0.99 0.01 185)",
      electric: "oklch(0.55 0.13 195)",
      glow: "oklch(0.55 0.13 195 / 0.32)",
    },
  },
  coral: {
    dark: {
      swatch: "oklch(0.68 0.16 30)",
      primary: "oklch(0.68 0.16 30)",
      primaryForeground: "oklch(0.98 0.01 30)",
      ring: "oklch(0.68 0.16 30)",
      accent: "oklch(0.64 0.15 25)",
      accentForeground: "oklch(0.98 0.01 25)",
      electric: "oklch(0.68 0.16 30)",
      glow: "oklch(0.68 0.16 30 / 0.42)",
    },
    light: {
      swatch: "oklch(0.58 0.15 30)",
      primary: "oklch(0.58 0.15 30)",
      primaryForeground: "oklch(0.99 0.01 30)",
      ring: "oklch(0.58 0.15 30)",
      accent: "oklch(0.55 0.14 25)",
      accentForeground: "oklch(0.99 0.01 25)",
      electric: "oklch(0.58 0.15 30)",
      glow: "oklch(0.58 0.15 30 / 0.34)",
    },
  },
};

export function isAccentId(value: string): value is AccentId {
  return (ACCENT_IDS as readonly string[]).includes(value);
}

export function applyAccentTokens(accent: AccentId, theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  const tokens = ACCENT_PALETTE[accent][theme];
  const root = document.documentElement;
  root.dataset.accent = accent;
  root.style.setProperty("--primary", tokens.primary);
  root.style.setProperty("--primary-foreground", tokens.primaryForeground);
  root.style.setProperty("--ring", tokens.ring);
  root.style.setProperty("--accent", tokens.accent);
  root.style.setProperty("--accent-foreground", tokens.accentForeground);
  root.style.setProperty("--electric", tokens.electric);
  root.style.setProperty("--accent-glow", tokens.glow);
  root.style.setProperty("--sidebar-primary", tokens.primary);
  root.style.setProperty("--sidebar-ring", tokens.ring);
  root.style.setProperty("--chart-1", tokens.primary);
  root.style.setProperty("--gradient-mid", tokens.primary);
}
