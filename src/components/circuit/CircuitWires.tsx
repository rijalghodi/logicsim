import type { PortRef } from "@/core";
import type { CircuitContextMenuState } from "./contextMenuItems";
import type { Position } from "./geometry";
import { connectionKey, getPortValue, resolvePortPosition } from "./portResolution";
import type { CircuitViewContext } from "./portResolution";
import type { WiringDraft } from "./useWiringDraft";
import { WireLine } from "./WireLine";

interface CircuitWiresProps {
  readonly ctx: CircuitViewContext;
  readonly wireAnchors: Readonly<Record<string, readonly Position[]>>;
  readonly portColors: Readonly<Record<string, string>>;
  readonly wiringDraft: WiringDraft | null;
  /** The live cursor position while wiring; only meaningful when `wiringDraft` is set. */
  readonly cursor: Position | null;
  readonly contextMenu: CircuitContextMenuState;
  /** Fired when a wire is clicked or right-clicked, with the click position — opens the shared context menu offering REMOVE. Omit to make wires non-interactive. */
  readonly onOpenContextMenu?: (from: PortRef, to: PortRef, x: number, y: number) => void;
}

/** Renders every committed wire in the circuit, plus the in-progress draft wire following the cursor while wiring. */
export function CircuitWires({
  ctx,
  wireAnchors,
  // portColors,
  wiringDraft,
  cursor,
  contextMenu,
  onOpenContextMenu,
}: CircuitWiresProps) {
  return (
    <>
      {ctx.circuit.connections.map((connection) => {
        const key = connectionKey(connection.from, connection.to);
        const corners = wireAnchors[key] ?? [];
        const points = [resolvePortPosition(connection.from, ctx), ...corners, resolvePortPosition(connection.to, ctx)];
        const isContextMenuOpen =
          contextMenu?.type === "wire" && connectionKey(contextMenu.from, contextMenu.to) === key;
        return (
          <WireLine
            key={key}
            points={points}
            active={Boolean(getPortValue(connection.from, ctx))}
            // TODO: Use wire color
            // color={connection.from.componentId === BOUNDARY_ID ? portColors[connection.from.portId] : undefined}
            isWiringActive={Boolean(wiringDraft)}
            isContextMenuOpen={isContextMenuOpen}
            onContextMenu={
              onOpenContextMenu ? (x, y) => onOpenContextMenu(connection.from, connection.to, x, y) : undefined
            }
          />
        );
      })}

      {wiringDraft && cursor && (
        <WireLine
          points={[wiringDraft.fromPos, ...wiringDraft.corners, cursor]}
          active={true}
          isDraft={true}
          // color={wiringDraft.from.componentId === BOUNDARY_ID ? portColors[wiringDraft.from.portId] : undefined}
        />
      )}
    </>
  );
}
