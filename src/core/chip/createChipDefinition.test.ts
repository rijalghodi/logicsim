import { describe, expect, it } from "bun:test";
import { Circuit } from "../circuit/Circuit";
import { BOUNDARY_ID } from "../circuit/Connection";
import type { ChipRegistry } from "./ChipRegistry";
import { createDefaultRegistry } from "./createDefaultRegistry";
import { createChipDefinition } from "./createChipDefinition";
import type { ChipDefinition } from "./ChipDefinition";
import { createPortDefinition } from "./PortDefinition";
import { evaluateChip } from "../simulation/evaluateCircuit";

/** AND(A, B) = NAND(NAND(A, B), NAND(A, B)), the textbook two-NAND AND chip. */
function buildAndChip(registry: ChipRegistry): ChipDefinition {
  const inputs = [createPortDefinition("A", "input"), createPortDefinition("B", "input")];
  const outputs = [createPortDefinition("Y", "output")];
  const circuit = new Circuit({ registry, inputs, outputs });

  const nand1 = circuit.addComponent("NAND");
  const nand2 = circuit.addComponent("NAND");

  circuit.connect({ componentId: BOUNDARY_ID, portId: inputs[0].id }, { componentId: nand1, portId: "A" });
  circuit.connect({ componentId: BOUNDARY_ID, portId: inputs[1].id }, { componentId: nand1, portId: "B" });
  circuit.connect({ componentId: nand1, portId: "Y" }, { componentId: nand2, portId: "A" });
  circuit.connect({ componentId: nand1, portId: "Y" }, { componentId: nand2, portId: "B" });
  circuit.connect({ componentId: nand2, portId: "Y" }, { componentId: BOUNDARY_ID, portId: outputs[0].id });

  return createChipDefinition({ name: "AND", inputs, outputs, circuit: circuit.toDefinition() });
}

describe("custom chip composition", () => {
  it("builds an AND chip from NAND primitives with the full truth table", () => {
    const registry = createDefaultRegistry();
    const and = buildAndChip(registry);
    const [a, b] = and.inputs;
    const [y] = and.outputs;

    const cases: [boolean, boolean, boolean][] = [
      [false, false, false],
      [false, true, false],
      [true, false, false],
      [true, true, true],
    ];

    for (const [av, bv, expected] of cases) {
      expect(evaluateChip(and, registry, { [a.id]: av, [b.id]: bv })[y.id]).toBe(expected);
    }
  });

  it("allows a custom chip to be used as a component inside another custom chip", () => {
    const registry = createDefaultRegistry();
    const and = buildAndChip(registry);

    // AND3(A, B, C) = AND(AND(A, B), C) — nests the AND chip inside a new chip.
    const inputs = [
      createPortDefinition("A", "input"),
      createPortDefinition("B", "input"),
      createPortDefinition("C", "input"),
    ];
    const outputs = [createPortDefinition("Y", "output")];
    const circuit = new Circuit({ registry, inputs, outputs });

    const and1 = circuit.addComponent(and);
    const and2 = circuit.addComponent(and);

    circuit.connect(
      { componentId: BOUNDARY_ID, portId: inputs[0].id },
      { componentId: and1, portId: and.inputs[0].id },
    );
    circuit.connect(
      { componentId: BOUNDARY_ID, portId: inputs[1].id },
      { componentId: and1, portId: and.inputs[1].id },
    );
    circuit.connect({ componentId: and1, portId: and.outputs[0].id }, { componentId: and2, portId: and.inputs[0].id });
    circuit.connect(
      { componentId: BOUNDARY_ID, portId: inputs[2].id },
      { componentId: and2, portId: and.inputs[1].id },
    );
    circuit.connect(
      { componentId: and2, portId: and.outputs[0].id },
      { componentId: BOUNDARY_ID, portId: outputs[0].id },
    );

    const and3 = createChipDefinition({ name: "AND3", inputs, outputs, circuit: circuit.toDefinition() });
    const [a, b, c] = and3.inputs;
    const [y] = and3.outputs;

    expect(evaluateChip(and3, registry, { [a.id]: true, [b.id]: true, [c.id]: true })[y.id]).toBe(true);
    expect(evaluateChip(and3, registry, { [a.id]: true, [b.id]: true, [c.id]: false })[y.id]).toBe(false);
    expect(evaluateChip(and3, registry, { [a.id]: false, [b.id]: true, [c.id]: true })[y.id]).toBe(false);
  });
});
