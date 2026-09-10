import { deserializeChipDefinition, serializeChipDefinition } from "../core";
import type { ChipDefinition, ChipRegistry, SerializedChipDefinitionV1 } from "../core";

const STORAGE_KEY = "logicsim_custom_chips";

/**
 * Loads all user-created chip definitions from localStorage, deserializes
 * and validates their schema, and registers each one into the given ChipRegistry.
 */
export function loadSavedChips(registry: ChipRegistry): ChipDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const chips: ChipDefinition[] = [];
    for (const item of parsed) {
      try {
        const chip = deserializeChipDefinition(item);
        if (!registry.hasChip(chip.id)) {
          registry.registerChip(chip);
        }
        chips.push(chip);
      } catch (err) {
        console.warn("Failed to deserialize saved chip:", err);
      }
    }
    return chips;
  } catch (err) {
    console.warn("Failed to load chips from localStorage:", err);
    return [];
  }
}

/**
 * Serializes and stores a new or updated ChipDefinition in localStorage,
 * and ensures it is registered in the ChipRegistry.
 */
export function saveCustomChip(chip: ChipDefinition, registry: ChipRegistry): void {
  try {
    if (!registry.hasChip(chip.id)) {
      registry.registerChip(chip);
    }

    const existingChips = loadSavedChips(registry);
    const serialized = serializeChipDefinition(chip);

    const filtered = existingChips.filter((g) => g.id !== chip.id);
    const updated: SerializedChipDefinitionV1[] = [...filtered.map(serializeChipDefinition), serialized];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save chip to localStorage:", err);
  }
}

/**
 * Deletes a custom chip from localStorage.
 */
export function deleteCustomChip(chipId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    const updated = parsed.filter((item: { id?: string }) => item.id !== chipId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to delete chip from localStorage:", err);
  }
}
