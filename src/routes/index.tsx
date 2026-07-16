import { Link, createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  FileTerminal,
  Grid3X3,
  Shield,
  ShieldAlert,
  Table2,
  Terminal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAdcsData } from "@/lib/adcs-data";
import { HomeTutorial } from "@/components/home-tutorial";
import { HeroMotion } from "@/components/hero-motion";
import { ThemeLangToggle } from "@/components/theme-lang-toggle";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ADCS ESC Lab — Aprende a identificar los 16 ESC" },
      {
        name: "description",
        content:
          "Lab multimedia inmersivo para identificar los 16 casos ESC de ADCS con Certipy v5 en entornos controlados.",
      },
      { property: "og:title", content: "ADCS ESC Lab — Aprende a identificar los 16 ESC" },
      {
        property: "og:description",
        content: "Lab multimedia inmersivo para identificar los 16 casos ESC de ADCS con Certipy v5 en entornos controlados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const TERMINAL_LINES = [
  { t: "$ certipy-ad find -u lowpriv@lab.local -p 'Password1!' -dc-ip 10.10.10.10", cls: "text-code-command" },
  { t: "[*] Finding certificate templates", cls: "text-code-comment" },
  { t: "[*] Found 34 certificate templates", cls: "text-code-comment" },
  { t: "[!] Vulnerabilities", cls: "text-warning" },
  { t: "    ESC1 : 'Domain Users' can enroll, ENROLLEE_SUPPLIES_SUBJECT is enabled", cls: "text-primary" },
  { t: "    ESC4 : 'Domain Users' has dangerous permissions", cls: "text-primary" },
  { t: "    ESC8 : Web Enrollment enabled, NTLM allowed", cls: "text-primary" },
  { t: "[+] Saved BloodHound data to 20260716.bloodhound.zip", cls: "text-code-string" },
];

