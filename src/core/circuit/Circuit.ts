import type { Bit } from "../bit";
import { createId } from "../id";
import { ConnectionValidationError } from "../errors";
import type { ChipDefinition } from "../chip/ChipDefinition";
import type { ChipRegistry } from "../chip/ChipRegistry";
import { createDefaultRegistry } from "../chip/createDefaultRegistry";
import type { PortDefinition } from "../chip/PortDefinition";
import { evaluateCircuit } from "../simulation/evaluateCircuit";
import type { SimulationState } from "../simulation/SimulationState";
import type { ComponentDefinition } from "./Component";
import type { Connection, PortRef } from "./Connection";
import type { BoundaryPorts } from "./validateConnection";
import { validateConnection } from "./validateConnection";

/**
 * The serializable shape of a circuit's wiring: what's placed, and how
 * it's connected. Deliberately holds nothing about layout or rendering —
 * see the module-level note in `Circuit` for why.
 */
export interface CircuitDefinition {
  readonly components: ComponentDefinition[];
  readonly connections: Connection[];
}

export interface CircuitOptions {
  /** Shared registry to resolve component types against. Defaults to a fresh registry with just NAND. */
  readonly registry?: ChipRegistry;
  /** This circuit's own external ports, when it is being built as a chip's internals (see `BOUNDARY_ID`). */
  readonly inputs?: PortDefinition[];
  readonly outputs?: PortDefinition[];
}

/**
 * A mutable builder/editor for a `CircuitDefinition`. This is the only
 * place in the core that mutates wiring; everything else (evaluation,
 * serialization) operates on the plain `CircuitDefinition` snapshot
 * returned by `toDefinition()`.
 *
 * Intentionally has no concept of position, color, or any other rendering
 * detail — a renderer lays its own coordinates on top of `components`
 * (e.g. keyed by component id) rather than the core carrying `x`/`y`.
 */
export class Circuit {
  readonly registry: ChipRegistry;
  private readonly boundary: BoundaryPorts;
  private components: ComponentDefinition[] = [];
  private connections: Connection[] = [];

  constructor(options: CircuitOptions = {}) {
    this.registry = options.registry ?? createDefaultRegistry();
    this.boundary = { inputs: options.inputs ?? [], outputs: options.outputs ?? [] };
  }

  /**
   * Adds a component. `type` may be a primitive's type name ("NAND") or a
   * `ChipDefinition` — passing a definition registers it (if not already
   * registered) so it can immediately be wired up as a component.
   */
  addComponent(type: string | ChipDefinition, id: string = createId("c")): string {
    if (typeof type === "string") {
      this.components.push({ id, type });
      return id;
    }

    if (!this.registry.hasChip(type.id)) {
      this.registry.registerChip(type);
    }
    this.components.push({ id, type: type.id });
    return id;
  }

  removeComponent(id: string): void {
    this.components = this.components.filter((c) => c.id !== id);
    this.connections = this.connections.filter((c) => c.from.componentId !== id && c.to.componentId !== id);
  }

  connect(from: PortRef, to: PortRef): void {
    const connection: Connection = { from, to };
    const issues = validateConnection({
      circuit: this.toDefinition(),
      registry: this.registry,
      connection,
      boundary: this.boundary,
    });
    if (issues.length > 0) {
      throw new ConnectionValidationError(issues);
    }
    this.connections.push(connection);
  }

  disconnect(from: PortRef, to: PortRef): void {
    this.connections = this.connections.filter(
      (c) =>
        !(
          c.from.componentId === from.componentId &&
          c.from.portId === from.portId &&
          c.to.componentId === to.componentId &&
          c.to.portId === to.portId
        ),
    );
  }

  toDefinition(): CircuitDefinition {
    return { components: [...this.components], connections: [...this.connections] };
  }

  /**
   * Runs a combinational evaluation pass over the current wiring. See
   * `evaluateCircuit` for the algorithm; `boundaryInputs` only matters if
   * this circuit was built with boundary ports (i.e. is a chip's
   * internals), `componentInputOverrides` is for poking values directly
   * into an unconnected component input (handy for tests on raw circuits).
   */
  evaluate(
    options: {
      boundaryInputs?: Readonly<Record<string, Bit>>;
      componentInputOverrides?: Readonly<Record<string, Readonly<Record<string, Bit>>>>;
    } = {},
  ): SimulationState {
    return evaluateCircuit(this.toDefinition(), this.registry, options);
  }
}
