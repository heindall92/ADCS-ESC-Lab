import { Link, createFileRoute } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdcsData } from "@/lib/adcs-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/decision")({
  head: () => ({
    meta: [
      { title: "Tabla de decisión — ADCS ESC Lab" },
      {
        name: "description",
        content:
          "Chuleta de 'find me dice X, ¿qué hago?' para los 16 casos ESC de ADCS con Certipy v5.",
      },
      { property: "og:title", content: "Tabla de decisión — ADCS ESC Lab" },
      { property: "og:description", content: "find me dice X → hago Y. Tabla de decisión ESC." },
    ],
  }),
  component: DecisionPage,
});

function DecisionPage() {
  const { lang } = useI18n();
  const { decisionTable, escCases, getGroupById } = useAdcsData();

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-12 pt-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {decisionTable.title}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {lang === "en" ? (
            <>
              Mental algorithm for when <code>certipy-ad find</code> flags an ESC. Identify the
              methodology and jump to the case for the exact command.
            </>
          ) : (
            <>
              Algoritmo mental para cuando <code>certipy-ad find</code> te marque un ESC. Identifica
              la metodología y salta al caso para ver el comando exacto.
            </>
          )}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {lang === "en" ? "Algorithm" : "Algoritmo"}
        </h2>
        <ol className="space-y-3">
          {decisionTable.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {lang === "en" ? "find → action table" : "Tabla find → acción"}
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-24 text-foreground">ESC</TableHead>
                  <TableHead className="text-foreground">
                    {lang === "en" ? "Methodology" : "Metodología"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisionTable.rows.map((row) => {
                  const esc = escCases.find((e) => e.id === row.esc);
                  const group = esc ? getGroupById(esc.group) : undefined;
                  return (
                    <TableRow key={row.esc} className="border-border">
                      <TableCell className="font-medium">
                        <Link to={`/esc/${row.esc}`} className="text-primary hover:underline">
                          ESC{row.esc}
                        </Link>
                        {group && (
                          <Badge
                            variant="outline"
                            className="ml-2 whitespace-nowrap"
                            style={{ borderColor: group.color, color: group.color }}
                          >
                            {group.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-pre-line font-mono text-sm text-foreground">
                        {row.action}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
}
