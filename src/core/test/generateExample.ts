import { createDefaultRegistry, serializeGateDefinition } from "../index";
import { buildAndGate } from "./gates";
import * as fs from "fs";

const registry = createDefaultRegistry();
const andGate = buildAndGate(registry);
const serialized = serializeGateDefinition(andGate);

fs.mkdirSync(__dirname + "/gates", { recursive: true });
await Bun.write(__dirname + "/gates/andGate.json", JSON.stringify(serialized, null, 2));
console.log("Successfully generated src/core/test/gates/andGate.json");
