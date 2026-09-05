import { describe, expect, it } from "bun:test";
import { createDefaultRegistry } from "../gate/createDefaultRegistry";
import type { CircuitDefinition } from "./Circuit";
import { validateConnection } from "./validateConnection";

describe("validateConnection", () => {
  const registry = createDefaultRegistry();
  const circuit: CircuitDefinition = {
    components: [
      { id: "n1", type: "NAND" },
      { id: "n2", type: "NAND" },
    ],
    connections: [],
  };

  it("accepts output -> input", () => {
    const issues = validateConnection({
      circuit,
      registry,
      connection: { from: { componentId: "n1", portId: "Y" }, to: { componentId: "n2", portId: "A" } },
    });
    expect(issues).toEqual([]);
  });

  it("rejects input -> input", () => {
    const issues = validateConnection({
      circuit,
      registry,
      connection: { from: { componentId: "n1", portId: "A" }, to: { componentId: "n2", portId: "A" } },
    });
    expect(issues.some((issue) => issue.code === "invalid-source")).toBe(true);
  });

  it("rejects output -> output", () => {
    const issues = validateConnection({
      circuit,
      registry,
      connection: { from: { componentId: "n1", portId: "Y" }, to: { componentId: "n2", portId: "Y" } },
    });
    expect(issues.some((issue) => issue.code === "invalid-destination")).toBe(true);
  });

  it("rejects a missing component", () => {
    const issues = validateConnection({
      circuit,
      registry,
      connection: { from: { componentId: "ghost", portId: "Y" }, to: { componentId: "n2", portId: "A" } },
    });
    expect(issues.some((issue) => issue.code === "missing-component")).toBe(true);
  });

  it("rejects a missing port", () => {
    const issues = validateConnection({
      circuit,
      registry,
      connection: { from: { componentId: "n1", portId: "Z" }, to: { componentId: "n2", portId: "A" } },
    });
    expect(issues.some((issue) => issue.code === "missing-port")).toBe(true);
  });

  it("rejects a second driver for an already-driven input", () => {
    const wired: CircuitDefinition = {
      components: circuit.components,
      connections: [{ from: { componentId: "n1", portId: "Y" }, to: { componentId: "n2", portId: "A" } }],
    };
    const issues = validateConnection({
      circuit: wired,
      registry,
      connection: { from: { componentId: "n1", portId: "Y" }, to: { componentId: "n2", portId: "A" } },
    });
    expect(issues.some((issue) => issue.code === "input-already-driven")).toBe(true);
  });
});
