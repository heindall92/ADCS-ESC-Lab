import { useEffect, useState } from "react";
import { RotateCcw, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ScenarioContext {
  user: string;
  domain: string;
  password: string;
  dcIp: string;
  caName: string;
  caHost: string;
}

export const DEFAULT_CONTEXT: ScenarioContext = {
  user: "lowpriv",
  domain: "lab.local",
  password: "Password1!",
  dcIp: "10.10.10.10",
  caName: "LAB-CA",
  caHost: "ca01.lab.local",
};

const STORAGE_PREFIX = "adcs-lab.practica.ctx.v1.";

export function useScenarioContext(scenarioId: string) {
  const key = STORAGE_PREFIX + scenarioId;
  const [ctx, setCtx] = useState<ScenarioContext>(DEFAULT_CONTEXT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setCtx({ ...DEFAULT_CONTEXT, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(ctx));
    } catch {
      /* ignore */
    }
  }, [ctx, hydrated, key]);

  const reset = () => setCtx(DEFAULT_CONTEXT);
  return { ctx, setCtx, reset, hydrated };
}

/**
 * Replace the DEFAULT_CONTEXT values inside a string with the user's ctx
 * values. Order matters: replace the longest / most specific tokens first
 * so `lab.local` doesn't clobber `ca01.lab.local`.
 */
export function applyContext(text: string, ctx: ScenarioContext): string {
  const pairs: Array<[string, string]> = [
    [DEFAULT_CONTEXT.caHost, ctx.caHost],
    [DEFAULT_CONTEXT.password, ctx.password],
    [DEFAULT_CONTEXT.caName, ctx.caName],
    [DEFAULT_CONTEXT.dcIp, ctx.dcIp],
    [`${DEFAULT_CONTEXT.user}@${DEFAULT_CONTEXT.domain}`, `${ctx.user}@${ctx.domain}`],
    [DEFAULT_CONTEXT.domain.toUpperCase(), ctx.domain.toUpperCase()],
    [DEFAULT_CONTEXT.domain, ctx.domain],
    [DEFAULT_CONTEXT.user, ctx.user],
  ];
  let out = text;
  for (const [from, to] of pairs) {
    if (!from || from === to) continue;
    out = out.split(from).join(to);
  }
  return out;
}

interface Field {
  key: keyof ScenarioContext;
  label: string;
  placeholder: string;
  type?: string;
}

const FIELDS: Field[] = [
  { key: "user", label: "Usuario", placeholder: "lowpriv" },
  { key: "domain", label: "Dominio", placeholder: "lab.local" },
  { key: "password", label: "Contraseña", placeholder: "Password1!", type: "text" },
  { key: "dcIp", label: "IP del DC", placeholder: "10.10.10.10" },
  { key: "caName", label: "Nombre de CA", placeholder: "LAB-CA" },
  { key: "caHost", label: "FQDN del CA", placeholder: "ca01.lab.local" },
];

export function ScenarioContextForm({
  ctx,
  setCtx,
  reset,
  className,
}: {
  ctx: ScenarioContext;
  setCtx: (updater: (prev: ScenarioContext) => ScenarioContext) => void;
  reset: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card/40 p-4",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Datos del escenario
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            · {ctx.user}@{ctx.domain} · DC {ctx.dcIp} · CA {ctx.caName}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {open ? "Ocultar" : "Personalizar"}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Cambia estos valores para adaptar el comando, la salida simulada y
            el siguiente paso a tu laboratorio. Se guardan por escenario.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FIELDS.map((f) => (
              <label key={f.key} className="flex flex-col gap-1 text-xs">
                <span className="font-medium text-muted-foreground">
                  {f.label}
                </span>
                <input
                  type={f.type ?? "text"}
                  value={ctx[f.key]}
                  placeholder={f.placeholder}
                  onChange={(e) =>
                    setCtx((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  spellCheck={false}
                  autoComplete="off"
                  className="rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                />
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={reset} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Restablecer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
