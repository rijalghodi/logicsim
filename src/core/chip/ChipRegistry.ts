import type { Bit } from "../bit";
import type { PortDefinition } from "./PortDefinition";
import type { ChipDefinition } from "./ChipDefinition";
import { UnknownComponentTypeError } from "../errors";

/**
 * A built-in chip's behavior. Unlike a custom `ChipDefinition`, a
 * primitive has no internal circuit — its truth table is expressed
 * directly as a function. NAND is currently the only one.
 */
export interface PrimitiveChipBehavior {
  readonly kind: "primitive";
  readonly type: string;
  readonly inputs: PortDefinition[];
  readonly outputs: PortDefinition[];
  evaluate(inputs: Readonly<Record<string, Bit>>): Record<string, Bit>;
}

export interface ResolvedCustomChip {
  readonly kind: "custom";
  readonly definition: ChipDefinition;
}

export type ResolvedChipType = PrimitiveChipBehavior | ResolvedCustomChip;

/**
 * Resolves a `ComponentDefinition.type` string into the behavior/definition
 * it names. This is the one place that distinguishes a built-in primitive
 * from a user-defined chip — everywhere else (validation, evaluation,
 * `Circuit`) only ever sees a `ResolvedChipType` and doesn't care which
 * kind it got. Adding a new primitive or a new custom chip never requires
 * touching the evaluator.
 */
export class ChipRegistry {
  private readonly primitives = new Map<string, PrimitiveChipBehavior>();
  private readonly chips = new Map<string, ChipDefinition>();

  registerPrimitive(behavior: PrimitiveChipBehavior): void {
    this.primitives.set(behavior.type, behavior);
  }

  registerChip(definition: ChipDefinition): void {
    this.chips.set(definition.id, definition);
  }

  hasChip(id: string): boolean {
    return this.chips.has(id);
  }

  unregisterChip(id: string): void {
    this.chips.delete(id);
  }

  resolve(type: string): ResolvedChipType {
    const primitive = this.primitives.get(type);
    if (primitive) return primitive;

    const chip = this.chips.get(type);
    if (chip) return { kind: "custom", definition: chip };

    throw new UnknownComponentTypeError(type);
  }

  getPorts(type: string): { inputs: PortDefinition[]; outputs: PortDefinition[] } {
    const resolved = this.resolve(type);
    return resolved.kind === "primitive"
      ? { inputs: resolved.inputs, outputs: resolved.outputs }
      : { inputs: resolved.definition.inputs, outputs: resolved.definition.outputs };
  }

  /**
   * Checks if `sourceType` recursively depends on `targetType`.
   * Useful to prevent circular dependencies when adding chips to a circuit.
   */
  dependsOn(sourceType: string, targetType: string, visited = new Set<string>()): boolean {
    if (sourceType === targetType) return true;
    if (visited.has(sourceType)) return false;
    visited.add(sourceType);

    const source = this.chips.get(sourceType);
    if (!source) return false; // Primitives don't depend on anything

    for (const comp of source.circuit.components) {
      if (this.dependsOn(comp.type, targetType, visited)) {
        return true;
      }
    }
    return false;
  }
}
