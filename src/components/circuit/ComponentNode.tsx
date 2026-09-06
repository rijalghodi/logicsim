import { useRef } from "react";
import { Arc, Group, Rect, Text } from "react-konva";
import type { PortDefinition } from "../../core";
import { getComponentBox, getComponentPortPosition, PORT_RADIUS } from "./geometry";
import type { Position } from "./geometry";
import { WIRE_ACTIVE_COLOR, WIRE_INACTIVE_COLOR } from "./WireLine";

const BOX_FILL = "#27272a";
const BOX_STROKE = "#71717a";
const LABEL_COLOR = "#f4f4f5";

interface ComponentNodeProps {
  readonly position: Position;
  readonly label: string;
  readonly inputs: readonly PortDefinition[];
  readonly outputs: readonly PortDefinition[];
  readonly getPortValue: (portId: string, direction: "input" | "output") => boolean;
  /** Fired with the component's new position while/after dragging. */
  readonly onMove?: (position: Position) => void;
}

/** One gate instance: a box with its name centered, input pins on the left edge, output pins on the right. */
export function ComponentNode({ position, label, inputs, outputs, getPortValue, onMove }: ComponentNodeProps) {
  const maxPortCount = Math.max(inputs.length, outputs.length);
  const box = getComponentBox(position, maxPortCount);
  const draggable = Boolean(onMove);

  // Konva measures drag offset from the position when the gesture *started*,
  // not frame-to-frame — so the base to add it to must be snapshotted once
  // at drag start, never the continuously-updating `position` prop (adding
  // a since-gesture-start delta to an already-updated base compounds it).
  const dragStart = useRef(position);

  return (
    <Group
      x={0}
      y={0}
      draggable={draggable}
      onDragStart={() => {
        dragStart.current = position;
      }}
      onDragMove={(e) => onMove?.({ x: dragStart.current.x + e.target.x(), y: dragStart.current.y + e.target.y() })}
      onDragEnd={(e) => {
        onMove?.({ x: dragStart.current.x + e.target.x(), y: dragStart.current.y + e.target.y() });
        e.target.position({ x: 0, y: 0 });
      }}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage && draggable) stage.container().style.cursor = "grab";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
    >
      <Rect
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        fill={BOX_FILL}
        stroke={BOX_STROKE}
        strokeWidth={1.5}
        cornerRadius={6}
      />
      <Text
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        text={label}
        fontSize={12}
        fontStyle="bold"
        fill={LABEL_COLOR}
        align="center"
        verticalAlign="middle"
        wrap="word"
        padding={6}
        listening={false}
      />
      {inputs.map((port, index) => {
        const p = getComponentPortPosition(position, "input", index, inputs.length, maxPortCount);
        const active = getPortValue(port.id, "input");
        return (
          <Arc
            key={port.id}
            x={p.x}
            y={p.y}
            innerRadius={0}
            outerRadius={PORT_RADIUS}
            angle={180}
            rotation={90}
            fill={active ? WIRE_ACTIVE_COLOR : WIRE_INACTIVE_COLOR}
          />
        );
      })}
      {outputs.map((port, index) => {
        const p = getComponentPortPosition(position, "output", index, outputs.length, maxPortCount);
        const active = getPortValue(port.id, "output");
        return (
          <Arc
            key={port.id}
            x={p.x}
            y={p.y}
            innerRadius={0}
            outerRadius={PORT_RADIUS}
            angle={180}
            rotation={-90}
            fill={active ? WIRE_ACTIVE_COLOR : WIRE_INACTIVE_COLOR}
          />
        );
      })}
    </Group>
  );
}
