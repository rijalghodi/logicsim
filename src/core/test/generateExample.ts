import { createDefaultRegistry, serializeChipDefinition } from "../index";
import { buildAndChip } from "./chips";
import * as fs from "fs";

const registry = createDefaultRegistry();
const andChip = buildAndChip(registry);
const serialized = serializeChipDefinition(andChip);

fs.mkdirSync(__dirname + "/chips", { recursive: true });
await Bun.write(__dirname + "/chips/andChip.json", JSON.stringify(serialized, null, 2));
console.log("Successfully generated src/core/test/chips/andChip.json");
