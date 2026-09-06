import { BOUNDARY_ID, Circuit, createGateDefinition, createPortDefinition } from "../index";
import type { GateDefinition, GateRegistry } from "../index";

/**
 * A small library of gates built purely from NAND, shared across the e2e
 * test suite. Each builder follows the same pattern: wire a `Circuit`
 * using the `BOUNDARY_ID` convention (SPEC.md §4), then wrap it into a
 * named `GateDefinition` with `createGateDefinition`. Not a test file
 * itself — no assertions live here.
 */

export function buildNotGate(registry: GateRegistry): GateDefinition {
  const A = createPortDefinition("A", "input");
  const Y = createPortDefinition("Y", "output");
  const circuit = new Circuit({ registry, inputs: [A], outputs: [Y] });

  const nand1 = circuit.addComponent("NAND");
  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: nand1, portId: "A" });
  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: nand1, portId: "B" });
  circuit.connect({ componentId: nand1, portId: "Y" }, { componentId: BOUNDARY_ID, portId: Y.id });

  return createGateDefinition({ name: "NOT", inputs: [A], outputs: [Y], circuit: circuit.toDefinition() });
}

/** AND(A, B) = NAND(NAND(A, B), NAND(A, B)) — the textbook two-NAND AND gate. */
export function buildAndGate(registry: GateRegistry): GateDefinition {
  const A = createPortDefinition("A", "input");
  const B = createPortDefinition("B", "input");
  const Y = createPortDefinition("Y", "output");
  const circuit = new Circuit({ registry, inputs: [A, B], outputs: [Y] });

  const nand1 = circuit.addComponent("NAND");
  const nand2 = circuit.addComponent("NAND");
  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: nand1, portId: "A" });
  circuit.connect({ componentId: BOUNDARY_ID, portId: B.id }, { componentId: nand1, portId: "B" });
  circuit.connect({ componentId: nand1, portId: "Y" }, { componentId: nand2, portId: "A" });
  circuit.connect({ componentId: nand1, portId: "Y" }, { componentId: nand2, portId: "B" });
  circuit.connect({ componentId: nand2, portId: "Y" }, { componentId: BOUNDARY_ID, portId: Y.id });

  return createGateDefinition({ name: "AND", inputs: [A, B], outputs: [Y], circuit: circuit.toDefinition() });
}

/** Standard 4-NAND XOR: NAND(NAND(A, NAND(A,B)), NAND(B, NAND(A,B))). */
export function buildXorGate(registry: GateRegistry): GateDefinition {
  const A = createPortDefinition("A", "input");
  const B = createPortDefinition("B", "input");
  const Y = createPortDefinition("Y", "output");
  const circuit = new Circuit({ registry, inputs: [A, B], outputs: [Y] });

  const n1 = circuit.addComponent("NAND");
  const n2 = circuit.addComponent("NAND");
  const n3 = circuit.addComponent("NAND");
  const n4 = circuit.addComponent("NAND");

  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: n1, portId: "A" });
  circuit.connect({ componentId: BOUNDARY_ID, portId: B.id }, { componentId: n1, portId: "B" });
  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: n2, portId: "A" });
  circuit.connect({ componentId: n1, portId: "Y" }, { componentId: n2, portId: "B" });
  circuit.connect({ componentId: BOUNDARY_ID, portId: B.id }, { componentId: n3, portId: "A" });
  circuit.connect({ componentId: n1, portId: "Y" }, { componentId: n3, portId: "B" });
  circuit.connect({ componentId: n2, portId: "Y" }, { componentId: n4, portId: "A" });
  circuit.connect({ componentId: n3, portId: "Y" }, { componentId: n4, portId: "B" });
  circuit.connect({ componentId: n4, portId: "Y" }, { componentId: BOUNDARY_ID, portId: Y.id });

  return createGateDefinition({ name: "XOR", inputs: [A, B], outputs: [Y], circuit: circuit.toDefinition() });
}

/** OR(A, B) = NAND(NOT(A), NOT(B)) — De Morgan's, nesting the NOT gate as a component. */
export function buildOrGate(registry: GateRegistry, not: GateDefinition): GateDefinition {
  const A = createPortDefinition("A", "input");
  const B = createPortDefinition("B", "input");
  const Y = createPortDefinition("Y", "output");
  const circuit = new Circuit({ registry, inputs: [A, B], outputs: [Y] });

  const [notIn] = not.inputs;
  const [notOut] = not.outputs;
  const notA = circuit.addComponent(not);
  const notB = circuit.addComponent(not);
  const nand1 = circuit.addComponent("NAND");

  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: notA, portId: notIn.id });
  circuit.connect({ componentId: BOUNDARY_ID, portId: B.id }, { componentId: notB, portId: notIn.id });
  circuit.connect({ componentId: notA, portId: notOut.id }, { componentId: nand1, portId: "A" });
  circuit.connect({ componentId: notB, portId: notOut.id }, { componentId: nand1, portId: "B" });
  circuit.connect({ componentId: nand1, portId: "Y" }, { componentId: BOUNDARY_ID, portId: Y.id });

  return createGateDefinition({ name: "OR", inputs: [A, B], outputs: [Y], circuit: circuit.toDefinition() });
}

/** HalfAdder(A, B): Sum = XOR(A, B), Carry = AND(A, B). */
export function buildHalfAdderGate(registry: GateRegistry, xor: GateDefinition, and: GateDefinition): GateDefinition {
  const A = createPortDefinition("A", "input");
  const B = createPortDefinition("B", "input");
  const Sum = createPortDefinition("Sum", "output");
  const Carry = createPortDefinition("Carry", "output");
  const circuit = new Circuit({ registry, inputs: [A, B], outputs: [Sum, Carry] });

  const [xorA, xorB] = xor.inputs;
  const [xorY] = xor.outputs;
  const [andA, andB] = and.inputs;
  const [andY] = and.outputs;

  const xorC = circuit.addComponent(xor);
  const andC = circuit.addComponent(and);

  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: xorC, portId: xorA.id });
  circuit.connect({ componentId: BOUNDARY_ID, portId: B.id }, { componentId: xorC, portId: xorB.id });
  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: andC, portId: andA.id });
  circuit.connect({ componentId: BOUNDARY_ID, portId: B.id }, { componentId: andC, portId: andB.id });
  circuit.connect({ componentId: xorC, portId: xorY.id }, { componentId: BOUNDARY_ID, portId: Sum.id });
  circuit.connect({ componentId: andC, portId: andY.id }, { componentId: BOUNDARY_ID, portId: Carry.id });

  return createGateDefinition({
    name: "HALF_ADDER",
    inputs: [A, B],
    outputs: [Sum, Carry],
    circuit: circuit.toDefinition(),
  });
}
