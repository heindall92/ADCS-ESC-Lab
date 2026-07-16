import { createFileRoute } from "@tanstack/react-router";
import { FileTerminal } from "lucide-react";

import { CodeBlock } from "@/components/code-block";
import { useAdcsData } from "@/lib/adcs-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/cheat-sheet")({
  head: () => ({
    meta: [
      { title: "Cheat Sheet — ADCS ESC Lab" },
      {
        name: "description",
        content: "Chuleta final de comandos Certipy v5 para los 16 casos ESC de ADCS.",
      },
      { property: "og:title", content: "Cheat Sheet — ADCS ESC Lab" },
      { property: "og:description", content: "Comandos rápidos para identificar ESC." },
    ],
  }),
  component: CheatSheetPage,
});

function CheatSheetPage() {
  const { lang } = useI18n();
  const { cheatSheet } = useAdcsData();

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-12 pt-6">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <FileTerminal className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            {lang === "en" ? "Quick reference" : "Consulta rápida"}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {cheatSheet.title}
        </h1>
      </header>

      <CodeBlock
        code={cheatSheet.intro.join("\n")}
        title={lang === "en" ? "Always first" : "Siempre primero"}
      />

      <div className="grid gap-6">
        {cheatSheet.blocks.map((block) => (
          <div key={block.title} className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{block.title}</h2>
            <CodeBlock code={block.lines.join("\n")} />
          </div>
        ))}
      </div>
    </div>
  );
}
