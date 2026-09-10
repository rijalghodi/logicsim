import { Circle, Group, Line, Text } from "react-konva";
import type Konva from "konva";
import { BOUNDARY_LABEL_OFFSET_Y, BOUNDARY_LABEL_WIDTH, BOUNDARY_PORT_RADIUS } from "./geometry";
import type { Position } from "./geometry";
import { WIRE_ACTIVE_COLOR, WIRE_INACTIVE_COLOR } from "./WireLine";

const LABEL_COLOR = "#d4d4d8";

interface BoundaryPortViewProps {
  /** Circle center. */
  readonly position: Position;
  /** The screen edge x this port's lead line touches: 0 for a left port, canvas width for a right port. */
  readonly edgeX: number;
  readonly name: string;
  readonly active: boolean;
  /** Present only for boundary inputs — an output is read-only, driven by the circuit. */
  readonly onToggle?: () => void;
  /** Fired with the port's new y while/after dragging — x never changes. */
  readonly onMove?: (y: number) => void;
  /** Fired when clicking the boundary pin circle to start or finish a wire connection. */
  readonly onPortClick?: (position: Position) => void;
  /** Whether a wire draft is currently in progress. */
  readonly isWiringActive?: boolean;
}

/**
 * A circuit's own input/output: a horizontal lead line running from the
 * very edge of the canvas to a circle, with its name floating above the
 * circle. Draggable vertically only — the line always stays flush with
 * the screen edge.
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
}: BoundaryPortViewProps) {
  const color = active ? WIRE_ACTIVE_COLOR : WIRE_INACTIVE_COLOR;
  const draggable = Boolean(onMove);

  const setCursor = (e: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = cursor;
  };

  return (
    <Group
      x={0}
      y={position.y}
      draggable={draggable}
      dragBoundFunc={(pos) => ({ x: 0, y: pos.y })}
      onDragMove={(e) => onMove?.(e.target.y())}
      onDragEnd={(e) => onMove?.(e.target.y())}
      onMouseEnter={(e) => setCursor(e, draggable ? "ns-resize" : "default")}
      onMouseLeave={(e) => setCursor(e, "default")}
    >
      {/* Lead line: clicking toggles input value if input */}
      <Line
        points={[edgeX, 0, position.x, 0]}
        stroke={color}
        strokeWidth={3}
        hitStrokeWidth={14}
        onClick={onToggle}
        onTap={onToggle}
        onMouseEnter={(e) => {
          if (onToggle) setCursor(e, "pointer");
        }}
        onMouseLeave={(e) => setCursor(e, draggable ? "ns-resize" : "default")}
      />

      {/* Target ring when wiring is active */}
      {isWiringActive && (
        <Circle
          x={position.x}
          y={0}
          radius={BOUNDARY_PORT_RADIUS + 6}
          stroke={WIRE_ACTIVE_COLOR}
          strokeWidth={1.5}
          dash={[3, 3]}
          listening={false}
        />
      )}

      {/* Pin Circle: clicking wires or toggles */}
      <Circle
        x={position.x}
        y={0}
        radius={BOUNDARY_PORT_RADIUS}
        fill={color}
        stroke="#ffffff"
        strokeWidth={1.5}
        hitStrokeWidth={10}
        onClick={(e) => {
          e.cancelBubble = true;
          if (onPortClick) {
            onPortClick(position);
          } else if (onToggle) {
            onToggle();
          }
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          if (onPortClick) {
            onPortClick(position);
          } else if (onToggle) {
            onToggle();
          }
        }}
        onMouseEnter={(e) => setCursor(e, "pointer")}
        onMouseLeave={(e) => setCursor(e, draggable ? "ns-resize" : "default")}
      />

      {/* Port Name Text */}
      <Text
        x={position.x - BOUNDARY_LABEL_WIDTH / 2}
        y={-BOUNDARY_LABEL_OFFSET_Y}
        width={BOUNDARY_LABEL_WIDTH}
        text={name}
        fontSize={13}
        fontStyle="bold"
        fill={LABEL_COLOR}
        align="center"
        onClick={onToggle}
        onTap={onToggle}
        onMouseEnter={(e) => {
          if (onToggle) setCursor(e, "pointer");
        }}
        onMouseLeave={(e) => setCursor(e, draggable ? "ns-resize" : "default")}
      />
    </Group>
  );
}
