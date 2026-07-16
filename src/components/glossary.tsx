import { BookMarked } from "lucide-react";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface GlossaryEntry {
  term: string;
  short: string;
  long: string;
  href?: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  adcs: {
    term: "AD CS",
    short: "Active Directory Certificate Services",
    long: "Rol de Windows Server que emite y gestiona certificados dentro de un dominio. Es la PKI interna del Active Directory.",
  },
  ca: {
    term: "CA",
    short: "Certificate Authority",
    long: "Servidor que firma y emite los certificados. Cada dominio puede tener una o varias CAs empresariales.",
  },
  esc: {
    term: "ESC",
    short: "Escalation Scenario",
    long: "Cada uno de los 16 escenarios de escalada de privilegios documentados sobre AD CS (ESC1 a ESC16).",
    href: "/tabla",
  },
  plantilla: {
    term: "Plantilla",
    short: "Certificate Template",
    long: "Definición reutilizable de qué campos tendrá un certificado y quién puede pedirlo. La mayoría de ESCs nacen de una plantilla mal configurada.",
  },
  vulnerable: {
    term: "-vulnerable",
    short: "Filtro de Certipy",
    long: "Flag de certipy-ad find que muestra solo las plantillas o CAs marcadas como explotables (ESC1, ESC2, ESC3…).",
  },
  eku: {
    term: "EKU",
    short: "Extended Key Usage",
    long: "Extensión del certificado que declara para qué sirve (Client Authentication, Smart Card Logon, Any Purpose…). Determina si un certificado puede usarse para autenticar contra Kerberos.",
  },
  ess: {
    term: "ENROLLEE_SUPPLIES_SUBJECT",
    short: "Flag de plantilla",
    long: "Cuando está activo, el que pide el certificado puede escribir el Subject/SAN. Combinado con enrolamiento abierto es la firma clásica de ESC1.",
  },
  editf: {
    term: "EDITF_ATTRIBUTESUBJECTALTNAME2",
    short: "Flag global de la CA",
    long: "Configuración de la CA que permite añadir SAN arbitrarios en la petición. Firma clásica de ESC6.",
  },
  webenroll: {
    term: "Web Enrollment",
    short: "certsrv HTTP",
    long: "Endpoint HTTP/HTTPS de la CA que acepta autenticación NTLM. Es la puerta que abre los ataques de relay (ESC8).",
  },
  bloodhound: {
    term: "BloodHound",
    short: "Grafo de AD",
    long: "Herramienta de análisis de rutas de ataque en Active Directory. Certipy exporta un .zip compatible para pintar caminos hacia Domain Admin.",
  },
  domainusers: {
    term: "Domain Users",
    short: "Grupo por defecto",
    long: "Grupo al que pertenece cualquier cuenta de dominio. Ver 'Domain Users' con permisos de enrolamiento sobre una plantilla es la señal más peligrosa.",
  },
  enrollment: {
    term: "Enrollment Rights",
    short: "Quién puede pedir",
    long: "Lista de principals autorizados a solicitar un certificado a partir de una plantilla concreta. Es la primera pista para clasificar un hallazgo.",
  },
  find: {
    term: "certipy find",
    short: "Enumeración base",
    long: "Comando de Certipy que descubre CAs, plantillas y las clasifica marcando cuáles son vulnerables. En Kali el binario es certipy-ad; si instalas por pip (certipy-ad) el binario se llama certipy.",
  },
  certipy: {
    term: "certipy / certipy-ad",
    short: "Mismo tool, dos nombres",
    long: "El paquete PyPI es certipy-ad, pero el binario instalado por pip se llama certipy. En Kali y muchas distros el paquete expone el comando certipy-ad. Este lab documenta certipy-ad; si usas pip, sustituye certipy-ad por certipy en todos los comandos.",
  },
};

interface GlossaryChipsProps {
  keys: string[];
  className?: string;
}

/**
 * Chips clicables. En desktop se muestra la definición en HoverCard (hover/foco);
 * en móvil se activa por tap con Popover para mantener la accesibilidad táctil.
 */
export function GlossaryChips({ keys, className }: GlossaryChipsProps) {
  const entries = keys.map((k) => GLOSSARY[k]).filter(Boolean);
  if (entries.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <BookMarked className="h-3.5 w-3.5" aria-hidden="true" />
        Glosario del paso
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {entries.map((e) => (
          <li key={e.term}>
            <GlossaryChip entry={e} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function GlossaryChip({ entry }: { entry: GlossaryEntry }) {
  const label = (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 font-mono text-xs text-primary transition-colors hover:border-primary/60 hover:bg-primary/10 focus-visible:border-primary"
      aria-label={`Definición de ${entry.term}`}
    >
      {entry.term}
    </button>
  );

  const body = (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-sm font-semibold text-primary">{entry.term}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{entry.short}</span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{entry.long}</p>
      {entry.href && (
        <a
          href={entry.href}
          className="inline-block text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          Abrir referencia →
        </a>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: hover / focus */}
      <span className="hidden md:inline-block">
        <HoverCard openDelay={120} closeDelay={80}>
          <HoverCardTrigger asChild>{label}</HoverCardTrigger>
          <HoverCardContent className="w-72 border-primary/20" side="top" align="start">
            {body}
          </HoverCardContent>
        </HoverCard>
      </span>
      {/* Móvil: tap */}
      <span className="inline-block md:hidden">
        <Popover>
          <PopoverTrigger asChild>{label}</PopoverTrigger>
          <PopoverContent className="w-64 border-primary/20" side="top" align="start">
            {body}
          </PopoverContent>
        </Popover>
      </span>
    </>
  );
}
