import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Compass,
  Eye,
  Filter,
  Fingerprint,
  RotateCcw,
  Search,
  GraduationCap,
  Target,
  TerminalSquare,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { GlossaryChips } from "@/components/glossary";
import { cn } from "@/lib/utils";

interface Checkpoint {
  id: string;
  label: string;
}

type PreviewTone = "cmd" | "info" | "warn" | "hit" | "ok" | "muted" | "dim";

interface PreviewLine {
  t: string;
  tone?: PreviewTone;
}

interface StepPreview {
  title: string;
  caption?: string;
  lines: PreviewLine[];
}

interface Step {
  id: string;
  icon: typeof Search;
  title: string;
  goal: string;
  command?: string;
  checkpoints: Checkpoint[];
  glossary?: string[];
  preview?: StepPreview;
  signals?: string[];
}

const STEPS: Step[] = [
  {
    id: "s1-context",
    icon: Compass,
    title: "Prepara el laboratorio",
    goal: "Confirma que trabajas sobre un entorno controlado y tienes credenciales de un usuario sin privilegios.",
    checkpoints: [
      { id: "c1", label: "Lab autorizado (HTB, VulnLab, GOAD, Dockerlabs o propio)" },
      { id: "c2", label: "Credenciales de un usuario de dominio (Domain Users)" },
      { id: "c3", label: "IP del DC y del CA identificadas" },
    ],
    glossary: ["adcs", "ca", "domainusers"],
    preview: {
      title: "Reconocimiento previo del dominio",
      caption: "Salida simulada de nxc/nmap antes de tocar Certipy.",
      lines: [
        { t: "$ nxc smb 10.10.10.10 -u lowpriv -p 'Password1!'", tone: "cmd" },
        { t: "SMB   10.10.10.10  445  DC01   [*] Windows Server 2019 Build 17763 (name:DC01) (domain:lab.local)", tone: "info" },
        { t: "SMB   10.10.10.10  445  DC01   [+] lab.local\\lowpriv:Password1! ", tone: "ok" },
        { t: "$ nmap -p 80,443,445,88 10.10.10.11 -Pn", tone: "cmd" },
        { t: "88/tcp   open  kerberos-sec", tone: "muted" },
        { t: "445/tcp  open  microsoft-ds", tone: "muted" },
        { t: "80/tcp   open  http           Microsoft IIS httpd 10.0  (title: Microsoft Active Directory Certificate Services)", tone: "hit" },
      ],
    },
    signals: [
      "Puerto 80/443 con título Microsoft Active Directory Certificate Services.",
      "SMB responde con credenciales válidas de un usuario de Domain Users.",
      "Se distinguen la IP del DC (88/445) y la del CA (80/443).",
      "Kerberos (88) y Microsoft-DS (445) están abiertos en el DC.",
    ],
  },
  {
    id: "s2-find",
    icon: Search,
    title: "Enumera toda la PKI",
    goal: "Lanza el escaneo base de Certipy para descubrir CAs y plantillas visibles con tu usuario.",
    command:
      "certipy-ad find -u lowpriv@lab.local -p 'Password1!' -dc-ip 10.10.10.10",
    checkpoints: [
      { id: "c1", label: "Se listan una o más 'Certificate Authorities'" },
      { id: "c2", label: "Aparece el número total de plantillas" },
      { id: "c3", label: "Se genera el .zip para BloodHound" },
    ],
    glossary: ["find", "ca", "plantilla", "bloodhound"],
    preview: {
      title: "Salida base de certipy find",
      caption: "Sin filtros: descubre CAs, plantillas y exporta datos.",
      lines: [
        { t: "$ certipy-ad find -u lowpriv@lab.local -p 'Password1!' -dc-ip 10.10.10.10", tone: "cmd" },
        { t: "[*] Finding certificate authorities", tone: "info" },
        { t: "[*] Found 1 certificate authority", tone: "info" },
        { t: "    0 - LAB-CA (CA01.lab.local)", tone: "muted" },
        { t: "[*] Finding certificate templates", tone: "info" },
        { t: "[*] Found 34 certificate templates", tone: "info" },
        { t: "[*] Retrieving CA configuration for 'LAB-CA' via RRP", tone: "dim" },
        { t: "[+] Saved BloodHound data to '20260716_lab.local.zip'", tone: "ok" },
        { t: "[+] Saved text output to '20260716_lab.local.txt'", tone: "ok" },
      ],
    },
    signals: [
      "Aparece al menos una Certificate Authority con nombre y FQDN.",
      "Se indica el número total de certificate templates encontradas.",
      "Se genera un .zip de BloodHound con la fecha del escaneo.",
      "El nombre del CA coincide con el descubierto en el reconocimiento previo.",
    ],
  },
  {
    id: "s3-vulnerable",
    icon: Filter,
    title: "Filtra las plantillas vulnerables",
    goal: "Reduce el ruido: quédate solo con lo que Certipy marca como explotable.",
    command:
      "certipy-ad find -u lowpriv@lab.local -p 'Password1!' -dc-ip 10.10.10.10 -stdout -vulnerable",
    checkpoints: [
      { id: "c1", label: "Aparece el bloque [!] Vulnerabilities" },
      { id: "c2", label: "Cada hallazgo empieza por un identificador ESCx" },
      { id: "c3", label: "Anotas el nombre de plantilla o CA afectada" },
    ],
    glossary: ["vulnerable", "esc", "plantilla"],
    preview: {
      title: "certipy find -vulnerable -stdout",
      caption: "Solo lo explotable: 3 firmas ESC en un vistazo.",
      lines: [
        { t: "$ certipy-ad find -u lowpriv@lab.local -p 'Password1!' -dc-ip 10.10.10.10 -stdout -vulnerable", tone: "cmd" },
        { t: "Certificate Templates", tone: "dim" },
        { t: "  0", tone: "dim" },
        { t: "    Template Name                       : VulnWebServer", tone: "muted" },
        { t: "    Enrollment Rights                   : lab.local\\Domain Users", tone: "muted" },
        { t: "    Extended Key Usage                  : Client Authentication, Server Authentication", tone: "muted" },
        { t: "    Enrollee Supplies Subject           : True", tone: "warn" },
        { t: "    [!] Vulnerabilities", tone: "warn" },
        { t: "      ESC1                               : 'lab.local\\Domain Users' can enroll, ENROLLEE_SUPPLIES_SUBJECT is enabled", tone: "hit" },
        { t: "      ESC4                               : 'lab.local\\Domain Users' has dangerous permissions", tone: "hit" },
        { t: "Certificate Authorities", tone: "dim" },
        { t: "  0", tone: "dim" },
        { t: "    CA Name                             : LAB-CA", tone: "muted" },
        { t: "    Web Enrollment                      : Enabled", tone: "warn" },
        { t: "    [!] Vulnerabilities", tone: "warn" },
        { t: "      ESC8                               : Web Enrollment enabled and NTLM authentication allowed", tone: "hit" },
      ],
    },
    signals: [
      "Aparece el bloque '[!] Vulnerabilities' en plantillas o en CAs.",
      "Cada hallazgo empieza con 'ESC' seguido de un número concreto.",
      "Las plantillas muestran Enrollment Rights que incluyen grupos de bajo privilegio.",
      "Se separan vulnerabilidades de plantillas de las de configuración de CA (p. ej. ESC8).",
    ],
  },
  {
    id: "s4-signature",
    icon: Fingerprint,
    title: "Lee la firma del hallazgo",
    goal: "No memorices ESCs: aprende a leer 3 pistas — quién enrola, qué EKU tiene, qué flag está activo.",
    checkpoints: [
      { id: "c1", label: "Identificas quién puede enrolar (Enrollment Rights)" },
      { id: "c2", label: "Localizas el EKU (Client Authentication, Any Purpose, etc.)" },
      { id: "c3", label: "Detectas flags clave: ENROLLEE_SUPPLIES_SUBJECT, EDITF_ATTRIBUTESUBJECTALTNAME2, Web Enrollment…" },
    ],
    glossary: ["enrollment", "eku", "ess", "editf", "webenroll"],
    preview: {
      title: "Anatomía de una plantilla",
      caption: "Las 3 pistas resaltadas dentro de una ficha real.",
      lines: [
        { t: "Template Name                       : VulnWebServer", tone: "muted" },
        { t: "Enrollment Rights                   : lab.local\\Domain Users        ← ¿QUIÉN?", tone: "hit" },
        { t: "Extended Key Usage                  : Client Authentication          ← ¿PARA QUÉ?", tone: "hit" },
        { t: "Enrollee Supplies Subject           : True                            ← ¿QUÉ FLAG?", tone: "hit" },
        { t: "Requires Manager Approval           : False", tone: "muted" },
        { t: "Authorized Signatures Required      : 0", tone: "muted" },
        { t: "# 3 pistas → 'Domain Users' + 'Client Auth' + ESS = ESC1 clarísimo", tone: "ok" },
      ],
    },
    signals: [
      "Enrollment Rights apunta a quién puede solicitar el certificado.",
      "Extended Key Usage indica para qué se puede usar (Client Authentication = autenticación).",
      "Flags como ENROLLEE_SUPPLIES_SUBJECT o EDITF_ATTRIBUTESUBJECTALTNAME2 en True son críticas.",
      "Requires Manager Approval en False reduce la fricción del ataque.",
    ],
  },
  {
    id: "s5-map",
    icon: Target,
    title: "Nombra el ESC",
    goal: "Cruza la firma con los 5 grupos del mapa mental hasta caer en un ESC concreto.",
    checkpoints: [
      { id: "c1", label: "Decides si es plantilla, ACL, config-CA, relay o mapping" },
      { id: "c2", label: "Nombras un ESC candidato (p.ej. 'esto huele a ESC1')" },
      { id: "c3", label: "Contrastas con la ficha del ESC antes de actuar" },
    ],
    glossary: ["esc", "plantilla"],
    preview: {
      title: "Del síntoma al ESC",
      caption: "Cómo se lee un hallazgo hasta bautizarlo.",
      lines: [
        { t: "# Síntoma en la salida", tone: "dim" },
        { t: "  Enrollment Rights           : Domain Users", tone: "muted" },
        { t: "  Enrollee Supplies Subject   : True", tone: "muted" },
        { t: "  Extended Key Usage          : Client Authentication", tone: "muted" },
        { t: "# Grupo → 'Fallo en la plantilla'", tone: "info" },
        { t: "# Candidato → ESC1 (SAN arbitrario)", tone: "hit" },
        { t: "# Contraste rápido con la ficha:", tone: "dim" },
        { t: "  ✓ Cualquiera puede enrolar", tone: "ok" },
        { t: "  ✓ Puede pedir SAN arbitrario", tone: "ok" },
        { t: "  ✓ EKU sirve para autenticar", tone: "ok" },
      ],
    },
    signals: [
      "La firma (Enrollment Rights + EKU + flag) apunta a un grupo del mapa mental.",
      "Si hay Web Enrollment + NTLM, el candidato es ESC8 (relay).",
      "Si hay permisos peligrosos sobre la plantilla, piensa en ESC4.",
      "Antes de decidir el siguiente paso, se contrasta con la ficha del ESC.",
    ],
  },
  {
    id: "s6-practice",
    icon: GraduationCap,
    title: "Practica con casos reales",
    goal: "Entrena el ojo con salidas simuladas y feedback inmediato en la sección de práctica guiada.",
    checkpoints: [
      { id: "c1", label: "Completas los 4 escenarios de práctica" },
      { id: "c2", label: "Aciertas el ESC en el primer intento en 3 de ellos" },
      { id: "c3", label: "Puedes explicar el 'siguiente paso lógico' sin mirar la ficha" },
    ],
    glossary: ["esc", "find", "vulnerable"],
    preview: {
      title: "Formato de la práctica guiada",
      caption: "Así se ve un escenario en /practica.",
      lines: [
        { t: "Escenario 02 · Salida enigmática", tone: "dim" },
        { t: "  Template Name              : WebServer", tone: "muted" },
        { t: "  Enrollment Rights          : lab.local\\Web Admins", tone: "muted" },
        { t: "  Owner                      : lab.local\\lowpriv", tone: "warn" },
        { t: "  [!] Vulnerabilities        : ESC4", tone: "hit" },
        { t: "Pregunta → ¿Qué ESC es y cuál es el siguiente paso?", tone: "info" },
        { t: "Tu respuesta → ESC4 · reescribir la plantilla y pedir cert", tone: "cmd" },
        { t: "[+] Correcto. Feedback: aprovechas Owner para modificar la template.", tone: "ok" },
      ],
    },
    signals: [
      "La pregunta del escenario es directa: '¿Qué ESC es y cuál es el siguiente paso?'.",
      "El feedback dice '[+] Correcto' y explica la relación causa-efecto.",
      "La salida no ejecuta nada: solo entrena la lectura de la firma.",
      "Cada escenario vincula una firma concreta con un ESC y una acción lógica.",
    ],
  },
];

