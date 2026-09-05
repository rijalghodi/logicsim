import { describe, expect, it } from "bun:test";
import { Circuit } from "./Circuit";
import { ConnectionValidationError } from "../errors";

describe("Circuit", () => {
  it("evaluates a chain of NAND components", () => {
    const circuit = new Circuit();
    const nand1 = circuit.addComponent("NAND");
    const nand2 = circuit.addComponent("NAND");
    const nand3 = circuit.addComponent("NAND");

    circuit.connect({ componentId: nand1, portId: "Y" }, { componentId: nand2, portId: "A" });
    circuit.connect({ componentId: nand1, portId: "Y" }, { componentId: nand2, portId: "B" });
    circuit.connect({ componentId: nand2, portId: "Y" }, { componentId: nand3, portId: "A" });
    circuit.connect({ componentId: nand2, portId: "Y" }, { componentId: nand3, portId: "B" });

    // nand1 = NAND(true,true) = false ; nand2 = NAND(false,false) = true ; nand3 = NAND(true,true) = false
    const result = circuit.evaluate({ componentInputOverrides: { [nand1]: { A: true, B: true } } });

    expect(result.componentOutputs[nand1].Y).toBe(false);
    expect(result.componentOutputs[nand2].Y).toBe(true);
    expect(result.componentOutputs[nand3].Y).toBe(false);
  });

  it("rejects an invalid connection instead of adding it", () => {
    const circuit = new Circuit();
    const nand1 = circuit.addComponent("NAND");
    const nand2 = circuit.addComponent("NAND");

    expect(() => circuit.connect({ componentId: nand1, portId: "A" }, { componentId: nand2, portId: "A" })).toThrow(
      ConnectionValidationError,
    );
    expect(circuit.toDefinition().connections).toEqual([]);
  });

  it("removeComponent also removes connections referencing it", () => {
    const circuit = new Circuit();
    const nand1 = circuit.addComponent("NAND");
    const nand2 = circuit.addComponent("NAND");
    circuit.connect({ componentId: nand1, portId: "Y" }, { componentId: nand2, portId: "A" });

    circuit.removeComponent(nand1);

    const definition = circuit.toDefinition();
    expect(definition.components.some((c) => c.id === nand1)).toBe(false);
    expect(definition.connections).toEqual([]);
  });
});
