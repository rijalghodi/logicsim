import type { PortRef } from "@/core";
import type { CircuitContextMenuState } from "./contextMenuItems";
import { sortPortsByLayout } from "./geometry";
import type { Position } from "./geometry";
import { getComponentInputValue } from "./portResolution";
import type { CircuitViewContext } from "./portResolution";
import { ChipNode } from "./ChipNode";

interface CircuitComponentsProps {
  readonly ctx: CircuitViewContext;
  readonly contextMenu: CircuitContextMenuState;
  readonly isWiringActive: boolean;
  readonly showPortLabels: boolean;
  /** Omit to make components fixed (non-draggable). */
  readonly onMoveComponent?: (componentId: string, position: Position) => void;
  readonly onViewComponent?: (componentId: string) => void;
  readonly onOpenContextMenu: (componentId: string, componentType: string, x: number, y: number) => void;
  readonly onCloseContextMenu: () => void;
  readonly onPortClick: (ref: PortRef, portPos: Position) => void;
}

/** Renders every placed chip instance, each showing its own live port values. */
export function CircuitComponents({
  ctx,
  contextMenu,
  isWiringActive,
  showPortLabels,
  onMoveComponent,
  onViewComponent,
  onOpenContextMenu,
  onCloseContextMenu,
  onPortClick,
}: CircuitComponentsProps) {
  return (
    <>
      {ctx.circuit.components.map((component) => {
        const resolved = ctx.registry.resolve(component.type);
        const label = resolved.kind === "primitive" ? resolved.type : resolved.definition.name;
        const inputs = resolved.kind === "primitive" ? resolved.inputs : resolved.definition.inputs;
        const outputs = resolved.kind === "primitive" ? resolved.outputs : resolved.definition.outputs;
        const position = ctx.layout[component.id] ?? { x: 0, y: 0 };
        const savedDef = ctx.savedChips?.find((c) => c.id === component.type);

        return (
          <ChipNode
            key={component.id}
            chipType={component.type}
            position={position}
            label={label}
            color={savedDef?.color}
            inputs={sortPortsByLayout(inputs, savedDef?.boundaryLayout)}
            outputs={sortPortsByLayout(outputs, savedDef?.boundaryLayout)}
            getPortValue={(portId, direction) =>
              direction === "output"
                ? Boolean(ctx.simulation.componentOutputs[component.id]?.[portId])
                : Boolean(getComponentInputValue(component.id, portId, ctx))
            }
            onMove={onMoveComponent ? (next) => onMoveComponent(component.id, next) : undefined}
            isContextMenuOpen={contextMenu?.type === "chip" && contextMenu.componentId === component.id}
            onContextMenu={(x, y) => onOpenContextMenu(component.id, component.type, x, y)}
            onDblClick={() => {
              onCloseContextMenu();
              onViewComponent?.(component.id);
            }}
            onPortClick={(portId, _direction, portPos) => onPortClick({ componentId: component.id, portId }, portPos)}
            isWiringActive={isWiringActive}
            showPortLabels={showPortLabels}
          />
        );
      })}
    </>
  );
}
