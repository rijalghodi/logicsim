import { useMemo } from "react";
import { Layer, Rect, Stage } from "react-konva";
import { evaluateCircuit } from "../../core";
import type { Bit, BoundaryPorts, CircuitDefinition, GateRegistry } from "../../core";
import { BoundaryPortView } from "./BoundaryPortView";
import { ComponentNode } from "./ComponentNode";
import { getBoundaryPortPosition } from "./geometry";
import type { Layout, Position } from "./geometry";
import { getComponentInputValue, getPortValue, resolvePortPosition } from "./portResolution";
import type { CircuitViewContext } from "./portResolution";
import { WireLine } from "./WireLine";

export interface CircuitCanvasProps {
  readonly circuit: CircuitDefinition;
  readonly registry: GateRegistry;
  readonly layout: Layout;
  /** This circuit's own inputs/outputs, when it's being viewed as a gate's internals (see SPEC.md §4). */
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
  readonly width: number;
  readonly height: number;
}

const CANVAS_BACKGROUND = "#1a1a1a";

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
  width,
  height,
}: CircuitCanvasProps) {
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

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill={CANVAS_BACKGROUND} listening={false} />

        {circuit.connections.map((connection) => (
          <WireLine
            key={`${connection.from.componentId}:${connection.from.portId}->${connection.to.componentId}:${connection.to.portId}`}
            from={resolvePortPosition(connection.from, ctx)}
            to={resolvePortPosition(connection.to, ctx)}
            active={Boolean(getPortValue(connection.from, ctx))}
          />
        ))}

        {circuit.components.map((component) => {
          const resolved = registry.resolve(component.type);
          const label = resolved.kind === "primitive" ? resolved.type : resolved.definition.name;
          const inputs = resolved.kind === "primitive" ? resolved.inputs : resolved.definition.inputs;
          const outputs = resolved.kind === "primitive" ? resolved.outputs : resolved.definition.outputs;
          const position = layout[component.id] ?? { x: 0, y: 0 };

          return (
            <ComponentNode
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
            />
          );
        })}

        {boundary?.inputs.map((port, index) => {
          const base = getBoundaryPortPosition("left", index, boundary.inputs.length, width, height);
          const position = { x: base.x, y: boundaryLayout?.[port.id] ?? base.y };
          return (
            <BoundaryPortView
              key={port.id}
              position={position}
              edgeX={0}
              name={port.name}
              active={Boolean(boundaryInputs[port.id])}
              onToggle={onToggleBoundaryInput ? () => onToggleBoundaryInput(port.id) : undefined}
              onMove={onMoveBoundaryPort ? (y) => onMoveBoundaryPort(port.id, y) : undefined}
            />
          );
        })}

        {boundary?.outputs.map((port, index) => {
          const base = getBoundaryPortPosition("right", index, boundary.outputs.length, width, height);
          const position = { x: base.x, y: boundaryLayout?.[port.id] ?? base.y };
          return (
            <BoundaryPortView
              key={port.id}
              position={position}
              edgeX={width}
              name={port.name}
              active={Boolean(simulation.boundaryOutputs[port.id])}
              onMove={onMoveBoundaryPort ? (y) => onMoveBoundaryPort(port.id, y) : undefined}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}
