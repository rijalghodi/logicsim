import { describe, expect, it } from "bun:test";
import { Circuit } from "../circuit/Circuit";
import { BOUNDARY_ID } from "../circuit/Connection";
import type { GateRegistry } from "./GateRegistry";
import { createDefaultRegistry } from "./createDefaultRegistry";
import { createGateDefinition } from "./createGateDefinition";
import type { GateDefinition } from "./GateDefinition";
import { createPortDefinition } from "./PortDefinition";
import { evaluateGate } from "../simulation/evaluateCircuit";

/** AND(A, B) = NAND(NAND(A, B), NAND(A, B)), the textbook two-NAND AND gate. */
function buildAndGate(registry: GateRegistry): GateDefinition {
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

  return createGateDefinition({ name: "AND", inputs, outputs, circuit: circuit.toDefinition() });
}

describe("custom gate composition", () => {
  it("builds an AND gate from NAND primitives with the full truth table", () => {
    const registry = createDefaultRegistry();
    const and = buildAndGate(registry);
    const [a, b] = and.inputs;
    const [y] = and.outputs;

    const cases: [boolean, boolean, boolean][] = [
      [false, false, false],
      [false, true, false],
      [true, false, false],
      [true, true, true],
    ];

    for (const [av, bv, expected] of cases) {
      expect(evaluateGate(and, registry, { [a.id]: av, [b.id]: bv })[y.id]).toBe(expected);
    }
  });

  it("allows a custom gate to be used as a component inside another custom gate", () => {
    const registry = createDefaultRegistry();
    const and = buildAndGate(registry);

    // AND3(A, B, C) = AND(AND(A, B), C) — nests the AND gate inside a new gate.
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

    const and3 = createGateDefinition({ name: "AND3", inputs, outputs, circuit: circuit.toDefinition() });
    const [a, b, c] = and3.inputs;
    const [y] = and3.outputs;

    expect(evaluateGate(and3, registry, { [a.id]: true, [b.id]: true, [c.id]: true })[y.id]).toBe(true);
    expect(evaluateGate(and3, registry, { [a.id]: true, [b.id]: true, [c.id]: false })[y.id]).toBe(false);
    expect(evaluateGate(and3, registry, { [a.id]: false, [b.id]: true, [c.id]: true })[y.id]).toBe(false);
  });
});
