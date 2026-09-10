import { useCallback, useEffect, useMemo, useState } from "react";
import { CircuitCanvas } from "./components/circuit/CircuitCanvas";
import type { Layout, Position } from "./components/circuit/geometry";
import { Dock } from "./components/ui/Dock";
import { SaveGateModal } from "./components/ui/SaveGateModal";
import { UnsavedChangesAlert } from "./components/ui/UnsavedChangesAlert";
import { Toast, toast } from "./components/ui/Toast";
import {
  createDefaultRegistry,
  createGateDefinition,
  createId,
  createPortDefinition,
  validateConnection,
} from "./core";
import type { Bit, CircuitDefinition, GateDefinition, PortDefinition, PortRef } from "./core";
import { loadSavedGates, saveCustomGate } from "./storage/gateStorage";

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

  const [savedGates, setSavedGates] = useState<GateDefinition[]>(() => loadSavedGates(registry));
  const [circuit, setCircuit] = useState<CircuitDefinition>(initial.circuit);
  const [layout, setLayout] = useState<Layout>(initial.layout);
  const [boundary, setBoundary] = useState<{ inputs: PortDefinition[]; outputs: PortDefinition[] }>(initial.boundary);
  const [boundaryLayout, setBoundaryLayout] = useState<Record<string, number>>({});
  const [boundaryInputs, setBoundaryInputs] = useState<Record<string, Bit>>({});

  const [isDirty, setIsDirty] = useState(false);
  const [currentGateName, setCurrentGateName] = useState<string | null>(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingGateToOpen, setPendingGateToOpen] = useState<string | null>(null);

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
    setCurrentGateName(null);
    setIsDirty(false);
  }, []);

  const handleNewClick = useCallback(() => {
    if (isDirty && (circuit.components.length > 0 || circuit.connections.length > 0)) {
      setPendingGateToOpen(null);
      setShowUnsavedModal(true);
    } else {
      resetToBlank();
    }
  }, [isDirty, circuit, resetToBlank]);

  const handleSaveClick = useCallback(() => {
    setShowSaveModal(true);
  }, []);

  const handleConfirmSave = useCallback(
    (name: string) => {
      const gate = createGateDefinition({
        name,
        inputs: boundary.inputs,
        outputs: boundary.outputs,
        circuit,
      });

      saveCustomGate(gate, registry);
      setSavedGates(loadSavedGates(registry));
      setCurrentGateName(name);
      setIsDirty(false);
      setShowSaveModal(false);
      toast.success(`Chip "${name}" saved to library!`);
    },
    [boundary, circuit, registry],
  );

  const loadGateToCanvas = useCallback(
    (gateId: string) => {
      const gateDef = savedGates.find((g) => g.id === gateId);
      if (!gateDef) return;

      setCircuit(gateDef.circuit);
      setBoundary({ inputs: [...gateDef.inputs], outputs: [...gateDef.outputs] });
      setLayout({});
      setBoundaryLayout({});
      setCurrentGateName(gateDef.name);
      setIsDirty(false);
      setPendingGateToOpen(null);
    },
    [savedGates],
  );

  const handleOpenGateClick = useCallback(
    (gateId: string) => {
      if (isDirty && (circuit.components.length > 0 || circuit.connections.length > 0)) {
        setPendingGateToOpen(gateId);
        setShowUnsavedModal(true);
      } else {
        loadGateToCanvas(gateId);
      }
    },
    [isDirty, circuit, loadGateToCanvas],
  );

  const handleDiscardChanges = useCallback(() => {
    setShowUnsavedModal(false);
    if (pendingGateToOpen) {
      loadGateToCanvas(pendingGateToOpen);
    } else {
      resetToBlank();
    }
  }, [pendingGateToOpen, loadGateToCanvas, resetToBlank]);

  const handleDropGate = useCallback(
    (gateType: string, position: Position) => {
      if (gateType === "IN") {
        const name = String.fromCharCode(65 + boundary.inputs.length);
        const port = createPortDefinition(name, "input");
        setBoundary((prev) => ({ ...prev, inputs: [...prev.inputs, port] }));
        setBoundaryLayout((prev) => ({ ...prev, [port.id]: position.y }));
        setIsDirty(true);
        return;
      }

      if (gateType === "OUT") {
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
        components: [...prev.components, { id: newId, type: gateType }],
      }));
      setLayout((prev) => ({
        ...prev,
        [newId]: position,
      }));
      setIsDirty(true);
    },
    [boundary.inputs.length, boundary.outputs.length],
  );

  const handleAddGateCenter = useCallback(
    (gateType: string) => {
      const pos: Position = {
        x: Math.round(windowSize.width / 2 - 60),
        y: Math.round(windowSize.height / 2 - 40),
      };
      handleDropGate(gateType, pos);
    },
    [windowSize, handleDropGate],
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
        layout={layout}
        boundary={boundary}
        boundaryLayout={boundaryLayout}
        boundaryInputs={boundaryInputs}
        onToggleBoundaryInput={handleToggleBoundaryInput}
        onMoveComponent={handleMoveComponent}
        onMoveBoundaryPort={handleMoveBoundaryPort}
        onRemoveComponent={handleRemoveComponent}
        onDropGate={handleDropGate}
        onConnectWire={handleConnectWire}
        onDisconnectWire={handleDisconnectWire}
        width={windowSize.width}
        height={windowSize.height}
      />

      {/* Floating Bottom Toolbar */}
      <Dock
        savedGates={savedGates}
        onNew={handleNewClick}
        onSave={handleSaveClick}
        onAddGate={handleAddGateCenter}
        onOpenGate={handleOpenGateClick}
        onRenameGate={() => toast.info("Rename coming soon!")}
      />

      {/* Toast Notification */}
      <Toast />

      {/* Save Chip Modal */}
      <SaveGateModal
        isOpen={showSaveModal}
        initialName={currentGateName ?? ""}
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
          setPendingGateToOpen(null);
        }}
      />
    </div>
  );
}

export default App;
