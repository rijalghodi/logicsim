import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircuitCanvas } from "@/components/circuit/CircuitCanvas";
import { Dock } from "@/components/ui/Dock";
import { ModalView } from "@/components/ui/ModalView";
import { Header } from "@/components/ui/Header";
import { Toast } from "@/components/ui/Toast";
import { useCircuitStore } from "@/stores/circuitStore";
import { modals } from "@/stores/modalStore";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useAppActions } from "@/hooks/useAppActions";
import { getProject } from "@/storage/projectStorage";
import { toast } from "@/stores/toastStore";

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const store = useCircuitStore();
  const preferences = useUserPreferencesStore();

  const windowSize = useWindowSize();
  const actions = useAppActions(windowSize);

  useEffect(() => {
    if (!projectId) return;
    const project = getProject(projectId);
    if (!project) {
      toast.error("Project not found");
      navigate("/projects", { replace: true });
      return;
    }
    document.title = `${project.name} · LogicSim`;
    store.initProject(projectId);
    return () => {
      document.title = "LogicSim";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (!projectId || store.currentProjectId !== projectId) {
    return null;
  }

  // Diving into a chip's internals (breadcrumb navigation) is inspection only — you can still
  // simulate it (toggle its own boundary inputs) but not restructure it. To edit a chip, open it
  // directly from the Dock instead, which clears the view stack and makes it the active editor.
  const isReadOnly = store.viewStack.length > 0;

  // Everything reached by diving in is read-only and can never be dirty — only the parent
  // (viewStack[0], the leftmost breadcrumb, or the current level itself when not dived into
  // anything) can hold real unsaved edits, so that's the only thing Quit needs to check.
  const handleQuitClick = () => {
    const parentIsDirty = isReadOnly ? !!store.viewStack[0]?.isDirty : store.isDirty;
    if (parentIsDirty) {
      modals.open("unsaved-alert", {
        onDiscard: () => {
          store.discardProjectChanges();
          navigate("/");
        },
        onSave: () => {
          // Surface the parent as the live canvas first, so Save persists its data — not
          // whatever read-only child currently happens to be on screen.
          if (isReadOnly) store.executeBreadcrumbNavigation(0);
          actions.handleSaveClick(() => navigate("/"));
        },
      });
    } else {
      navigate("/");
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      <Header
        onNavigateBreadcrumb={actions.handleBreadcrumbClick}
        onNew={actions.handleNewClick}
        onSave={actions.handleSaveClick}
        onSaveAs={actions.handleSaveAsClick}
        onCustomize={actions.handleCustomizeClick}
        onDelete={actions.handleDeleteCurrentClick}
        onEditReadOnlyChip={actions.handleEditReadOnlyChipClick}
        onPreferences={() => modals.open("preferences")}
        onQuit={handleQuitClick}
        isSaved={!!store.currentChipId}
      />

      <CircuitCanvas
        circuit={store.circuit}
        registry={store.registry}
        savedChips={store.savedChips}
        layout={store.layout}
        boundary={store.boundary}
        boundaryLayout={store.boundaryLayout}
        wireAnchors={store.wireAnchors}
        boundaryInputs={store.boundaryInputs}
        onToggleBoundaryInput={store.toggleBoundaryInput}
        onViewComponent={store.diveIntoChip}
        onMoveComponent={isReadOnly ? undefined : store.moveComponent}
        onMoveBoundaryPort={isReadOnly ? undefined : store.moveBoundaryPort}
        onRemoveComponent={isReadOnly ? undefined : store.removeComponent}
        onRemoveBoundaryPort={isReadOnly ? undefined : store.removeBoundaryPort}
        onDuplicateComponent={isReadOnly ? undefined : store.duplicateComponent}
        onDuplicateBoundaryPort={isReadOnly ? undefined : store.duplicateBoundaryPort}
        onCustomizeBoundaryPort={isReadOnly ? undefined : (portId) => modals.open("customize-port", { portId })}
        onDropChip={isReadOnly ? undefined : store.dropChip}
        onConnectWire={isReadOnly ? undefined : store.connectWire}
        onDisconnectWire={isReadOnly ? undefined : store.disconnectWire}
        showGrid={preferences.showGrid}
        showPortLabel={preferences.showPortLabel}
        width={windowSize.width}
        height={windowSize.height}
      />

      {!isReadOnly && (
        <Dock
          onAddChip={actions.handleAddChipFreespace}
          onOpenChip={actions.handleOpenChipClick}
          onDeleteChip={(deletedChipId) => modals.open("delete-chip", { chipId: deletedChipId })}
        />
      )}

      <Toast />

      <ModalView />
    </div>
  );
}