function HomePage() {
  const reduce = useReducedMotion();
  const { t } = useI18n();
  const { escCases, groups } = useAdcsData();
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (reduce) {
      setVisible(TERMINAL_LINES.length);
      return;
    }
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (id) return;
      id = setInterval(() => {
        setVisible((v) => (v >= TERMINAL_LINES.length ? 1 : v + 1));
      }, 750);
    };
    const stop = () => {
      if (id) {
        clearInterval(id);
        id = null;
      }
    };
    const onVis = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduce]);

  const fade = reduce
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="relative -mx-4 -my-6 space-y-16 pb-20 sm:-mx-6 lg:-mx-8">
      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden border-b border-border/50 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8 lg:pt-28">
        <div className="hero-ambient" aria-hidden />

        <div className="absolute right-4 top-8 z-20 sm:right-6 lg:right-8 lg:top-10">
          <div className="glass-surface-strong rounded-full px-3 py-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)]">
            <ThemeLangToggle size="md" />
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 xl:gap-16">
            <div className="min-w-0">
          <motion.p
            {...fade}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="eyebrow text-primary/90"
          >
            {t("home.badge")}
          </motion.p>

          <motion.h1
            {...fade}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-6 max-w-4xl text-[clamp(2.25rem,5.5vw,4.75rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-foreground"
          >
            {t("home.title1")}{" "}
            <span className="text-accent-line">{t("home.title2")}</span>
          </motion.h1>

          <motion.p
            {...fade}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-2xl text-xl font-medium tracking-[-0.02em] text-foreground/55 sm:text-2xl"
          >
            {t("home.title3")}
          </motion.p>

          <motion.p
            {...fade}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 max-w-xl text-base leading-[1.7] text-muted-foreground sm:text-lg"
          >
            {t("home.subtitle")}
          </motion.p>

          <motion.div
            {...fade}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg" className="h-11 gap-2 rounded-lg px-6 text-sm font-medium">
              <Link to="/mapa">
                {t("home.cta.start")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 gap-2 rounded-lg border-border/80 bg-transparent px-6 text-sm font-medium"
            >
              <Link to="/tabla">
                <Table2 className="h-4 w-4" />
                {t("home.cta.explore")}
              </Link>
            </Button>
          </motion.div>

          <motion.dl
            {...fade}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40 sm:grid-cols-4"
          >
            {[
              { k: "16", v: t("home.stat.cases") },
              { k: "5", v: t("home.stat.groups") },
              { k: "3", v: t("home.stat.steps") },
              { k: "100%", v: t("home.stat.edu") },
            ].map((s) => (
              <div key={s.v} className="bg-card px-5 py-5">
                <dt className="font-mono text-2xl font-semibold tracking-tight text-foreground">{s.k}</dt>
                <dd className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {s.v}
                </dd>
              </div>
            ))}
          </motion.dl>
            </div>

            <motion.div
              {...fade}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative mx-auto w-full max-w-[520px] lg:max-w-none lg:justify-self-end"
            >
              <HeroMotion />
            </motion.div>
          </div>

          <motion.div
            {...fade}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="panel-elevated relative mt-16 overflow-hidden rounded-2xl"
            role="img"
            aria-label="Ejemplo de salida de certipy find identificando ESC1, ESC4 y ESC8 en un dominio de laboratorio"
          >
            <div
              className="flex items-center gap-2 border-b border-border/60 bg-background/60 px-4 py-2.5"
              aria-hidden="true"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                certipy-ad find — lab.local
              </span>
              <Terminal className="ml-auto h-3.5 w-3.5 text-muted-foreground/70" />
            </div>
            <div
              className="min-h-[260px] bg-terminal p-5 font-mono text-[13px] leading-relaxed sm:p-6"
              aria-hidden="true"
            >
              {TERMINAL_LINES.slice(0, visible).map((l, i) => (
                <motion.div
                  key={i}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={l.cls}
                >
                  {l.t}
                  {i === visible - 1 && <span className="caret" aria-hidden="true" />}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= ETHICAL WARNING ================= */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-warning/25 bg-warning/5 p-6 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-warning/20 bg-warning/10 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">{t("home.legal.title")}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t("home.legal.body1")}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{t("home.legal.body2")}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================= GROUPS ================= */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-2xl"
        >
          <p className="eyebrow text-muted-foreground">{t("home.groups.eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            {t("home.groups.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("home.groups.subtitle")}
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, idx) => {
            const count = escCases.filter((e) => e.group === group.id).length;
            return (
              <motion.div
                key={group.id}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: idx * 0.04 }}
              >
                <Link
                  to="/mapa"
                  className="group panel-elevated block h-full rounded-2xl p-6 transition-colors duration-300 hover:border-border"
                  style={{ borderLeftWidth: "3px", borderLeftColor: group.color }}
                >
                  <div
                    className="mb-4 font-mono text-xs font-medium uppercase tracking-wider"
                    style={{ color: group.color }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{group.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{group.description}</p>
                  <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">
                      {count} {t("home.groups.escs")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {t("home.groups.explore")}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ================= JOURNEY + TUTORIAL ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="journey-layout">
          <div className="journey-area-header max-w-2xl">
            <p className="eyebrow text-muted-foreground">{t("home.journey.eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              {t("home.journey.title")}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {t("home.cta2.desc")}
            </p>
          </div>

          <div className="journey-area-nav glass-surface overflow-hidden rounded-2xl">
            {[
              { icon: Brain, title: "Mapa mental", desc: "Los 5 grupos en un lienzo interactivo.", to: "/mapa" as const },
              { icon: Table2, title: "Tabla maestra", desc: "Los 16 ESC en una vista comparable.", to: "/tabla" as const },
              { icon: BookOpen, title: "Fichas ESC", desc: "Vulnerabilidad, find, ataque y matiz por caso.", to: "/tabla" as const },
              { icon: ShieldAlert, title: "El parche KB5014754", desc: "Qué cambia tras el parche y qué sigue explotable.", to: "/parche" as const },
              { icon: Grid3X3, title: "Tabla de decisión", desc: "Del síntoma al ESC en segundos.", to: "/decision" as const },
              { icon: Shield, title: "Blue Team", desc: "Detección y hardening organizados por grupo.", to: "/blue-team" as const },
              { icon: FileTerminal, title: "Cheat sheet", desc: "Los comandos clave siempre a mano.", to: "/cheat-sheet" as const },
              { icon: BookOpen, title: "Solo educativo", desc: "Sin ejecución real. Solo comprensión.", to: "/" as const },
            ].map((item, idx, arr) => (
              <Link
                key={item.title}
                to={item.to}
                className={cn(
                  "glass-list-row group flex items-start gap-4 px-5 py-4 transition-colors duration-300 sm:items-center sm:px-6 sm:py-5",
                  idx < arr.length - 1 && "border-b",
                )}
              >
                <div className="glass-chip flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors group-hover:text-primary sm:h-11 sm:w-11">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold tracking-tight text-foreground">{item.title}</div>
                  <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</div>
                </div>
                <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:mt-0 sm:block" />
              </Link>
            ))}
          </div>

          <div className="journey-area-flow glass-surface rounded-2xl p-5 sm:p-6">
            <p className="eyebrow text-muted-foreground">Flujo de identificación</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Cada hallazgo sigue la misma cadena: enumera, filtra y lee la firma antes de nombrar el ESC.
            </p>
            <ol className="mt-5 grid gap-3 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { n: "01", label: "certipy-ad find", hint: "Enumera CAs y plantillas" },
                { n: "02", label: "-vulnerable / -enabled", hint: "Filtra candidatos" },
                { n: "03", label: "firma → ESC", hint: "Lee y nombra el caso" },
              ].map((step) => (
                <li
                  key={step.n}
                  className="glass-chip rounded-xl px-4 py-4"
                >
                  <div className="font-mono text-xs text-primary">{step.n}</div>
                  <div className="mt-1.5 text-sm font-medium leading-snug text-foreground">{step.label}</div>
                  <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.hint}</div>
                </li>
              ))}
            </ol>
          </div>

          <div className="journey-area-tutorial glass-surface rounded-2xl p-5 sm:p-6">
            <HomeTutorial embedded />
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="journey-area-cta glass-surface-strong rounded-2xl p-10 text-center sm:p-12"
          >
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              <span className="text-accent-line">{t("home.cta2.a")}</span>
              <br />
              {t("home.cta2.b")}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              {t("home.cta2.desc")}
            </p>
            <Button asChild size="lg" className="mt-8 h-11 gap-2 rounded-lg px-8 text-sm font-medium">
              <Link to="/mapa">
                {t("home.cta2.button")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
