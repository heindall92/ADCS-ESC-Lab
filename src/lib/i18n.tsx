import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "es" | "en";

type Dict = Record<string, string>;

const es: Dict = {
  "app.name": "ADCS Lab",
  "app.tagline": "ADCS ESC Lab",
  "nav.sections": "Secciones",
  "nav.escCases": "Casos ESC",
  "nav.home": "Inicio",
  "nav.map": "Mapa mental",
  "nav.masterTable": "Tabla maestra",
  "nav.practice": "Práctica guiada",
  "nav.patch": "El parche",
  "nav.decision": "Tabla de decisión",
  "nav.blueTeam": "Blue Team",
  "nav.cheatSheet": "Cheat Sheet",

  "a11y.skip": "Saltar al contenido",
  "a11y.themeToggle": "Cambiar tema",
  "a11y.langToggle": "Cambiar idioma",
  "a11y.accentToggle": "Cambiar acento",
  "a11y.accentPicker": "Elegir color de acento",
  "theme.accentColor": "Color de acento",
  "accent.blue": "Azul",
  "accent.green": "Verde",
  "accent.yellow": "Amarillo",
  "accent.orange": "Naranja",
  "accent.red": "Rojo",
  "accent.pink": "Rosa",
  "accent.purple": "Púrpura",
  "accent.teal": "Turquesa",
  "accent.coral": "Coral",
  "theme.light": "Claro",
  "theme.dark": "Oscuro",

  "home.badge": "ADCS · Volumen 2 · Edición Lab",
  "home.title1": "Identifica los",
  "home.title2": "16 ESC de ADCS.",
  "home.title3": "En cinemática. Paso a paso.",
  "home.subtitle":
    "Un recorrido inmersivo basado en el manual de Certipy v5. Aprende el flujo find → req → auth, visualiza los 5 grupos de fallo y domina la metodología para cada escenario.",
  "home.cta.start": "Empezar el recorrido",
  "home.cta.explore": "Explorar los 16 ESC",
  "home.stat.cases": "Casos ESC",
  "home.stat.groups": "Grupos de fallo",
  "home.stat.steps": "Pasos: find · req · auth",
  "home.stat.edu": "Uso educativo",
  "home.legal.title": "Aviso legal y ético",
  "home.legal.body1":
    "Cada técnica puede escalar de usuario sin privilegios a Domain Admin. Úsalo exclusivamente en sistemas propios, laboratorios autorizados (HTB, VulnLab, GOAD, Dockerlabs) o auditorías con autorización escrita.",
  "home.legal.body2":
    "Modificar plantillas o la CA en un entorno real puede romper la PKI corporativa. Restaura siempre.",
  "home.groups.eyebrow": "5 grupos",
  "home.groups.title": "Todo fallo ADCS cae en una de estas cinco familias.",
  "home.groups.subtitle": "Aprende a reconocer el patrón antes que el ESC concreto.",
  "home.groups.escs": "ESC",
  "home.groups.explore": "Explorar",
  "home.journey.eyebrow": "Tu recorrido",
  "home.journey.title": "De la teoría al reconocimiento visual.",
  "home.cta2.a": "Aprende viendo.",
  "home.cta2.b": "Identifica al instante.",
  "home.cta2.desc": "Cada ESC tiene una firma. Este lab te entrena para verla.",
  "home.cta2.button": "Entrar al mapa",

  "esc.vuln": "¿Qué lo hace vulnerable?",
  "esc.detection": "Cómo lo detecta find",
  "esc.detectionTitle": "Salida de certipy-ad find",
  "esc.attack": "El ataque",
  "esc.attackTitle": "Comandos Certipy v5",
  "esc.certipyNote":
    "Nota: en Kali el binario es certipy-ad; si instalas por pip (certipy-ad), el comando es certipy. Sustituye según tu entorno.",
  "esc.requires": "Requisitos previos",
  "esc.notes": "Notas del operador",
  "esc.frequency": "Frecuencia en labs",
};