const TONE_CLASS: Record<PreviewTone, string> = {
  cmd: "text-code-command",
  info: "text-code-comment",
  warn: "text-warning",
  hit: "text-primary",
  ok: "text-code-string",
  muted: "text-terminal-foreground/85",
  dim: "text-muted-foreground",
};

function TerminalPreview({ preview }: { preview: StepPreview }) {
  return (
    <figure className="space-y-2">
      <figcaption className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <TerminalSquare className="h-3.5 w-3.5" aria-hidden="true" />
        Vista previa · {preview.title}
      </figcaption>
      <div
        className="panel-elevated overflow-hidden rounded-xl"
        role="img"
        aria-label={`Ejemplo de salida: ${preview.title}`}
      >
        <div
          className="flex items-center gap-1.5 border-b border-border/60 bg-background/40 px-3 py-1.5"
          aria-hidden="true"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            simulación · no ejecutable
          </span>
        </div>
        <pre
          className="scroll-hidden max-h-72 overflow-x-auto overflow-y-auto bg-terminal/90 px-4 py-3 font-mono text-[12.5px] leading-relaxed"
          aria-hidden="true"
        >
          {preview.lines.map((l, i) => (
            <div key={i} className={cn("whitespace-pre", TONE_CLASS[l.tone ?? "muted"])}>
              {l.t}
            </div>
          ))}
        </pre>
      </div>
      {preview.caption && (
        <p className="text-xs text-muted-foreground">{preview.caption}</p>
      )}
    </figure>
  );
}


