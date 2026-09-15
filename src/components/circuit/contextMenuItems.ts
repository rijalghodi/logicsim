import type { ChipRegistry, PortRef } from "@/core";
import type { ContextMenuItem } from "../ui/ContextMenu";

export type CircuitContextMenuState =
  | { type: "chip"; componentId: string; componentType: string; x: number; y: number }
  | { type: "boundary"; portId: string; x: number; y: number }
  | { type: "wire"; from: PortRef; to: PortRef; x: number; y: number }
  | null;

export interface CircuitContextMenuCallbacks {
  readonly onViewComponent?: (componentId: string) => void;
  readonly onDuplicateComponent?: (componentId: string) => void;
  readonly onRemoveComponent?: (componentId: string) => void;
  readonly onCustomizeBoundaryPort?: (portId: string) => void;
  readonly onDuplicateBoundaryPort?: (portId: string) => void;
  readonly onRemoveBoundaryPort?: (portId: string) => void;
  readonly onDisconnectWire?: (from: PortRef, to: PortRef) => void;
}

/**
 * Builds the right-click menu for a chip or a boundary port. A primitive chip
 * (only NAND today, per SPEC.md) has no internals, so it gets no VIEW item —
 * checked via `registry.resolve(...).kind`, never the chip's name. Each other
 * item is included only when its backing callback is provided, so a read-only
 * canvas (e.g. viewing a dived-into chip's internals) never offers an action
 * that would silently do nothing when clicked.
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
    if (callbacks.onDuplicateComponent) {
      items.push({
        label: "DUPLICATE",
        shortcutHint: "⌘ D",
        shortcutKeys: ["d"],
        requireModifier: true,
        onClick: () => callbacks.onDuplicateComponent?.(contextMenu.componentId),
      });
    }
    if (callbacks.onRemoveComponent) {
      items.push({
        label: "REMOVE",
        shortcutHint: "⌫",
        shortcutKeys: ["Backspace", "Delete"],
        isDanger: true,
        onClick: () => callbacks.onRemoveComponent?.(contextMenu.componentId),
      });
    }
    return items;
  }

  if (contextMenu.type === "boundary") {
    const items: ContextMenuItem[] = [];
    if (callbacks.onCustomizeBoundaryPort) {
      items.push({
        label: "CUSTOMIZE",
        shortcutHint: "⏎",
        shortcutKeys: ["Enter"],
        onClick: () => callbacks.onCustomizeBoundaryPort?.(contextMenu.portId),
      });
    }
    if (callbacks.onDuplicateBoundaryPort) {
      items.push({
        label: "DUPLICATE",
        shortcutHint: "⌘ D",
        shortcutKeys: ["d"],
        requireModifier: true,
        onClick: () => callbacks.onDuplicateBoundaryPort?.(contextMenu.portId),
      });
    }
    if (callbacks.onRemoveBoundaryPort) {
      items.push({
        label: "REMOVE",
        shortcutHint: "⌫",
        shortcutKeys: ["Backspace", "Delete"],
        isDanger: true,
        onClick: () => callbacks.onRemoveBoundaryPort?.(contextMenu.portId),
      });
    }
    return items;
  }

  // contextMenu.type === "wire" — only REMOVE is offered for now.
  if (!callbacks.onDisconnectWire) return [];
  return [
    {
      label: "REMOVE",
      shortcutHint: "⌫",
      shortcutKeys: ["Backspace", "Delete"],
      isDanger: true,
      onClick: () => callbacks.onDisconnectWire?.(contextMenu.from, contextMenu.to),
    },
  ];
}