const en: Dict = {
  "app.name": "ADCS Lab",
  "app.tagline": "ADCS ESC Lab",
  "nav.sections": "Sections",
  "nav.escCases": "ESC cases",
  "nav.home": "Home",
  "nav.map": "Mind map",
  "nav.masterTable": "Master table",
  "nav.practice": "Guided practice",
  "nav.patch": "The patch",
  "nav.decision": "Decision table",
  "nav.blueTeam": "Blue Team",
  "nav.cheatSheet": "Cheat sheet",

  "a11y.skip": "Skip to content",
  "a11y.themeToggle": "Toggle theme",
  "a11y.langToggle": "Toggle language",
  "a11y.accentToggle": "Toggle accent",
  "a11y.accentPicker": "Pick accent color",
  "theme.accentColor": "Accent color",
  "accent.blue": "Blue",
  "accent.green": "Green",
  "accent.yellow": "Yellow",
  "accent.orange": "Orange",
  "accent.red": "Red",
  "accent.pink": "Pink",
  "accent.purple": "Purple",
  "accent.teal": "Teal",
  "accent.coral": "Coral",
  "theme.light": "Light",
  "theme.dark": "Dark",

  "home.badge": "ADCS · Volume 2 · Lab Edition",
  "home.title1": "Identify the",
  "home.title2": "16 ADCS ESCs.",
  "home.title3": "Cinematically. Step by step.",
  "home.subtitle":
    "An immersive walkthrough based on the Certipy v5 manual. Learn the find → req → auth flow, visualize the 5 failure groups and master the methodology for each scenario.",
  "home.cta.start": "Start the tour",
  "home.cta.explore": "Explore all 16 ESCs",
  "home.stat.cases": "ESC cases",
  "home.stat.groups": "Failure groups",
  "home.stat.steps": "Steps: find · req · auth",
  "home.stat.edu": "Educational only",
  "home.legal.title": "Legal & ethical notice",
  "home.legal.body1":
    "Each technique can escalate an unprivileged user to Domain Admin. Use it exclusively on systems you own, authorized labs (HTB, VulnLab, GOAD, Dockerlabs) or engagements with written authorization.",
  "home.legal.body2":
    "Modifying templates or the CA in a real environment can break the corporate PKI. Always restore.",
  "home.groups.eyebrow": "5 groups",
  "home.groups.title": "Every ADCS flaw falls into one of these five families.",
  "home.groups.subtitle": "Learn to recognize the pattern before the specific ESC.",
  "home.groups.escs": "ESC",
  "home.groups.explore": "Explore",
  "home.journey.eyebrow": "Your journey",
  "home.journey.title": "From theory to visual recognition.",
  "home.cta2.a": "Learn by seeing.",
  "home.cta2.b": "Identify instantly.",
  "home.cta2.desc": "Every ESC has a signature. This lab trains you to spot it.",
  "home.cta2.button": "Enter the map",

  "esc.vuln": "What makes it vulnerable?",
  "esc.detection": "How find detects it",
  "esc.detectionTitle": "certipy-ad find output",
  "esc.attack": "The attack",
  "esc.attackTitle": "Certipy v5 commands",
  "esc.certipyNote":
    "Note: on Kali the binary is certipy-ad; if you install via pip (certipy-ad), the command is certipy. Substitute for your environment.",
  "esc.requires": "Prerequisites",
  "esc.notes": "Operator notes",
  "esc.frequency": "Lab frequency",
};

const dictionaries: Record<Lang, Dict> = { es, en };

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "adcs-lab-lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    let initial: Lang = "es";
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "es" || stored === "en") initial = stored;
      else if (
        typeof navigator !== "undefined" &&
        navigator.language?.toLowerCase().startsWith("en")
      )
        initial = "en";
    } catch {
      /* ignore */
    }
    setLangState(initial);
    if (typeof document !== "undefined") document.documentElement.lang = initial;
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      toggle: () => setLang(lang === "es" ? "en" : "es"),
      t: (key: string) => dictionaries[lang][key] ?? dictionaries.es[key] ?? key,
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
