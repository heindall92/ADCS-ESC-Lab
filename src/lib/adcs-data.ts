/**
 * Facade: re-exports localized ADCS data.
 * Prefer useAdcsData() in React components so content follows the ES/EN toggle.
 * Static getters (getEscById, escCases, groups) return Spanish — use for id checks / loaders only.
 */
export {
  escCases,
  getAdcsBundle,
  getEscById,
  groups,
  useAdcsData,
  type AdcsBundle,
  type BlueTeamRow,
  type CheatSheet,
  type DecisionTable,
  type EscCase,
  type EscGroup,
  type EscGroupMeta,
  type PatchContext,
} from "./data";

import { getAdcsBundle } from "./data";

const es = getAdcsBundle("es");

export const patchContext = es.patchContext;
export const decisionTable = es.decisionTable;
export const blueTeam = es.blueTeam;
export const cheatSheet = es.cheatSheet;

export function getGroupById(id: import("./data").EscGroup) {
  return es.getGroupById(id);
}

export function getEscsByGroup(id: import("./data").EscGroup) {
  return es.getEscsByGroup(id);
}
