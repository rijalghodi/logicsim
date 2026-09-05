import type { PortDefinition } from "./PortDefinition";
import type { CircuitDefinition } from "../circuit/Circuit";

/**
 * A reusable gate, built from composition rather than inheritance: it is a
 * name and an interface (`inputs`/`outputs`) wrapped around a plain
 * `CircuitDefinition`. Nothing here is a TypeScript class — a user-built
 * AND gate and a hand-authored one are the exact same shape, which is what
 * lets custom gates nest inside other custom gates without the core
 * knowing about them ahead of time (see `GateRegistry`).
 *
 * This is definition data only. It never holds a signal value or any
 * other transient simulation state — see `simulation/SimulationState.ts`.
 */
export interface GateDefinition {
  readonly id: string;
  readonly name: string;
  readonly inputs: PortDefinition[];
  readonly outputs: PortDefinition[];
  readonly circuit: CircuitDefinition;
}
