import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, Layer, Rect, Stage } from "react-konva";
import type Konva from "konva";
import { BOUNDARY_ID, evaluateCircuit } from "@/core";
import type { Bit, BoundaryPorts, CircuitDefinition, ChipRegistry, PortRef } from "@/core";
import type { SavedChip } from "@/storage/chipStorage";
import { BoundaryPort } from "./BoundaryPort";
import { ChipNode } from "./ChipNode";
import { ContextMenu } from "../ui/ContextMenu";
import { getBoundaryPortPosition, NODE_WIDTH } from "./geometry";
import type { Layout, Position } from "./geometry";
import { connectionKey, getComponentInputValue, getPortValue, resolvePortPosition } from "./portResolution";
import type { CircuitViewContext } from "./portResolution";
import { WireLine } from "./WireLine";
import { CANVAS_BACKGROUND } from "./colors";

/** A wire being drawn: the starting port, plus any corner anchors committed so far by clicking empty canvas space. */
interface WiringDraft {
  readonly from: PortRef;
  readonly fromPos: Position;
  readonly corners: readonly Position[];
}

type MenuState =
  | { type: "chip"; componentId: string; componentType: string; x: number; y: number }
  | { type: "boundary"; portId: string; x: number; y: number }
  | null;

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
  /** Triggered when a boundary port should be renamed. */
  readonly onCustomizeBoundaryPort?: (portId: string) => void;
  /** Triggered when a chip is dragged from the bottom toolbar and dropped onto the canvas. */
  readonly onDropChip?: (chipType: string, position: Position) => void;
  /** Triggered when a wire is connected from source to destination, with any corner anchors placed along the way. */
  readonly onConnectWire?: (from: PortRef, to: PortRef, anchors?: Position[]) => void;
  /** Triggered when an existing wire is deleted. */
  readonly onDisconnectWire?: (from: PortRef, to: PortRef) => void;
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
  onCustomizeBoundaryPort,
  onDropChip,
  onConnectWire,
  onDisconnectWire,
  width,
  height,
}: CircuitCanvasProps) {
  const [wiringDraft, setWiringDraft] = useState<WiringDraft | null>(null);
  const [mousePos, setMousePos] = useState<Position | null>(null);
  const [contextMenu, setContextMenu] = useState<MenuState>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Cancel wiring on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setWiringDraft(null);
        setMousePos(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!wiringDraft) return;
    const stage = e.target.getStage();
    const ptr = stage?.getPointerPosition();
    if (ptr) {
      setMousePos(ptr);
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (contextMenu) setContextMenu(null);

    const isBackground = e.target === e.target.getStage() || e.target.attrs.name === "canvas-bg";
    if (!isBackground) return;

    // While actively wiring, a click on empty canvas commits another corner anchor instead of canceling.
    if (wiringDraft) {
      const stage = e.target.getStage();
      const ptr = stage?.getPointerPosition();
      if (ptr) {
        setWiringDraft({ ...wiringDraft, corners: [...wiringDraft.corners, ptr] });
        setMousePos(ptr);
      }
    }
  };

  const handlePortInteraction = (ref: PortRef, portPos: Position) => {
    if (!wiringDraft) {
      // Start wiring from this port
      setWiringDraft({ from: ref, fromPos: portPos, corners: [] });
      setMousePos(portPos);
    } else {
      // If clicking the exact same port, cancel
      if (wiringDraft.from.componentId === ref.componentId && wiringDraft.from.portId === ref.portId) {
        setWiringDraft(null);
        setMousePos(null);
        return;
      }
      // Complete connection, carrying over any corners placed along the way
      onConnectWire?.(wiringDraft.from, ref, [...wiringDraft.corners]);
      setWiringDraft(null);
      setMousePos(null);
    }
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

  const getContextMenuItems = () => {
    if (!contextMenu) return [];

    if (contextMenu.type === "chip") {
      if (contextMenu.componentType === "NAND") {
        return [
          {
            label: "REMOVE",
            shortcutHint: "⌫",
            shortcutKeys: ["Backspace", "Delete"],
            isDanger: true,
            onClick: () => onRemoveComponent?.(contextMenu.componentId),
          },
        ];
      }
      return [
        {
          label: "VIEW",
          shortcutHint: "⏎",
          shortcutKeys: ["Enter"],
          onClick: () => onViewComponent?.(contextMenu.componentId),
        },
        {
          label: "REMOVE",
          shortcutHint: "⌫",
          shortcutKeys: ["Backspace", "Delete"],
          isDanger: true,
          onClick: () => onRemoveComponent?.(contextMenu.componentId),
        },
      ];
    }

    if (contextMenu.type === "boundary") {
      return [
        {
          label: "CUSTOMIZE",
          shortcutHint: "⏎",
          shortcutKeys: ["Enter"],
          onClick: () => onCustomizeBoundaryPort?.(contextMenu.portId),
        },
        {
          label: "REMOVE",
          shortcutHint: "⌫",
          shortcutKeys: ["Backspace", "Delete"],
          isDanger: true,
          onClick: () => onRemoveBoundaryPort?.(contextMenu.portId),
        },
      ];
    }
    return [];
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width, height, overflow: "hidden" }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        width={width}
        height={height}
        onMouseMove={handleStageMouseMove}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          <Rect name="canvas-bg" x={0} y={0} width={width} height={height} fill={CANVAS_BACKGROUND} listening={true} />

          {/* Existing wires */}
          {circuit.connections.map((connection) => {
            const key = connectionKey(connection.from, connection.to);
            const corners = wireAnchors[key] ?? [];
            const points = [
              resolvePortPosition(connection.from, ctx),
              ...corners,
              resolvePortPosition(connection.to, ctx),
            ];
            return (
              <WireLine
                key={key}
                points={points}
                active={Boolean(getPortValue(connection.from, ctx))}
                color={connection.from.componentId === BOUNDARY_ID ? portColors[connection.from.portId] : undefined}
                onDelete={onDisconnectWire ? () => onDisconnectWire(connection.from, connection.to) : undefined}
              />
            );
          })}

          {/* Active wire draft preview following mouse cursor, with any corners already committed */}
          {wiringDraft && mousePos && (
            <>
              <WireLine
                points={[wiringDraft.fromPos, ...wiringDraft.corners, mousePos]}
                active={true}
                isDraft={true}
                color={wiringDraft.from.componentId === BOUNDARY_ID ? portColors[wiringDraft.from.portId] : undefined}
              />
              {wiringDraft.corners.map((corner, index) => (
                <Circle
                  key={index}
                  x={corner.x}
                  y={corner.y}
                  radius={4}
                  fill={CANVAS_BACKGROUND}
                  stroke="hsl(0, 0%, 70%)"
                  strokeWidth={1.5}
                  listening={false}
                />
              ))}
            </>
          )}

          {/* Placed chip components */}
          {circuit.components.map((component) => {
            const resolved = registry.resolve(component.type);
            const label = resolved.kind === "primitive" ? resolved.type : resolved.definition.name;
            const inputs = resolved.kind === "primitive" ? resolved.inputs : resolved.definition.inputs;
            const outputs = resolved.kind === "primitive" ? resolved.outputs : resolved.definition.outputs;
            const position = layout[component.id] ?? { x: 0, y: 0 };
            const savedDef = savedChips.find((c) => c.id === component.type);
            const customChipColor = savedDef?.color;
            const boundaryLayout = savedDef?.boundaryLayout;

            const sortedInputs = boundaryLayout
              ? [...inputs].sort((a, b) => (boundaryLayout[a.id] ?? 0) - (boundaryLayout[b.id] ?? 0))
              : inputs;

            const sortedOutputs = boundaryLayout
              ? [...outputs].sort((a, b) => (boundaryLayout[a.id] ?? 0) - (boundaryLayout[b.id] ?? 0))
              : outputs;

            return (
              <ChipNode
                key={component.id}
                chipType={component.type}
                position={position}
                label={label}
                color={customChipColor}
                inputs={sortedInputs}
                outputs={sortedOutputs}
                getPortValue={(portId, direction) =>
                  direction === "output"
                    ? Boolean(simulation.componentOutputs[component.id]?.[portId])
                    : Boolean(getComponentInputValue(component.id, portId, ctx))
                }
                onMove={onMoveComponent ? (next) => onMoveComponent(component.id, next) : undefined}
                isContextMenuOpen={contextMenu?.type === "chip" && contextMenu.componentId === component.id}
                onContextMenu={(x, y) => {
                  setContextMenu({ type: "chip", componentId: component.id, componentType: component.type, x, y });
                }}
                onDblClick={() => {
                  setContextMenu(null);
                  onViewComponent?.(component.id);
                }}
                onPortClick={(portId, _direction, portPos) =>
                  handlePortInteraction({ componentId: component.id, portId }, portPos)
                }
                isWiringActive={Boolean(wiringDraft)}
              />
            );
          })}

          {/* Left boundary inputs */}
          {boundary?.inputs.map((port, index) => {
            const base = getBoundaryPortPosition("left", index, boundary.inputs.length, width, height);
            const position = { x: base.x, y: boundaryLayout?.[port.id] ?? base.y };
            return (
              <BoundaryPort
                key={port.id}
                position={position}
                edgeX={16}
                side="left"
                name={port.name}
                color={portColors[port.id]}
                active={Boolean(boundaryInputs[port.id])}
                onToggle={onToggleBoundaryInput ? () => onToggleBoundaryInput(port.id) : undefined}
                onMove={onMoveBoundaryPort ? (y) => onMoveBoundaryPort(port.id, y) : undefined}
                onPortClick={(p) => handlePortInteraction({ componentId: BOUNDARY_ID, portId: port.id }, p)}
                isWiringActive={Boolean(wiringDraft)}
                bounds={{ minY: 16, maxY: height - 56 }}
                isContextMenuOpen={contextMenu?.type === "boundary" && contextMenu.portId === port.id}
                onContextMenu={(x, y) => {
                  setContextMenu({ type: "boundary", portId: port.id, x, y });
                }}
              />
            );
          })}

          {/* Right boundary outputs */}
          {boundary?.outputs.map((port, index) => {
            const base = getBoundaryPortPosition("right", index, boundary.outputs.length, width, height);
            const position = { x: base.x, y: boundaryLayout?.[port.id] ?? base.y };
            return (
              <BoundaryPort
                key={port.id}
                position={position}
                edgeX={width - 16}
                side="right"
                name={port.name}
                color={portColors[port.id]}
                active={Boolean(simulation.boundaryOutputs[port.id])}
                onMove={onMoveBoundaryPort ? (y) => onMoveBoundaryPort(port.id, y) : undefined}
                onPortClick={(p) => handlePortInteraction({ componentId: BOUNDARY_ID, portId: port.id }, p)}
                isWiringActive={Boolean(wiringDraft)}
                bounds={{ minY: 16, maxY: height - 56 }}
                isContextMenuOpen={contextMenu?.type === "boundary" && contextMenu.portId === port.id}
                onContextMenu={(x, y) => {
                  setContextMenu({ type: "boundary", portId: port.id, x, y });
                }}
              />
            );
          })}
        </Layer>
      </Stage>

      {contextMenu && (
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          items={getContextMenuItems()}
        />
      )}
    </div>
  );
}
