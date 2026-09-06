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
import type { GateDefinition, GateRegistry } from "../index";
import { buildAndGate, buildHalfAdderGate, buildNotGate, buildOrGate, buildXorGate } from "./gates";

/**
 * End-to-end walk through custom-gate composition several layers deep:
 * NAND -> {NOT, AND, XOR} -> {OR, HALF_ADDER} -> FULL_ADDER, then a 2-bit
 * ripple-carry adder built from two FULL_ADDERs. NOT/AND/XOR/OR/HALF_ADDER
 * come from the shared `./gates` library; FULL_ADDER and the 2-bit adder
 * are specific to this test.
 */

/**
 * FullAdder(A, B, Cin): chains two half adders and ORs their carries —
 * the textbook "two half adders + an OR gate" full adder.
 */
function buildFullAdderGate(registry: GateRegistry, halfAdder: GateDefinition, or: GateDefinition): GateDefinition {
  const A = createPortDefinition("A", "input");
  const B = createPortDefinition("B", "input");
  const Cin = createPortDefinition("Cin", "input");
  const Sum = createPortDefinition("Sum", "output");
  const Cout = createPortDefinition("Cout", "output");
  const circuit = new Circuit({ registry, inputs: [A, B, Cin], outputs: [Sum, Cout] });

  const [haA, haB] = halfAdder.inputs;
  const [haSum, haCarry] = halfAdder.outputs;
  const [orA, orB] = or.inputs;
  const [orY] = or.outputs;

  const ha1 = circuit.addComponent(halfAdder);
  const ha2 = circuit.addComponent(halfAdder);
  const orC = circuit.addComponent(or);

  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: ha1, portId: haA.id });
  circuit.connect({ componentId: BOUNDARY_ID, portId: B.id }, { componentId: ha1, portId: haB.id });
  circuit.connect({ componentId: ha1, portId: haSum.id }, { componentId: ha2, portId: haA.id });
  circuit.connect({ componentId: BOUNDARY_ID, portId: Cin.id }, { componentId: ha2, portId: haB.id });
  circuit.connect({ componentId: ha2, portId: haSum.id }, { componentId: BOUNDARY_ID, portId: Sum.id });
  circuit.connect({ componentId: ha1, portId: haCarry.id }, { componentId: orC, portId: orA.id });
  circuit.connect({ componentId: ha2, portId: haCarry.id }, { componentId: orC, portId: orB.id });
  circuit.connect({ componentId: orC, portId: orY.id }, { componentId: BOUNDARY_ID, portId: Cout.id });

  return createGateDefinition({
    name: "FULL_ADDER",
    inputs: [A, B, Cin],
    outputs: [Sum, Cout],
    circuit: circuit.toDefinition(),
  });
}

/** A 2-bit ripple-carry adder: two FULL_ADDERs, the first's Cout feeding the second's Cin. */
function buildTwoBitAdderGate(registry: GateRegistry, fullAdder: GateDefinition): GateDefinition {
  const A0 = createPortDefinition("A0", "input");
  const B0 = createPortDefinition("B0", "input");
  const A1 = createPortDefinition("A1", "input");
  const B1 = createPortDefinition("B1", "input");
  const Cin = createPortDefinition("Cin", "input");
  const Sum0 = createPortDefinition("Sum0", "output");
  const Sum1 = createPortDefinition("Sum1", "output");
  const Cout = createPortDefinition("Cout", "output");
  const circuit = new Circuit({ registry, inputs: [A0, B0, A1, B1, Cin], outputs: [Sum0, Sum1, Cout] });

  const [faA, faB, faCin] = fullAdder.inputs;
  const [faSum, faCout] = fullAdder.outputs;

  const fa1 = circuit.addComponent(fullAdder);
  const fa2 = circuit.addComponent(fullAdder);

  circuit.connect({ componentId: BOUNDARY_ID, portId: A0.id }, { componentId: fa1, portId: faA.id });
  circuit.connect({ componentId: BOUNDARY_ID, portId: B0.id }, { componentId: fa1, portId: faB.id });
  circuit.connect({ componentId: BOUNDARY_ID, portId: Cin.id }, { componentId: fa1, portId: faCin.id });
  circuit.connect({ componentId: fa1, portId: faSum.id }, { componentId: BOUNDARY_ID, portId: Sum0.id });

  circuit.connect({ componentId: BOUNDARY_ID, portId: A1.id }, { componentId: fa2, portId: faA.id });
  circuit.connect({ componentId: BOUNDARY_ID, portId: B1.id }, { componentId: fa2, portId: faB.id });
  circuit.connect({ componentId: fa1, portId: faCout.id }, { componentId: fa2, portId: faCin.id });
  circuit.connect({ componentId: fa2, portId: faSum.id }, { componentId: BOUNDARY_ID, portId: Sum1.id });
  circuit.connect({ componentId: fa2, portId: faCout.id }, { componentId: BOUNDARY_ID, portId: Cout.id });

  return createGateDefinition({
    name: "ADDER2",
    inputs: [A0, B0, A1, B1, Cin],
    outputs: [Sum0, Sum1, Cout],
    circuit: circuit.toDefinition(),
  });
}

