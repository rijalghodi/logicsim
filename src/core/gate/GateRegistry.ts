import type { Bit } from "../bit";
import type { PortDefinition } from "./PortDefinition";
import type { GateDefinition } from "./GateDefinition";
import { UnknownComponentTypeError } from "../errors";

/**
 * A built-in gate's behavior. Unlike a custom `GateDefinition`, a
 * primitive has no internal circuit — its truth table is expressed
 * directly as a function. NAND is currently the only one.
 */
export interface PrimitiveGateBehavior {
  readonly kind: "primitive";
  readonly type: string;
  readonly inputs: PortDefinition[];
  readonly outputs: PortDefinition[];
  evaluate(inputs: Readonly<Record<string, Bit>>): Record<string, Bit>;
}

export interface ResolvedCustomGate {
  readonly kind: "custom";
  readonly definition: GateDefinition;
}

export type ResolvedGateType = PrimitiveGateBehavior | ResolvedCustomGate;

/**
 * Resolves a `ComponentDefinition.type` string into the behavior/definition
 * it names. This is the one place that distinguishes a built-in primitive
 * from a user-defined gate — everywhere else (validation, evaluation,
 * `Circuit`) only ever sees a `ResolvedGateType` and doesn't care which
 * kind it got. Adding a new primitive or a new custom gate never requires
 * touching the evaluator.
 */
export class GateRegistry {
  private readonly primitives = new Map<string, PrimitiveGateBehavior>();
  private readonly gates = new Map<string, GateDefinition>();

  registerPrimitive(behavior: PrimitiveGateBehavior): void {
    this.primitives.set(behavior.type, behavior);
  }

  registerGate(definition: GateDefinition): void {
    this.gates.set(definition.id, definition);
  }

  hasGate(id: string): boolean {
    return this.gates.has(id);
  }

  resolve(type: string): ResolvedGateType {
    const primitive = this.primitives.get(type);
    if (primitive) return primitive;

    const gate = this.gates.get(type);
    if (gate) return { kind: "custom", definition: gate };

    throw new UnknownComponentTypeError(type);
  }

  getPorts(type: string): { inputs: PortDefinition[]; outputs: PortDefinition[] } {
    const resolved = this.resolve(type);
    return resolved.kind === "primitive"
      ? { inputs: resolved.inputs, outputs: resolved.outputs }
      : { inputs: resolved.definition.inputs, outputs: resolved.definition.outputs };
  }
}
