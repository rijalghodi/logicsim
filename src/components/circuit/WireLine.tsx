import { useState } from "react";
import { Path } from "react-konva";
import type Konva from "konva";
import { buildRoundedWirePath, WIRE_CORNER_RADIUS } from "./geometry";
import type { Position } from "./geometry";
import { BIT_COLOR } from "./colors";
import { getBrightColor, getDimmedColor } from "@/utils/colorHelper";

interface WireLineProps {
  /** Ordered points from source to destination — at least [from, to], with any corner anchors in between. Every segment between them is straight; only the interior corners are rounded (see `WIRE_CORNER_RADIUS` in geometry.ts). */
  readonly points: readonly Position[];
  readonly active: boolean;
  readonly color?: string;
  readonly isDraft?: boolean;
  /** Suppress hover-highlight and click-to-open-menu while a different wire is being drawn, so passing the cursor over (or accidentally clicking) this wire mid-draft doesn't open its menu. */
  readonly isWiringActive?: boolean;
  /** Whether this wire's context menu is currently open — keeps the dashed highlight while the menu is deciding the wire's fate. */
  readonly isContextMenuOpen?: boolean;
  /** Fired with the click position when the wire is clicked or right-clicked; omit to make the wire non-interactive (no menu to offer). */
  readonly onContextMenu?: (x: number, y: number) => void;
}

/** A wire, drawn as a straight-segment path with rounded interior corners: lit and glowing when its driving value is `true`, dimmed when `false`. Hovering (or having its context menu open) highlights it as a dashed line — clicking opens a menu offering REMOVE, rather than deleting directly. */
export function WireLine({
  points,
  active,
  color,
  isDraft,
  isWiringActive,
  isContextMenuOpen,
  onContextMenu,
}: WireLineProps) {
  const [hovered, setHovered] = useState(false);
  const interactive = Boolean(onContextMenu) && !isWiringActive;
  const highlighted = (interactive && (hovered || isContextMenuOpen)) || isDraft;

  let activeColor = getBrightColor(BIT_COLOR);
  let inactiveColor = getDimmedColor(BIT_COLOR);
  if (color) {
    activeColor = getBrightColor(color);
    inactiveColor = getDimmedColor(color);
  }

  const strokeColor = highlighted ? activeColor : active || isDraft ? activeColor : inactiveColor;

  const pathData = buildRoundedWirePath(points, WIRE_CORNER_RADIUS);

  const openMenu = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!onContextMenu) return;
    const stage = e.target.getStage();
    const pointerPos = stage?.getPointerPosition() ?? points[0];
    onContextMenu(pointerPos.x, pointerPos.y);
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    openMenu(e);
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if ("button" in e.evt && e.evt.button !== 0) return;
    e.cancelBubble = true;
    openMenu(e);
  };

  return (
    <Path
      data={pathData}
      stroke={strokeColor}
      strokeWidth={highlighted ? 3.5 : 3}
      dash={highlighted ? [6] : undefined}
      lineCap="round"
      lineJoin="round"
      listening={Boolean(onContextMenu)}
      onClick={handleClick}
      onTap={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={(e) => {
        if (!onContextMenu) return;
        setHovered(true);
        if (!interactive) return;
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        if (!onContextMenu) return;
        setHovered(false);
        if (!interactive) return;
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
    />
  );
}