function buildFullAdderStack(registry: GateRegistry = createDefaultRegistry()) {
  const not = buildNotGate(registry);
  const and = buildAndGate(registry);
  const xor = buildXorGate(registry);
  const or = buildOrGate(registry, not);
  const halfAdder = buildHalfAdderGate(registry, xor, and);
  const fullAdder = buildFullAdderGate(registry, halfAdder, or);
  return { not, and, xor, or, halfAdder, fullAdder };
}

/** [A, B, Cin, expected Sum, expected Cout] */
const TRUTH_TABLE: [boolean, boolean, boolean, boolean, boolean][] = [
  [false, false, false, false, false],
  [false, false, true, true, false],
  [false, true, false, true, false],
  [false, true, true, false, true],
  [true, false, false, true, false],
  [true, false, true, false, true],
  [true, true, false, false, true],
  [true, true, true, true, true],
];

describe("Full adder end-to-end", () => {
  it("evaluates the full truth table through the registry", () => {
    const registry = createDefaultRegistry();
    const { fullAdder } = buildFullAdderStack(registry);
    const [a, b, cin] = fullAdder.inputs;
    const [sum, cout] = fullAdder.outputs;

    for (const [av, bv, cinv, expectedSum, expectedCout] of TRUTH_TABLE) {
      const result = evaluateGate(fullAdder, registry, { [a.id]: av, [b.id]: bv, [cin.id]: cinv });
      expect(result[sum.id]).toBe(expectedSum);
      expect(result[cout.id]).toBe(expectedCout);
    }
  });

  it("works as a component nested inside a 2-bit ripple-carry adder", () => {
    const registry = createDefaultRegistry();
    const { fullAdder } = buildFullAdderStack(registry);
    const adder2 = buildTwoBitAdderGate(registry, fullAdder);
    const [a0, b0, a1, b1, cin] = adder2.inputs;
    const [sum0, sum1, cout] = adder2.outputs;

    // 1 (01) + 1 (01) + 0 = 2 (010)
    const oneplusone = evaluateGate(adder2, registry, {
      [a0.id]: true,
      [b0.id]: true,
      [a1.id]: false,
      [b1.id]: false,
      [cin.id]: false,
    });
    expect(oneplusone[sum0.id]).toBe(false);
    expect(oneplusone[sum1.id]).toBe(true);
    expect(oneplusone[cout.id]).toBe(false);

    // 3 (11) + 1 (01) + 1 = 5 (101)
    const threeplusonepluscarry = evaluateGate(adder2, registry, {
      [a0.id]: true,
      [b0.id]: true,
      [a1.id]: true,
      [b1.id]: false,
      [cin.id]: true,
    });
    expect(threeplusonepluscarry[sum0.id]).toBe(true);
    expect(threeplusonepluscarry[sum1.id]).toBe(false);
    expect(threeplusonepluscarry[cout.id]).toBe(true);
  });

  it("survives a serialize/deserialize round-trip as a full gate library", () => {
    const registry = createDefaultRegistry();
    const { not, and, xor, or, halfAdder, fullAdder } = buildFullAdderStack(registry);

    // SPEC.md §8: serialization captures one gate at a time, not its
    // dependency tree — restoring FULL_ADDER for real requires separately
    // saving and re-registering every custom gate it (transitively) uses.
    const dependencies = [not, and, xor, or, halfAdder];
    const savedDependencies = dependencies.map((gate) => JSON.parse(JSON.stringify(serializeGateDefinition(gate))));
    const savedFullAdder = JSON.parse(JSON.stringify(serializeGateDefinition(fullAdder)));

    const freshRegistry = createDefaultRegistry();
    for (const saved of savedDependencies) {
      freshRegistry.registerGate(deserializeGateDefinition(saved));
    }
    const restoredFullAdder = deserializeGateDefinition(savedFullAdder);

    const [a, b, cin] = restoredFullAdder.inputs;
    const [sum, cout] = restoredFullAdder.outputs;

    for (const [av, bv, cinv, expectedSum, expectedCout] of TRUTH_TABLE) {
      const result = evaluateGate(restoredFullAdder, freshRegistry, { [a.id]: av, [b.id]: bv, [cin.id]: cinv });
      expect(result[sum.id]).toBe(expectedSum);
      expect(result[cout.id]).toBe(expectedCout);
    }
  });
});
