/**
 * An instance of some gate type placed inside a circuit. `type` is a
 * lookup key resolved through a `GateRegistry` — it is either a built-in
 * primitive's type name (e.g. "NAND") or a custom `GateDefinition`'s id.
 * The component itself carries no behavior and no ports of its own; those
 * are looked up from the resolved definition. This keeps every gate type,
 * built-in or user-defined, representable by the same plain record instead
 * of a growing class hierarchy.
 */
export interface ComponentDefinition {
  readonly id: string;
  readonly type: string;
}
