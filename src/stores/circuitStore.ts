import { create } from "zustand";
import {
  createDefaultRegistry,
  createChipDefinition,
  createId,
  createPortDefinition,
  validateConnection,
  BOUNDARY_ID,
} from "@/core";
import type { Bit, CircuitDefinition, PortDefinition, PortRef, ChipRegistry } from "@/core";
import { loadSavedChips, saveCustomChip, deleteCustomChip } from "@/storage/chipStorage";
import type { SavedChip } from "@/storage/chipStorage";
import type { Layout, Position } from "@/components/circuit/geometry";
import { connectionKey } from "@/components/circuit/portResolution";
import { toast } from "@/stores/toastStore";

export interface ViewState {
  circuit: CircuitDefinition;
  layout: Layout;
  boundary: { inputs: PortDefinition[]; outputs: PortDefinition[] };
  boundaryLayout: Record<string, number>;
  portColors: Record<string, string | undefined>;
  wireAnchors: Record<string, Position[]>;
  boundaryInputs: Record<string, Bit>;
  isDirty: boolean;
  currentChipId: string | null;
}

interface CircuitState {
  registry: ChipRegistry;
  savedChips: SavedChip[];
  circuit: CircuitDefinition;
  layout: Layout;
  boundary: { inputs: PortDefinition[]; outputs: PortDefinition[] };
  boundaryLayout: Record<string, number>;
  portColors: Record<string, string | undefined>;
  /** Corner anchors for cornered wires, keyed by `connectionKey(from, to)`. */
  wireAnchors: Record<string, Position[]>;
  boundaryInputs: Record<string, Bit>;
  currentChipId: string | null;
  isDirty: boolean;
  viewStack: ViewState[];
}

interface CircuitActions {
  resetToBlank: () => void;
  loadChipToCanvas: (chipId: string) => void;
  executeBreadcrumbNavigation: (index: number) => void;
  diveIntoChip: (componentId: string) => void;
  toggleBoundaryInput: (portId: string) => void;
  moveComponent: (id: string, pos: Position) => void;
  moveBoundaryPort: (id: string, y: number) => void;
  dropChip: (chipType: string, pos: Position) => void;
  connectWire: (from: PortRef, to: PortRef, anchors?: Position[]) => void;
  disconnectWire: (from: PortRef, to: PortRef) => void;
  removeComponent: (id: string) => void;
  removeBoundaryPort: (id: string) => void;
  duplicateComponent: (id: string) => void;
  duplicateBoundaryPort: (portId: string) => void;
  customizeBoundaryPort: (portId: string, newName: string) => void;
  saveCurrentChip: (payload: { id?: string | null; name: string; color: string }) => void;
  deleteChips: (chipsToDelete: SavedChip[]) => void;
}

function createBlankCircuit() {
  const IN = createPortDefinition("IN", "input");
  const OUT = createPortDefinition("OUT", "output");
  return {
    circuit: { components: [], connections: [] } as CircuitDefinition,
    layout: {} as Layout,
    boundary: { inputs: [IN], outputs: [OUT] },
    boundaryLayout: {} as Record<string, number>,
    portColors: {} as Record<string, string>,
    wireAnchors: {} as Record<string, Position[]>,
  };
}

const defaultRegistry = createDefaultRegistry();
const initialSavedChips = loadSavedChips(defaultRegistry);
const initialBlank = createBlankCircuit();

