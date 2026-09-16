import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircuitCanvas } from "@/components/circuit/CircuitCanvas";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AppMenu } from "@/components/ui/AppMenu";
import { BackButton } from "@/components/ui/BackButton";
import { ModalView } from "@/components/ui/ModalView";
import { Toast } from "@/components/ui/Toast";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore";
import { modals } from "@/stores/modalStore";
import { getExampleById } from "@/examples";
import type { ExampleDefinition } from "@/examples";
import type { Bit, BoundaryPorts, CircuitDefinition } from "@/core";
import type { Layout } from "@/components/circuit/geometry";
import { createProject } from "@/storage/projectStorage";
import { saveProjectCircuit } from "@/storage/projectCircuitStorage";
import { saveCustomChip } from "@/storage/chipStorage";
import { toast } from "@/stores/toastStore";
import "./ExamplePage.css";

interface ExampleView {
  readonly name: string;
  readonly circuit: CircuitDefinition;
  readonly boundary: BoundaryPorts;
  readonly layout: Layout;
}

function toRootView(example: ExampleDefinition): ExampleView {
  return {
    name: example.name,
    circuit: example.rootCircuit,
    boundary: example.rootBoundary,
    layout: example.rootLayout,
  };
}

export function ExamplePage() {
  const { exampleId } = useParams<{ exampleId: string }>();
  const navigate = useNavigate();
  const example = exampleId ? getExampleById(exampleId) : undefined;

  if (!example) {
    return (
      <div className="example-missing">
        <p>Example not found.</p>
        <BackButton onClick={() => navigate("/")} />
      </div>
    );
  }

  // Keyed on the example's id so switching examples remounts this with fresh local state,
  // instead of an effect resetting it — there's never more than one example open at a time.
  return (
    <ExampleViewer
      key={example.id}
      example={example}
      onBack={() => navigate("/")}
      onCopied={(projectId) => navigate(`/projects/${projectId}`)}
    />
  );
}

interface ExampleViewerProps {
  readonly example: ExampleDefinition;
  readonly onBack: () => void;
  readonly onCopied: (projectId: string) => void;
}

function ExampleViewer({ example, onBack, onCopied }: ExampleViewerProps) {
  const windowSize = useWindowSize();
  const preferences = useUserPreferencesStore();

  // A tiny, self-contained view stack for dive-in — deliberately not the shared circuitStore,
  // since this page never edits or persists anything and shouldn't touch project autosave.
  const [viewStack, setViewStack] = useState<ExampleView[]>([]);
  const [current, setCurrent] = useState<ExampleView>(() => toRootView(example));
  const [boundaryInputs, setBoundaryInputs] = useState<Record<string, Bit>>({});

  const handleViewComponent = (componentId: string) => {
    const component = current.circuit.components.find((c) => c.id === componentId);
    if (!component) return;
    const target = example.chips.find((c) => c.id === component.type);
    if (!target) return; // primitive (NAND) — nothing to dive into

    setViewStack((prev) => [...prev, current]);
    setCurrent({
      name: target.name,
      circuit: target.circuit,
      boundary: { inputs: target.inputs, outputs: target.outputs },
      layout: target.layout || {},
    });
    setBoundaryInputs({});
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = viewStack[index];
    if (!target) return;
    setCurrent(target);
    setViewStack((prev) => prev.slice(0, index));
    setBoundaryInputs({});
  };

  const handleToggleBoundaryInput = (portId: string) => {
    setBoundaryInputs((prev) => ({ ...prev, [portId]: !prev[portId] }));
  };

  const handleCopy = () => {
    const project = createProject(example.name);

    for (const chip of example.chips) {
      try {
        saveCustomChip(chip, example.registry, project.id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : String(err));
        return;
      }
    }

    saveProjectCircuit(project.id, {
      circuit: example.rootCircuit,
      layout: example.rootLayout,
      boundary: example.rootBoundary,
      boundaryLayout: {},
      portColors: {},
      wireAnchors: {},
      boundaryInputs: {},
      currentChipId: null,
    });

    toast.success(`"${example.name}" copied to your projects!`);
    onCopied(project.id);
  };

  const breadcrumbItems = [
    ...viewStack.map((view, i) => ({ id: `stack-${i}`, name: view.name, unsaved: false })),
    { id: "current", name: current.name, unsaved: false },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      <header className="example-header">
        <AppMenu
          mode="example"
          onCopyToProject={handleCopy}
          onPreferences={() => modals.open("preferences")}
          onQuit={onBack}
        />
        <Breadcrumbs items={breadcrumbItems} onNavigate={handleNavigateBreadcrumb} />
        <span className="example-readonly-badge" title="Examples are read-only — copy this to your projects to edit it">
          READ-ONLY
        </span>
      </header>

      <CircuitCanvas
        circuit={current.circuit}
        registry={example.registry}
        savedChips={example.chips}
        layout={current.layout}
        boundary={current.boundary}
        boundaryInputs={boundaryInputs}
        onToggleBoundaryInput={handleToggleBoundaryInput}
        onViewComponent={handleViewComponent}
        showGrid={preferences.showGrid}
        showPortLabel={preferences.showPortLabel}
        width={windowSize.width}
        height={windowSize.height}
      />

      <Toast />

      <ModalView />
    </div>
  );
}
