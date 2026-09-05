import { createId } from "../id";
import type { CircuitDefinition } from "../circuit/Circuit";
import type { PortDefinition } from "./PortDefinition";
import type { GateDefinition } from "./GateDefinition";

export interface CreateGateDefinitionParams {
  readonly id?: string;
  readonly name: string;
  readonly inputs: PortDefinition[];
  readonly outputs: PortDefinition[];
  readonly circuit: CircuitDefinition;
}

/**
 * Packages an already-built `CircuitDefinition` (typically produced by
 * wiring up a `Circuit` constructed with the same `inputs`/`outputs` as
 * its boundary) into a named, reusable `GateDefinition`. Does not
 * re-validate the wiring — build the circuit with `Circuit`, whose
 * `connect()` already validates every wire against these same boundary
 * ports, to get that check for free.
 */
export function createGateDefinition(params: CreateGateDefinitionParams): GateDefinition {
  return {
    id: params.id ?? createId("gate"),
    name: params.name,
    inputs: params.inputs,
    outputs: params.outputs,
    circuit: params.circuit,
  };
}