const STORAGE_KEY = "adcs-lab.tutorial.checkpoints.v1";
const COMPARE_KEY = "adcs-lab.tutorial.comparisons.v1";

type CheckMap = Record<string, boolean>;
type CompareVerdict = "match" | "miss";
type CompareMap = Record<string, CompareVerdict>;

function usePersistentMap<T extends Record<string, unknown>>(storageKey: string) {
  const [state, setState] = useState<T>({} as T);
  const [hydrated, setHydrated] = useState(false);
  // When true, the next state change came from another tab — skip re-persisting.
  const skipPersistRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setState(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setHydrated(true);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey || event.storageArea !== localStorage) return;
      skipPersistRef.current = true;
      if (!event.newValue) {
        setState({} as T);
        return;
      }
      try {
        setState(JSON.parse(event.newValue) as T);
      } catch {
        /* ignore malformed payloads from other tabs */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated, storageKey]);

  return { state, setState, hydrated };
}

function useCheckpoints() {
  const { state, setState, hydrated } = usePersistentMap<CheckMap>(STORAGE_KEY);
  const toggle = (key: string) =>
    setState((s) => ({ ...s, [key]: !s[key] }));
  const reset = () => setState({});
  return { state, toggle, reset, hydrated };
}

function useComparisons() {
  const { state, setState, hydrated } = usePersistentMap<CompareMap>(COMPARE_KEY);
  const setVerdict = (key: string, verdict: CompareVerdict) =>
    setState((s) => {
      // Toggle off if the same verdict is pressed again.
      if (s[key] === verdict) {
        const next = { ...s };
        delete next[key];
        return next;
      }
      return { ...s, [key]: verdict };
    });
  const resetStep = (stepId: string) =>
    setState((s) => {
      const next: CompareMap = {};
      const prefix = `${stepId}.`;
      for (const k of Object.keys(s)) if (!k.startsWith(prefix)) next[k] = s[k];
      return next;
    });
  return { state, setVerdict, resetStep, hydrated };
}

