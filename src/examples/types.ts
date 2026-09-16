import type { BoundaryPorts, ChipRegistry, CircuitDefinition } from "@/core";
import type { Layout } from "@/components/circuit/geometry";
import type { SavedChip } from "@/storage/chipStorage";

/**
 * A curated, static circuit shown on the home page that a user can copy into a brand-new
 * project of their own (see ExamplePage). Bundled with the app, never persisted itself —
 * distinct from a Project, which lives in localStorage.
 */
export interface ExampleDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Pre-populated with every chip this example (transitively) depends on, so ExamplePage can
   * resolve/evaluate/dive into it without a project's own registry. */
  readonly registry: ChipRegistry;
  readonly rootCircuit: CircuitDefinition;
  readonly rootBoundary: BoundaryPorts;
  readonly rootLayout: Layout;
  /** Dependency chips to seed into a new project's library, leaf-first, when copied. */
  readonly chips: SavedChip[];
}
