import { GateRegistry } from "./GateRegistry";
import { nandGate } from "../primitives/nand";

/** A fresh registry pre-loaded with the only built-in primitive, NAND. */
export function createDefaultRegistry(): GateRegistry {
  const registry = new GateRegistry();
  registry.registerPrimitive(nandGate);
  return registry;
}
