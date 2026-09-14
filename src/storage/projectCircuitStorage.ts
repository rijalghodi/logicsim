import type { Bit, CircuitDefinition, PortDefinition } from "../core";
import type { Layout, Position } from "../components/circuit/geometry";
import { circuitStorageKey } from "./projectStorage";

/**
 * A project's root canvas state — everything App.tsx needs to restore the
 * exact view a user left, including which saved chip (if any) they had open
 * for editing. Distinct from a SavedChip: this is scratch/working state, not
 * a named entry in the chip library.
 */
export interface StoredProjectCircuit {
  readonly circuit: CircuitDefinition;
  readonly layout: Layout;
  readonly boundary: { inputs: PortDefinition[]; outputs: PortDefinition[] };
  readonly boundaryLayout: Record<string, number>;
  readonly portColors: Record<string, string | undefined>;
  readonly wireAnchors: Record<string, Position[]>;
  readonly boundaryInputs: Record<string, Bit>;
  readonly currentChipId: string | null;
}

export function loadProjectCircuit(projectId: string): StoredProjectCircuit | null {
  try {
    const raw = localStorage.getItem(circuitStorageKey(projectId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return {
      circuit: parsed.circuit ?? { components: [], connections: [] },
      layout: parsed.layout ?? {},
      boundary: parsed.boundary ?? { inputs: [], outputs: [] },
      boundaryLayout: parsed.boundaryLayout ?? {},
      portColors: parsed.portColors ?? {},
      wireAnchors: parsed.wireAnchors ?? {},
      boundaryInputs: parsed.boundaryInputs ?? {},
      currentChipId: parsed.currentChipId ?? null,
    };
  } catch (err) {
    console.warn("Failed to load project circuit from localStorage:", err);
    return null;
  }
}

export function saveProjectCircuit(projectId: string, state: StoredProjectCircuit): void {
  try {
    localStorage.setItem(circuitStorageKey(projectId), JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save project circuit to localStorage:", err);
  }
}
