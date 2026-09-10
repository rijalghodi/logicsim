import { createId } from "../id";

export type PortDirection = "input" | "output";

/**
 * The static description of an input or output on a chip: stable identity
 * plus a display name. Deliberately holds no runtime value — see
 * `simulation/SimulationState.ts` for where live port values live. Keeping
 * these separate means a saved chip never has to serialize a transient
 * signal value.
 */
export interface PortDefinition {
  readonly id: string;
  readonly name: string;
  readonly direction: PortDirection;
}

export function createPortDefinition(
  name: string,
  direction: PortDirection,
  id: string = createId("port"),
): PortDefinition {
  return { id, name, direction };
}
