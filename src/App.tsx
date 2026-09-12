import { useCallback, useEffect, useMemo, useState } from "react";
import { CircuitCanvas } from "./components/circuit/CircuitCanvas";
import { Dock } from "./components/ui/Dock";
import { SaveChipModal, SaveChipModalContext } from "./components/ui/SaveChipModal";
import type { ChipSaveState } from "./components/ui/SaveChipModal";
import { UnsavedChangesAlert } from "./components/ui/UnsavedChangesAlert";
import { DeleteChipModal } from "./components/ui/DeleteChipModal";
import { CustomizePortModal } from "./components/ui/CustomizePortModal";
import { Header } from "./components/ui/Header";
import { Toast, toast } from "./components/ui/Toast";
import {
  createDefaultRegistry,
  createChipDefinition,
  createId,
  createPortDefinition,
  validateConnection,
  BOUNDARY_ID,
} from "./core";
import type { Bit, CircuitDefinition, PortDefinition, PortRef } from "./core";
import { loadSavedChips, saveCustomChip, deleteCustomChip } from "./storage/chipStorage";
import type { SavedChip } from "./storage/chipStorage";
import type { Layout, Position } from "./components/circuit/geometry";
import { CHIP_FILL } from "./components/circuit/colors";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

function createBlankCircuit() {
  const IN = createPortDefinition("IN", "input");
  const OUT = createPortDefinition("OUT", "output");
  return {
    circuit: { components: [], connections: [] } as CircuitDefinition,
    layout: {} as Layout,
    boundary: { inputs: [IN], outputs: [OUT] },
    boundaryLayout: {} as Record<string, number>,
    portColors: {} as Record<string, string>,
  };
}

interface ViewState {
  circuit: CircuitDefinition;
  layout: Layout;
  boundary: { inputs: PortDefinition[]; outputs: PortDefinition[] };
  boundaryLayout: Record<string, number>;
  portColors: Record<string, string>;
  boundaryInputs: Record<string, Bit>;
  isDirty: boolean;
  currentChipName: string | null;
  currentChipId: string | null;
}

