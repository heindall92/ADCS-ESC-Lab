import { useMemo } from "react";

import type { Lang } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n";

import * as adcsEn from "./adcs.en";
import * as adcsEs from "./adcs.es";
import * as practiceEn from "./practice.en";
import * as practiceEs from "./practice.es";
import type {
  BlueTeamRow,
  CheatSheet,
  DecisionTable,
  EscCase,
  EscGroup,
  EscGroupMeta,
  PatchContext,
  PracticeScenario,
} from "./types";

export type {
  BlueTeamRow,
  CheatSheet,
  DecisionTable,
  EscCase,
  EscGroup,
  EscGroupMeta,
  PatchContext,
  PracticeOption,
  PracticeScenario,
} from "./types";

export interface AdcsBundle {
  groups: EscGroupMeta[];
  escCases: EscCase[];
  patchContext: PatchContext;
  decisionTable: DecisionTable;
  blueTeam: BlueTeamRow[];
  cheatSheet: CheatSheet;
  getGroupById: (id: EscGroup) => EscGroupMeta | undefined;
  getEscById: (id: number) => EscCase | undefined;
  getEscsByGroup: (id: EscGroup) => EscCase[];
}

function buildAdcsBundle(lang: Lang): AdcsBundle {
  const src = lang === "en" ? adcsEn : adcsEs;
  return {
    groups: src.groups,
    escCases: src.escCases,
    patchContext: src.patchContext,
    decisionTable: src.decisionTable,
    blueTeam: src.blueTeam,
    cheatSheet: src.cheatSheet,
    getGroupById: (id) => src.groups.find((g) => g.id === id),
    getEscById: (id) => src.escCases.find((e) => e.id === id),
    getEscsByGroup: (id) => src.escCases.filter((e) => e.group === id),
  };
}

export function getAdcsBundle(lang: Lang = "es"): AdcsBundle {
  return buildAdcsBundle(lang);
}

export function getPracticeScenarios(lang: Lang = "es"): PracticeScenario[] {
  return lang === "en" ? practiceEn.scenarios : practiceEs.scenarios;
}

/** Default Spanish exports for loaders / static checks (id existence). */
export const escCases = adcsEs.escCases;
export const groups = adcsEs.groups;

export function getEscById(id: number): EscCase | undefined {
  return adcsEs.escCases.find((e) => e.id === id);
}

export function useAdcsData(): AdcsBundle {
  const { lang } = useI18n();
  return useMemo(() => buildAdcsBundle(lang), [lang]);
}

export function usePracticeScenarios(): PracticeScenario[] {
  const { lang } = useI18n();
  return useMemo(() => getPracticeScenarios(lang), [lang]);
}
