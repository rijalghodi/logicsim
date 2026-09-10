import { beforeEach, describe, expect, it } from "bun:test";
import { createDefaultRegistry, createGateDefinition, createPortDefinition } from "../core";
import { deleteCustomGate, loadSavedGates, saveCustomGate } from "./gateStorage";

const store = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
};

// Polyfill localStorage for Node/Bun test environment
if (typeof globalThis.localStorage === "undefined") {
  (globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;
}

describe("gateStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads a custom gate round-trip", () => {
    const registry = createDefaultRegistry();
    const inA = createPortDefinition("A", "input");
    const outY = createPortDefinition("Y", "output");

    const gate = createGateDefinition({
      id: "CUSTOM_BUFFER",
      name: "BUFFER",
      inputs: [inA],
      outputs: [outY],
      circuit: { components: [], connections: [] },
    });

    saveCustomGate(gate, registry);

    const freshRegistry = createDefaultRegistry();
    const loaded = loadSavedGates(freshRegistry);

    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe("CUSTOM_BUFFER");
    expect(loaded[0].name).toBe("BUFFER");
    expect(freshRegistry.hasGate("CUSTOM_BUFFER")).toBe(true);
  });

  it("deletes a custom gate by id", () => {
    const registry = createDefaultRegistry();
    const inA = createPortDefinition("A", "input");
    const outY = createPortDefinition("Y", "output");

    const gate = createGateDefinition({
      id: "TO_DELETE",
      name: "DEL",
      inputs: [inA],
      outputs: [outY],
      circuit: { components: [], connections: [] },
    });

    saveCustomGate(gate, registry);
    expect(loadSavedGates(registry).length).toBe(1);

    deleteCustomGate("TO_DELETE");
    expect(loadSavedGates(registry).length).toBe(0);
  });
});
