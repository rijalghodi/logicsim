import { describe, expect, it } from "bun:test";
import { Circuit } from "../circuit/Circuit";
import { BOUNDARY_ID } from "../circuit/Connection";
import { createDefaultRegistry } from "../chip/createDefaultRegistry";
import { createChipDefinition } from "../chip/createChipDefinition";
import { createPortDefinition } from "../chip/PortDefinition";
import { evaluateChip } from "../simulation/evaluateCircuit";
import { deserializeChipDefinition } from "./deserializeChipDefinition";
import { serializeChipDefinition } from "./serializeChipDefinition";

function buildAndChip() {
  const registry = createDefaultRegistry();
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

  return { registry, chip: createChipDefinition({ name: "AND", inputs, outputs, circuit: circuit.toDefinition() }) };
}

describe("chip definition serialization", () => {
  it("round-trips through JSON and stays behaviorally equivalent", () => {
    const { registry, chip } = buildAndChip();

    const json = JSON.stringify(serializeChipDefinition(chip));
    const restored = deserializeChipDefinition(JSON.parse(json));

    expect(restored).toEqual(chip);

    const [a, b] = restored.inputs;
    const [y] = restored.outputs;
    expect(evaluateChip(restored, registry, { [a.id]: true, [b.id]: true })[y.id]).toBe(true);
    expect(evaluateChip(restored, registry, { [a.id]: true, [b.id]: false })[y.id]).toBe(false);
  });

  it("rejects an unsupported schema version", () => {
    expect(() => deserializeChipDefinition({ version: 99 })).toThrow();
  });

  it("rejects malformed data", () => {
    expect(() => deserializeChipDefinition({ version: 1, id: "x" })).toThrow();
  });
});
