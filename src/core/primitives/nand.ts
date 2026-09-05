import type { PrimitiveGateBehavior } from "../gate/GateRegistry";
import { createPortDefinition } from "../gate/PortDefinition";

export const NAND_TYPE = "NAND";

/**
 * The one and only built-in primitive. Every other gate, however complex,
 * is ultimately built by composing NANDs (see `createGateDefinition`).
 *
 * Truth table:
 *   A     B     | Y
 *   false false | true
 *   false true  | true
 *   true  false | true
 *   true  true  | false
 */
export const nandGate: PrimitiveGateBehavior = {
  kind: "primitive",
  type: NAND_TYPE,
  inputs: [createPortDefinition("A", "input", "A"), createPortDefinition("B", "input", "B")],
  outputs: [createPortDefinition("Y", "output", "Y")],
  evaluate: (inputs) => ({
    Y: !(inputs.A && inputs.B),
  }),
};
