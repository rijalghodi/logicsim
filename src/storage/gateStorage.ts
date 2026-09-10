import { deserializeGateDefinition, serializeGateDefinition } from "../core";
import type { GateDefinition, GateRegistry, SerializedGateDefinitionV1 } from "../core";

const STORAGE_KEY = "logicsim_custom_gates";

/**
 * Loads all user-created gate definitions from localStorage, deserializes
 * and validates their schema, and registers each one into the given GateRegistry.
 */
export function loadSavedGates(registry: GateRegistry): GateDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const gates: GateDefinition[] = [];
    for (const item of parsed) {
      try {
        const gate = deserializeGateDefinition(item);
        if (!registry.hasGate(gate.id)) {
          registry.registerGate(gate);
        }
        gates.push(gate);
      } catch (err) {
        console.warn("Failed to deserialize saved gate:", err);
      }
    }
    return gates;
  } catch (err) {
    console.warn("Failed to load gates from localStorage:", err);
    return [];
  }
}

/**
 * Serializes and stores a new or updated GateDefinition in localStorage,
 * and ensures it is registered in the GateRegistry.
 */
export function saveCustomGate(gate: GateDefinition, registry: GateRegistry): void {
  try {
    if (!registry.hasGate(gate.id)) {
      registry.registerGate(gate);
    }

    const existingGates = loadSavedGates(registry);
    const serialized = serializeGateDefinition(gate);

    const filtered = existingGates.filter((g) => g.id !== gate.id);
    const updated: SerializedGateDefinitionV1[] = [...filtered.map(serializeGateDefinition), serialized];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save chip to localStorage:", err);
  }
}

/**
 * Deletes a custom gate from localStorage.
 */
export function deleteCustomGate(gateId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    const updated = parsed.filter((item: { id?: string }) => item.id !== gateId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to delete gate from localStorage:", err);
  }
}
