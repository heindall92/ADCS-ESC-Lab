/**
 * Facade: prefer usePracticeScenarios() in React so practice follows ES/EN.
 */
export {
  getPracticeScenarios,
  usePracticeScenarios,
  type PracticeOption,
  type PracticeScenario,
} from "./data";

import { getPracticeScenarios } from "./data";

/** Spanish default for non-React consumers. */
export const scenarios = getPracticeScenarios("es");
