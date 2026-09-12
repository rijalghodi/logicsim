import { useState } from "react";
import { Line } from "react-konva";
import type { Position } from "./geometry";
import { BIT_COLOR, WIRE_DELETE_HOVER_COLOR } from "./colors";
import { getBrightColor, getDimmedColor } from "@/utils/colorHelper";

interface WireLineProps {
  /** Ordered points from source to destination — at least [from, to], with any corner anchors in between. Every segment is a straight line; the polyline is never curved. */
  readonly points: readonly Position[];
  readonly active: boolean;
  readonly color?: string;
  readonly isDraft?: boolean;
  readonly onDelete?: () => void;
}

/** A wire, drawn as a straight-segment polyline: lit and glowing when its driving value is `true`, dimmed when `false`, with support for draft preview and click-to-delete. */
export function WireLine({ points, active, color, isDraft, onDelete }: WireLineProps) {
  const [hovered, setHovered] = useState(false);

  let activeColor = getBrightColor(BIT_COLOR);
  let inactiveColor = getDimmedColor(BIT_COLOR);
  if (color) {
    activeColor = getBrightColor(color);
    inactiveColor = getDimmedColor(color);
  }

  const strokeColor = hovered && onDelete ? WIRE_DELETE_HOVER_COLOR : active || isDraft ? activeColor : inactiveColor;

  return (
    <Line
      points={points.flatMap((p) => [p.x, p.y])}
      stroke={strokeColor}
      strokeWidth={hovered && onDelete ? 3.5 : active || isDraft ? 3 : 2.75}
      dash={isDraft ? [6, 4] : undefined}
      lineCap="round"
      lineJoin="round"
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
