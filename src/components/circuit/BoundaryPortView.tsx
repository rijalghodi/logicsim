import { useRef } from "react";
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
}

/**
 * A circuit's own input/output: a horizontal lead line running from the
 * very edge of the canvas to a circle, with its name floating above the
 * circle. Draggable vertically only — the line always stays flush with
 * the screen edge.
 */
export function BoundaryPortView({ position, edgeX, name, active, onToggle, onMove }: BoundaryPortViewProps) {
  const color = active ? WIRE_ACTIVE_COLOR : WIRE_INACTIVE_COLOR;
  const draggable = Boolean(onMove);

  const setCursor = (e: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = cursor;
  };

  // See ComponentNode's comment: Konva's drag offset is measured from the
  // gesture's start, so the base must be a fixed snapshot, not the
  // continuously-updating `position` prop.
  const dragStartY = useRef(position.y);

  return (
    <Group
      x={0}
      y={0}
      draggable={draggable}
      dragBoundFunc={(pos) => ({ x: 0, y: pos.y })}
      onDragStart={() => {
        dragStartY.current = position.y;
      }}
      onDragMove={(e) => onMove?.(dragStartY.current + e.target.y())}
      onDragEnd={(e) => {
        onMove?.(dragStartY.current + e.target.y());
        e.target.position({ x: 0, y: 0 });
      }}
      onClick={onToggle}
      onTap={onToggle}
      onMouseEnter={(e) => setCursor(e, draggable ? (onToggle ? "pointer" : "ns-resize") : "default")}
      onMouseLeave={(e) => setCursor(e, "default")}
    >
      <Line points={[edgeX, position.y, position.x, position.y]} stroke={color} strokeWidth={2} listening={false} />
      <Circle x={position.x} y={position.y} radius={BOUNDARY_PORT_RADIUS} fill={color} />
      <Text
        x={position.x - BOUNDARY_LABEL_WIDTH / 2}
        y={position.y - BOUNDARY_LABEL_OFFSET_Y}
        width={BOUNDARY_LABEL_WIDTH}
        text={name}
        fontSize={13}
        fill={LABEL_COLOR}
        align="center"
        listening={false}
      />
    </Group>
  );
}
