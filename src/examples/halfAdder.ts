import { BOUNDARY_ID, Circuit, createChipDefinition, createDefaultRegistry, createPortDefinition } from "@/core";
import type { ChipDefinition, ChipRegistry } from "@/core";
import type { Layout } from "@/components/circuit/geometry";
import type { SavedChip } from "@/storage/chipStorage";
import type { ExampleDefinition } from "./types";

/**
 * Builds NOT, AND, XOR and HALF ADDER purely from NAND (the standard textbook constructions —
 * same pattern as src/core/test/chips.ts, kept separate since that module lives under
 * src/core/test and is excluded from the app build). The project's root circuit then places
 * one HALF ADDER instance wired straight to its own boundary, so copying the example gives you
 * both a working top-level circuit and three reusable chips already in your library.
 */

function toSavedChip(chip: ChipDefinition, color: string, layout: Layout): SavedChip {
  return { ...chip, color, layout, boundaryLayout: {}, portColors: {}, wireAnchors: {} };
}

function buildNotChip(registry: ChipRegistry) {
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
function buildAndChip(registry: ChipRegistry) {
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
function buildXorChip(registry: ChipRegistry) {
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

/** HalfAdder(A, B): Sum = XOR(A, B), Carry = AND(A, B). */
function buildHalfAdderChip(registry: ChipRegistry, xor: ChipDefinition, and: ChipDefinition) {
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

/** The example's own root circuit: one HALF ADDER instance wired straight to the boundary. */
function buildRootCircuit(registry: ChipRegistry, halfAdder: ChipDefinition) {
  const A = createPortDefinition("A", "input");
  const B = createPortDefinition("B", "input");
  const Sum = createPortDefinition("Sum", "output");
  const Carry = createPortDefinition("Carry", "output");
  const circuit = new Circuit({ registry, inputs: [A, B], outputs: [Sum, Carry] });

  const [haA, haB] = halfAdder.inputs;
  const [haSum, haCarry] = halfAdder.outputs;
  const ha = circuit.addComponent(halfAdder);

  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: ha, portId: haA.id });
  circuit.connect({ componentId: BOUNDARY_ID, portId: B.id }, { componentId: ha, portId: haB.id });
  circuit.connect({ componentId: ha, portId: haSum.id }, { componentId: BOUNDARY_ID, portId: Sum.id });
  circuit.connect({ componentId: ha, portId: haCarry.id }, { componentId: BOUNDARY_ID, portId: Carry.id });

  return {
    circuit: circuit.toDefinition(),
    boundary: { inputs: [A, B], outputs: [Sum, Carry] },
    layout: { [ha]: { x: 320, y: 140 } } as Layout,
  };
}

function buildHalfAdderExample(): ExampleDefinition {
  const registry = createDefaultRegistry();

  const not = buildNotChip(registry);
  const and = buildAndChip(registry);
  const xor = buildXorChip(registry);
  const halfAdder = buildHalfAdderChip(registry, xor.chip, and.chip);
  const root = buildRootCircuit(registry, halfAdder.chip);

  return {
    id: "half-adder",
    name: "Half Adder",
    registry,
    rootCircuit: root.circuit,
    rootBoundary: root.boundary,
    rootLayout: root.layout,
    chips: [
      toSavedChip(not.chip, "#6b5b95", not.layout),
      toSavedChip(and.chip, "#4a6920", and.layout),
      toSavedChip(xor.chip, "#2f6690", xor.layout),
      toSavedChip(halfAdder.chip, "#a8763e", halfAdder.layout),
    ],
  };
}

export const HALF_ADDER_EXAMPLE: ExampleDefinition = buildHalfAdderExample();
