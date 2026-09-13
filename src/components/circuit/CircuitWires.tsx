import { BOUNDARY_ID } from "@/core";
import type { PortRef } from "@/core";
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
  readonly onDisconnectWire?: (from: PortRef, to: PortRef) => void;
}

/** Renders every committed wire in the circuit, plus the in-progress draft wire following the cursor while wiring. */
export function CircuitWires({
  ctx,
  wireAnchors,
  portColors,
  wiringDraft,
  cursor,
  onDisconnectWire,
}: CircuitWiresProps) {
  return (
    <>
      {ctx.circuit.connections.map((connection) => {
        const key = connectionKey(connection.from, connection.to);
        const corners = wireAnchors[key] ?? [];
        const points = [resolvePortPosition(connection.from, ctx), ...corners, resolvePortPosition(connection.to, ctx)];
        return (
          <WireLine
            key={key}
            points={points}
            active={Boolean(getPortValue(connection.from, ctx))}
            color={connection.from.componentId === BOUNDARY_ID ? portColors[connection.from.portId] : undefined}
            onDelete={onDisconnectWire ? () => onDisconnectWire(connection.from, connection.to) : undefined}
          />
        );
      })}

      {wiringDraft && cursor && (
        <WireLine
          points={[wiringDraft.fromPos, ...wiringDraft.corners, cursor]}
          active={true}
          isDraft={true}
          color={wiringDraft.from.componentId === BOUNDARY_ID ? portColors[wiringDraft.from.portId] : undefined}
        />
      )}
    </>
  );
}
