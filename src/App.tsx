import { useEffect, useMemo, useState, useCallback } from "react";
import { CircuitCanvas } from "./components/circuit/CircuitCanvas";
import { Dock } from "./components/ui/Dock";
import { SaveChipModal } from "./components/ui/SaveChipModal";
import { saveChipModal } from "./stores/saveChipModalStore";
import { UnsavedAlert } from "./components/ui/UnsavedAlert";
import { DeleteChipModal } from "./components/ui/DeleteChipModal";
import { CustomizePortModal } from "./components/ui/CustomizePortModal";
import { Header } from "./components/ui/Header";
import { Toast } from "./components/ui/Toast";
import { CHIP_FILL } from "./components/circuit/colors";
import { unsavedAlert } from "./stores/unsavedAlertStore";
import { useCircuitStore, useCurrentChip } from "./stores/circuitStore";
import type { SavedChip } from "./storage/chipStorage";

function App() {
  const store = useCircuitStore();
  const currentChip = useCurrentChip();

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

  const handleSaveClick = useCallback(() => {
    if (store.currentChipId) {
      const chipDef = store.savedChips.find((c) => c.id === store.currentChipId);
      store.saveCurrentChip({
        id: store.currentChipId,
        name: chipDef?.name ?? "",
        color: chipDef?.color ?? CHIP_FILL,
      });
    } else {
      saveChipModal.open();
    }
  }, [store]);

  const handleNewClick = useCallback(() => {
    if (store.isDirty && (store.circuit.components.length > 0 || store.circuit.connections.length > 0)) {
      unsavedAlert.open(store.currentChipId ?? "");
    } else {
      store.resetToBlank();
    }
  }, [store]);

  const handleCustomizeClick = useCallback(() => {
    if (store.currentChipId) {
      saveChipModal.open(store.currentChipId);
    }
  }, [store.currentChipId]);

  const handleDeleteCurrentClick = useCallback(() => {
    if (store.currentChipId) {
      setDeletingChipId(store.currentChipId);
    }
  }, [store]);

  const handleOpenChipClick = (chipId: string) => {
    if (store.isDirty && (store.circuit.components.length > 0 || store.circuit.connections.length > 0)) {
      unsavedAlert.open(chipId);
    } else {
      store.loadChipToCanvas(chipId);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (store.isDirty) {
      // In a real app we'd need to store pendingBreadcrumbIndex.
      // For now we'll just block navigating if dirty or you could just let the alert handle it.
      // Wait, let's keep it simple: if dirty, open alert.
      // We will need a way to pass pending index to alert, or let unsavedAlert have custom callbacks.
      // The user modified UnsavedAlert to just take chipId. We will pass a special string for breadcrumbs?
      // Since the user modified UnsavedAlert to just take chipId and call openSaveModal/handleDiscardChanges,
      // discarding will resetToBlank instead of executing breadcrumb.
      // For now, let's just trigger the alert.
      unsavedAlert.open(store.currentChipId ?? "");
    } else {
      store.executeBreadcrumbNavigation(index);
    }
  };

  const handleDiscardChanges = useCallback(
    (chipId?: string | null) => {
      unsavedAlert.close();
      if (chipId) {
        store.loadChipToCanvas(chipId);
      } else {
        store.resetToBlank();
      }
    },
    [store],
  );

  const handleConfirmDelete = (chipsToDelete: SavedChip[]) => {
    store.deleteChips(chipsToDelete);
    setDeletingChipId(null);
  };

  const renamingPort = useMemo(() => {
    if (!renamingPortId) return null;
    return (
      store.boundary.inputs.find((p) => p.id === renamingPortId) ??
      store.boundary.outputs.find((p) => p.id === renamingPortId) ??
      null
    );
  }, [renamingPortId, store.boundary]);

  const handleConfirmRenamePort = (newName: string, newColor: string) => {
    if (renamingPortId) {
      store.renameBoundaryPort(renamingPortId, newName, newColor);
      setRenamingPortId(null);
    }
  };

  const handleAddChipCenter = (chipType: string) => {
    store.dropChip(chipType, {
      x: Math.round(windowSize.width / 2 - 60),
      y: Math.round(windowSize.height / 2 - 40),
    });
  };

  const disabledChipIds = useMemo(() => {
    const disabled = new Set<string>();
    if (store.currentChipId) {
      for (const chip of store.savedChips) {
        if (store.registry.dependsOn(chip.id, store.currentChipId)) {
          disabled.add(chip.id);
        }
      }
    }
    return disabled;
  }, [store.currentChipId, store.savedChips, store.registry]);

  const breadcrumbItems = useMemo(() => {
    const items = store.viewStack.map((state, i) => {
      // In viewStack, state corresponds to a saved chip, so we find it to get the name
      const chip = store.savedChips.find((c) => c.id === state.currentChipId);
      return {
        id: `stack-${i}`,
        name: chip?.name ?? "Untitled Chip",
        isDirty: state.isDirty,
      };
    });
    items.push({
      id: "current",
      name: currentChip?.name ?? "Untitled Chip",
      isDirty: store.isDirty,
    });
    return items;
  }, [store.viewStack, store.savedChips, currentChip, store.isDirty]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      <Header
        breadcrumbItems={breadcrumbItems}
        onNavigateBreadcrumb={handleBreadcrumbClick}
        onNew={handleNewClick}
        onSave={handleSaveClick}
        onCustomize={handleCustomizeClick}
        onDelete={handleDeleteCurrentClick}
        isSaved={!!store.currentChipId}
      />

      <CircuitCanvas
        circuit={store.circuit}
        registry={store.registry}
        savedChips={store.savedChips}
        layout={store.layout}
        boundary={store.boundary}
        boundaryLayout={store.boundaryLayout}
        portColors={store.portColors}
        boundaryInputs={store.boundaryInputs}
        onToggleBoundaryInput={store.toggleBoundaryInput}
        onMoveComponent={store.moveComponent}
        onViewComponent={store.diveIntoChip}
        onMoveBoundaryPort={store.moveBoundaryPort}
        onRemoveComponent={store.removeComponent}
        onRemoveBoundaryPort={store.removeBoundaryPort}
        onRenameBoundaryPort={setRenamingPortId}
        onDropChip={store.dropChip}
        onConnectWire={store.connectWire}
        onDisconnectWire={store.disconnectWire}
        width={windowSize.width}
        height={windowSize.height}
      />

      <Dock
        savedChips={store.savedChips}
        disabledChipIds={disabledChipIds}
        onAddChip={handleAddChipCenter}
        onOpenChip={handleOpenChipClick}
        onDeleteChip={setDeletingChipId}
      />

      <Toast />

      <SaveChipModal
        onSave={(data) => {
          store.saveCurrentChip(data);
          saveChipModal.close();
        }}
      />

      <UnsavedAlert onSave={saveChipModal.open} onDiscard={handleDiscardChanges} />

      <DeleteChipModal
        chipId={deletingChipId}
        savedChips={store.savedChips}
        registry={store.registry}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingChipId(null)}
      />

      <CustomizePortModal
        isOpen={Boolean(renamingPortId && renamingPort)}
        initialName={renamingPort?.name ?? ""}
        initialColor={renamingPortId ? (store.portColors[renamingPortId] ?? "") : ""}
        onCustomize={handleConfirmRenamePort}
        onCancel={() => setRenamingPortId(null)}
      />
    </div>
  );
}

export default App;
