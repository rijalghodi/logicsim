import type { ChipRegistry } from "@/core";
import type { ContextMenuItem } from "../ui/ContextMenu";

export type CircuitContextMenuState =
  | { type: "chip"; componentId: string; componentType: string; x: number; y: number }
  | { type: "boundary"; portId: string; x: number; y: number }
  | null;

export interface CircuitContextMenuCallbacks {
  readonly onViewComponent?: (componentId: string) => void;
  readonly onDuplicateComponent?: (componentId: string) => void;
  readonly onRemoveComponent?: (componentId: string) => void;
  readonly onCustomizeBoundaryPort?: (portId: string) => void;
  readonly onDuplicateBoundaryPort?: (portId: string) => void;
  readonly onRemoveBoundaryPort?: (portId: string) => void;
}

/**
 * Builds the right-click menu for a chip or a boundary port. A primitive chip
 * (only NAND today, per SPEC.md) has no internals, so it gets no VIEW item —
 * checked via `registry.resolve(...).kind`, never the chip's name.
 */
export function getCircuitContextMenuItems(
  contextMenu: CircuitContextMenuState,
  registry: ChipRegistry,
  callbacks: CircuitContextMenuCallbacks,
): ContextMenuItem[] {
  if (!contextMenu) return [];

  if (contextMenu.type === "chip") {
    const isPrimitive = registry.resolve(contextMenu.componentType).kind === "primitive";
    const items: ContextMenuItem[] = [];
    if (!isPrimitive) {
      items.push({
        label: "VIEW",
        shortcutHint: "⏎",
        shortcutKeys: ["Enter"],
        onClick: () => callbacks.onViewComponent?.(contextMenu.componentId),
      });
    }
    items.push(
      {
        label: "DUPLICATE",
        shortcutHint: "⌘ D",
        shortcutKeys: ["d"],
        requireModifier: true,
        onClick: () => callbacks.onDuplicateComponent?.(contextMenu.componentId),
      },
      {
        label: "REMOVE",
        shortcutHint: "⌫",
        shortcutKeys: ["Backspace", "Delete"],
        isDanger: true,
        onClick: () => callbacks.onRemoveComponent?.(contextMenu.componentId),
      },
    );
    return items;
  }

  return [
    {
      label: "CUSTOMIZE",
      shortcutHint: "⏎",
      shortcutKeys: ["Enter"],
      onClick: () => callbacks.onCustomizeBoundaryPort?.(contextMenu.portId),
    },
    {
      label: "DUPLICATE",
      shortcutHint: "⌘ D",
      shortcutKeys: ["d"],
      requireModifier: true,
      onClick: () => callbacks.onDuplicateBoundaryPort?.(contextMenu.portId),
    },
    {
      label: "REMOVE",
      shortcutHint: "⌫",
      shortcutKeys: ["Backspace", "Delete"],
      isDanger: true,
      onClick: () => callbacks.onRemoveBoundaryPort?.(contextMenu.portId),
    },
  ];
}
