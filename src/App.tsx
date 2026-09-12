import { useMemo } from "react";
import { CircuitCanvas } from "./components/circuit/CircuitCanvas";
import { Dock } from "./components/ui/Dock";
import { SaveChipModal } from "./components/ui/SaveChipModal";
import { saveChipModal } from "./stores/saveChipModalStore";
import { UnsavedAlert } from "./components/ui/UnsavedAlert";
import { DeleteChipAlert } from "./components/ui/DeleteChipAlert";
import { CustomizePortModal } from "./components/ui/CustomizePortModal";
import { Header } from "./components/ui/Header";
import { Toast } from "./components/ui/Toast";
import { useCircuitStore, useCurrentChip } from "./stores/circuitStore";
import { deleteChipAlert } from "./stores/deleteChipAlertStore";
import { customizePortModal } from "./stores/customizePortModalStore";
import { useWindowSize } from "./hooks/useWindowSize";
import { useAppActions } from "./hooks/useAppActions";

function App() {
  const store = useCircuitStore();
  const currentChip = useCurrentChip();

  const windowSize = useWindowSize();
  const actions = useAppActions(windowSize);

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
        onNavigateBreadcrumb={actions.handleBreadcrumbClick}
        onNew={actions.handleNewClick}
        onSave={actions.handleSaveClick}
        onCustomize={actions.handleCustomizeClick}
        onDelete={actions.handleDeleteCurrentClick}
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
        onCustomizeBoundaryPort={customizePortModal.open}
        onDropChip={store.dropChip}
        onConnectWire={store.connectWire}
        onDisconnectWire={store.disconnectWire}
        width={windowSize.width}
        height={windowSize.height}
      />

      <Dock
        savedChips={store.savedChips}
        disabledChipIds={disabledChipIds}
        onAddChip={actions.handleAddChipCenter}
        onOpenChip={actions.handleOpenChipClick}
        onDeleteChip={deleteChipAlert.open}
      />

      <Toast />

      <SaveChipModal
        onSave={(data) => {
          store.saveCurrentChip(data);
          saveChipModal.close();
        }}
      />

      <UnsavedAlert onSave={saveChipModal.open} onDiscard={actions.handleDiscardChanges} />

      <DeleteChipAlert />

      <CustomizePortModal />
    </div>
  );
}

export default App;
