import { deserializeChipDefinition, serializeChipDefinition } from "../core";
import type { ChipDefinition, ChipRegistry } from "../core";
import type { Layout } from "../components/circuit/geometry";
import { CHIP_FILL } from "../components/circuit/colors";

export interface SavedChip extends ChipDefinition {
  readonly color: string;
  readonly layout: Layout;
  readonly boundaryLayout: Record<string, number>;
}

const STORAGE_KEY = "logicsim_custom_chips";

/**
 * Loads all user-created chip definitions from localStorage, deserializes
 * and validates their schema, and registers each one into the given ChipRegistry.
 * Returns the fully hydrated SavedChip which includes UI layout metadata.
 */
export function loadSavedChips(registry: ChipRegistry): SavedChip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const chips: SavedChip[] = [];
    for (const item of parsed) {
      try {
        const coreItem = item.ui ? item.core : item;
        const chip = deserializeChipDefinition(coreItem);
        if (!registry.hasChip(chip.id)) {
          registry.registerChip(chip);
        }
        
        chips.push({
          ...chip,
          color: item.ui?.color ?? CHIP_FILL,
          layout: item.ui?.layout ?? {},
          boundaryLayout: item.ui?.boundaryLayout ?? {},
        });
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
 * Serializes and stores a new or updated ChipDefinition with UI metadata
 * in localStorage, and ensures it is registered in the ChipRegistry.
 */
export function saveCustomChip(savedChip: SavedChip, registry: ChipRegistry): void {
  try {
    if (!registry.hasChip(savedChip.id)) {
      registry.registerChip(savedChip);
    }

    const existingChips = loadSavedChips(registry);
    
    // Core definition serialization
    const serializedCore = serializeChipDefinition(savedChip);

    const filtered = existingChips.filter((g) => g.id !== savedChip.id);
    
    const serializeFull = (chip: SavedChip) => ({
      core: serializeChipDefinition(chip),
      ui: {
        color: chip.color,
        layout: chip.layout,
        boundaryLayout: chip.boundaryLayout
      }
    });

    const updated = [...filtered.map(serializeFull), {
      core: serializedCore,
      ui: {
        color: savedChip.color,
        layout: savedChip.layout,
        boundaryLayout: savedChip.boundaryLayout
      }
    }];

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
