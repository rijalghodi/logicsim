import { useState } from "react";
import { Circle, Group, Line, Rect } from "react-konva";
import type Konva from "konva";
import { PORT_RADIUS, getPortLabelWidth, PORT_LABEL_HEIGHT } from "./geometry";
import type { Position } from "./geometry";
import { WIRE_ACTIVE_COLOR, WIRE_INACTIVE_COLOR } from "./WireLine";
import { PortLabel } from "./PortLabel";
import { PortPin } from "./PortPin";

interface BoundaryPortViewProps {
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
}

const CONTROLLER_WIDTH = 10;
const CONTROLLER_HEIGHT = 32;
const BIT_CIRCLE_RADIUS = 15;

// Colors
const CONTROLLER_FILL = "hsl(0, 0%, 0%)";
const CONTROLLER_FILL_HOVER = "hsl(0, 0%, 10%)";
const CONTROLLER_STROKE = "hsl(0, 0%, 20%)";
const CONTROLLER_STROKE_HOVER = "hsl(0, 0%, 30%)";

const BIT_FILL = "hsla(56, 15%, 21%, 1.00)";
const BIT_FILL_HOVER = "hsla(56, 15%, 32%, 1.00)";

const BIT_STROKE = "hsl(0, 0%, 6%)";
const BIT_STROKE_HOVER = "hsl(53, 98%, 10%)";
const BIT_STROKE_ACTIVE = "hsl(53, 98%, 77%)";

/**
 * A circuit's boundary port laid out with separated components:
 * [Position (y) Controller touching edge] — [Bit input/output circle] — [Line] — [Wire connection pin] — [Label]
 */
export function BoundaryPortView({
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
}: BoundaryPortViewProps) {
  const [controllerHovered, setControllerHovered] = useState(false);
  const [bitHovered, setBitHovered] = useState(false);
  const [pinHovered, setPinHovered] = useState(false); // Used to conditionally show PortLabel

  const isLeft = side === "left";
  const draggable = Boolean(onMove);

  const setCursor = (e: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = cursor;
  };

  // 1. Position Controller (touches screen edge)
  const controllerX = isLeft ? edgeX : edgeX - CONTROLLER_WIDTH;
  const controllerY = -CONTROLLER_HEIGHT / 2;

  // 2. Bit input/output circle (between edge controller and wire connection pin)
  const bitCircleX = isLeft ? edgeX + 32 : edgeX - 32;

  // 3. Connecting wire lead between Bit circle and Wire connection pin
  const lineFromX = isLeft ? bitCircleX + BIT_CIRCLE_RADIUS : position.x + PORT_RADIUS;
  const lineToX = isLeft ? position.x - PORT_RADIUS : bitCircleX - BIT_CIRCLE_RADIUS;

  // 4. Wire connection pin is at (position.x, 0)

  // 5. Label badge
  const labelText = isLeft ? `in ${name}` : `out ${name}`;
  const badgeWidth = getPortLabelWidth(labelText);
  const badgeHeight = PORT_LABEL_HEIGHT;
  const badgeX = isLeft ? position.x + 14 : position.x - 14 - badgeWidth;
  const badgeY = -badgeHeight / 2;

  return (
    <Group
      x={0}
      y={position.y}
      draggable={draggable}
      dragBoundFunc={(pos) => {
        let y = pos.y;
        if (bounds) {
          y = Math.max(bounds.minY, Math.min(bounds.maxY, y));
        }
        return { x: 0, y };
      }}
      onDragMove={(e) => onMove?.(e.target.y())}
      onDragEnd={(e) => onMove?.(e.target.y())}
    >
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
          height={CONTROLLER_HEIGHT}
          fill={controllerHovered ? CONTROLLER_FILL_HOVER : CONTROLLER_FILL}
        />
        {/* Grip ridges */}
        {[-6, 0, 6].map((offset) => (
          <Line
            key={offset}
            points={[controllerX + 2, offset, controllerX + CONTROLLER_WIDTH - 2, offset]}
            stroke={controllerHovered ? CONTROLLER_STROKE_HOVER : CONTROLLER_STROKE}
            strokeWidth={1.5}
            lineCap="round"
          />
        ))}
      </Group>

      {/* 2. BIT INPUT / OUTPUT CIRCLE */}
      <Group
        onClick={(e) => {
          e.cancelBubble = true;
          if (onToggle) onToggle();
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          if (onToggle) onToggle();
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
          fill={active ? WIRE_ACTIVE_COLOR : bitHovered && onToggle ? BIT_FILL_HOVER : BIT_FILL}
          stroke={active ? BIT_STROKE_ACTIVE : bitHovered && onToggle ? BIT_STROKE_HOVER : BIT_STROKE}
          strokeWidth={2}
          shadowColor={active ? WIRE_ACTIVE_COLOR : undefined}
          shadowBlur={active ? 6 : 0}
          shadowOpacity={active ? 0.8 : 0}
        />
      </Group>

      {/* 3. CONNECTING LINE BETWEEN BIT CIRCLE AND WIRE CONNECTION PIN */}
      <Line points={[lineFromX, 0, lineToX, 0]} stroke={WIRE_INACTIVE_COLOR} strokeWidth={2.5} listening={false} />

      {/* 4. WIRE CONNECTION PIN (where circuit wires attach) */}
      <PortPin
        x={position.x}
        y={0}
        active={active}
        isWiringActive={isWiringActive}
        onPortClick={() => onPortClick?.(position)}
        onHoverChange={setPinHovered}
      />

      {/* 5. LABEL BADGE */}
      {pinHovered && <PortLabel x={badgeX} y={badgeY} text={labelText} />}
    </Group>
  );
}
