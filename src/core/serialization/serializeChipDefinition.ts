import type { ChipDefinition } from "../chip/ChipDefinition";
import type { SerializedChipDefinitionV1 } from "./types";
import { CHIP_DEFINITION_SCHEMA_VERSION } from "./types";

/** Produces the deliberate, JSON-safe on-disk shape — plain data, never `JSON.stringify(instance)`. */
export function serializeChipDefinition(chip: ChipDefinition): SerializedChipDefinitionV1 {
  return {
    version: CHIP_DEFINITION_SCHEMA_VERSION,
    id: chip.id,
    name: chip.name,
    inputs: chip.inputs.map((port) => ({ ...port })),
    outputs: chip.outputs.map((port) => ({ ...port })),
    components: chip.circuit.components.map((component) => ({ ...component })),
    connections: chip.circuit.connections.map((connection) => ({
      from: { ...connection.from },
      to: { ...connection.to },
    })),
  };
}
