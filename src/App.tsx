import { CircuitCanvas } from "./components/circuit/CircuitCanvas";
import { Dock } from "./components/ui/Dock";
import { SaveChipModal } from "./components/ui/SaveChipModal";
import { saveChipModal } from "./stores/saveChipModalStore";
import { UnsavedAlert } from "./components/ui/UnsavedAlert";
import { DeleteChipAlert } from "./components/ui/DeleteChipAlert";
import { CustomizePortModal } from "./components/ui/CustomizePortModal";
import { PreferencesModal } from "./components/ui/PreferencesModal";
import { Header } from "./components/ui/Header";
import { Toast } from "./components/ui/Toast";
import { useCircuitStore } from "./stores/circuitStore";
import { deleteChipAlert } from "./stores/deleteChipAlertStore";
import { customizePortModal } from "./stores/customizePortModalStore";
import { preferencesModal } from "./stores/preferencesModalStore";
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
        onPreferences={preferencesModal.open}
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
        onCustomizeBoundaryPort={customizePortModal.open}
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

      <PreferencesModal />
    </div>
  );
}

export default App;
