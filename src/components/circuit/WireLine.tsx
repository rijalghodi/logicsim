import { useState } from "react";
import { Line } from "react-konva";
import type { Position } from "./geometry";
import { BIT_ACTIVE_COLOR, BIT_INACTIVE_COLOR, WIRE_DELETE_HOVER_COLOR } from "./colors";
import { getBrightColor, getDimmedColor } from "../../utils/colorHelper";

interface WireLineProps {
  readonly from: Position;
  readonly to: Position;
  readonly active: boolean;
  readonly color?: string;
  readonly isDraft?: boolean;
  readonly onDelete?: () => void;
}

/** A single wire: lit and glowing when its driving value is `true`, dimmed when `false`, with support for draft preview and click-to-delete. */
export function WireLine({ from, to, active, color, isDraft, onDelete }: WireLineProps) {
  const [hovered, setHovered] = useState(false);

  let activeColor = BIT_ACTIVE_COLOR;
  let inactiveColor = BIT_INACTIVE_COLOR;
  if (color) {
    activeColor = getBrightColor(color);
    inactiveColor = getDimmedColor(color);
  }

  const strokeColor = hovered && onDelete ? WIRE_DELETE_HOVER_COLOR : active || isDraft ? activeColor : inactiveColor;

  return (
    <Line
      points={[from.x, from.y, to.x, to.y]}
      stroke={strokeColor}
      strokeWidth={hovered && onDelete ? 3.5 : active || isDraft ? 2.5 : 2}
      dash={isDraft ? [6, 4] : undefined}
      lineCap="round"
      hitStrokeWidth={12}
      listening={Boolean(onDelete)}
      onClick={onDelete}
      onMouseEnter={(e) => {
        if (!onDelete) return;
        setHovered(true);
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        if (!onDelete) return;
        setHovered(false);
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
    />
  );
}
