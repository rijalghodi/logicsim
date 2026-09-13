import { BOUNDARY_ID } from "@/core";
import type { Bit, BoundaryPorts, CircuitDefinition, ChipRegistry, PortDirection, PortRef, SimulationState } from "@/core";
import type { SavedChip } from "@/storage/chipStorage";
import { getBoundaryPortPosition, getComponentPortPosition, sortPortsByLayout } from "./geometry";
import type { Layout, Position } from "./geometry";

/**
 * Everything needed to turn a `PortRef` into a screen position or a live
 * value. Kept as a plain context object (rather than component props) so
 * this logic stays testable and reusable outside `CircuitCanvas`.
 */
export interface CircuitViewContext {
  readonly circuit: CircuitDefinition;
  readonly registry: ChipRegistry;
  readonly savedChips?: readonly SavedChip[];
  readonly boundary?: BoundaryPorts;
  readonly layout: Layout;
  /** Per-boundary-port-id y override, from dragging — falls back to even spacing when absent. */
  readonly boundaryLayout?: Readonly<Record<string, number>>;
  readonly boundaryInputs: Readonly<Record<string, Bit>>;
  readonly simulation: SimulationState;
  readonly canvasWidth: number;
  readonly canvasHeight: number;
}

/** Stable string identity for a connection, used to key per-wire UI state (e.g. corner anchors) that isn't part of the core `Connection` itself. */
export function connectionKey(from: PortRef, to: PortRef): string {
  return `${from.componentId}:${from.portId}->${to.componentId}:${to.portId}`;
}

export function resolvePortPosition(ref: PortRef, ctx: CircuitViewContext): Position {
  if (ref.componentId === BOUNDARY_ID) {
    const inputs = ctx.boundary?.inputs ?? [];
    const inputIndex = inputs.findIndex((port) => port.id === ref.portId);
    if (inputIndex >= 0) {
      const base = getBoundaryPortPosition("left", inputIndex, inputs.length, ctx.canvasWidth, ctx.canvasHeight);
      return { x: base.x, y: ctx.boundaryLayout?.[ref.portId] ?? base.y };
    }
    const outputs = ctx.boundary?.outputs ?? [];
    const outputIndex = outputs.findIndex((port) => port.id === ref.portId);
    const base = getBoundaryPortPosition(
      "right",
      Math.max(outputIndex, 0),
      outputs.length,
      ctx.canvasWidth,
      ctx.canvasHeight,
    );
    return { x: base.x, y: ctx.boundaryLayout?.[ref.portId] ?? base.y };
  }

  const position = ctx.layout[ref.componentId] ?? { x: 0, y: 0 };
  const component = ctx.circuit.components.find((c) => c.id === ref.componentId);
  if (!component) return position;

  const { inputs, outputs } = ctx.registry.getPorts(component.type);
  const maxPortCount = Math.max(inputs.length, outputs.length);

  const savedDef = ctx.savedChips?.find((c) => c.id === component.type);
  const sortedInputs = sortPortsByLayout(inputs, savedDef?.boundaryLayout);
  const sortedOutputs = sortPortsByLayout(outputs, savedDef?.boundaryLayout);

  const inputIndex = sortedInputs.findIndex((port) => port.id === ref.portId);
  if (inputIndex >= 0) {
    return getComponentPortPosition(position, "input", inputIndex, inputs.length, maxPortCount);
  }
  const outputIndex = sortedOutputs.findIndex((port) => port.id === ref.portId);
  return getComponentPortPosition(position, "output", Math.max(outputIndex, 0), outputs.length, maxPortCount);
}

/** The live value at a port that acts as a source: a boundary input, or any component's output. */
export function getPortValue(ref: PortRef, ctx: CircuitViewContext): Bit {
  if (ref.componentId === BOUNDARY_ID) return ctx.boundaryInputs[ref.portId] ?? false;
  return ctx.simulation.componentOutputs[ref.componentId]?.[ref.portId] ?? false;
}

/**
 * A component input port's value isn't in `SimulationState` directly (only
 * outputs are recorded) — trace back to whatever drives it, the same way
 * `evaluateCircuit` does internally. Floating inputs read as `false`, per
 * SPEC.md's floating-inputs section.
 */
export function getComponentInputValue(componentId: string, portId: string, ctx: CircuitViewContext): Bit {
  const driver = ctx.circuit.connections.find(
    (connection) => connection.to.componentId === componentId && connection.to.portId === portId,
  );
  return driver ? getPortValue(driver.from, ctx) : false;
}

/**
 * A port's own direction, mirroring the boundary inversion `resolveEndpoint`
 * applies in `validateConnection.ts` (see SPEC.md §4): a circuit's own
 * boundary input acts as a connection *source* internally (so it reads as
 * "output" here), and a boundary output acts as a *sink* (reads as "input").
 * Returns `undefined` if the component/port can't be resolved — callers
 * should treat that as "unknown" and let core's own validation report it.
 */
export function getPortDirection(ref: PortRef, ctx: CircuitViewContext): PortDirection | undefined {
  if (ref.componentId === BOUNDARY_ID) {
    if (ctx.boundary?.inputs.some((port) => port.id === ref.portId)) return "output";
    if (ctx.boundary?.outputs.some((port) => port.id === ref.portId)) return "input";
    return undefined;
  }

  const component = ctx.circuit.components.find((c) => c.id === ref.componentId);
  if (!component) return undefined;

  const { inputs, outputs } = ctx.registry.getPorts(component.type);
  if (outputs.some((port) => port.id === ref.portId)) return "output";
  if (inputs.some((port) => port.id === ref.portId)) return "input";
  return undefined;
}
