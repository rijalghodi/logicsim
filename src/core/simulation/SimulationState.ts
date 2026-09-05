import type { Bit } from "../bit";

/**
 * Everything the evaluator produced from one pass: transient, recomputed
 * data — never part of a saved `GateDefinition`. Keyed by component id and
 * then port id so results for nested/custom components sit alongside
 * primitives without any special casing.
 */
export interface SimulationState {
  readonly componentOutputs: Record<string, Record<string, Bit>>;
  readonly boundaryOutputs: Record<string, Bit>;
}

export interface EvaluateCircuitOptions {
  /** Values fed into the circuit's own boundary inputs (only meaningful for a gate's internals). */
  readonly boundaryInputs?: Readonly<Record<string, Bit>>;
  /**
   * Forced values for component input ports that have no driving
   * connection. Used to poke values directly into a raw/test circuit that
   * has no boundary of its own (e.g. a bare chain of NANDs).
   */
  readonly componentInputOverrides?: Readonly<Record<string, Readonly<Record<string, Bit>>>>;
}