function App() {
  const registry = useMemo(() => createDefaultRegistry(), []);
  const initial = useMemo(() => createBlankCircuit(), []);

  const [savedChips, setSavedChips] = useState<SavedChip[]>(() => loadSavedChips(registry));
  const [circuit, setCircuit] = useState<CircuitDefinition>(initial.circuit);
  const [layout, setLayout] = useState<Layout>(initial.layout);
  const [boundary, setBoundary] = useState<{ inputs: PortDefinition[]; outputs: PortDefinition[] }>(initial.boundary);
  const [boundaryLayout, setBoundaryLayout] = useState<Record<string, number>>({});
  const [portColors, setPortColors] = useState<Record<string, string>>({});
  const [boundaryInputs, setBoundaryInputs] = useState<Record<string, Bit>>({});

  const [isDirty, setIsDirty] = useState(false);
  const [currentChipName, setCurrentChipName] = useState<string | null>(null);
  const [currentChipId, setCurrentChipId] = useState<string | null>(null);

  const [viewStack, setViewStack] = useState<ViewState[]>([]);
  const [pendingBreadcrumbIndex, setPendingBreadcrumbIndex] = useState<number | null>(null);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveModalState, setSaveModalState] = useState<ChipSaveState | undefined>(undefined);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingChipToOpen, setPendingChipToOpen] = useState<string | null>(null);
  const [deletingChipId, setDeletingChipId] = useState<string | null>(null);
  const [renamingPortId, setRenamingPortId] = useState<string | null>(null);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleBoundaryInput = useCallback((portId: string) => {
    setBoundaryInputs((prev) => ({ ...prev, [portId]: !prev[portId] }));
  }, []);

  const handleMoveComponent = useCallback((componentId: string, position: Position) => {
    setLayout((prev) => ({ ...prev, [componentId]: position }));
    setIsDirty(true);
  }, []);

  const handleMoveBoundaryPort = useCallback((portId: string, y: number) => {
    setBoundaryLayout((prev) => ({ ...prev, [portId]: y }));
    setIsDirty(true);
  }, []);

  const resetToBlank = useCallback(() => {
    const blank = createBlankCircuit();
    setCircuit(blank.circuit);
    setLayout(blank.layout);
    setBoundary(blank.boundary);
    setBoundaryLayout(blank.boundaryLayout);
    setPortColors(blank.portColors);
    setBoundaryInputs({});
    setCurrentChipName(null);
    setCurrentChipId(null);
    setIsDirty(false);
    setViewStack([]);
  }, []);

  const handleNewClick = useCallback(() => {
    if (isDirty && (circuit.components.length > 0 || circuit.connections.length > 0)) {
      setPendingChipToOpen(null);
      setShowUnsavedModal(true);
    } else {
      resetToBlank();
    }
  }, [isDirty, circuit, resetToBlank]);

  const getViewState = useCallback(
    (): ViewState => ({
      circuit,
      layout,
      boundary,
      boundaryLayout,
      portColors,
      boundaryInputs,
      isDirty,
      currentChipName,
      currentChipId,
    }),
    [circuit, layout, boundary, boundaryLayout, portColors, boundaryInputs, isDirty, currentChipName, currentChipId],
  );

  const restoreViewState = useCallback((state: ViewState) => {
    setCircuit(state.circuit);
    setLayout(state.layout);
    setBoundary(state.boundary);
    setBoundaryLayout(state.boundaryLayout);
    setPortColors(state.portColors);
    setBoundaryInputs(state.boundaryInputs);
    setIsDirty(state.isDirty);
    setCurrentChipName(state.currentChipName);
    setCurrentChipId(state.currentChipId);
  }, []);

  const executeBreadcrumbNavigation = useCallback(
    (index: number) => {
      if (index < 0) return;
      setViewStack((prev) => {
        const targetState = prev[index];
        if (targetState) restoreViewState(targetState);
        return prev.slice(0, index);
      });
      setPendingBreadcrumbIndex(null);
    },
    [restoreViewState],
  );

  const loadChipToCanvas = useCallback(
    (chipId: string) => {
      const chipDef = savedChips.find((g) => g.id === chipId);
      if (!chipDef) return;

      setCircuit(chipDef.circuit);
      setBoundary({ inputs: [...chipDef.inputs], outputs: [...chipDef.outputs] });
      setLayout(chipDef.layout || {});
      setBoundaryLayout(chipDef.boundaryLayout || {});
      setPortColors(chipDef.portColors || {});
      setCurrentChipName(chipDef.name);
      setCurrentChipId(chipDef.id);
      setIsDirty(false);
      setPendingChipToOpen(null);
      setViewStack([]);
    },
    [savedChips],
  );

  const handleConfirmSave = useCallback(
    ({ id, name, color }: { id?: string | null; name: string; color: string }) => {
      const chipDef = createChipDefinition({
        id: id || undefined,
        name,
        inputs: boundary.inputs,
        outputs: boundary.outputs,
        circuit,
      });

      const savedChip: SavedChip = {
        ...chipDef,
        color,
        layout,
        boundaryLayout,
        portColors,
      };

      try {
        saveCustomChip(savedChip, registry);
        setSavedChips(loadSavedChips(registry));
        setCurrentChipName(name);
        setCurrentChipId(chipDef.id);
        setIsDirty(false);
        setSaveModalOpen(false);
        toast.success(`Chip "${name}" saved to library!`);

        if (pendingBreadcrumbIndex !== null) {
          executeBreadcrumbNavigation(pendingBreadcrumbIndex);
        } else if (pendingChipToOpen) {
          loadChipToCanvas(pendingChipToOpen);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : String(err));
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      boundary,
      circuit,
      registry,
      layout,
      boundaryLayout,
      portColors,
      currentChipId,
      pendingBreadcrumbIndex,
      pendingChipToOpen,
      executeBreadcrumbNavigation,
      loadChipToCanvas,
    ],
  );

  const openSaveModal = useCallback((state?: ChipSaveState) => {
    setSaveModalState(state);
    setSaveModalOpen(true);
  }, []);

  const handleSaveClick = useCallback(() => {
    if (currentChipId && currentChipName) {
      const chipDef = savedChips.find((c) => c.id === currentChipId);
      const color = chipDef?.color || CHIP_FILL;
      handleConfirmSave({ id: currentChipId, name: currentChipName, color });
    } else {
      openSaveModal();
    }
  }, [currentChipId, currentChipName, savedChips, handleConfirmSave, openSaveModal]);

  const handleCustomizeClick = useCallback(() => {
    if (currentChipId && currentChipName) {
      const chipDef = savedChips.find((c) => c.id === currentChipId);
      openSaveModal({ id: currentChipId, name: currentChipName, color: chipDef?.color ?? CHIP_FILL });
    }
  }, [currentChipId, currentChipName, savedChips, openSaveModal]);

  const handleDeleteCurrentClick = useCallback(() => {
    if (currentChipId) {
      setDeletingChipId(currentChipId);
    }
  }, [currentChipId]);

  const handleOpenChipClick = useCallback(
    (chipId: string) => {
      if (isDirty && (circuit.components.length > 0 || circuit.connections.length > 0)) {
        setPendingChipToOpen(chipId);
        setShowUnsavedModal(true);
      } else {
        loadChipToCanvas(chipId);
      }
    },
    [isDirty, circuit, loadChipToCanvas],
  );

  const handleDeleteChipClick = useCallback((chipId: string) => {
    setDeletingChipId(chipId);
  }, []);

  const handleConfirmDelete = useCallback(
    (chipsToDelete: SavedChip[]) => {
      // 1. Delete from storage and unregister from registry
      for (const c of chipsToDelete) {
        deleteCustomChip(c.id);
        registry.unregisterChip(c.id);
      }

      // 2. Refresh local state
      setSavedChips(loadSavedChips(registry));
      setDeletingChipId(null);

      // 3. If current canvas is one of the deleted chips, reset it to blank
      if (currentChipId && chipsToDelete.some((c) => c.id === currentChipId)) {
        resetToBlank();
        toast.info("Active chip was deleted. Canvas reset to blank.");
      } else {
        toast.success(`Deleted ${chipsToDelete.length} chip(s)`);
      }
    },
    [currentChipId, registry, resetToBlank],
  );

  const handleDiscardChanges = useCallback(() => {
    setShowUnsavedModal(false);
    if (pendingBreadcrumbIndex !== null) {
      executeBreadcrumbNavigation(pendingBreadcrumbIndex);
    } else if (pendingChipToOpen) {
      loadChipToCanvas(pendingChipToOpen);
    } else {
      resetToBlank();
    }
  }, [pendingBreadcrumbIndex, pendingChipToOpen, loadChipToCanvas, resetToBlank, executeBreadcrumbNavigation]);

  const handleDiveIntoChip = useCallback(
    (componentId: string) => {
      const component = circuit.components.find((c) => c.id === componentId);
      if (!component) return;

      const targetDef = savedChips.find((c) => c.id === component.type);
      if (!targetDef) {
        toast.error("Cannot dive into primitive chip.");
        return;
      }

      setViewStack((prev) => [...prev, getViewState()]);

      setCircuit(targetDef.circuit);
      setBoundary({ inputs: [...targetDef.inputs], outputs: [...targetDef.outputs] });
      setLayout(targetDef.layout || {});
      setBoundaryLayout(targetDef.boundaryLayout || {});
      setPortColors(targetDef.portColors || {});
      setBoundaryInputs({});
      setCurrentChipName(targetDef.name);
      setCurrentChipId(targetDef.id);
      setIsDirty(false);
    },
    [savedChips, getViewState, circuit.components],
  );

  const handleBreadcrumbClick = useCallback(
    (index: number) => {
      if (isDirty) {
        setPendingBreadcrumbIndex(index);
        setShowUnsavedModal(true);
      } else {
        executeBreadcrumbNavigation(index);
      }
    },
    [isDirty, executeBreadcrumbNavigation],
  );

  const handleDropChip = useCallback(
    (chipType: string, position: Position) => {
      if (chipType === "IN") {
        const name = String.fromCharCode(65 + boundary.inputs.length);
        const port = createPortDefinition(name, "input");
        setBoundary((prev) => ({ ...prev, inputs: [...prev.inputs, port] }));
        setBoundaryLayout((prev) => ({ ...prev, [port.id]: position.y }));
        setIsDirty(true);
        return;
      }

      if (chipType === "OUT") {
        const name = boundary.outputs.length === 0 ? "Y" : `Y${boundary.outputs.length}`;
        const port = createPortDefinition(name, "output");
        setBoundary((prev) => ({ ...prev, outputs: [...prev.outputs, port] }));
        setBoundaryLayout((prev) => ({ ...prev, [port.id]: position.y }));
        setIsDirty(true);
        return;
      }

      if (currentChipId && registry.dependsOn(chipType, currentChipId)) {
        toast.error("Cannot add chip: circular dependency detected");
        return;
      }

      const newId = createId("c");
      setCircuit((prev) => ({
        ...prev,
        components: [...prev.components, { id: newId, type: chipType }],
      }));
      setLayout((prev) => ({
        ...prev,
        [newId]: position,
      }));
      setIsDirty(true);
    },
    [boundary.inputs.length, boundary.outputs.length, currentChipId, registry],
  );

  const handleAddChipCenter = useCallback(
    (chipType: string) => {
      const pos: Position = {
        x: Math.round(windowSize.width / 2 - 60),
        y: Math.round(windowSize.height / 2 - 40),
      };
      handleDropChip(chipType, pos);
    },
    [windowSize, handleDropChip],
  );

  const handleConnectWire = useCallback(
    (from: PortRef, to: PortRef) => {
      const issues = validateConnection({
        circuit,
        registry,
        connection: { from, to },
        boundary,
      });

      if (issues.length > 0) {
        toast.error(issues[0].message);
        return;
      }

      setCircuit((prev) => ({
        ...prev,
        connections: [...prev.connections, { from, to }],
      }));
      setIsDirty(true);
    },
    [circuit, registry, boundary],
  );

  const handleDisconnectWire = useCallback((from: PortRef, to: PortRef) => {
    setCircuit((prev) => ({
      ...prev,
      connections: prev.connections.filter(
        (c) =>
          !(
            c.from.componentId === from.componentId &&
            c.from.portId === from.portId &&
            c.to.componentId === to.componentId &&
            c.to.portId === to.portId
          ),
      ),
    }));
    setIsDirty(true);
  }, []);

  const handleRemoveComponent = useCallback((componentId: string) => {
    setCircuit((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== componentId),
      connections: prev.connections.filter(
        (c) => c.from.componentId !== componentId && c.to.componentId !== componentId,
      ),
    }));
    setIsDirty(true);
  }, []);

  const handleRemoveBoundaryPort = useCallback((portId: string) => {
    setBoundary((prev) => ({
      inputs: prev.inputs.filter((p) => p.id !== portId),
      outputs: prev.outputs.filter((p) => p.id !== portId),
    }));
    setCircuit((prev) => ({
      ...prev,
      connections: prev.connections.filter(
        (c) =>
          !(
            (c.from.componentId === BOUNDARY_ID && c.from.portId === portId) ||
            (c.to.componentId === BOUNDARY_ID && c.to.portId === portId)
          ),
      ),
    }));
    setBoundaryLayout((prev) => {
      const next = { ...prev };
      delete next[portId];
      return next;
    });
    setPortColors((prev) => {
      const next = { ...prev };
      delete next[portId];
      return next;
    });
    setBoundaryInputs((prev) => {
      const next = { ...prev };
      delete next[portId];
      return next;
    });
    setIsDirty(true);
  }, []);

  const renamingPort = useMemo(() => {
    if (!renamingPortId) return null;
    return (
      boundary.inputs.find((p) => p.id === renamingPortId) ??
      boundary.outputs.find((p) => p.id === renamingPortId) ??
      null
    );
  }, [renamingPortId, boundary]);

  const handleRenameBoundaryPort = useCallback((portId: string) => {
    setRenamingPortId(portId);
  }, []);

  const handleConfirmRenamePort = useCallback(
    (newName: string, newColor: string) => {
      if (!renamingPortId || !renamingPort) return;

      if (renamingPort.name === newName && (portColors[renamingPortId] || "") === newColor) {
        setRenamingPortId(null);
        return;
      }

      const isInput = boundary.inputs.some((p) => p.id === renamingPortId);
      const targetList = isInput ? boundary.inputs : boundary.outputs;
      const duplicate = targetList.some((p) => p.id !== renamingPortId && p.name.toUpperCase() === newName);
      if (duplicate) {
        toast.error(`A port named "${newName}" already exists`);
        return;
      }

      setBoundary((prev) => ({
        inputs: prev.inputs.map((p) => (p.id === renamingPortId ? { ...p, name: newName } : p)),
        outputs: prev.outputs.map((p) => (p.id === renamingPortId ? { ...p, name: newName } : p)),
      }));
      setPortColors((prev) => ({
        ...prev,
        [renamingPortId]: newColor,
      }));
      setIsDirty(true);
      setRenamingPortId(null);
      toast.success(`Port updated`);
    },
    [renamingPortId, renamingPort, boundary, portColors],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveClick();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewClick();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        handleCustomizeClick();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "del") {
        e.preventDefault();
        handleDeleteCurrentClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveClick, handleNewClick, handleCustomizeClick, handleDeleteCurrentClick]);

  const disabledChipIds = useMemo(() => {
    const disabled = new Set<string>();
    if (currentChipId) {
      for (const chip of savedChips) {
        if (registry.dependsOn(chip.id, currentChipId)) {
          disabled.add(chip.id);
        }
      }
    }
    return disabled;
  }, [currentChipId, savedChips, registry]);

  const breadcrumbItems = useMemo(() => {
    const items = viewStack.map((state, i) => ({
      id: `stack-${i}`,
      name: state.currentChipName ?? "Untitled Chip",
      isDirty: state.isDirty,
    }));
    items.push({
      id: "current",
      name: currentChipName ?? "Untitled Chip",
      isDirty: isDirty,
    });
    return items;
  }, [viewStack, currentChipName, isDirty]);

  return (
    <SaveChipModalContext.Provider value={{ openSaveModal }}>
      <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
        <Header
          breadcrumbItems={breadcrumbItems}
          onNavigateBreadcrumb={handleBreadcrumbClick}
          onNew={handleNewClick}
          onSave={handleSaveClick}
          onCustomize={handleCustomizeClick}
          onDelete={handleDeleteCurrentClick}
          isSaved={!!currentChipId}
        />

        {/* Circuit Canvas */}
        <ErrorBoundary>
          <CircuitCanvas
            circuit={circuit}
            registry={registry}
            savedChips={savedChips}
            layout={layout}
            boundary={boundary}
            boundaryLayout={boundaryLayout}
            portColors={portColors}
            boundaryInputs={boundaryInputs}
            onToggleBoundaryInput={handleToggleBoundaryInput}
            onMoveComponent={handleMoveComponent}
            onOpenComponent={handleDiveIntoChip}
            onMoveBoundaryPort={handleMoveBoundaryPort}
            onRemoveComponent={handleRemoveComponent}
            onRemoveBoundaryPort={handleRemoveBoundaryPort}
            onRenameBoundaryPort={handleRenameBoundaryPort}
            onDropChip={handleDropChip}
            onConnectWire={handleConnectWire}
            onDisconnectWire={handleDisconnectWire}
            width={windowSize.width}
            height={windowSize.height}
          />
        </ErrorBoundary>

        {/* Floating Bottom Toolbar */}
        <Dock
          savedChips={savedChips}
          disabledChipIds={disabledChipIds}
          onAddChip={handleAddChipCenter}
          onOpenChip={handleOpenChipClick}
          onDeleteChip={handleDeleteChipClick}
        />

        {/* Toast Notification */}
        <Toast />

        {/* Save Chip Modal */}
        <SaveChipModal
          isOpen={saveModalOpen}
          initialState={saveModalState ?? { id: null, name: currentChipName ?? "", color: CHIP_FILL }}
          onSave={handleConfirmSave}
          onCancel={() => setSaveModalOpen(false)}
        />

        {/* Unsaved Changes Confirmation Modal */}
        <UnsavedChangesAlert
          isOpen={showUnsavedModal}
          onSave={() => {
            setShowUnsavedModal(false);
            openSaveModal();
          }}
          onDiscard={handleDiscardChanges}
          onCancel={() => {
            setShowUnsavedModal(false);
            setPendingChipToOpen(null);
            setPendingBreadcrumbIndex(null);
          }}
        />

        {/* Delete Chip Confirmation Modal */}
        <DeleteChipModal
          chipId={deletingChipId}
          savedChips={savedChips}
          registry={registry}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingChipId(null)}
        />

        {/* Customize Boundary Port Modal */}
        <CustomizePortModal
          isOpen={Boolean(renamingPortId && renamingPort)}
          initialName={renamingPort?.name ?? ""}
          initialColor={renamingPortId ? (portColors[renamingPortId] ?? "") : ""}
          onCustomize={handleConfirmRenamePort}
          onCancel={() => setRenamingPortId(null)}
        />
      </div>
    </SaveChipModalContext.Provider>
  );
}

export default App;
