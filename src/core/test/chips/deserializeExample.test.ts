import { describe, expect, it } from "bun:test";
import { createDefaultRegistry, deserializeChipDefinition, evaluateChip } from "../../index";
import * as fs from "fs";

describe("Deserialization Example", () => {
  it("loads a custom AND chip from JSON and evaluates its truth table", () => {
    // 1. Read the JSON string from the file system
    const jsonString = fs.readFileSync(__dirname + "/andChip.json", "utf-8");

    // 2. Parse it into a raw JavaScript object
    const rawData = JSON.parse(jsonString);

    // 3. Deserialize into a ChipDefinition (this validates the structure against the schema)
    const andChip = deserializeChipDefinition(rawData);

    // 4. Create a new registry and register the loaded chip
    const registry = createDefaultRegistry();
    registry.registerChip(andChip);

    // 5. Evaluate the loaded chip
    const [a, b] = andChip.inputs;
    const [y] = andChip.outputs;

    // Test case: true AND true = true
    const resultTrueTrue = evaluateChip(andChip, registry, {
      [a.id]: true,
      [b.id]: true,
    });
    expect(resultTrueTrue[y.id]).toBe(true);

    // Test case: true AND false = false
    const resultTrueFalse = evaluateChip(andChip, registry, {
      [a.id]: true,
      [b.id]: false,
    });
    expect(resultTrueFalse[y.id]).toBe(false);

    // Test case: false AND false = false
    const resultFalseFalse = evaluateChip(andChip, registry, {
      [a.id]: false,
      [b.id]: false,
    });
    expect(resultFalseFalse[y.id]).toBe(false);
  });
});
