import type { PortDefinition } from "../chip/PortDefinition";
import type { ComponentDefinition } from "../circuit/Component";
import type { Connection } from "../circuit/Connection";

export const CHIP_DEFINITION_SCHEMA_VERSION = 1;

/**
 * The deliberate, JSON-compatible on-disk shape of a `ChipDefinition`.
 * Carries an explicit `version` because this format will evolve — a
 * future migration only needs to teach `deserializeChipDefinition` about
 * older version numbers, not change every caller.
 */
export interface SerializedChipDefinitionV1 {
  readonly version: 1;
  readonly id: string;
  readonly name: string;
  readonly inputs: PortDefinition[];
  readonly outputs: PortDefinition[];
  readonly components: ComponentDefinition[];
  readonly connections: Connection[];
}
