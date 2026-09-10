import { useCallback, useEffect, useMemo, useState } from "react";
import { CircuitCanvas } from "./components/circuit/CircuitCanvas";
import type { Layout, Position } from "./components/circuit/geometry";
import { Dock } from "./components/ui/Dock";
import { SaveChipModal } from "./components/ui/SaveChipModal";
import { UnsavedChangesAlert } from "./components/ui/UnsavedChangesAlert";
import { Toast, toast } from "./components/ui/Toast";
import {
  createDefaultRegistry,
  createChipDefinition,
  createId,
  createPortDefinition,
  validateConnection,
} from "./core";
import type { Bit, CircuitDefinition, PortDefinition, PortRef } from "./core";
import { loadSavedChips, saveCustomChip } from "./storage/chipStorage";
import type { SavedChip } from "./storage/chipStorage";

function createBlankCircuit() {
  const IN = createPortDefinition("IN", "input");
  const OUT = createPortDefinition("OUT", "output");
  return {
    circuit: { components: [], connections: [] } as CircuitDefinition,
    layout: {} as Layout,
    boundary: { inputs: [IN], outputs: [OUT] },
    boundaryLayout: {} as Record<string, number>,
  };
}

function App() {
  const registry = useMemo(() => createDefaultRegistry(), []);
  const initial = useMemo(() => createBlankCircuit(), []);

  const [savedChips, setSavedChips] = useState<SavedChip[]>(() => loadSavedChips(registry));
  const [circuit, setCircuit] = useState<CircuitDefinition>(initial.circuit);
  const [layout, setLayout] = useState<Layout>(initial.layout);
  const [boundary, setBoundary] = useState<{ inputs: PortDefinition[]; outputs: PortDefinition[] }>(initial.boundary);
  const [boundaryLayout, setBoundaryLayout] = useState<Record<string, number>>({});
  const [boundaryInputs, setBoundaryInputs] = useState<Record<string, Bit>>({});

  const [isDirty, setIsDirty] = useState(false);
  const [currentChipName, setCurrentChipName] = useState<string | null>(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingChipToOpen, setPendingChipToOpen] = useState<string | null>(null);

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
    setBoundaryInputs({});
    setCurrentChipName(null);
    setIsDirty(false);
  }, []);

  const handleNewClick = useCallback(() => {
    if (isDirty && (circuit.components.length > 0 || circuit.connections.length > 0)) {
      setPendingChipToOpen(null);
      setShowUnsavedModal(true);
    } else {
      resetToBlank();
    }
  }, [isDirty, circuit, resetToBlank]);

  const handleSaveClick = useCallback(() => {
    setShowSaveModal(true);
  }, []);

  const handleConfirmSave = useCallback(
    (name: string, color: string) => {
      const chipDef = createChipDefinition({
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
      };

      saveCustomChip(savedChip, registry);
      setSavedChips(loadSavedChips(registry));
      setCurrentChipName(name);
      setIsDirty(false);
      setShowSaveModal(false);
      toast.success(`Chip "${name}" saved to library!`);
    },
    [boundary, circuit, registry, layout, boundaryLayout],
  );

  const loadChipToCanvas = useCallback(
    (chipId: string) => {
      const chipDef = savedChips.find((g) => g.id === chipId);
      if (!chipDef) return;

      setCircuit(chipDef.circuit);
      setBoundary({ inputs: [...chipDef.inputs], outputs: [...chipDef.outputs] });
      setLayout(chipDef.layout || {});
      setBoundaryLayout(chipDef.boundaryLayout || {});
      setCurrentChipName(chipDef.name);
      setIsDirty(false);
      setPendingChipToOpen(null);
    },
    [savedChips],
  );

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

  const handleDiscardChanges = useCallback(() => {
    setShowUnsavedModal(false);
    if (pendingChipToOpen) {
      loadChipToCanvas(pendingChipToOpen);
    } else {
      resetToBlank();
    }
  }, [pendingChipToOpen, loadChipToCanvas, resetToBlank]);

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
    [boundary.inputs.length, boundary.outputs.length],
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

  // Keyboard shortcuts (Ctrl+S / Ctrl+N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveClick();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveClick, handleNewClick]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Circuit Canvas */}
      <CircuitCanvas
        circuit={circuit}
        registry={registry}
        savedChips={savedChips}
        layout={layout}
        boundary={boundary}
        boundaryLayout={boundaryLayout}
        boundaryInputs={boundaryInputs}
        onToggleBoundaryInput={handleToggleBoundaryInput}
        onMoveComponent={handleMoveComponent}
        onMoveBoundaryPort={handleMoveBoundaryPort}
        onRemoveComponent={handleRemoveComponent}
        onDropChip={handleDropChip}
        onConnectWire={handleConnectWire}
        onDisconnectWire={handleDisconnectWire}
        width={windowSize.width}
        height={windowSize.height}
      />

      {/* Floating Bottom Toolbar */}
      <Dock
        savedChips={savedChips}
        onNew={handleNewClick}
        onSave={handleSaveClick}
        onAddChip={handleAddChipCenter}
        onOpenChip={handleOpenChipClick}
        onRenameChip={() => toast.info("Rename coming soon!")}
      />

      {/* Toast Notification */}
      <Toast />

      {/* Save Chip Modal */}
      <SaveChipModal
        isOpen={showSaveModal}
        initialName={currentChipName ?? ""}
        onSave={handleConfirmSave}
        onCancel={() => setShowSaveModal(false)}
      />

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesAlert
        isOpen={showUnsavedModal}
        onSave={() => {
          setShowUnsavedModal(false);
          setShowSaveModal(true);
        }}
        onDiscard={handleDiscardChanges}
        onCancel={() => {
          setShowUnsavedModal(false);
          setPendingChipToOpen(null);
        }}
      />
    </div>
  );
}

export default App;
