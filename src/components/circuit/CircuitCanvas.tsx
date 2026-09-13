import { useMemo, useRef, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";
import type Konva from "konva";
import { evaluateCircuit } from "@/core";
import type { Bit, BoundaryPorts, CircuitDefinition, ChipRegistry, PortRef } from "@/core";
import type { SavedChip } from "@/storage/chipStorage";
import { CircuitBoundaryPorts } from "./CircuitBoundaryPorts";
import { CircuitComponents } from "./CircuitComponents";
import { CircuitGrid } from "./CircuitGrid";
import { CircuitWires } from "./CircuitWires";
import { ContextMenu } from "../ui/ContextMenu";
import { getCircuitContextMenuItems } from "./contextMenuItems";
import type { CircuitContextMenuState } from "./contextMenuItems";
import { CANVAS_BG_NAME, NODE_WIDTH } from "./geometry";
import type { Layout, Position } from "./geometry";
import type { CircuitViewContext } from "./portResolution";
import { useWiringDraft } from "./useWiringDraft";
import { CANVAS_BACKGROUND } from "./colors";

export interface CircuitCanvasProps {
  readonly circuit: CircuitDefinition;
  readonly registry: ChipRegistry;
  readonly savedChips?: SavedChip[];
  readonly layout: Layout;
  /** This circuit's own inputs/outputs, when it's being viewed as a chip's internals (see SPEC.md §4). */
  readonly boundary?: BoundaryPorts;
  /** Per-boundary-port-id y override, from dragging — falls back to even spacing when absent. */
  readonly boundaryLayout?: Readonly<Record<string, number>>;
  readonly portColors?: Readonly<Record<string, string>>;
  /** Corner anchors for cornered wires, keyed by `connectionKey(from, to)`. */
  readonly wireAnchors?: Readonly<Record<string, readonly Position[]>>;
  readonly boundaryInputs: Readonly<Record<string, Bit>>;
  /** Omit to render boundary inputs as read-only (e.g. viewing a nested chip driven by its parent). */
  readonly onToggleBoundaryInput?: (portId: string) => void;
  /** Omit to make boundary ports vertically fixed (non-draggable). */
  readonly onMoveBoundaryPort?: (portId: string, y: number) => void;
  /** Omit to make components fixed (non-draggable). */
  readonly onMoveComponent?: (componentId: string, position: Position) => void;
  readonly onViewComponent?: (componentId: string) => void;
  /** Triggered when a component should be removed. */
  readonly onRemoveComponent?: (componentId: string) => void;
  /** Triggered when a boundary port should be removed. */
  readonly onRemoveBoundaryPort?: (portId: string) => void;
  /** Triggered when a component should be duplicated. */
  readonly onDuplicateComponent?: (componentId: string) => void;
  /** Triggered when a boundary port should be duplicated. */
  readonly onDuplicateBoundaryPort?: (portId: string) => void;
  /** Triggered when a boundary port should be renamed. */
  readonly onCustomizeBoundaryPort?: (portId: string) => void;
  /** Triggered when a chip is dragged from the bottom toolbar and dropped onto the canvas. */
  readonly onDropChip?: (chipType: string, position: Position) => void;
  /** Triggered when a wire is connected from source to destination, with any corner anchors placed along the way. */
  readonly onConnectWire?: (from: PortRef, to: PortRef, anchors?: Position[]) => void;
  /** Triggered when an existing wire is deleted. */
  readonly onDisconnectWire?: (from: PortRef, to: PortRef) => void;
  /** Show a dotted background grid (the "show grid" preference). Default false. */
  readonly showGrid?: boolean;
  /** Show every port's label at all times, not just on hover (the "show port labels" preference). Default false. */
  readonly showPortLabel?: boolean;
  readonly width: number;
  readonly height: number;
}

/** Renders one flat level of a circuit: its own components, wires, and boundary ports, all live. */
export function CircuitCanvas({
  circuit,
  registry,
  savedChips = [],
  layout,
  boundary,
  boundaryLayout,
  portColors = {},
  wireAnchors = {},
  boundaryInputs,
  onToggleBoundaryInput,
  onMoveBoundaryPort,
  onMoveComponent,
  onViewComponent,
  onRemoveComponent,
  onRemoveBoundaryPort,
  onDuplicateComponent,
  onDuplicateBoundaryPort,
  onCustomizeBoundaryPort,
  onDropChip,
  onConnectWire,
  onDisconnectWire,
  showGrid = false,
  showPortLabel = false,
  width,
  height,
}: CircuitCanvasProps) {
  const [contextMenu, setContextMenu] = useState<CircuitContextMenuState>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { wiringDraft, cursor, stageRef, handleStageMouseMove, handleBackgroundClick, handlePortInteraction } =
    useWiringDraft(onConnectWire);

  const simulation = useMemo(
    () => evaluateCircuit(circuit, registry, { boundaryInputs }),
    [circuit, registry, boundaryInputs],
  );

  const ctx: CircuitViewContext = {
    circuit,
    registry,
    savedChips,
    boundary,
    layout,
    boundaryLayout,
    boundaryInputs,
    simulation,
    canvasWidth: width,
    canvasHeight: height,
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (contextMenu) setContextMenu(null);

    const isBackground = e.target === e.target.getStage() || e.target.attrs.name === CANVAS_BG_NAME;
    if (isBackground) handleBackgroundClick(e);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/logicsim-chip")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const chipType = e.dataTransfer.getData("application/logicsim-chip");
    if (!chipType || !onDropChip || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dropPos: Position = {
      x: Math.round(e.clientX - rect.left - NODE_WIDTH / 2),
      y: Math.round(e.clientY - rect.top - 30),
    };

    onDropChip(chipType, dropPos);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width, height, overflow: "hidden" }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseMove={handleStageMouseMove}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          <Rect
            name={CANVAS_BG_NAME}
            x={0}
            y={0}
            width={width}
            height={height}
            fill={CANVAS_BACKGROUND}
            listening={true}
          />

          {showGrid && <CircuitGrid width={width} height={height} />}

          <CircuitWires
            ctx={ctx}
            wireAnchors={wireAnchors}
            portColors={portColors}
            wiringDraft={wiringDraft}
            cursor={cursor}
            onDisconnectWire={onDisconnectWire}
          />

          <CircuitComponents
            ctx={ctx}
            contextMenu={contextMenu}
            isWiringActive={Boolean(wiringDraft)}
            showPortLabels={showPortLabel}
            onMoveComponent={onMoveComponent}
            onViewComponent={onViewComponent}
            onOpenContextMenu={(componentId, componentType, x, y) =>
              setContextMenu({ type: "chip", componentId, componentType, x, y })
            }
            onCloseContextMenu={() => setContextMenu(null)}
            onPortClick={handlePortInteraction}
          />

          <CircuitBoundaryPorts
            ctx={ctx}
            portColors={portColors}
            contextMenu={contextMenu}
            isWiringActive={Boolean(wiringDraft)}
            showPortLabel={showPortLabel}
            onToggleBoundaryInput={onToggleBoundaryInput}
            onMoveBoundaryPort={onMoveBoundaryPort}
            onOpenContextMenu={(portId, x, y) => setContextMenu({ type: "boundary", portId, x, y })}
            onPortClick={handlePortInteraction}
          />
        </Layer>
      </Stage>

      {contextMenu && (
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          items={getCircuitContextMenuItems(contextMenu, registry, {
            onViewComponent,
            onDuplicateComponent,
            onRemoveComponent,
            onCustomizeBoundaryPort,
            onDuplicateBoundaryPort,
            onRemoveBoundaryPort,
          })}
        />
      )}
    </div>
  );
}
