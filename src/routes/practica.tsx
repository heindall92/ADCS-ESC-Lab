import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  RotateCcw,
  Target,
  XCircle,
} from "lucide-react";

import { CodeBlock } from "@/components/code-block";
import {
  ScenarioContextForm,
  applyContext,
  useScenarioContext,
} from "@/components/scenario-context-form";
import { Button } from "@/components/ui/button";
import { usePracticeScenarios } from "@/lib/practice-scenarios";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/practica")({
  head: () => ({
    meta: [
      { title: "Práctica guiada — ADCS ESC Lab" },
      {
        name: "description",
        content:
          "Ejecuta el comando sugerido, analiza la salida simulada de Certipy find y recibe feedback guiado sobre qué ESC identificar.",
      },
      { property: "og:title", content: "Práctica guiada — ADCS ESC Lab" },
      {
        property: "og:description",
        content: "Interpreta salidas reales de certipy find y aprende a nombrar el ESC correcto.",
      },
    ],
  }),
  component: PracticaPage,
});

function PracticaPage() {
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const scenarios = usePracticeScenarios();

  const scenario = scenarios[idx];
  const total = scenarios.length;
  const { ctx, setCtx, reset: resetCtx } = useScenarioContext(scenario.id);
  const chosenOption = useMemo(
    () => scenario.options.find((o) => o.esc === chosen) ?? null,
    [scenario, chosen],
  );
  const correct = chosenOption?.correct ?? false;

  const command = useMemo(() => applyContext(scenario.command, ctx), [scenario, ctx]);
  const output = useMemo(() => applyContext(scenario.output, ctx), [scenario, ctx]);
  const nextStep = useMemo(() => applyContext(scenario.nextStep, ctx), [scenario, ctx]);
  const keyLines = useMemo(
    () => scenario.keyLines.map((l) => applyContext(l, ctx)),
    [scenario, ctx],
  );

  const reset = () => {
    setChosen(null);
    setShowHint(false);
    setRevealed(false);
  };

  const go = (delta: number) => {
    const next = Math.max(0, Math.min(total - 1, idx + delta));
    setIdx(next);
    setChosen(null);
    setShowHint(false);
    setRevealed(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16 pt-6">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Target className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-wider">Práctica guiada</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Interpreta la salida de <code className="text-primary">certipy find</code>
        </h1>
        <p className="text-muted-foreground">
          Lee el escenario, ejecuta mentalmente el comando y decide qué ESC estás viendo. Ningún
          comando se ejecuta: es un entrenamiento visual sobre salidas simuladas.
        </p>

        {/* Progress */}
        <div className="flex items-center gap-2 pt-2">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setIdx(i);
                reset();
              }}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                i === idx
                  ? "bg-primary"
                  : i < idx
                    ? "bg-primary/40"
                    : "bg-border hover:bg-muted-foreground/40",
              )}
              aria-label={`Ir al escenario ${i + 1}`}
            />
          ))}
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          {idx + 1} / {total}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.section
          key={scenario.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <h2 className="text-xl font-semibold text-foreground">{scenario.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {scenario.scenario}
            </p>
          </div>

          <ScenarioContextForm ctx={ctx} setCtx={setCtx} reset={resetCtx} />

          {/* Comando */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              1 · Comando sugerido
            </div>
            <CodeBlock code={command} title="terminal" />
          </div>

          {/* Salida */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              2 · Salida obtenida
            </div>
            <div className="rounded-lg border border-border bg-terminal p-4 font-mono text-xs leading-relaxed">
              {output.split("\n").map((line, i) => {
                const highlight = keyLines.some((k) => line.includes(k));
                return (
                  <div
                    key={i}
                    className={cn(
                      "whitespace-pre-wrap",
                      highlight && revealed
                        ? "bg-primary/15 text-primary rounded px-1 -mx-1"
                        : line.startsWith("[!]")
                          ? "text-warning"
                          : line.startsWith("[*]")
                            ? "text-code-comment"
                            : line.startsWith("[+]")
                              ? "text-code-string"
                              : "text-foreground/80",
                    )}
                  >
                    {line || "\u00A0"}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pregunta */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              3 · Tu turno
            </div>
            <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
              <p className="font-medium text-foreground">{scenario.question}</p>

              <div className="mt-4 grid gap-2">
                {scenario.options.map((opt) => {
                  const isChosen = chosen === opt.esc;
                  const state = !chosen
                    ? "idle"
                    : isChosen
                      ? opt.correct
                        ? "correct"
                        : "wrong"
                      : opt.correct
                        ? "reveal"
                        : "muted";
                  return (
                    <button
                      key={opt.esc}
                      onClick={() => {
                        if (!chosen) {
                          setChosen(opt.esc);
                          setRevealed(true);
                        }
                      }}
                      disabled={!!chosen}
                      className={cn(
                        "group flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                        state === "idle" &&
                          "border-border bg-background hover:border-primary/50 hover:bg-primary/5",
                        state === "correct" && "border-primary bg-primary/10 text-foreground",
                        state === "wrong" &&
                          "border-destructive/60 bg-destructive/10 text-foreground",
                        state === "reveal" && "border-primary/40 bg-primary/5",
                        state === "muted" && "border-border bg-background/40 opacity-60",
                      )}
                    >
                      <div className="mt-0.5">
                        {state === "correct" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        {state === "wrong" && <XCircle className="h-5 w-5 text-destructive" />}
                        {state === "reveal" && <CheckCircle2 className="h-5 w-5 text-primary/70" />}
                        {(state === "idle" || state === "muted") && (
                          <div className="h-5 w-5 rounded-full border border-border" />
                        )}
                      </div>
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{opt.label}</div>
                        {chosen && (state === "correct" || state === "wrong") && (
                          <div className="mt-2 text-xs text-muted-foreground">{opt.feedback}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {!chosen && (
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint((v) => !v)}
                    className="gap-2 text-warning hover:text-warning"
                  >
                    <Lightbulb className="h-4 w-4" />
                    {showHint ? "Ocultar pista" : "Necesito una pista"}
                  </Button>
                  {showHint && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-muted-foreground"
                    >
                      {scenario.hint}
                    </motion.p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Feedback / explicación */}
          {chosen && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                4 · Feedback guiado
              </div>

              <div
                className={cn(
                  "rounded-2xl border p-6",
                  correct ? "border-primary/30 bg-primary/5" : "border-warning/30 bg-warning/5",
                )}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {correct ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-primary">Bien identificado</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-warning" />
                      <span className="text-warning">Casi. Mira las líneas resaltadas.</span>
                    </>
                  )}
                </div>

                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {scenario.explanation.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Siguiente paso lógico
                  </div>
                  <CodeBlock code={scenario.nextStep} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={reset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Volver a intentar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button variant="ghost" onClick={() => go(-1)} disabled={idx === 0} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button onClick={() => go(1)} disabled={idx === total - 1} className="gap-2">
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
