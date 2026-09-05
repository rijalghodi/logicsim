import type { GateDefinition } from "../gate/GateDefinition";
import type { SerializedGateDefinitionV1 } from "./types";
import { GATE_DEFINITION_SCHEMA_VERSION } from "./types";

/** Produces the deliberate, JSON-safe on-disk shape — plain data, never `JSON.stringify(instance)`. */
export function serializeGateDefinition(gate: GateDefinition): SerializedGateDefinitionV1 {
  return {
    version: GATE_DEFINITION_SCHEMA_VERSION,
    id: gate.id,
    name: gate.name,
    inputs: gate.inputs.map((port) => ({ ...port })),
    outputs: gate.outputs.map((port) => ({ ...port })),
    components: gate.circuit.components.map((component) => ({ ...component })),
    connections: gate.circuit.connections.map((connection) => ({
      from: { ...connection.from },
      to: { ...connection.to },
    })),
  };
}
