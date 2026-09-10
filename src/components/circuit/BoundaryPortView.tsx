import { useState } from "react";
import { Circle, Group, Line, Rect } from "react-konva";
import type Konva from "konva";
import { PORT_RADIUS, getPortLabelWidth, PORT_LABEL_HEIGHT } from "./geometry";
import type { Position } from "./geometry";
import { WIRE_ACTIVE_COLOR, WIRE_INACTIVE_COLOR } from "./WireLine";
import { PortLabel } from "./PortLabel";

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
  const [pinHovered, setPinHovered] = useState(false);

  const isLeft = side === "left";
  const draggable = Boolean(onMove);

  const wireColor = active ? WIRE_ACTIVE_COLOR : WIRE_INACTIVE_COLOR;
  const pinHoverColor = active ? "#fef08a" : "#a1a1aa";

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
          fill={controllerHovered ? "#3f3f46" : "#27272a"}
          stroke={controllerHovered ? "#a1a1aa" : "#52525b"}
          strokeWidth={1}
          cornerRadius={isLeft ? [0, 4, 4, 0] : [4, 0, 0, 4]}
          shadowColor="#000"
          shadowBlur={4}
          shadowOpacity={0.4}
        />
        {/* Grip ridges */}
        {[-6, 0, 6].map((offset) => (
          <Line
            key={offset}
            points={[controllerX + 2, offset, controllerX + CONTROLLER_WIDTH - 2, offset]}
            stroke={controllerHovered ? "#d4d4d8" : "#71717a"}
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
          fill={active ? WIRE_ACTIVE_COLOR : bitHovered && onToggle ? "#2e2e34" : "#202024"}
          stroke={active ? "#fef08a" : bitHovered && onToggle ? "#a1a1aa" : "#52525b"}
          strokeWidth={2}
          shadowColor={active ? WIRE_ACTIVE_COLOR : "#000"}
          shadowBlur={active ? 10 : 4}
          shadowOpacity={active ? 0.8 : 0.4}
        />
      </Group>

      {/* 3. CONNECTING LINE BETWEEN BIT CIRCLE AND WIRE CONNECTION PIN */}
      <Line points={[lineFromX, 0, lineToX, 0]} stroke={wireColor} strokeWidth={2.5} listening={false} />

      {/* 4. WIRE CONNECTION PIN (where circuit wires attach) */}
      <Group
        onClick={(e) => {
          e.cancelBubble = true;
          onPortClick?.(position);
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onPortClick?.(position);
        }}
        onMouseEnter={(e) => {
          setPinHovered(true);
          setCursor(e, "pointer");
        }}
        onMouseLeave={(e) => {
          setPinHovered(false);
          setCursor(e, "default");
        }}
      >
        {/* Expanded hit target */}
        <Circle x={position.x} y={0} radius={PORT_RADIUS + 8} fill="transparent" />

        {/* Target indicator ring during active wiring */}
        {isWiringActive && (
          <Circle
            x={position.x}
            y={0}
            radius={PORT_RADIUS + 6}
            stroke={WIRE_ACTIVE_COLOR}
            strokeWidth={1.5}
            dash={[3, 3]}
            listening={false}
          />
        )}

        {/* Hover halo */}
        {pinHovered && (
          <Circle
            x={position.x}
            y={0}
            radius={PORT_RADIUS + 4}
            fill={active ? "rgba(233, 210, 79, 0.25)" : "rgba(161, 161, 170, 0.25)"}
            listening={false}
          />
        )}

        {/* Pin circle */}
        <Circle
          x={position.x}
          y={0}
          radius={pinHovered ? PORT_RADIUS + 1.5 : PORT_RADIUS}
          fill={pinHovered ? pinHoverColor : wireColor}
          strokeWidth={1.5}
          shadowColor={active ? WIRE_ACTIVE_COLOR : "hsl(0, 0%, 30%)"}
          shadowBlur={pinHovered ? 8 : active ? 4 : 0}
          shadowOpacity={0.9}
        />
      </Group>

      {/* 5. LABEL BADGE */}
      {pinHovered && <PortLabel x={badgeX} y={badgeY} text={labelText} />}
    </Group>
  );
}
