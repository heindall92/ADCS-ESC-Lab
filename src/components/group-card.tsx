import { Link } from "@tanstack/react-router";

import { type EscGroupMeta, useAdcsData } from "@/lib/adcs-data";
import { cn } from "@/lib/utils";

interface GroupCardProps {
  group: EscGroupMeta;
  compact?: boolean;
}

export function GroupCard({ group, compact = false }: GroupCardProps) {
  const { escCases } = useAdcsData();
  const escs = escCases.filter((e) => e.group === group.id);

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card/80",
        compact ? "" : "flex flex-col gap-3",
      )}
      style={{ borderLeftColor: group.color, borderLeftWidth: "4px" }}
    >
      <div>
        <h3 className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-base")}>
          {group.label}
        </h3>
        {!compact && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{group.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {escs.map((esc) => (
          <Link
            key={esc.id}
            to={`/esc/${esc.id}`}
            className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {esc.shortName}
          </Link>
        ))}
      </div>
    </div>
  );
}