export const useCircuitStore = create<CircuitState & CircuitActions>((set, get) => ({
  registry: defaultRegistry,
  savedChips: initialSavedChips,

  circuit: initialBlank.circuit,
  layout: initialBlank.layout,
  boundary: initialBlank.boundary,
  boundaryLayout: initialBlank.boundaryLayout,
  portColors: initialBlank.portColors,
  wireAnchors: initialBlank.wireAnchors,
  boundaryInputs: {},
  currentChipId: null,
  isDirty: false,
  viewStack: [],

  resetToBlank: () => {
    const blank = createBlankCircuit();
    set({
      circuit: blank.circuit,
      layout: blank.layout,
      boundary: blank.boundary,
      boundaryLayout: blank.boundaryLayout,
      portColors: blank.portColors,
      wireAnchors: blank.wireAnchors,
      boundaryInputs: {},
      currentChipId: null,
      isDirty: false,
      viewStack: [],
    });
  },

  loadChipToCanvas: (chipId: string) => {
    const { savedChips } = get();
    const chipDef = savedChips.find((g) => g.id === chipId);
    if (!chipDef) return;

    set({
      circuit: chipDef.circuit,
      boundary: { inputs: [...chipDef.inputs], outputs: [...chipDef.outputs] },
      layout: chipDef.layout || {},
      boundaryLayout: chipDef.boundaryLayout || {},
      portColors: chipDef.portColors || {},
      wireAnchors: chipDef.wireAnchors || {},
      currentChipId: chipDef.id,
      isDirty: false,
      viewStack: [],
    });
  },

  executeBreadcrumbNavigation: (index: number) => {
    if (index < 0) return;
    set((state) => {
      const targetState = state.viewStack[index];
      if (!targetState) return state;

      return {
        circuit: targetState.circuit,
        layout: targetState.layout,
        boundary: targetState.boundary,
        boundaryLayout: targetState.boundaryLayout,
        portColors: targetState.portColors,
        wireAnchors: targetState.wireAnchors,
        boundaryInputs: targetState.boundaryInputs,
        isDirty: targetState.isDirty,
        currentChipId: targetState.currentChipId,
        viewStack: state.viewStack.slice(0, index),
      };
    });
  },

  diveIntoChip: (componentId: string) => {
    const state = get();
    const component = state.circuit.components.find((c) => c.id === componentId);
    if (!component) return;

    const targetDef = state.savedChips.find((c) => c.id === component.type);
    if (!targetDef) {
      toast.error("Cannot dive into primitive chip.");
      return;
    }

    const currentViewState: ViewState = {
      circuit: state.circuit,
      layout: state.layout,
      boundary: state.boundary,
      boundaryLayout: state.boundaryLayout,
      portColors: state.portColors,
      wireAnchors: state.wireAnchors,
      boundaryInputs: state.boundaryInputs,
      isDirty: state.isDirty,
      currentChipId: state.currentChipId,
    };

    set((prev) => ({
      viewStack: [...prev.viewStack, currentViewState],
      circuit: targetDef.circuit,
      boundary: { inputs: [...targetDef.inputs], outputs: [...targetDef.outputs] },
      layout: targetDef.layout || {},
      boundaryLayout: targetDef.boundaryLayout || {},
      portColors: targetDef.portColors || {},
      wireAnchors: targetDef.wireAnchors || {},
      boundaryInputs: {},
      currentChipId: targetDef.id,
      isDirty: false,
    }));
  },

  toggleBoundaryInput: (portId: string) => {
    set((state) => ({
      boundaryInputs: { ...state.boundaryInputs, [portId]: !state.boundaryInputs[portId] },
    }));
  },

  moveComponent: (id: string, pos: Position) => {
    set((state) => ({
      layout: { ...state.layout, [id]: pos },
      isDirty: true,
    }));
  },

  moveBoundaryPort: (id: string, y: number) => {
    set((state) => ({
      boundaryLayout: { ...state.boundaryLayout, [id]: y },
      isDirty: true,
    }));
  },

  dropChip: (chipType: string, pos: Position) => {
    const state = get();

    if (chipType === "IN") {
      const name = state.boundary.inputs.length === 0 ? "IN" : `IN-${state.boundary.inputs.length}`;
      const port = createPortDefinition(name, "input");
      set({
        boundary: { ...state.boundary, inputs: [...state.boundary.inputs, port] },
        boundaryLayout: { ...state.boundaryLayout, [port.id]: pos.y },
        isDirty: true,
      });
      return;
    }

    if (chipType === "OUT") {
      const name = state.boundary.outputs.length === 0 ? "OUT" : `OUT-${state.boundary.outputs.length}`;
      const port = createPortDefinition(name, "output");
      set({
        boundary: { ...state.boundary, outputs: [...state.boundary.outputs, port] },
        boundaryLayout: { ...state.boundaryLayout, [port.id]: pos.y },
        isDirty: true,
      });
      return;
    }

    if (state.currentChipId && state.registry.dependsOn(chipType, state.currentChipId)) {
      toast.error("Cannot add chip: circular dependency detected");
      return;
    }

    const newId = createId("chip");
    set({
      circuit: {
        ...state.circuit,
        components: [...state.circuit.components, { id: newId, type: chipType }],
      },
      layout: {
        ...state.layout,
        [newId]: pos,
      },
      isDirty: true,
    });
  },

  connectWire: (from: PortRef, to: PortRef, anchors: Position[] = []) => {
    const state = get();
    const issues = validateConnection({
      circuit: state.circuit,
      registry: state.registry,
      connection: { from, to },
      boundary: state.boundary,
    });

    if (issues.length > 0) {
      toast.error(issues[0].message);
      return;
    }

    set({
      circuit: {
        ...state.circuit,
        connections: [...state.circuit.connections, { from, to }],
      },
      wireAnchors:
        anchors.length > 0 ? { ...state.wireAnchors, [connectionKey(from, to)]: anchors } : state.wireAnchors,
      isDirty: true,
    });
  },

  disconnectWire: (from: PortRef, to: PortRef) => {
    set((state) => {
      const nextWireAnchors = { ...state.wireAnchors };
      delete nextWireAnchors[connectionKey(from, to)];

      return {
        circuit: {
          ...state.circuit,
          connections: state.circuit.connections.filter(
            (c) =>
              !(
                c.from.componentId === from.componentId &&
                c.from.portId === from.portId &&
                c.to.componentId === to.componentId &&
                c.to.portId === to.portId
              ),
          ),
        },
        wireAnchors: nextWireAnchors,
        isDirty: true,
      };
    });
  },

  removeComponent: (id: string) => {
    set((state) => {
      const removed = state.circuit.connections.filter((c) => c.from.componentId === id || c.to.componentId === id);
      const nextWireAnchors = { ...state.wireAnchors };
      for (const c of removed) delete nextWireAnchors[connectionKey(c.from, c.to)];

      return {
        circuit: {
          ...state.circuit,
          components: state.circuit.components.filter((c) => c.id !== id),
          connections: state.circuit.connections.filter((c) => c.from.componentId !== id && c.to.componentId !== id),
        },
        wireAnchors: nextWireAnchors,
        isDirty: true,
      };
    });
  },

  removeBoundaryPort: (portId: string) => {
    set((state) => {
      const nextBoundaryLayout = { ...state.boundaryLayout };
      delete nextBoundaryLayout[portId];
      const nextPortColors = { ...state.portColors };
      delete nextPortColors[portId];
      const nextBoundaryInputs = { ...state.boundaryInputs };
      delete nextBoundaryInputs[portId];

      const removed = state.circuit.connections.filter(
        (c) =>
          (c.from.componentId === BOUNDARY_ID && c.from.portId === portId) ||
          (c.to.componentId === BOUNDARY_ID && c.to.portId === portId),
      );
      const nextWireAnchors = { ...state.wireAnchors };
      for (const c of removed) delete nextWireAnchors[connectionKey(c.from, c.to)];

      return {
        boundary: {
          inputs: state.boundary.inputs.filter((p) => p.id !== portId),
          outputs: state.boundary.outputs.filter((p) => p.id !== portId),
        },
        circuit: {
          ...state.circuit,
          connections: state.circuit.connections.filter(
            (c) =>
              !(
                (c.from.componentId === BOUNDARY_ID && c.from.portId === portId) ||
                (c.to.componentId === BOUNDARY_ID && c.to.portId === portId)
              ),
          ),
        },
        boundaryLayout: nextBoundaryLayout,
        portColors: nextPortColors,
        wireAnchors: nextWireAnchors,
        boundaryInputs: nextBoundaryInputs,
        isDirty: true,
      };
    });
  },

  duplicateComponent: (id: string) => {
    const state = get();
    const component = state.circuit.components.find((c) => c.id === id);
    if (!component) return;

    const newId = createId("chip");
    const original = state.layout[id] ?? { x: 0, y: 0 };

    set({
      circuit: {
        ...state.circuit,
        components: [...state.circuit.components, { id: newId, type: component.type }],
      },
      layout: { ...state.layout, [newId]: { x: original.x + 40, y: original.y + 40 } },
      isDirty: true,
    });
  },

  duplicateBoundaryPort: (portId: string) => {
    const state = get();
    const isInput = state.boundary.inputs.some((p) => p.id === portId);
    const sourceList = isInput ? state.boundary.inputs : state.boundary.outputs;
    const original = sourceList.find((p) => p.id === portId);
    if (!original) return;

    let name = `${original.name}-COPY`;
    for (let suffix = 2; sourceList.some((p) => p.name.toUpperCase() === name); suffix++) {
      name = `${original.name}-COPY-${suffix}`;
    }

    const newPort = createPortDefinition(name, isInput ? "input" : "output");
    const originalY = state.boundaryLayout[portId];
    const originalColor = state.portColors[portId];

    set({
      boundary: isInput
        ? { ...state.boundary, inputs: [...state.boundary.inputs, newPort] }
        : { ...state.boundary, outputs: [...state.boundary.outputs, newPort] },
      boundaryLayout:
        originalY !== undefined ? { ...state.boundaryLayout, [newPort.id]: originalY + 40 } : state.boundaryLayout,
      portColors: originalColor ? { ...state.portColors, [newPort.id]: originalColor } : state.portColors,
      isDirty: true,
    });
  },

  customizeBoundaryPort: (portId: string, newName: string, newColor?: string) => {
    set((state) => {
      const isInput = state.boundary.inputs.some((p) => p.id === portId);
      const targetList = isInput ? state.boundary.inputs : state.boundary.outputs;
      const duplicate = targetList.some((p) => p.id !== portId && p.name.toUpperCase() === newName);
      if (duplicate) {
        toast.error(`A port named "${newName}" already exists`);
        return state; // No change
      }

      toast.success(`Port updated`);
      return {
        boundary: {
          inputs: state.boundary.inputs.map((p) => (p.id === portId ? { ...p, name: newName } : p)),
          outputs: state.boundary.outputs.map((p) => (p.id === portId ? { ...p, name: newName } : p)),
        },
        portColors: {
          ...state.portColors,
          [portId]: newColor,
        },
        isDirty: true,
      };
    });
  },

  saveCurrentChip: ({ id, name, color }) => {
    const state = get();
    const chipDef = createChipDefinition({
      id: id || undefined,
      name,
      inputs: state.boundary.inputs,
      outputs: state.boundary.outputs,
      circuit: state.circuit,
    });

    const savedChip: SavedChip = {
      ...chipDef,
      color,
      layout: state.layout,
      boundaryLayout: state.boundaryLayout,
      portColors: state.portColors,
      wireAnchors: state.wireAnchors,
    };

    try {
      saveCustomChip(savedChip, state.registry);
      const nextSavedChips = loadSavedChips(state.registry);
      set({
        savedChips: nextSavedChips,
        currentChipId: chipDef.id,
        isDirty: false,
      });
      toast.success(`Chip "${name}" saved to library!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  },

  deleteChips: (chipsToDelete: SavedChip[]) => {
    const state = get();
    for (const c of chipsToDelete) {
      deleteCustomChip(c.id);
      state.registry.unregisterChip(c.id);
    }
    const nextSavedChips = loadSavedChips(state.registry);

    let needsReset = false;
    if (state.currentChipId && chipsToDelete.some((c) => c.id === state.currentChipId)) {
      needsReset = true;
      toast.info("Active chip was deleted. Circuit reset to blank.");
    } else {
      toast.success(`Deleted ${chipsToDelete.length} chip(s)`);
    }

    set({ savedChips: nextSavedChips });
    if (needsReset) {
      get().resetToBlank();
    }
  },
}));

export const useCurrentChip = () =>
  useCircuitStore((state) => state.savedChips.find((c) => c.id === state.currentChipId) || null);
