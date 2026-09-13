import { CircuitCanvas } from "./components/circuit/CircuitCanvas";
import { Dock } from "./components/ui/Dock";
import { ModalView } from "./components/ui/ModalView";
import { Header } from "./components/ui/Header";
import { Toast } from "./components/ui/Toast";
import { useCircuitStore } from "./stores/circuitStore";
import { modals } from "./stores/modalStore";
import { useUserPreferencesStore } from "./stores/userPreferencesStore";
import { useWindowSize } from "./hooks/useWindowSize";
import { useAppActions } from "./hooks/useAppActions";

function App() {
  const store = useCircuitStore();
  const preferences = useUserPreferencesStore();

  const windowSize = useWindowSize();
  const actions = useAppActions(windowSize);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      <Header
        onNavigateBreadcrumb={actions.handleBreadcrumbClick}
        onNew={actions.handleNewClick}
        onSave={actions.handleSaveClick}
        onCustomize={actions.handleCustomizeClick}
        onDelete={actions.handleDeleteCurrentClick}
        onPreferences={() =>
          modals.open("preferences", { title: "PREFERENCES", description: "Personalize how the circuit is displayed." })
        }
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
        wireAnchors={store.wireAnchors}
        boundaryInputs={store.boundaryInputs}
        onToggleBoundaryInput={store.toggleBoundaryInput}
        onMoveComponent={store.moveComponent}
        onViewComponent={store.diveIntoChip}
        onMoveBoundaryPort={store.moveBoundaryPort}
        onRemoveComponent={store.removeComponent}
        onRemoveBoundaryPort={store.removeBoundaryPort}
        onDuplicateComponent={store.duplicateComponent}
        onDuplicateBoundaryPort={store.duplicateBoundaryPort}
        onCustomizeBoundaryPort={(portId) =>
          modals.open("customize-port", {
            title: "CUSTOMIZE PORT",
            description: "Enter a new name for this boundary port.",
            portId,
          })
        }
        onDropChip={store.dropChip}
        onConnectWire={store.connectWire}
        onDisconnectWire={store.disconnectWire}
        showGrid={preferences.showGrid}
        showPortLabel={preferences.showPortLabel}
        width={windowSize.width}
        height={windowSize.height}
      />

      <Dock
        onAddChip={actions.handleAddChipFreespace}
        onOpenChip={actions.handleOpenChipClick}
        onDeleteChip={(chipId) =>
          modals.open("delete-chip", { title: "DELETE CHIP", description: "This action cannot be undone.", chipId })
        }
      />

      <Toast />

      <ModalView />
    </div>
  );
}

export default App;
