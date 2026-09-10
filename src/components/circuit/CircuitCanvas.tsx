import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";
import type Konva from "konva";
import { BOUNDARY_ID, evaluateCircuit } from "../../core";
import type { Bit, BoundaryPorts, CircuitDefinition, GateRegistry, PortRef } from "../../core";
import { BoundaryPort } from "./BoundaryPort";
import { Chip } from "./Chip";
import { ChipContextMenu } from "../ui/ChipContextMenu";
import { getBoundaryPortPosition, NODE_WIDTH } from "./geometry";
import type { Layout, Position } from "./geometry";
import { getComponentInputValue, getPortValue, resolvePortPosition } from "./portResolution";
import type { CircuitViewContext } from "./portResolution";
import { WireLine } from "./WireLine";
import { CANVAS_BACKGROUND } from "./colors";

export interface CircuitCanvasProps {
  readonly circuit: CircuitDefinition;
  readonly registry: GateRegistry;
  readonly layout: Layout;
  /** This circuit's own inputs/outputs, when it's being viewed as a chip's internals (see SPEC.md §4). */
  readonly boundary?: BoundaryPorts;
  /** Per-boundary-port-id y override, from dragging — falls back to even spacing when absent. */
  readonly boundaryLayout?: Readonly<Record<string, number>>;
  readonly boundaryInputs: Readonly<Record<string, Bit>>;
  /** Omit to render boundary inputs as read-only (e.g. viewing a nested gate driven by its parent). */
  readonly onToggleBoundaryInput?: (portId: string) => void;
  /** Omit to make boundary ports vertically fixed (non-draggable). */
  readonly onMoveBoundaryPort?: (portId: string, y: number) => void;
  /** Omit to make components fixed (non-draggable). */
  readonly onMoveComponent?: (componentId: string, position: Position) => void;
  /** Triggered when a component should be removed. */
  readonly onRemoveComponent?: (componentId: string) => void;
  /** Triggered when a gate is dragged from the bottom toolbar and dropped onto the canvas. */
  readonly onDropGate?: (gateType: string, position: Position) => void;
  /** Triggered when a wire is connected from source to destination. */
  readonly onConnectWire?: (from: PortRef, to: PortRef) => void;
  /** Triggered when an existing wire is deleted. */
  readonly onDisconnectWire?: (from: PortRef, to: PortRef) => void;
  readonly width: number;
  readonly height: number;
}

/** Renders one flat level of a circuit: its own components, wires, and boundary ports, all live. */
export function CircuitCanvas({
  circuit,
  registry,
  layout,
  boundary,
  boundaryLayout,
  boundaryInputs,
  onToggleBoundaryInput,
  onMoveBoundaryPort,
  onMoveComponent,
  onRemoveComponent,
  onDropGate,
  onConnectWire,
  onDisconnectWire,
  width,
  height,
}: CircuitCanvasProps) {
  const [wiringDraft, setWiringDraft] = useState<{ from: PortRef; fromPos: Position } | null>(null);
  const [mousePos, setMousePos] = useState<Position | null>(null);
  const [contextMenu, setContextMenu] = useState<{ componentId: string; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const simulation = useMemo(
    () => evaluateCircuit(circuit, registry, { boundaryInputs }),
    [circuit, registry, boundaryInputs],
  );

  const ctx: CircuitViewContext = {
    circuit,
    registry,
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
    // If clicking the canvas background, cancel wiring draft
    if (e.target === e.target.getStage() || e.target.attrs.name === "canvas-bg") {
      setWiringDraft(null);
      setMousePos(null);
    }
  };

  const handlePortInteraction = (ref: PortRef, portPos: Position) => {
    if (!wiringDraft) {
      // Start wiring from this port
      setWiringDraft({ from: ref, fromPos: portPos });
      setMousePos(portPos);
    } else {
      // If clicking the exact same port, cancel
      if (wiringDraft.from.componentId === ref.componentId && wiringDraft.from.portId === ref.portId) {
        setWiringDraft(null);
        setMousePos(null);
        return;
      }
      // Complete connection
      onConnectWire?.(wiringDraft.from, ref);
      setWiringDraft(null);
      setMousePos(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/logicsim-gate")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData("application/logicsim-gate");
    if (!gateType || !onDropGate || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dropPos: Position = {
      x: Math.round(e.clientX - rect.left - NODE_WIDTH / 2),
      y: Math.round(e.clientY - rect.top - 30),
    };

    onDropGate(gateType, dropPos);
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
            const key = `${connection.from.componentId}:${connection.from.portId}->${connection.to.componentId}:${connection.to.portId}`;
            return (
              <WireLine
                key={key}
                from={resolvePortPosition(connection.from, ctx)}
                to={resolvePortPosition(connection.to, ctx)}
                active={Boolean(getPortValue(connection.from, ctx))}
                onDelete={onDisconnectWire ? () => onDisconnectWire(connection.from, connection.to) : undefined}
              />
            );
          })}

          {/* Active wire draft preview following mouse cursor */}
          {wiringDraft && mousePos && (
            <WireLine from={wiringDraft.fromPos} to={mousePos} active={true} isDraft={true} />
          )}

          {/* Placed gate components */}
          {circuit.components.map((component) => {
            const resolved = registry.resolve(component.type);
            const label = resolved.kind === "primitive" ? resolved.type : resolved.definition.name;
            const inputs = resolved.kind === "primitive" ? resolved.inputs : resolved.definition.inputs;
            const outputs = resolved.kind === "primitive" ? resolved.outputs : resolved.definition.outputs;
            const position = layout[component.id] ?? { x: 0, y: 0 };

            return (
              <Chip
                key={component.id}
                position={position}
                label={label}
                inputs={inputs}
                outputs={outputs}
                getPortValue={(portId, direction) =>
                  direction === "output"
                    ? Boolean(simulation.componentOutputs[component.id]?.[portId])
                    : Boolean(getComponentInputValue(component.id, portId, ctx))
                }
                onMove={onMoveComponent ? (next) => onMoveComponent(component.id, next) : undefined}
                isContextMenuOpen={contextMenu?.componentId === component.id}
                onContextMenu={(x, y) => setContextMenu({ componentId: component.id, x, y })}
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
                active={Boolean(boundaryInputs[port.id])}
                onToggle={onToggleBoundaryInput ? () => onToggleBoundaryInput(port.id) : undefined}
                onMove={onMoveBoundaryPort ? (y) => onMoveBoundaryPort(port.id, y) : undefined}
                onPortClick={(p) => handlePortInteraction({ componentId: BOUNDARY_ID, portId: port.id }, p)}
                isWiringActive={Boolean(wiringDraft)}
                bounds={{ minY: 16, maxY: height - 56 }}
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
                active={Boolean(simulation.boundaryOutputs[port.id])}
                onMove={onMoveBoundaryPort ? (y) => onMoveBoundaryPort(port.id, y) : undefined}
                onPortClick={(p) => handlePortInteraction({ componentId: BOUNDARY_ID, portId: port.id }, p)}
                isWiringActive={Boolean(wiringDraft)}
                bounds={{ minY: 16, maxY: height - 56 }}
              />
            );
          })}
        </Layer>
      </Stage>

      {contextMenu && onRemoveComponent && (
        <ChipContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onRemove={() => onRemoveComponent(contextMenu.componentId)}
        />
      )}
    </div>
  );
}
