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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tabla")({
  head: () => ({
    meta: [
      { title: "Tabla maestra — ADCS ESC Lab" },
      {
        name: "description",
        content:
          "Resumen de los 16 casos ESC de ADCS con su fallo, grupo y frecuencia de aparición en labs.",
      },
      { property: "og:title", content: "Tabla maestra — ADCS ESC Lab" },
      { property: "og:description", content: "Resumen de los 16 ESC de ADCS." },
    ],
  }),
  component: TablaPage,
});

function TablaPage() {
  const { lang, t } = useI18n();
  const { escCases, getGroupById } = useAdcsData();

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12 pt-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("nav.masterTable")}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "Quick summary of the 16 ESCs, their failure group, and how often they show up in controlled labs."
            : "Resumen rápido de los 16 ESC, su grupo de fallo y su frecuencia en labs controlados."}
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-24 text-foreground">ESC</TableHead>
                <TableHead className="text-foreground">
                  {lang === "en" ? "The flaw" : "El fallo"}
                </TableHead>
                <TableHead className="text-foreground">
                  {lang === "en" ? "Group" : "Grupo"}
                </TableHead>
                <TableHead className="w-40 text-foreground">
                  {lang === "en" ? "Frequency" : "Frecuencia"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escCases.map((esc) => {
                const group = getGroupById(esc.group);
                return (
                  <TableRow key={esc.id} className="border-border">
                    <TableCell className="font-medium">
                      <Link to={`/esc/${esc.id}`} className="text-primary hover:underline">
                        {esc.shortName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <Link
                        to={`/esc/${esc.id}`}
                        className="text-foreground transition-colors hover:text-primary"
                      >
                        {esc.tagline}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {group && (
                        <Badge
                          variant="outline"
                          className="whitespace-nowrap"
                          style={{ borderColor: group.color, color: group.color }}
                        >
                          {group.label}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <FrequencyPills frequency={esc.frequency} lang={lang} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function FrequencyPills({ frequency, lang }: { frequency: number; lang: "es" | "en" }) {
  const labelEs =
    frequency === 5
      ? "Muy común"
      : frequency >= 3
        ? "Común"
        : frequency === 2
          ? "Ocasional"
          : "Raro";
  const labelEn =
    frequency === 5
      ? "Very common"
      : frequency >= 3
        ? "Common"
        : frequency === 2
          ? "Occasional"
          : "Rare";
  const label = lang === "en" ? labelEn : labelEs;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn("h-2 w-2 rounded-full", i < frequency ? "bg-primary" : "bg-border")}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
