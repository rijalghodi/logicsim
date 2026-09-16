import { BOUNDARY_ID, Circuit, createDefaultRegistry, createPortDefinition } from "@/core";
import type { ChipDefinition, ChipRegistry, PortDefinition } from "@/core";
import type { Layout } from "@/components/circuit/geometry";
import type { ExampleDefinition } from "./types";
import { buildAndChip, buildNorChip, buildNotChip, buildOrChip, buildXnorChip, buildXorChip, toSavedChip } from "./gates";

interface BasicGates {
  readonly and: ChipDefinition;
  readonly not: ChipDefinition;
  readonly or: ChipDefinition;
  readonly xor: ChipDefinition;
  readonly nor: ChipDefinition;
  readonly xnor: ChipDefinition;
}

/** The example's own root circuit: every two-input gate shares the same A/B boundary inputs
 * (NOT just takes A), so toggling A/B once shows how all six basic gates respond side by side —
 * each output port is named after the gate feeding it, for an at-a-glance comparison chart. */
function buildRootCircuit(registry: ChipRegistry, gates: BasicGates) {
  const A = createPortDefinition("A", "input");
  const B = createPortDefinition("B", "input");
  const AndOut = createPortDefinition("AND", "output");
  const NotOut = createPortDefinition("NOT", "output");
  const OrOut = createPortDefinition("OR", "output");
  const XorOut = createPortDefinition("XOR", "output");
  const NorOut = createPortDefinition("NOR", "output");
  const XnorOut = createPortDefinition("XNOR", "output");
  const outputs = [AndOut, NotOut, OrOut, XorOut, NorOut, XnorOut];

  const circuit = new Circuit({ registry, inputs: [A, B], outputs });
  const layout: Layout = {};

  const wireTwoInputGate = (gate: ChipDefinition, outPort: PortDefinition, y: number) => {
    const [gateA, gateB] = gate.inputs;
    const [gateY] = gate.outputs;
    const c = circuit.addComponent(gate);
    layout[c] = { x: 380, y };
    circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: c, portId: gateA.id });
    circuit.connect({ componentId: BOUNDARY_ID, portId: B.id }, { componentId: c, portId: gateB.id });
    circuit.connect({ componentId: c, portId: gateY.id }, { componentId: BOUNDARY_ID, portId: outPort.id });
  };

  wireTwoInputGate(gates.and, AndOut, 60);

  // NOT only takes one input, so it's wired to A alone rather than through wireTwoInputGate.
  const notC = circuit.addComponent(gates.not);
  layout[notC] = { x: 380, y: 160 };
  const [notIn] = gates.not.inputs;
  const [notY] = gates.not.outputs;
  circuit.connect({ componentId: BOUNDARY_ID, portId: A.id }, { componentId: notC, portId: notIn.id });
  circuit.connect({ componentId: notC, portId: notY.id }, { componentId: BOUNDARY_ID, portId: NotOut.id });

  wireTwoInputGate(gates.or, OrOut, 260);
  wireTwoInputGate(gates.xor, XorOut, 360);
  wireTwoInputGate(gates.nor, NorOut, 460);
  wireTwoInputGate(gates.xnor, XnorOut, 560);

  return {
    circuit: circuit.toDefinition(),
    boundary: { inputs: [A, B], outputs },
    layout,
  };
}

function buildBasicChipsExample(): ExampleDefinition {
  const registry = createDefaultRegistry();

  const not = buildNotChip(registry);
  const and = buildAndChip(registry);
  const or = buildOrChip(registry, not.chip);
  const xor = buildXorChip(registry);
  const nor = buildNorChip(registry, or.chip, not.chip);
  const xnor = buildXnorChip(registry, xor.chip, not.chip);

  const root = buildRootCircuit(registry, {
    and: and.chip,
    not: not.chip,
    or: or.chip,
    xor: xor.chip,
    nor: nor.chip,
    xnor: xnor.chip,
  });

  return {
    id: "basic-chips",
    name: "Basic Chips",
    registry,
    rootCircuit: root.circuit,
    rootBoundary: root.boundary,
    rootLayout: root.layout,
    chips: [
      toSavedChip(not.chip, "#6b5b95", not.layout),
      toSavedChip(and.chip, "#4a6920", and.layout),
      toSavedChip(or.chip, "#8a5a44", or.layout),
      toSavedChip(xor.chip, "#2f6690", xor.layout),
      toSavedChip(nor.chip, "#7a3b69", nor.layout),
      toSavedChip(xnor.chip, "#c9820c", xnor.layout),
    ],
  };
}

export const BASIC_CHIPS_EXAMPLE: ExampleDefinition = buildBasicChipsExample();
