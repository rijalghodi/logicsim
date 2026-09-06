import { describe, expect, it } from "bun:test";
import { createDefaultRegistry, deserializeGateDefinition, evaluateGate } from "../../index";
import * as fs from "fs";

describe("Deserialization Example", () => {
  it("loads a custom AND gate from JSON and evaluates its truth table", () => {
    // 1. Read the JSON string from the file system
    const jsonString = fs.readFileSync(__dirname + "/andGate.json", "utf-8");

    // 2. Parse it into a raw JavaScript object
    const rawData = JSON.parse(jsonString);

    // 3. Deserialize into a GateDefinition (this validates the structure against the schema)
    const andGate = deserializeGateDefinition(rawData);

    // 4. Create a new registry and register the loaded gate
    const registry = createDefaultRegistry();
    registry.registerGate(andGate);

    // 5. Evaluate the loaded gate
    const [a, b] = andGate.inputs;
    const [y] = andGate.outputs;

    // Test case: true AND true = true
    const resultTrueTrue = evaluateGate(andGate, registry, {
      [a.id]: true,
      [b.id]: true,
    });
    expect(resultTrueTrue[y.id]).toBe(true);

    // Test case: true AND false = false
    const resultTrueFalse = evaluateGate(andGate, registry, {
      [a.id]: true,
      [b.id]: false,
    });
    expect(resultTrueFalse[y.id]).toBe(false);

    // Test case: false AND false = false
    const resultFalseFalse = evaluateGate(andGate, registry, {
      [a.id]: false,
      [b.id]: false,
    });
    expect(resultFalseFalse[y.id]).toBe(false);
  });
});
