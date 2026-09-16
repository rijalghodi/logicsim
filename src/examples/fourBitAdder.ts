import { BOUNDARY_ID, Circuit, createDefaultRegistry, createPortDefinition } from "@/core";
import type { ChipDefinition, ChipRegistry, PortDefinition, PortRef } from "@/core";
import type { Layout } from "@/components/circuit/geometry";
import type { ExampleDefinition } from "./types";
import {
  buildAndChip,
  buildFullAdderChip,
  buildHalfAdderChip,
  buildNotChip,
  buildOrChip,
  buildXorChip,
  toSavedChip,
} from "./gates";

const BIT_WIDTH = 4;

/** The example's own root circuit: four FULL ADDER instances chained ripple-carry style —
 * each stage's Cout feeds the next stage's Cin, just like buildTwoBitAdderChip in
 * src/core/test/fullAdder.e2e.test.ts, extended from 2 bits to 4. */
function buildRootCircuit(registry: ChipRegistry, fullAdder: ChipDefinition) {
  const A: PortDefinition[] = [];
  const B: PortDefinition[] = [];
  const Sum: PortDefinition[] = [];
  for (let i = 0; i < BIT_WIDTH; i++) {
    A.push(createPortDefinition(`A${i}`, "input"));
    B.push(createPortDefinition(`B${i}`, "input"));
    Sum.push(createPortDefinition(`Sum${i}`, "output"));
  }
  const Cin = createPortDefinition("Cin", "input");
  const Cout = createPortDefinition("Cout", "output");

  const circuit = new Circuit({ registry, inputs: [...A, ...B, Cin], outputs: [...Sum, Cout] });

  const [faA, faB, faCin] = fullAdder.inputs;
  const [faSum, faCout] = fullAdder.outputs;

  const layout: Layout = {};
  // The very first stage's carry-in is the boundary's own Cin; each later stage's carry-in
  // is the previous stage's Cout — both are valid PortRef sources for circuit.connect.
  let carryIn: PortRef = { componentId: BOUNDARY_ID, portId: Cin.id };

  for (let i = 0; i < BIT_WIDTH; i++) {
    const fa = circuit.addComponent(fullAdder);
    layout[fa] = { x: 240 + i * 220, y: 140 };

    circuit.connect({ componentId: BOUNDARY_ID, portId: A[i].id }, { componentId: fa, portId: faA.id });
    circuit.connect({ componentId: BOUNDARY_ID, portId: B[i].id }, { componentId: fa, portId: faB.id });
    circuit.connect(carryIn, { componentId: fa, portId: faCin.id });
    circuit.connect({ componentId: fa, portId: faSum.id }, { componentId: BOUNDARY_ID, portId: Sum[i].id });

    carryIn = { componentId: fa, portId: faCout.id };
  }

  circuit.connect(carryIn, { componentId: BOUNDARY_ID, portId: Cout.id });

  return {
    circuit: circuit.toDefinition(),
    boundary: { inputs: [...A, ...B, Cin], outputs: [...Sum, Cout] },
    layout,
  };
}

function buildFourBitAdderExample(): ExampleDefinition {
  const registry = createDefaultRegistry();

  const not = buildNotChip(registry);
  const and = buildAndChip(registry);
  const xor = buildXorChip(registry);
  const or = buildOrChip(registry, not.chip);
  const halfAdder = buildHalfAdderChip(registry, xor.chip, and.chip);
  const fullAdder = buildFullAdderChip(registry, halfAdder.chip, or.chip);
  const root = buildRootCircuit(registry, fullAdder.chip);

  return {
    id: "four-bit-adder",
    name: "4-Bit Adder",
    registry,
    rootCircuit: root.circuit,
    rootBoundary: root.boundary,
    rootLayout: root.layout,
    chips: [
      toSavedChip(not.chip, "#6b5b95", not.layout),
      toSavedChip(and.chip, "#4a6920", and.layout),
      toSavedChip(xor.chip, "#2f6690", xor.layout),
      toSavedChip(or.chip, "#8a5a44", or.layout),
      toSavedChip(halfAdder.chip, "#a8763e", halfAdder.layout),
      toSavedChip(fullAdder.chip, "#b23a48", fullAdder.layout),
    ],
  };
}

export const FOUR_BIT_ADDER_EXAMPLE: ExampleDefinition = buildFourBitAdderExample();
