import { describe, expect, it } from "bun:test";
import {
  BOUNDARY_ID,
  Circuit,
  createDefaultRegistry,
  createPortDefinition,
  deserializeGateDefinition,
  evaluateGate,
  serializeGateDefinition,
} from "../index";
import { buildAndGate } from "./gates";

/**
 * End-to-end walk through every layer in SPEC.md's layering diagram —
 * PortDefinition -> Component/Connection -> CircuitDefinition ->
 * GateDefinition -> GateRegistry -> evaluateCircuit -> serialization —
 * using only the public `../index` surface, with the textbook two-NAND
 * AND gate (SPEC.md §4, built by the shared `./gates` library) as the
 * running example.
 */
describe("AND gate end-to-end", () => {
  const TRUTH_TABLE: [boolean, boolean, boolean][] = [
    [false, false, false],
    [false, true, false],
    [true, false, false],
    [true, true, true],
  ];

  it("evaluates the full truth table through the registry", () => {
    const registry = createDefaultRegistry();
    const and = buildAndGate(registry);
    const [a, b] = and.inputs;
    const [y] = and.outputs;

    for (const [av, bv, expected] of TRUTH_TABLE) {
      expect(evaluateGate(and, registry, { [a.id]: av, [b.id]: bv })[y.id]).toBe(expected);
    }
  });

  it("works as a component nested inside a larger circuit", () => {
    const registry = createDefaultRegistry();
    const and = buildAndGate(registry);
    const [andA, andB] = and.inputs;
    const [andY] = and.outputs;

    // AND3(a, b, c) = AND(AND(a, b), c), composed from two AND gate instances.
    const a3 = createPortDefinition("A", "input");
    const b3 = createPortDefinition("B", "input");
    const c3 = createPortDefinition("C", "input");
    const y3 = createPortDefinition("Y", "output");
    const outer = new Circuit({ registry, inputs: [a3, b3, c3], outputs: [y3] });

    const and1 = outer.addComponent(and);
    const and2 = outer.addComponent(and);

    outer.connect({ componentId: BOUNDARY_ID, portId: a3.id }, { componentId: and1, portId: andA.id });
    outer.connect({ componentId: BOUNDARY_ID, portId: b3.id }, { componentId: and1, portId: andB.id });
    outer.connect({ componentId: and1, portId: andY.id }, { componentId: and2, portId: andA.id });
    outer.connect({ componentId: BOUNDARY_ID, portId: c3.id }, { componentId: and2, portId: andB.id });
    outer.connect({ componentId: and2, portId: andY.id }, { componentId: BOUNDARY_ID, portId: y3.id });

    const allTrue = outer.evaluate({ boundaryInputs: { [a3.id]: true, [b3.id]: true, [c3.id]: true } });
    expect(allTrue.boundaryOutputs[y3.id]).toBe(true);

    const oneFalse = outer.evaluate({ boundaryInputs: { [a3.id]: true, [b3.id]: true, [c3.id]: false } });
    expect(oneFalse.boundaryOutputs[y3.id]).toBe(false);
  });

  it("survives a serialize/deserialize round-trip and still evaluates correctly", () => {
    const and = buildAndGate(createDefaultRegistry());

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
