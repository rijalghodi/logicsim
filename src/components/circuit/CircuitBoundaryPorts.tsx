import { BOUNDARY_ID } from "@/core";
import type { PortDefinition, PortRef } from "@/core";
import { BoundaryPort } from "./BoundaryPort";
import type { CircuitContextMenuState } from "./contextMenuItems";
import { getBoundaryPortPosition } from "./geometry";
import type { Position } from "./geometry";
import type { CircuitViewContext } from "./portResolution";

interface CircuitBoundaryPortsProps {
  readonly ctx: CircuitViewContext;
  readonly portColors: Readonly<Record<string, string>>;
  readonly contextMenu: CircuitContextMenuState;
  readonly isWiringActive: boolean;
  readonly showPortLabel: boolean;
  /** Omit to render boundary inputs as read-only (e.g. viewing a nested chip driven by its parent). */
  readonly onToggleBoundaryInput?: (portId: string) => void;
  /** Omit to make boundary ports vertically fixed (non-draggable). */
  readonly onMoveBoundaryPort?: (portId: string, y: number) => void;
  readonly onOpenContextMenu: (portId: string, x: number, y: number) => void;
  readonly onPortClick: (ref: PortRef, portPos: Position) => void;
}

/** Renders a circuit's own boundary ports along both edges: inputs on the left, outputs on the right (see SPEC.md §4, the boundary convention). */
export function CircuitBoundaryPorts({
  ctx,
  portColors,
  contextMenu,
  isWiringActive,
  showPortLabel,
  onToggleBoundaryInput,
  onMoveBoundaryPort,
  onOpenContextMenu,
  onPortClick,
}: CircuitBoundaryPortsProps) {
  const { boundary, boundaryLayout, canvasWidth, canvasHeight } = ctx;
  if (!boundary) return null;

  const renderColumn = (
    side: "left" | "right",
    ports: readonly PortDefinition[],
    isActive: (port: PortDefinition) => boolean,
    onToggle?: (portId: string) => void,
  ) =>
    ports.map((port, index) => {
      const base = getBoundaryPortPosition(side, index, ports.length, canvasWidth, canvasHeight);
      const position = { x: base.x, y: boundaryLayout?.[port.id] ?? base.y };
      return (
        <BoundaryPort
          key={port.id}
          position={position}
          edgeX={side === "left" ? 16 : canvasWidth - 16}
          side={side}
          name={port.name}
          color={portColors[port.id]}
          active={isActive(port)}
          onToggle={onToggle ? () => onToggle(port.id) : undefined}
          onMove={onMoveBoundaryPort ? (y) => onMoveBoundaryPort(port.id, y) : undefined}
          onPortClick={(p) => onPortClick({ componentId: BOUNDARY_ID, portId: port.id }, p)}
          isWiringActive={isWiringActive}
          bounds={{ minY: 16, maxY: canvasHeight - 56 }}
          isContextMenuOpen={contextMenu?.type === "boundary" && contextMenu.portId === port.id}
          onContextMenu={(x, y) => onOpenContextMenu(port.id, x, y)}
          showLabel={showPortLabel}
        />
      );
    });

  return (
    <>
      {renderColumn("left", boundary.inputs, (port) => Boolean(ctx.boundaryInputs[port.id]), onToggleBoundaryInput)}
      {renderColumn("right", boundary.outputs, (port) => Boolean(ctx.simulation.boundaryOutputs[port.id]))}
    </>
  );
}
