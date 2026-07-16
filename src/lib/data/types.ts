export type EscGroup = "plantilla" | "acl" | "config-ca" | "relay" | "mapping" | "acceso-ca";

export interface EscCase {
  id: number;
  name: string;
  shortName: string;
  group: EscGroup;
  frequency: 1 | 2 | 3 | 4 | 5;
  tagline: string;
  vulnerability: string[];
  detection: string;
  attack: string[];
  notes: string[];
  requires?: string[];
}

export interface EscGroupMeta {
  id: EscGroup;
  label: string;
  description: string;
  escs: number[];
  color: string;
}

export interface BlueTeamRow {
  group: EscGroup;
  detection: string[];
  hardening: string[];
}

export interface PatchContext {
  title: string;
  paragraphs: string[];
  rule: string[];
  whySid: string;
}

export interface DecisionTableRow {
  esc: number;
  action: string;
}

export interface DecisionTable {
  title: string;
  steps: string[];
  rows: DecisionTableRow[];
}

export interface CheatSheetBlock {
  title: string;
  lines: string[];
}

export interface CheatSheet {
  title: string;
  intro: string[];
  blocks: CheatSheetBlock[];
}

export interface PracticeOption {
  esc: string;
  label: string;
  correct: boolean;
  feedback: string;
}

export interface PracticeScenario {
  id: string;
  title: string;
  scenario: string;
  command: string;
  output: string;
  question: string;
  hint: string;
  options: PracticeOption[];
  keyLines: string[];
  explanation: string[];
  nextStep: string;
}
