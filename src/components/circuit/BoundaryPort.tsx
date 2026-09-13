import { useState, useRef } from "react";
import { Circle, Group, Line, Rect } from "react-konva";
import type Konva from "konva";
import { PORT_RADIUS, getPortLabelWidth, PORT_LABEL_HEIGHT, BIT_CIRCLE_RADIUS } from "./geometry";
import type { Position } from "./geometry";

import { CONTROLLER_FILL, CONTROLLER_FILL_HOVER, BIT_COLOR, BIT_STROKE } from "./constants";
import { PortLabel } from "./PortLabel";
import { PortPin } from "./PortPin";

import { getBrightColor, getDimmedColor, getHoverColor } from "@/utils/colorHelper";

interface BoundaryPortProps {
  /** The position of the wire connection pin (where circuit wires attach). */
  readonly position: Position;
  /** The screen edge x this port touches. */
  readonly edgeX: number;
  /** Whether this port is on the left or right side of the box. */
  readonly side: "left" | "right";
  readonly name: string;
  readonly active: boolean;
  /** Present only for boundary inputs — an output is read-only, driven by the circuit. */
  readonly onToggle?: () => void;
  /** Fired with the port's new y while/after dragging — x never changes. */
  readonly onMove?: (y: number) => void;
  /** Fired when clicking the wire connection pin to start or finish a wire connection. */
  readonly onPortClick?: (position: Position) => void;
  /** Whether a wire draft is currently in progress. */
  readonly isWiringActive?: boolean;
  /** Constrain vertical dragging within min/max bounds. */
  readonly bounds?: { minY: number; maxY: number };
  /** Whether the context menu for this boundary port is open */
  readonly isContextMenuOpen?: boolean;
  /** Fired when right clicking the boundary port */
  readonly onContextMenu?: (x: number, y: number) => void;
  /** Show the label at all times, not just on hover (the "show port labels" preference). */
  readonly showLabel?: boolean;
}

const CONTROLLER_WIDTH = 12;

/**
 * A circuit's boundary port laid out with separated components:
 * [Position (y) Controller touching edge] — [Bit input/output circle] — [Line] — [Wire connection pin] — [Label]
 */
