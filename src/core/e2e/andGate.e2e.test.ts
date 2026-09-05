import { describe, expect, it } from "bun:test";
import {
  BOUNDARY_ID,
  Circuit,
  createDefaultRegistry,
  createGateDefinition,
  createPortDefinition,
  deserializeGateDefinition,
  evaluateGate,
  serializeGateDefinition,
} from "../index";

/**
 * End-to-end walk through every layer in SPEC.md's layering diagram —
 * PortDefinition -> Component/Connection -> CircuitDefinition ->
 * GateDefinition -> GateRegistry -> evaluateCircuit -> serialization —
 * using only the public `../index` surface, with the textbook two-NAND
 * AND gate (SPEC.md §3) as the running example.
 */
describe("AND gate end-to-end", () => {
  const A = createPortDefinition("A", "input");
  const B = createPortDefinition("B", "input");
  const Y = createPortDefinition("Y", "output");

  const TRUTH_TABLE: [boolean, boolean, boolean][] = [
    [false, false, false],
    [false, true, false],
    [true, false, false],
    [true, true, true],
  ];

  /** AND(A, B) = NAND(NAND(A, B), NAND(A, B)) — see SPEC.md §3 for the boundary wiring. */
  function buildAndGate(registry = createDefaultRegistry()) {
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

  it("evaluates the full truth table through the registry", () => {
    const registry = createDefaultRegistry();
    const and = buildAndGate(registry);

    for (const [a, b, expected] of TRUTH_TABLE) {
      expect(evaluateGate(and, registry, { [A.id]: a, [B.id]: b })[Y.id]).toBe(expected);
    }
  });

  it("works as a component nested inside a larger circuit", () => {
    const registry = createDefaultRegistry();
    const and = buildAndGate(registry);

    // AND3(a, b, c) = AND(AND(a, b), c), composed from two AND gate instances.
    const a3 = createPortDefinition("A", "input");
    const b3 = createPortDefinition("B", "input");
    const c3 = createPortDefinition("C", "input");
    const y3 = createPortDefinition("Y", "output");
    const outer = new Circuit({ registry, inputs: [a3, b3, c3], outputs: [y3] });

    const and1 = outer.addComponent(and);
    const and2 = outer.addComponent(and);

    outer.connect({ componentId: BOUNDARY_ID, portId: a3.id }, { componentId: and1, portId: A.id });
    outer.connect({ componentId: BOUNDARY_ID, portId: b3.id }, { componentId: and1, portId: B.id });
    outer.connect({ componentId: and1, portId: Y.id }, { componentId: and2, portId: A.id });
    outer.connect({ componentId: BOUNDARY_ID, portId: c3.id }, { componentId: and2, portId: B.id });
    outer.connect({ componentId: and2, portId: Y.id }, { componentId: BOUNDARY_ID, portId: y3.id });

    const allTrue = outer.evaluate({ boundaryInputs: { [a3.id]: true, [b3.id]: true, [c3.id]: true } });
    expect(allTrue.boundaryOutputs[y3.id]).toBe(true);

    const oneFalse = outer.evaluate({ boundaryInputs: { [a3.id]: true, [b3.id]: true, [c3.id]: false } });
    expect(oneFalse.boundaryOutputs[y3.id]).toBe(false);
  });

  it("survives a serialize/deserialize round-trip and still evaluates correctly", () => {
    const and = buildAndGate();

    // Round-trip through actual JSON text, as it would cross a real persistence boundary.
    const json = JSON.parse(JSON.stringify(serializeGateDefinition(and)));
    const restored = deserializeGateDefinition(json);

    // A fresh registry stands in for a brand-new session loading the saved gate.
    const freshRegistry = createDefaultRegistry();
    const [a, b] = restored.inputs;
    const [y] = restored.outputs;

    for (const [av, bv, expected] of TRUTH_TABLE) {
      expect(evaluateGate(restored, freshRegistry, { [a.id]: av, [b.id]: bv })[y.id]).toBe(expected);
    }
  });
});
