import { beforeEach, describe, expect, it } from "bun:test";
import { createDefaultRegistry, createChipDefinition, createPortDefinition } from "../core";
import { deleteCustomChip, loadSavedChips, saveCustomChip } from "./chipStorage";

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

describe("chipStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads a custom chip round-trip", () => {
    const registry = createDefaultRegistry();
    const inA = createPortDefinition("A", "input");
    const outY = createPortDefinition("Y", "output");

    const chip = createChipDefinition({
      id: "CUSTOM_BUFFER",
      name: "BUFFER",
      inputs: [inA],
      outputs: [outY],
      circuit: { components: [], connections: [] },
    });

    saveCustomChip(chip, registry);

    const freshRegistry = createDefaultRegistry();
    const loaded = loadSavedChips(freshRegistry);

    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe("CUSTOM_BUFFER");
    expect(loaded[0].name).toBe("BUFFER");
    expect(freshRegistry.hasChip("CUSTOM_BUFFER")).toBe(true);
  });

  it("deletes a custom chip by id", () => {
    const registry = createDefaultRegistry();
    const inA = createPortDefinition("A", "input");
    const outY = createPortDefinition("Y", "output");

    const chip = createChipDefinition({
      id: "TO_DELETE",
      name: "DEL",
      inputs: [inA],
      outputs: [outY],
      circuit: { components: [], connections: [] },
    });

    saveCustomChip(chip, registry);
    expect(loadSavedChips(registry).length).toBe(1);

    deleteCustomChip("TO_DELETE");
    expect(loadSavedChips(registry).length).toBe(0);
  });
});