export function BoundaryPort({
  position,
  edgeX,
  name,
  active,
  onToggle,
  onMove,
  onPortClick,
  isWiringActive,
  side,
  bounds,
  isContextMenuOpen,
  onContextMenu,
  showLabel,
}: BoundaryPortProps) {
  const [controllerHovered, setControllerHovered] = useState(false);
  const [bitHovered, setBitHovered] = useState(false);
  const [pinHovered, setPinHovered] = useState(false); // Used to conditionally show PortLabel
  const [isHovered, setIsHovered] = useState(false);
  const isDraggingRef = useRef(false);

  const isLeft = side === "left";
  const draggable = Boolean(onMove);

  const setCursor = (e: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = cursor;
  };

  const openContextMenu = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (onContextMenu) {
      const stage = e.target.getStage();
      const pointerPos = stage?.getPointerPosition();
      if (pointerPos) {
        onContextMenu(pointerPos.x, pointerPos.y);
      } else {
        onContextMenu(isLeft ? position.x + 20 : position.x - 120, position.y);
      }
    }
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    openContextMenu(e);
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if ("button" in e.evt && e.evt.button !== 0) return;
    if (isDraggingRef.current) return;
    e.cancelBubble = true;
    openContextMenu(e);
  };

  // Position Controller (touches screen edge)
  const controllerX = isLeft ? edgeX : edgeX - CONTROLLER_WIDTH;
  const controllerY = -BIT_CIRCLE_RADIUS;

  // Bit input/output circle (between edge controller and wire connection pin)
  const bitCircleX = isLeft ? edgeX + 32 : edgeX - 32;

  // Connecting wire lead between Bit circle and Wire connection pin
  const lineFromX = isLeft ? bitCircleX + BIT_CIRCLE_RADIUS : position.x + PORT_RADIUS;
  const lineToX = isLeft ? position.x - PORT_RADIUS : bitCircleX - BIT_CIRCLE_RADIUS;

  // Wire connection pin is at (position.x, 0)

  // Label badge
  const labelText = name;
  const badgeWidth = getPortLabelWidth(labelText);
  const badgeHeight = PORT_LABEL_HEIGHT;
  const badgeX = isLeft ? position.x + 14 : position.x - 14 - badgeWidth;
  const badgeY = -badgeHeight / 2;

  const hitAreaX = isLeft ? edgeX : position.x - PORT_RADIUS;
  const hitAreaWidth = isLeft ? position.x + PORT_RADIUS - edgeX : edgeX - (position.x - PORT_RADIUS);

  return (
    <Group
      x={0}
      y={position.y}
      draggable={draggable && !isContextMenuOpen}
      dragBoundFunc={(pos) => {
        let y = pos.y;
        if (bounds) {
          y = Math.max(bounds.minY, Math.min(bounds.maxY, y));
        }
        return { x: 0, y };
      }}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragMove={(e) => onMove?.(e.target.y())}
      onDragEnd={(e) => {
        onMove?.(e.target.y());
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 100);
      }}
      onClick={handleClick}
      onTap={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Halo Effect behind the boundary port assembly when hovered */}
      {(isHovered || isContextMenuOpen) && (
        <Rect
          x={hitAreaX - 3}
          y={-BIT_CIRCLE_RADIUS - 6}
          width={hitAreaWidth + 6}
          height={(BIT_CIRCLE_RADIUS + 6) * 2}
          cornerRadius={6}
          fill="hsla(0, 0%, 43%)"
          opacity={0.5}
          listening={false}
        />
      )}

      {/* Invisible hit area covering the entire boundary port assembly */}
      <Rect
        x={hitAreaX}
        y={-BIT_CIRCLE_RADIUS - 4}
        width={hitAreaWidth}
        height={(BIT_CIRCLE_RADIUS + 4) * 2}
        fill="transparent"
      />
      {/* 1. POSITION (Y) CONTROLLER — touches the screen edge */}
      <Group
        onMouseEnter={(e) => {
          setControllerHovered(true);
          if (draggable) setCursor(e, "ns-resize");
        }}
        onMouseLeave={(e) => {
          setControllerHovered(false);
          setCursor(e, "default");
        }}
      >
        <Rect
          x={controllerX}
          y={controllerY}
          width={CONTROLLER_WIDTH}
          height={BIT_CIRCLE_RADIUS * 2}
          fill={controllerHovered ? CONTROLLER_FILL_HOVER : CONTROLLER_FILL}
        />
      </Group>

      {/* 2. BIT INPUT / OUTPUT CIRCLE */}
      <Group
        onClick={(e) => {
          if (onToggle) {
            e.cancelBubble = true;
            onToggle();
          }
        }}
        onTap={(e) => {
          if (onToggle) {
            e.cancelBubble = true;
            onToggle();
          }
        }}
        onMouseEnter={(e) => {
          setBitHovered(true);
          if (onToggle) setCursor(e, "pointer");
        }}
        onMouseLeave={(e) => {
          setBitHovered(false);
          setCursor(e, "default");
        }}
      >
        <Circle
          x={bitCircleX}
          y={0}
          radius={BIT_CIRCLE_RADIUS}
          fill={
            active
              ? getBrightColor(BIT_COLOR)
              : bitHovered && onToggle
                ? getHoverColor(getDimmedColor(BIT_COLOR))
                : getDimmedColor(BIT_COLOR)
          }
          stroke={BIT_STROKE}
          strokeWidth={2}
        />
      </Group>

      {/* Connecting line between Bit circle and Wire connection pin */}
      <Line points={[lineFromX, 0, lineToX, 0]} stroke={BIT_STROKE} strokeWidth={2.5} hitStrokeWidth={16} />

      {/* Wire connection pin (where circuit wires attach) */}
      <PortPin
        x={position.x}
        y={0}
        active={active}
        isWiringActive={isWiringActive}
        onPortClick={() => onPortClick?.(position)}
        onHoverChange={setPinHovered}
      />

      {/* Label badge — shown on hover, or always when the "show port labels" preference is on */}
      {(pinHovered || showLabel) && <PortLabel x={badgeX} y={badgeY} text={labelText} />}
    </Group>
  );
}
