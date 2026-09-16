import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircuitCanvas } from "@/components/circuit/CircuitCanvas";
import { Dock } from "@/components/ui/Dock";
import { ModalView } from "@/components/ui/ModalView";
import { Toast } from "@/components/ui/Toast";
import { AppMenu } from "@/components/ui/AppMenu";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useCircuitStore, useCurrentChip } from "@/stores/circuitStore";
import { modals } from "@/stores/modalStore";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useAppActions } from "@/hooks/useAppActions";
import { getProject } from "@/storage/projectStorage";
import { toast } from "@/stores/toastStore";
import "./ProjectPage.css";

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const store = useCircuitStore();
  const preferences = useUserPreferencesStore();
  const currentChip = useCurrentChip();

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

  // Diving into a chip's internals (breadcrumb navigation) is inspection only — you can still
  // simulate it (toggle its own boundary inputs) but not restructure it. To edit a chip, open it
  // directly from the menu instead, which clears the view stack and makes it the active editor.
  const isReadOnly = store.viewStack.length > 0;

  // Hooks must run unconditionally on every render, so this stays above the early return below
  // even though its result is only used once we know we have a matching project to render.
  const breadcrumbItems = useMemo(() => {
    const items = store.viewStack.map((state, i) => {
      // In viewStack, state corresponds to a saved chip, so we find it to get the name
      const chip = store.savedChips.find((c) => c.id === state.currentChipId);
      return {
        id: `stack-${i}`,
        name: chip?.name ?? "Untitled",
        unsaved: state.isDirty,
      };
    });
    items.push({
      id: "current",
      name: currentChip?.name ?? "Untitled",
      unsaved: store.isDirty,
    });
    return items;
  }, [store.viewStack, store.savedChips, currentChip, store.isDirty]);

  if (!projectId || store.currentProjectId !== projectId) {
    return null;
  }

  // Read-only mode disables every structural edit — CircuitCanvas already treats each of these
  // callbacks as "omit to disable" (see its own prop docs), so this is the single place that
  // says so, instead of repeating the same ternary on every prop below.
  const editableCanvasProps = isReadOnly
    ? {}
    : {
        onMoveComponent: store.moveComponent,
        onMoveBoundaryPort: store.moveBoundaryPort,
        onRemoveComponent: store.removeComponent,
        onRemoveBoundaryPort: store.removeBoundaryPort,
        onDuplicateComponent: store.duplicateComponent,
        onDuplicateBoundaryPort: store.duplicateBoundaryPort,
        onCustomizeBoundaryPort: (portId: string) => modals.open("customize-port", { portId }),
        onDropChip: store.dropChip,
        onConnectWire: store.connectWire,
        onDisconnectWire: store.disconnectWire,
      };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      <header className="project-header" style={{ zIndex: 1, position: "fixed", top: 8, left: 16, right: 16 }}>
        {isReadOnly ? (
          <AppMenu
            mode="readOnly"
            onNew={actions.handleNewClick}
            onEditChip={actions.handleEditReadOnlyChipClick}
            onBackToParent={() => actions.handleBreadcrumbClick(0)}
            onPreferences={() => modals.open("preferences")}
            onQuit={actions.handleQuitClick}
          />
        ) : (
          <AppMenu
            mode="edit"
            onNew={actions.handleNewClick}
            onSave={actions.handleSaveClick}
            onSaveAs={actions.handleSaveAsClick}
            onCustomize={actions.handleCustomizeClick}
            onDelete={actions.handleDeleteCurrentClick}
            onPreferences={() => modals.open("preferences")}
            onQuit={actions.handleQuitClick}
            isSaved={!!store.currentChipId}
          />
        )}
        <Breadcrumbs items={breadcrumbItems} onNavigate={actions.handleBreadcrumbClick} />
        {isReadOnly && (
          <span
            className="project-readonly-badge"
            title="Viewing this chip's internals — open it from the menu to edit"
          >
            READ-ONLY
          </span>
        )}
      </header>

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
        {...editableCanvasProps}
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
