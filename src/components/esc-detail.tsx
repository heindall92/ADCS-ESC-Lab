import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Crosshair,
  ShieldAlert,
  Terminal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";
import { GroupCard } from "@/components/group-card";
import { type EscCase, useAdcsData } from "@/lib/adcs-data";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface EscDetailProps {
  esc: EscCase;
}

export function EscDetail({ esc }: EscDetailProps) {
  const { getGroupById } = useAdcsData();
  const { t, lang } = useI18n();
  const group = getGroupById(esc.group);
  const attackCode = esc.attack.join("\n");

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <header className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className="text-sm font-semibold"
            style={{ borderColor: group?.color, color: group?.color }}
          >
            {esc.shortName}
          </Badge>
          {group && (
            <Badge variant="secondary" className="text-xs">
              {group.label}
            </Badge>
          )}
          <FrequencyBadge frequency={esc.frequency} lang={lang} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {esc.name}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{esc.tagline}</p>
      </header>

      <Section icon={ShieldAlert} title={t("esc.vuln")}>
        <ul className="space-y-2">
          {esc.vulnerability.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={Crosshair} title={t("esc.detection")}>
        <CodeBlock code={esc.detection} title={t("esc.detectionTitle")} />
      </Section>

      <Section icon={Terminal} title={t("esc.attack")}>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{t("esc.certipyNote")}</p>
        <CodeBlock code={attackCode} title={t("esc.attackTitle")} showLineNumbers />
      </Section>

      {esc.requires && esc.requires.length > 0 && (
        <Section icon={BookOpen} title={t("esc.requires")}>
          <ul className="space-y-2">
            {esc.requires.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm leading-relaxed text-foreground"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section icon={AlertTriangle} title={t("esc.notes")}>
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
          <ul className="space-y-2">
            {esc.notes.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm leading-relaxed text-foreground"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {group && (
        <div className="pt-4">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            {lang === "en" ? "Related group" : "Grupo relacionado"}
          </h3>
          <GroupCard group={group} />
        </div>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="pl-7">{children}</div>
    </section>
  );
}

function FrequencyBadge({ frequency, lang }: { frequency: number; lang: "es" | "en" }) {
  const stars = "★".repeat(frequency) + "☆".repeat(5 - frequency);
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
    <Badge
      variant="outline"
      className={cn(
        "text-xs",
        frequency === 5 && "border-primary/50 text-primary",
        frequency === 4 && "border-accent/50 text-accent",
        frequency <= 3 && "border-muted-foreground/50 text-muted-foreground",
      )}
      title={label}
    >
      {stars} <span className="ml-1">{label}</span>
    </Badge>
  );
}
