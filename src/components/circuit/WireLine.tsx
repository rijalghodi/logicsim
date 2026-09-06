import { Line } from "react-konva";
import type { Position } from "./geometry";

export const WIRE_ACTIVE_COLOR = "#E9D24F";
export const WIRE_INACTIVE_COLOR = "#52525b";

interface WireLineProps {
  readonly from: Position;
  readonly to: Position;
  readonly active: boolean;
}

/** A single wire: lit and glowing when its driving value is `true`, dimmed when `false`. */
export function WireLine({ from, to, active }: WireLineProps) {
  return (
    <Line
      points={[from.x, from.y, to.x, to.y]}
      stroke={active ? WIRE_ACTIVE_COLOR : WIRE_INACTIVE_COLOR}
      strokeWidth={active ? 2.5 : 2}
      shadowColor={WIRE_ACTIVE_COLOR}
      shadowBlur={active ? 8 : 0}
      shadowOpacity={0.9}
      lineCap="round"
      listening={false}
    />
  );
}
