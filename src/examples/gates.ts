import { BOUNDARY_ID, Circuit, createChipDefinition, createPortDefinition } from "@/core";
import type { ChipDefinition, ChipRegistry } from "@/core";
import type { Layout } from "@/components/circuit/geometry";
import type { SavedChip } from "@/storage/chipStorage";

/**
 * A small library of chips built purely from NAND, shared across the bundled examples —
 * same textbook constructions as src/core/test/chips.ts, duplicated here since that module
 * lives under src/core/test and is excluded from the app build.
 */

export function toSavedChip(chip: ChipDefinition, color: string, layout: Layout): SavedChip {
  return { ...chip, color, layout, boundaryLayout: {}, portColors: {}, wireAnchors: {} };
}

export function buildNotChip(registry: ChipRegistry) {
  const A = createPortDefinition("A", "input");
  const Y = createPortDefinition("Y", "output");
  const circuit = new Circuit({ registry, inputs: [A], outputs: [Y] });

  const nand1 = circuit.addComponent("NAND");
  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: nand1, portId: "A" });
  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: nand1, portId: "B" });
  circuit.connect({ componentId: nand1, portId: "Y" }, { componentId: BOUNDARY_ID, portId: Y.id });

  const chip = createChipDefinition({ name: "NOT", inputs: [A], outputs: [Y], circuit: circuit.toDefinition() });
  const layout: Layout = { [nand1]: { x: 260, y: 140 } };
  return { chip, layout };
}

/** AND(A, B) = NAND(NAND(A, B), NAND(A, B)) — the textbook two-NAND AND chip. */
export function buildAndChip(registry: ChipRegistry) {
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

  const chip = createChipDefinition({ name: "AND", inputs: [A, B], outputs: [Y], circuit: circuit.toDefinition() });
  const layout: Layout = { [nand1]: { x: 220, y: 140 }, [nand2]: { x: 420, y: 140 } };
  return { chip, layout };
}

/** Standard 4-NAND XOR: NAND(NAND(A, NAND(A,B)), NAND(B, NAND(A,B))). */
export function buildXorChip(registry: ChipRegistry) {
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

  const chip = createChipDefinition({ name: "XOR", inputs: [A, B], outputs: [Y], circuit: circuit.toDefinition() });
  const layout: Layout = {
    [n1]: { x: 200, y: 140 },
    [n2]: { x: 380, y: 80 },
    [n3]: { x: 380, y: 200 },
    [n4]: { x: 560, y: 140 },
  };
  return { chip, layout };
}

/** OR(A, B) = NAND(NOT(A), NOT(B)) — De Morgan's, nesting the NOT chip as a component. */
export function buildOrChip(registry: ChipRegistry, not: ChipDefinition) {
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

  const chip = createChipDefinition({ name: "OR", inputs: [A, B], outputs: [Y], circuit: circuit.toDefinition() });
  const layout: Layout = { [notA]: { x: 200, y: 80 }, [notB]: { x: 200, y: 200 }, [nand1]: { x: 400, y: 140 } };
  return { chip, layout };
}

/** NOR(A, B) = NOT(OR(A, B)) — nests the OR and NOT chips as components. */
export function buildNorChip(registry: ChipRegistry, or: ChipDefinition, not: ChipDefinition) {
  const A = createPortDefinition("A", "input");
  const B = createPortDefinition("B", "input");
  const Y = createPortDefinition("Y", "output");
  const circuit = new Circuit({ registry, inputs: [A, B], outputs: [Y] });

  const [orA, orB] = or.inputs;
  const [orY] = or.outputs;
  const [notIn] = not.inputs;
  const [notY] = not.outputs;

  const orC = circuit.addComponent(or);
  const notC = circuit.addComponent(not);

  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: orC, portId: orA.id });
  circuit.connect({ componentId: BOUNDARY_ID, portId: B.id }, { componentId: orC, portId: orB.id });
  circuit.connect({ componentId: orC, portId: orY.id }, { componentId: notC, portId: notIn.id });
  circuit.connect({ componentId: notC, portId: notY.id }, { componentId: BOUNDARY_ID, portId: Y.id });

  const chip = createChipDefinition({ name: "NOR", inputs: [A, B], outputs: [Y], circuit: circuit.toDefinition() });
  const layout: Layout = { [orC]: { x: 240, y: 140 }, [notC]: { x: 460, y: 140 } };
  return { chip, layout };
}

/** XNOR(A, B) = NOT(XOR(A, B)) — nests the XOR and NOT chips as components. */
export function buildXnorChip(registry: ChipRegistry, xor: ChipDefinition, not: ChipDefinition) {
  const A = createPortDefinition("A", "input");
  const B = createPortDefinition("B", "input");
  const Y = createPortDefinition("Y", "output");
  const circuit = new Circuit({ registry, inputs: [A, B], outputs: [Y] });

  const [xorA, xorB] = xor.inputs;
  const [xorY] = xor.outputs;
  const [notIn] = not.inputs;
  const [notY] = not.outputs;

  const xorC = circuit.addComponent(xor);
  const notC = circuit.addComponent(not);

  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: xorC, portId: xorA.id });
  circuit.connect({ componentId: BOUNDARY_ID, portId: B.id }, { componentId: xorC, portId: xorB.id });
  circuit.connect({ componentId: xorC, portId: xorY.id }, { componentId: notC, portId: notIn.id });
  circuit.connect({ componentId: notC, portId: notY.id }, { componentId: BOUNDARY_ID, portId: Y.id });

  const chip = createChipDefinition({ name: "XNOR", inputs: [A, B], outputs: [Y], circuit: circuit.toDefinition() });
  const layout: Layout = { [xorC]: { x: 240, y: 140 }, [notC]: { x: 460, y: 140 } };
  return { chip, layout };
}

/** HalfAdder(A, B): Sum = XOR(A, B), Carry = AND(A, B). */
export function buildHalfAdderChip(registry: ChipRegistry, xor: ChipDefinition, and: ChipDefinition) {
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

  const chip = createChipDefinition({
    name: "HALF ADDER",
    inputs: [A, B],
    outputs: [Sum, Carry],
    circuit: circuit.toDefinition(),
  });
  const layout: Layout = { [xorC]: { x: 280, y: 80 }, [andC]: { x: 280, y: 220 } };
  return { chip, layout };
}

/** FullAdder(A, B, Cin): chains two half adders and ORs their carries — the textbook
 * "two half adders + an OR chip" full adder. */
export function buildFullAdderChip(registry: ChipRegistry, halfAdder: ChipDefinition, or: ChipDefinition) {
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

  const chip = createChipDefinition({
    name: "FULL ADDER",
    inputs: [A, B, Cin],
    outputs: [Sum, Cout],
    circuit: circuit.toDefinition(),
  });
  const layout: Layout = { [ha1]: { x: 220, y: 100 }, [ha2]: { x: 440, y: 200 }, [orC]: { x: 660, y: 140 } };
  return { chip, layout };
}
