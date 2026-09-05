import type { Bit } from "../bit";
import type { GateRegistry } from "../gate/GateRegistry";
import type { GateDefinition } from "../gate/GateDefinition";
import type { CircuitDefinition } from "../circuit/Circuit";
import type { ComponentDefinition } from "../circuit/Component";
import type { Connection } from "../circuit/Connection";
import { BOUNDARY_ID } from "../circuit/Connection";
import { EvaluationError } from "../errors";
import type { EvaluateCircuitOptions, SimulationState } from "./SimulationState";

function inputKey(componentId: string, portId: string): string {
  return `${componentId}::${portId}`;
}

/**
 * Evaluation, end to end:
 *
 *   set input values (boundaryInputs / componentInputOverrides)
 *         v
 *   topologically order components by dependency
 *         v
 *   evaluate each component once, in that order, resolving its
 *   type through the registry (primitive truth table, or recurse
 *   into a custom gate's own circuit)
 *         v
 *   collect the values landing on boundary outputs
 *
 * Only combinational circuits are supported: a dependency cycle (including
 * a feedback loop deliberately wired for a future latch) is rejected with
 * `EvaluationError` rather than silently producing a wrong answer. Nothing
 * about this shape assumes acyclic-only circuits forever — a future
 * sequential evaluator can reuse the same `ComponentDefinition`/`Connection`
 * data and simply allow cycles to settle over ticks instead of rejecting
 * them outright.
 */
export function evaluateCircuit(
  circuit: CircuitDefinition,
  registry: GateRegistry,
  options: EvaluateCircuitOptions = {},
): SimulationState {
  const boundaryInputs = options.boundaryInputs ?? {};
  const overrides = options.componentInputOverrides ?? {};

  const componentsById = new Map<string, ComponentDefinition>(circuit.components.map((c) => [c.id, c]));

  const driverByInput = new Map<string, Connection>();
  for (const connection of circuit.connections) {
    if (connection.to.componentId === BOUNDARY_ID) continue;
    driverByInput.set(inputKey(connection.to.componentId, connection.to.portId), connection);
  }

  const order = topologicallySortComponents(circuit);

  const componentOutputs = new Map<string, Record<string, Bit>>();

  for (const id of order) {
    const component = componentsById.get(id);
    if (!component) continue;
    const resolved = registry.resolve(component.type);
    const inputPorts = resolved.kind === "primitive" ? resolved.inputs : resolved.definition.inputs;

    const inputValues: Record<string, Bit> = {};
    for (const port of inputPorts) {
      const driver = driverByInput.get(inputKey(id, port.id));
      if (driver) {
        inputValues[port.id] =
          driver.from.componentId === BOUNDARY_ID
            ? (boundaryInputs[driver.from.portId] ?? false)
            : (componentOutputs.get(driver.from.componentId)?.[driver.from.portId] ?? false);
      } else {
        inputValues[port.id] = overrides[id]?.[port.id] ?? false;
      }
    }

    const outputValues =
      resolved.kind === "primitive"
        ? resolved.evaluate(inputValues)
        : evaluateCircuit(resolved.definition.circuit, registry, { boundaryInputs: inputValues }).boundaryOutputs;

    componentOutputs.set(id, outputValues);
  }

  const boundaryOutputs: Record<string, Bit> = {};
  for (const connection of circuit.connections) {
    if (connection.to.componentId !== BOUNDARY_ID) continue;
    boundaryOutputs[connection.to.portId] =
      connection.from.componentId === BOUNDARY_ID
        ? (boundaryInputs[connection.from.portId] ?? false)
        : (componentOutputs.get(connection.from.componentId)?.[connection.from.portId] ?? false);
  }

  return { componentOutputs: Object.fromEntries(componentOutputs), boundaryOutputs };
}

/** Convenience for evaluating a `GateDefinition` by its external interface. */
export function evaluateGate(
  gate: GateDefinition,
  registry: GateRegistry,
  inputs: Readonly<Record<string, Bit>>,
): Record<string, Bit> {
  return evaluateCircuit(gate.circuit, registry, { boundaryInputs: inputs }).boundaryOutputs;
}

function topologicallySortComponents(circuit: CircuitDefinition): string[] {
  const dependents = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();
  for (const component of circuit.components) {
    dependents.set(component.id, new Set());
    inDegree.set(component.id, 0);
  }

  for (const connection of circuit.connections) {
    if (connection.from.componentId === BOUNDARY_ID || connection.to.componentId === BOUNDARY_ID) continue;
    const from = connection.from.componentId;
    const to = connection.to.componentId;
    const set = dependents.get(from);
    if (set && !set.has(to)) {
      set.add(to);
      inDegree.set(to, (inDegree.get(to) ?? 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift();
    if (id === undefined) break;
    order.push(id);
    for (const dependent of dependents.get(id) ?? []) {
      const remaining = (inDegree.get(dependent) ?? 0) - 1;
      inDegree.set(dependent, remaining);
      if (remaining === 0) queue.push(dependent);
    }
  }

  if (order.length !== circuit.components.length) {
    throw new EvaluationError(
      "Cycle detected in circuit — combinational evaluation does not support feedback loops yet",
    );
  }

  return order;
}
