import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Shield, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useAdcsData } from "@/lib/adcs-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/blue-team")({
  head: () => ({
    meta: [
      { title: "Blue Team — ADCS ESC Lab" },
      {
        name: "description",
        content: "Detección y hardening por grupo de fallo para los 16 casos ESC de ADCS.",
      },
      { property: "og:title", content: "Blue Team — ADCS ESC Lab" },
      { property: "og:description", content: "Detección y hardening por ESC." },
    ],
  }),
  component: BlueTeamPage,
});

function BlueTeamPage() {
  const { lang } = useI18n();
  const { blueTeam, getGroupById } = useAdcsData();

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-12 pt-6">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            {lang === "en" ? "Defensive focus" : "Enfoque defensivo"}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Blue Team</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {lang === "en" ? (
            <>
              Detection and hardening organized by failure group. Remember:{" "}
              <code>certipy-ad find -vulnerable</code> in audit mode is your best defensive tool.
            </>
          ) : (
            <>
              Detección y hardening organizados por grupo de fallo. Recuerda:{" "}
              <code>certipy-ad find -vulnerable</code> en modo auditoría es tu mejor herramienta
              defensiva.
            </>
          )}
        </p>
      </header>

      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <p className="text-sm leading-relaxed text-foreground">
            {lang === "en"
              ? "This section is for identifying and mitigating. Regular enumeration of templates, ACLs, and CA configuration lets you catch these paths before they are exploited."
              : "Esta sección es para identificar y mitigar. La enumeración regular de plantillas, ACLs y configuración de la CA permite detectar estas vías antes de que sean explotadas."}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {blueTeam.map((row) => {
          const group = getGroupById(row.group);
          return (
            <div
              key={row.group}
              className="rounded-xl border border-border bg-card p-5"
              style={{ borderTopColor: group?.color, borderTopWidth: "4px" }}
            >
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{group?.label}</h2>
                <Badge variant="outline" style={{ borderColor: group?.color, color: group?.color }}>
                  {group?.escs.map((id) => `ESC${id}`).join(", ")}
                </Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {lang === "en" ? "Detection" : "Detección"}
                  </h3>
                  <ul className="space-y-2">
                    {row.detection.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm leading-relaxed text-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Hardening
                  </h3>
                  <ul className="space-y-2">
                    {row.hardening.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm leading-relaxed text-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