export function HomeTutorial({ embedded = false }: { embedded?: boolean }) {
  const reduce = useReducedMotion();
  const { state, toggle, reset, hydrated } = useCheckpoints();
  const {
    state: compareState,
    setVerdict,
    resetStep: resetStepCompare,
    hydrated: compareHydrated,
  } = useComparisons();
  const [activeStep, setActiveStep] = useState(-1);

  const stepProgress = useMemo(() => {
    return STEPS.map((step) => {
      const done = step.checkpoints.filter((c) => state[`${step.id}.${c.id}`]).length;
      return { done, total: step.checkpoints.length, complete: done === step.checkpoints.length };
    });
  }, [state]);

  const totalDone = stepProgress.filter((s) => s.complete).length;
  const percent = Math.round((totalDone / STEPS.length) * 100);

  return (
    <section
      aria-labelledby={embedded ? undefined : "tutorial-heading"}
      className={cn(embedded ? "" : "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8")}
    >
      <div
        className={cn(
          "flex flex-col gap-6",
          embedded ? "md:flex-row md:items-start md:justify-between" : "mb-12 md:flex-row md:items-end md:justify-between",
        )}
      >
        {!embedded && (
          <div className="max-w-2xl">
            <p className="eyebrow text-muted-foreground">Tutorial paso a paso</p>
            <h2
              id="tutorial-heading"
              className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl"
            >
              Cómo identificar AD CS en un lab.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Sigue los 6 pasos, marca cada checkpoint y desbloquea el flujo completo{" "}
              <code className="rounded bg-card px-1.5 py-0.5 text-primary">find → firma → ESC</code>.
              Tu progreso se guarda automáticamente en este navegador.
            </p>
          </div>
        )}

        {embedded && (
          <div className="max-w-2xl md:flex-1">
            <p className="eyebrow text-muted-foreground">Tutorial interactivo</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              6 pasos · find → firma → ESC
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Marca cada checkpoint mientras recorres el flujo. Tu progreso se guarda en este navegador.
            </p>
          </div>
        )}

        <div className={cn("panel-elevated rounded-2xl p-5", embedded ? "w-full md:w-80 md:shrink-0" : "md:w-72")} aria-live="polite">
          {embedded && (
            <div className="mb-4 border-b border-border/60 pb-4 md:hidden">
              <p className="text-sm font-semibold text-foreground">Progreso del tutorial</p>
            </div>
          )}
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Progreso
            </span>
            <span className="font-mono text-2xl font-bold text-primary">
              {hydrated ? `${percent}%` : "—"}
            </span>
          </div>
          <div
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={hydrated ? percent : 0}
            aria-label="Progreso del tutorial"
          >
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{ width: `${hydrated ? percent : 0}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {totalDone} / {STEPS.length} pasos completados
            </span>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Reiniciar
            </button>
          </div>
        </div>
      </div>

      <ol className="relative mt-6 grid grid-cols-1 gap-3">
        {/* Línea de conexión */}
        <div
          className="pointer-events-none absolute left-[27px] top-6 hidden h-[calc(100%-3rem)] w-px bg-gradient-to-b from-primary/40 via-border to-transparent md:block"
          aria-hidden="true"
        />
        {STEPS.map((step, i) => {
          const progress = stepProgress[i];
          const isActive = activeStep === i;
          const Icon = step.icon;
          return (
            <li
              key={step.id}
              className={cn(
                "relative min-w-0 rounded-xl border transition-colors",
                progress.complete
                  ? "border-primary/35 bg-primary/5"
                  : "panel-elevated border-border/80",
                isActive && "ring-1 ring-primary/20",
              )}
            >
              <button
                type="button"
                onClick={() => setActiveStep(isActive ? -1 : i)}
                aria-expanded={isActive}
                aria-controls={`${step.id}-panel`}
                className="flex w-full items-start gap-3 rounded-xl p-4 text-left"
              >
                <div
                  className={cn(
                    "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors",
                    progress.complete
                      ? "border-electric bg-electric text-electric-foreground"
                      : "border-border bg-background text-foreground",
                  )}
                  aria-hidden="true"
                >
                  {progress.complete ? <Check className="h-6 w-6" /> : String(i + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <span
                      className={cn(
                        "ml-auto rounded-full border px-2 py-0.5 font-mono text-xs",
                        progress.complete
                          ? "border-electric/50 text-electric"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {progress.done}/{progress.total}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{step.goal}</p>

                  {/* Mini barra */}
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={cn("h-full", progress.complete ? "bg-electric" : "bg-primary")}
                      initial={false}
                      animate={{ width: `${(progress.done / progress.total) * 100}%` }}
                      transition={{ type: "spring", stiffness: 140, damping: 22 }}
                    />
                  </div>
                </div>
              </button>

              {/* Panel expandible */}
              <div
                id={`${step.id}-panel`}
                className={cn("overflow-hidden transition-[grid-template-rows] duration-300 ease-out", isActive ? "grid grid-rows-[1fr]" : "grid grid-rows-[0fr]")}
              >
                <div className="min-h-0 space-y-4 border-t border-border/60 px-4 pb-5 pt-4 sm:px-5">
                  {step.command && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Comando sugerido
                      </div>
                      <CodeBlock code={step.command} title="terminal" />
                    </div>
                  )}

                  {step.preview && <TerminalPreview preview={step.preview} />}

                  {step.signals && step.signals.length > 0 && (() => {
                    const total = step.signals.length;
                    const matched = step.signals.filter(
                      (_, idx) => compareState[`${step.id}.sig${idx}`] === "match",
                    ).length;
                    const missed = step.signals.filter(
                      (_, idx) => compareState[`${step.id}.sig${idx}`] === "miss",
                    ).length;
                    const answered = matched + missed;
                    return (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Qué mirar · comparativa
                          </div>
                          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                            {compareHydrated ? (
                              <>
                                <span className="text-electric">{matched}✓</span>
                                {" · "}
                                <span className="text-warning">{missed}✗</span>
                                {" · "}
                                {answered}/{total}
                              </>
                            ) : (
                              "—"
                            )}
                          </span>
                          {answered > 0 && (
                            <button
                              type="button"
                              onClick={() => resetStepCompare(step.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <RotateCcw className="h-3 w-3" aria-hidden="true" />
                              Limpiar
                            </button>
                          )}
                        </div>
                        <ul className="grid gap-2">
                          {step.signals.map((signal, idx) => {
                            const key = `${step.id}.sig${idx}`;
                            const verdict = compareState[key];
                            return (
                              <li
                                key={key}
                                className={cn(
                                  "flex items-start gap-3 rounded-xl border p-3 text-sm transition-colors",
                                  verdict === "match" && "border-electric/40 bg-electric/5",
                                  verdict === "miss" && "border-warning/40 bg-warning/5",
                                  !verdict && "border-border bg-background",
                                )}
                              >
                                <Eye
                                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                                  aria-hidden="true"
                                />
                                <span className="flex-1 text-foreground">{signal}</span>
                                <div className="flex shrink-0 items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setVerdict(key, "match")}
                                    aria-pressed={verdict === "match"}
                                    aria-label="Coincide con mi salida"
                                    title="Coincide"
                                    className={cn(
                                      "inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
                                      verdict === "match"
                                        ? "border-electric bg-electric text-electric-foreground"
                                        : "border-border text-muted-foreground hover:border-electric/50 hover:text-electric",
                                    )}
                                  >
                                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setVerdict(key, "miss")}
                                    aria-pressed={verdict === "miss"}
                                    aria-label="No coincide con mi salida"
                                    title="No coincide"
                                    className={cn(
                                      "inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
                                      verdict === "miss"
                                        ? "border-warning bg-warning/20 text-warning"
                                        : "border-border text-muted-foreground hover:border-warning/50 hover:text-warning",
                                    )}
                                  >
                                    <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })()}





                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Checkpoints
                    </div>
                    <ul className="grid gap-2">
                      {step.checkpoints.map((c) => {
                        const key = `${step.id}.${c.id}`;
                        const checked = !!state[key];
                        return (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => toggle(key)}
                              aria-pressed={checked}
                              className={cn(
                                "group flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                                checked
                                  ? "border-electric/40 bg-electric/5 text-foreground"
                                  : "border-border bg-background hover:border-electric/40 hover:bg-electric/5",
                              )}
                            >
                              {checked ? (
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-electric" aria-hidden="true" />
                              ) : (
                                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground group-hover:text-electric" aria-hidden="true" />
                              )}
                              <span className={cn(checked && "text-foreground")}>{c.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {step.glossary && step.glossary.length > 0 && (
                    <GlossaryChips keys={step.glossary} />
                  )}



                  {step.id === "s6-practice" && (
                    <Button asChild size="sm" className="gap-2">
                      <Link to="/practica">
                        Ir a la práctica guiada
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Finalización */}
      {hydrated && totalDone === STEPS.length && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="panel-elevated mt-8 flex flex-col gap-3 rounded-2xl p-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left"
          role="status"
        >
          <div>
            <div className="text-sm font-semibold text-primary">Tutorial completado</div>
            <div className="text-sm text-muted-foreground">
              Ya conoces el flujo. Pon a prueba tu ojo con los escenarios de práctica.
            </div>
          </div>
          <Button asChild className="gap-2">
            <Link to="/practica">
              Empezar la práctica
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>
      )}
    </section>
  );
}
