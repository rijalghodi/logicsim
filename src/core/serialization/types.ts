import type { PortDefinition } from "../gate/PortDefinition";
import type { ComponentDefinition } from "../circuit/Component";
import type { Connection } from "../circuit/Connection";

export const GATE_DEFINITION_SCHEMA_VERSION = 1;

/**
 * The deliberate, JSON-compatible on-disk shape of a `GateDefinition`.
 * Carries an explicit `version` because this format will evolve — a
 * future migration only needs to teach `deserializeGateDefinition` about
 * older version numbers, not change every caller.
 */
export interface SerializedGateDefinitionV1 {
  readonly version: 1;
  readonly id: string;
  readonly name: string;
  readonly inputs: PortDefinition[];
  readonly outputs: PortDefinition[];
  readonly components: ComponentDefinition[];
  readonly connections: Connection[];
}
