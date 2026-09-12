import { BOUNDARY_ID, Circuit, createDefaultRegistry, createPortDefinition } from "@/core";
import type { CircuitDefinition, ChipRegistry, PortDefinition } from "@/core";
import type { Layout } from "./geometry";

export interface DemoCircuit {
  readonly registry: ChipRegistry;
  readonly definition: CircuitDefinition;
  readonly boundary: { readonly inputs: PortDefinition[]; readonly outputs: PortDefinition[] };
  readonly layout: Layout;
}

/**
 * AND(A, B) = NAND(NAND(A, B), NAND(A, B)) — the textbook two-NAND AND
 * chip, wired flat (not wrapped as a ChipDefinition) so it can be viewed
 * and edited directly as a "root" circuit. See SPEC.md §4 for the
 * boundary wiring and `e2e/andChip.e2e.test.ts` for the same circuit
 * proven correct.
 */
export function createDemoCircuit(): DemoCircuit {
  const registry = createDefaultRegistry();
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

  return {
    registry,
    definition: circuit.toDefinition(),
    boundary: { inputs: [A, B], outputs: [Y] },
    layout: {
      [nand1]: { x: 280, y: 140 },
      [nand2]: { x: 520, y: 200 },
    },
  };
}
