import { ChipRegistry } from "./ChipRegistry";
import { nandChip } from "../primitives/nand";

/** A fresh registry pre-loaded with the only built-in primitive, NAND. */
export function createDefaultRegistry(): ChipRegistry {
  const registry = new ChipRegistry();
  registry.registerPrimitive(nandChip);
  return registry;
}
