import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { CodeBlock } from "@/components/code-block";
import { useAdcsData } from "@/lib/adcs-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/parche")({
  head: () => ({
    meta: [
      { title: "El parche KB5014754 — ADCS ESC Lab" },
      {
        name: "description",
        content:
          "KB5014754, ESC6 con SID en SAN, y mapping débil (ESC9/10/16) bajo Full Enforcement.",
      },
      { property: "og:title", content: "El parche KB5014754 — ADCS ESC Lab" },
      { property: "og:description", content: "Entiende ESC6, mapping fuerte y Full Enforcement." },
    ],
  }),
  component: ParchePage,
});

function ParchePage() {
  const { lang } = useI18n();
  const { patchContext } = useAdcsData();

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-12 pt-6">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-warning">
          <ShieldAlert className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            {lang === "en" ? "Critical context" : "Contexto crítico"}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {patchContext.title}
        </h1>
      </header>

      <section className="space-y-4">
        {patchContext.paragraphs.map((p, i) => (
          <p key={i} className="text-base leading-relaxed text-foreground">
            {p}
          </p>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {lang === "en" ? "The mental rule" : "La regla mental"}
        </h2>
        <ul className="space-y-3">
          {patchContext.rule.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {lang === "en" ? "Why -sid in the commands?" : "¿Por qué el -sid en los comandos?"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{patchContext.whySid}</p>
        <CodeBlock
          code={`# Example: req with target SID (administrator = RID 500)
certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip "$DC_IP" \\
  -target "$CA_HOST" -ca 'CA-NAME' -template 'User' \\
  -upn 'administrator@corp.local' -sid 'S-1-5-21-...-500'`}
          title={lang === "en" ? "Using the -sid flag" : "Uso del flag -sid"}
        />
      </section>
    </div>
  );
}
