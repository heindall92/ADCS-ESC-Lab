import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { GroupCard } from "@/components/group-card";
import { useAdcsData } from "@/lib/adcs-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa mental — ADCS ESC Lab" },
      {
        name: "description",
        content:
          "Los 5 grupos de fallo que organizan los 16 casos ESC de ADCS: plantilla, ACL, configuración de la CA, relay y mapping.",
      },
      { property: "og:title", content: "Mapa mental — ADCS ESC Lab" },
      { property: "og:description", content: "Los 5 grupos de fallo de los 16 ESC de ADCS." },
    ],
  }),
  component: MapaPage,
});

const CHAIN_STEPS = [
  {
    id: "foothold",
    es: "Foothold",
    en: "Foothold",
    subEs: "Credenciales lowpriv",
    subEn: "Lowpriv credentials",
  },
  {
    id: "find",
    es: "find",
    en: "find",
    subEs: "certipy-ad find -vulnerable",
    subEn: "certipy-ad find -vulnerable",
  },
  {
    id: "group",
    es: "Identificar grupo",
    en: "Identify group",
    subEs: "Plantilla / ACL / CA / Relay / Mapping",
    subEn: "Template / ACL / CA / Relay / Mapping",
  },
  {
    id: "act",
    es: "req · manipular · relay",
    en: "req · manipulate · relay",
    subEs: "Según la familia de fallo",
    subEn: "Per failure family",
  },
  {
    id: "auth",
    es: "auth",
    en: "auth",
    subEs: "certipy-ad auth -pfx",
    subEn: "certipy-ad auth -pfx",
  },
  {
    id: "da",
    es: "DCSync / DA",
    en: "DCSync / DA",
    subEs: "Dominio comprometido",
    subEn: "Domain compromised",
  },
] as const;

function MapaPage() {
  const { lang, t } = useI18n();
  const { escCases, groups } = useAdcsData();

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-12 pt-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("nav.map")}
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed">
          {lang === "en" ? (
            <>
              These are not 16 disconnected cases. If you understand the 5 groups by{" "}
              <strong>where the flaw lives</strong>, you know where to look when <code>find</code>{" "}
              flags an ESC.
            </>
          ) : (
            <>
              No son 16 casos inconexos. Si entiendes los 5 grupos por{" "}
              <strong>dónde está el fallo</strong>, sabes dónde mirar cuando <code>find</code> te
              marque un ESC.
            </>
          )}
        </p>
      </header>

      <section className="space-y-4 rounded-xl border border-border bg-card/40 p-5 sm:p-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">
            {lang === "en"
              ? "Full chain: foothold → Domain Admin"
              : "Cadena completa: foothold → Domain Admin"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {lang === "en"
              ? "One mental model that connects every ESC group."
              : "Un solo modelo mental que conecta todos los grupos ESC."}
          </p>
        </div>
        <ol className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-stretch lg:gap-1">
          {CHAIN_STEPS.map((step, i) => (
            <li key={step.id} className="flex items-center gap-1 lg:min-w-[8rem] lg:flex-1">
              <div className="flex w-full flex-col rounded-lg border border-border bg-background px-3 py-3">
                <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 text-sm font-semibold text-foreground">
                  {lang === "en" ? step.en : step.es}
                </span>
                <span className="mt-0.5 text-xs text-muted-foreground">
                  {lang === "en" ? step.subEn : step.subEs}
                </span>
              </div>
              {i < CHAIN_STEPS.length - 1 && (
                <ArrowRight
                  className="mx-0.5 hidden h-4 w-4 shrink-0 text-muted-foreground lg:block"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "Template → req · ACL → rewrite then req · CA config → req · Relay → coerce + relay · Mapping → UPN/altSecurityIdentities · CA access → forge."
            : "Plantilla → req · ACL → reescribir y req · Config-CA → req · Relay → coerción + relay · Mapping → UPN/altSecurityIdentities · Acceso-CA → forge."}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {lang === "en" ? "Summary by ESC" : "Resumen por ESC"}
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {escCases.map((esc) => {
            const group = groups.find((g) => g.id === esc.group);
            return (
              <Link
                key={esc.id}
                to={`/esc/${esc.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-card/80"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: group?.color }}
                  />
                  <span className="text-sm font-medium text-foreground">{esc.shortName}</span>
                </div>
                <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                  {esc.tagline}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
