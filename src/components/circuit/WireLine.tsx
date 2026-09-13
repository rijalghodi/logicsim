import { useState } from "react";
import { Path } from "react-konva";
import { buildRoundedWirePath, WIRE_CORNER_RADIUS } from "./geometry";
import type { Position } from "./geometry";
import { BIT_COLOR, WIRE_DELETE_HOVER_COLOR } from "./colors";
import { getBrightColor, getDimmedColor } from "@/utils/colorHelper";

interface WireLineProps {
  /** Ordered points from source to destination — at least [from, to], with any corner anchors in between. Every segment between them is straight; only the interior corners are rounded (see `WIRE_CORNER_RADIUS` in geometry.ts). */
  readonly points: readonly Position[];
  readonly active: boolean;
  readonly color?: string;
  readonly isDraft?: boolean;
  /** Suppress hover-to-highlight and click-to-delete while a different wire is being drawn, so passing the cursor over (or accidentally clicking) this wire mid-draft doesn't delete it. */
  readonly isWiringActive?: boolean;
  readonly onDelete?: () => void;
}

/** A wire, drawn as a straight-segment path with rounded interior corners: lit and glowing when its driving value is `true`, dimmed when `false`, with support for draft preview and click-to-delete. */
export function WireLine({ points, active, color, isDraft, isWiringActive, onDelete }: WireLineProps) {
  const [hovered, setHovered] = useState(false);
  // Whether hovering/clicking this wire should currently show the delete affordance.
  // `listening` stays tied to `onDelete` alone (not `deletable`) so Konva keeps firing real
  // enter/leave events even while wiring is active — that's what keeps `hovered` accurate
  // instead of going stale while events are suppressed.
  const deletable = Boolean(onDelete) && !isWiringActive;

  let activeColor = getBrightColor(BIT_COLOR);
  let inactiveColor = getDimmedColor(BIT_COLOR);
  if (color) {
    activeColor = getBrightColor(color);
    inactiveColor = getDimmedColor(color);
  }

  const strokeColor = hovered && deletable ? WIRE_DELETE_HOVER_COLOR : active || isDraft ? activeColor : inactiveColor;

  const pathData = buildRoundedWirePath(points, WIRE_CORNER_RADIUS);

  return (
    <Path
      data={pathData}
      stroke={strokeColor}
      strokeWidth={hovered && deletable ? 3.5 : 3}
      lineCap="round"
      lineJoin="round"
      hitStrokeWidth={12}
      listening={Boolean(onDelete)}
      onClick={deletable ? onDelete : undefined}
      onMouseEnter={(e) => {
        if (!onDelete) return;
        setHovered(true);
        if (!deletable) return;
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        if (!onDelete) return;
        setHovered(false);
        if (!deletable) return;
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
    />
  );
}
